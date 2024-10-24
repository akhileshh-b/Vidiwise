import logging
from fastapi import FastAPI, HTTPException, Request, BackgroundTasks
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl, ValidationError
import sys
import os
import re
from pathlib import Path
from services.video_service import VideoService
from services.gemini_service import GeminiChatbot  # Add this import
import shutil


# Add the parent directory to Python path
current_dir = Path(__file__).resolve().parent
sys.path.append(str(current_dir))

app = FastAPI()
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Initialize VideoService instance
video_service = VideoService()
gemini_chatbot = GeminiChatbot("AIzaSyAICBtOfsDcUNPHx3BvFu62EAGGounrMO4")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Track processing status
video_processing_status = {}

class VideoURL(BaseModel):
    url: HttpUrl

    @classmethod
    def __get_validators__(cls):
        yield cls.validate_url

    @classmethod
    def validate_url(cls, v):
        if not isinstance(v, str):
            raise ValueError('URL must be a string')
        
        youtube_regex = r'^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$'
        if not re.match(youtube_regex, v):
            raise ValueError('Invalid YouTube URL')
        
        return v

class ChatRequest(BaseModel):
    message: str
    videoId: str

@app.exception_handler(ValidationError)
async def validation_exception_handler(request: Request, exc: ValidationError):
    return JSONResponse(
        status_code=400,
        content={"message": "Invalid input", "details": exc.errors()},
    )

@app.post("/process-video")
async def process_video(video: VideoURL, background_tasks: BackgroundTasks):
    try:
        logger.info(f"Received request to process video: {video.url}")
        
        # Delete video_findings folder if it exists
        findings_dir = r"C:\Users\akhil\OneDrive - rknec.edu\Desktop\mini project\vidiwise_llamabackup\vidiwise\backend\video_findings"
        try:
            if os.path.exists(findings_dir):
                # Delete all files in the directory first
                for filename in os.listdir(findings_dir):
                    file_path = os.path.join(findings_dir, filename)
                    try:
                        if os.path.isfile(file_path):
                            os.unlink(file_path)
                        elif os.path.isdir(file_path):
                            shutil.rmtree(file_path)
                    except Exception as e:
                        logger.error(f"Error deleting {file_path}: {e}")
                
                # Then try to remove the directory itself
                if os.path.exists(findings_dir):
                    shutil.rmtree(findings_dir, ignore_errors=True)
            
            # Create fresh directory
            os.makedirs(findings_dir, exist_ok=True)
            logger.info("Successfully cleared video_findings directory")
            
        except Exception as e:
            logger.error(f"Error clearing directory: {e}")

        # Extract video ID and start processing
        url_str = str(video.url)
        video_id = video_service.get_video_id(url_str)
        
        if not video_id:
            raise HTTPException(status_code=400, detail="Could not extract video ID from URL")
            
        video_processing_status[video_id] = "processing"
        background_tasks.add_task(process_video_task, url_str)
        
        return {"message": "Video processing started", "video_id": video_id}
        
    except Exception as e:
        logger.exception(f"Error processing video: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred while processing the video: {str(e)}")

async def process_video_task(url: str):
    try:
        video_id = video_service.get_video_id(url)
        result = video_service.process_video(url)
        video_processing_status[video_id] = "completed"
    except Exception as e:
        logger.error(f"Error in background video processing: {str(e)}")
        video_processing_status[video_id] = "failed"

@app.get("/video-status/{video_id}")
async def get_video_status(video_id: str):
    status = video_processing_status.get(video_id, "not_found")
    return {"status": status}

@app.post("/start-chat")
async def start_chat(request: ChatRequest):
    try:
        # Construct path to transcript file
        transcript_path = os.path.join("video_findings", "video_transcript.txt")
        
        if not os.path.exists(transcript_path):
            raise HTTPException(status_code=404, detail="Transcript not found")
        
        # Read transcript
        if not gemini_chatbot.read_transcript(transcript_path):
            raise HTTPException(status_code=500, detail="Failed to read transcript")
        
        # Get response from Gemini
        response = gemini_chatbot.send_message(request.message)
        
        return {"message": response}
        
    except Exception as e:
        logger.error(f"Error in chat process: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "OK"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)