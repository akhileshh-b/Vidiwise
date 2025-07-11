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
from services.gemini_service import GeminiChatbot
import shutil

current_dir = Path(__file__).resolve().parent
sys.path.append(str(current_dir))

app = FastAPI()
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Check for required environment variables
required_env_vars = ["GROQ_API_KEY", "GEMINI_API_KEY"]
missing_vars = []

for var in required_env_vars:
    if not os.getenv(var):
        missing_vars.append(var)

if missing_vars:
    logger.error(f"Missing required environment variables: {', '.join(missing_vars)}")
    logger.error("Please set up your .env file with the required API keys.")
    logger.error("See .env.example for reference.")

video_service = VideoService()
gemini_api_key = os.getenv("GEMINI_API_KEY")
if not gemini_api_key:
    logger.error("GEMINI_API_KEY not found. AI chat functionality will fail.")
    gemini_api_key = "dummy_key"  # Prevent crashes during development

gemini_chatbot = GeminiChatbot(gemini_api_key)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

video_processing_status = {}
video_folders = {}  # Track folder paths for each video
video_metadata = {}  # Track title and summary for each video

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

class VideoTitleRequest(BaseModel):
    videoId: str
    title: str

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
        
        url_str = str(video.url)
        video_id = video_service.get_video_id(url_str)
        
        if not video_id:
            raise HTTPException(status_code=400, detail="Could not extract video ID from URL")
            
        video_processing_status[video_id] = "processing"
        background_tasks.add_task(process_video_task, url_str, video_id)
        
        return {"message": "Video processing started", "video_id": video_id}
        
    except Exception as e:
        logger.exception(f"Error processing video: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred while processing the video: {str(e)}")

async def process_video_task(url: str, video_id: str):
    try:
        result = video_service.process_video(url)
        video_processing_status[video_id] = "completed"
        video_folders[video_id] = result.get("video_folder")
        
        # Generate title and summary automatically
        transcript_path = os.path.join(result.get("video_folder"), "video_transcript.txt")
        if os.path.exists(transcript_path):
            if gemini_chatbot.read_transcript(transcript_path):
                # Generate title
                title_prompt = "Based on this video transcript, generate a concise, descriptive title (maximum 80 characters) that captures the main topic. Return only the title, nothing else."
                title = gemini_chatbot.send_message(title_prompt)
                
                # Generate summary
                summary_prompt = "Generate a summary in 1 short paragraphs. DO NOT include any output like 'here is the summary', 'here's a summary', 'this video', 'the video shows', or any introductory text. Just give me the summary content directly, no extra trash text."
                summary = gemini_chatbot.send_message(summary_prompt)
                
                video_metadata[video_id] = {
                    "title": title.strip(),
                    "summary": summary.strip(),
                    "auto_generated": True
                }
                logger.info(f"Generated metadata for video {video_id}")
        
        logger.info(f"Video {video_id} processed successfully in folder: {result.get('video_folder')}")
    except Exception as e:
        logger.error(f"Error in background video processing: {str(e)}")
        video_processing_status[video_id] = "failed"

@app.get("/video-status/{video_id}")
async def get_video_status(video_id: str):
    status = video_processing_status.get(video_id, "not_found")
    folder = video_folders.get(video_id)
    metadata = video_metadata.get(video_id, {})
    return {
        "status": status,
        "folder": folder,
        "video_id": video_id,
        "title": metadata.get("title"),
        "summary": metadata.get("summary"),
        "auto_generated": metadata.get("auto_generated", False)
    }

@app.get("/list-videos")
async def list_processed_videos():
    """List all processed videos with their folders."""
    videos = []
    for video_id, folder in video_folders.items():
        status = video_processing_status.get(video_id, "unknown")
        metadata = video_metadata.get(video_id, {})
        if folder and os.path.exists(folder):
            transcript_exists = os.path.exists(os.path.join(folder, "video_transcript.txt"))
            videos.append({
                "video_id": video_id,
                "folder": folder,
                "status": status,
                "transcript_available": transcript_exists,
                "title": metadata.get("title", f"Video {video_id}"),
                "summary": metadata.get("summary"),
                "auto_generated": metadata.get("auto_generated", False)
            })
    return {"videos": videos}

@app.delete("/delete-video/{video_id}")
async def delete_video(video_id: str):
    """Delete a video's folder and all its files."""
    try:
        folder = video_folders.get(video_id)
        if not folder:
            raise HTTPException(status_code=404, detail="Video not found")
        
        if os.path.exists(folder):
            shutil.rmtree(folder)
            logger.info(f"Deleted folder: {folder}")
        
        # Clean up tracking dictionaries
        video_folders.pop(video_id, None)
        video_processing_status.pop(video_id, None)
        video_metadata.pop(video_id, None)
        
        return {"message": f"Video {video_id} deleted successfully"}
        
    except Exception as e:
        logger.error(f"Error deleting video: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/update-video-title/{video_id}")
async def update_video_title(video_id: str, request: VideoTitleRequest):
    """Update the title of a video."""
    try:
        if video_id not in video_folders:
            raise HTTPException(status_code=404, detail="Video not found")
        
        if video_id not in video_metadata:
            video_metadata[video_id] = {}
        
        video_metadata[video_id]["title"] = request.title.strip()
        video_metadata[video_id]["auto_generated"] = False
        
        return {"message": "Title updated successfully", "title": request.title.strip()}
        
    except Exception as e:
        logger.error(f"Error updating video title: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/start-chat")
async def start_chat(request: ChatRequest):
    try:
        # Get the video folder for this video ID
        video_folder = video_folders.get(request.videoId)
        if not video_folder:
            raise HTTPException(status_code=404, detail="Video folder not found. Please process the video first.")
        
        transcript_path = os.path.join(video_folder, "video_transcript.txt")
        
        if not os.path.exists(transcript_path):
            raise HTTPException(status_code=404, detail="Transcript not found")
        
        if not gemini_chatbot.read_transcript(transcript_path):
            raise HTTPException(status_code=500, detail="Failed to read transcript")
        
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