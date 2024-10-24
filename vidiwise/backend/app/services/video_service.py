import yt_dlp
import os
import whisper
import cv2
import numpy as np
import torch
from torchvision import models, transforms
from sklearn.cluster import KMeans
from skimage.metrics import structural_similarity as ssim
import pytesseract
from datetime import timedelta
import logging
import subprocess
import shutil


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class VideoService:
    def __init__(self):
        self.ffmpeg_path = r'C:/ffmpeg/bin/ffmpeg.exe'
        self.base_output_dir = 'video_findings'  # New base directory
        os.makedirs(self.base_output_dir, exist_ok=True)
        
        self.ydl_opts = {
            'format': 'bestaudio/best',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }],
            'outtmpl': os.path.join(self.base_output_dir, 'video.%(ext)s'),  # Updated template
            'ffmpeg_location': self.ffmpeg_path,
            'prefer_ffmpeg': True,
        }
        self.whisper_model = whisper.load_model("base")
        
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        logger.info(f"Using device: {self.device}")
        
        self.cnn_model = models.resnet18(pretrained=True)
        self.cnn_model = self.cnn_model.to(self.device)
        self.cnn_model.eval()
        
        self.transform = transforms.Compose([
            transforms.ToPILImage(),
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ])

    def extract_features(self, frame):
        try:
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            frame = self.transform(frame).unsqueeze(0)
            frame = frame.to(self.device)
            with torch.no_grad():
                features = self.cnn_model(frame)
            return features.cpu().squeeze().numpy()
        except Exception as e:
            logger.error(f"Error in extract_features: {str(e)}")
            raise


    def download_video(self, url):
        ydl_opts = {
            'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
            'outtmpl': os.path.join(self.base_output_dir, 'video.%(ext)s'),  # Updated template
            'ffmpeg_location': self.ffmpeg_path,
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            filename = os.path.join(self.base_output_dir, 'video.mp4')  # Standardized filename
        return filename

    def extract_keyframes(self, video_path, num_frames=10):
        cap = cv2.VideoCapture(video_path)
        frames = []
        features = []
        timestamps = []
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            if frame.size == 0:
                logger.warning("Empty frame detected. Skipping.")
                continue
            timestamp = cap.get(cv2.CAP_PROP_POS_MSEC)
            frames.append(frame)
            features.append(self.extract_features(frame))
            timestamps.append(timestamp)
        cap.release()

        if not frames:
            logger.warning("No valid frames extracted from the video.")
            return [], []

        features = np.array(features)
        kmeans = KMeans(n_clusters=num_frames, random_state=42)
        kmeans.fit(features)

        centroids = kmeans.cluster_centers_
        closest_frames = []
        closest_timestamps = []

        for centroid in centroids:
            distances = np.linalg.norm(features - centroid, axis=1)
            closest_frame_idx = np.argmin(distances)
            closest_frames.append(frames[closest_frame_idx])
            closest_timestamps.append(timestamps[closest_frame_idx])

        return self.filter_unique_frames(closest_frames, closest_timestamps)

    def filter_unique_frames(self, frames, timestamps, similarity_threshold=0.85):
        unique_frames = [frames[0]]
        unique_timestamps = [timestamps[0]]

        for i in range(1, len(frames)):
            is_unique = True
            for unique_frame in unique_frames:
                try:
                    if frames[i].shape[0] < 7 or frames[i].shape[1] < 7 or unique_frame.shape[0] < 7 or unique_frame.shape[1] < 7:
                        logger.warning(f"Frame {i} or unique frame is too small. Skipping SSIM comparison.")
                        continue
                    
                    similarity = ssim(frames[i], unique_frame, multichannel=True, channel_axis=2)
                    if similarity > similarity_threshold:
                        is_unique = False
                        break
                except ValueError as e:
                    logger.warning(f"Error comparing frame {i}: {str(e)}. Skipping this comparison.")
                    continue
            if is_unique:
                unique_frames.append(frames[i])
                unique_timestamps.append(timestamps[i])

        return unique_frames, unique_timestamps

    def perform_ocr(self, frame):
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        text = pytesseract.image_to_string(gray)
        return text.strip()

    def save_keyframes(self, frames, timestamps):
        frames_dir = os.path.join(self.base_output_dir, 'frames')  # Updated directory
        os.makedirs(frames_dir, exist_ok=True)
        frame_data = []
        for i, (frame, timestamp) in enumerate(zip(frames, timestamps)):
            path = os.path.join(frames_dir, f'frame_{i}.jpg')
            cv2.imwrite(path, frame)
            ocr_text = self.perform_ocr(frame)
            frame_data.append({
                'path': path,
                'timestamp': timestamp,
                'ocr_text': ocr_text
            })
        return frame_data

    def transcribe_audio(self, audio_file):
        result = self.whisper_model.transcribe(audio_file)
        return result["segments"]

    def combine_data(self, transcript, frame_data):
        logger.info(f"Combining data: {len(transcript)} transcript segments and {len(frame_data)} frames")
        combined_data = []
        for segment in transcript:
            combined_data.append({
                'type': 'transcript',
                'start': segment.get('start'),
                'end': segment.get('end'),
                'text': segment.get('text', '')
            })
        
        for frame in frame_data:
            combined_data.append({
                'type': 'frame',
                'timestamp': frame.get('timestamp'),
                'ocr_text': frame.get('ocr_text', ''),
                'path': frame.get('path', '')
            })
        
        combined_data.sort(key=lambda x: x.get('start') or x.get('timestamp') or 0)
        return combined_data

    def prepare_combined_transcript(self, combined_data):
        formatted_data = "Video Content:\n\n"
        for item in combined_data:
            if item['type'] == 'transcript':
                timestamp = timedelta(seconds=item['start'])
                formatted_data += f"[{timestamp}] Transcript: {item['text']}\n"
            else:
                timestamp = timedelta(milliseconds=item['timestamp'])
                formatted_data += f"[{timestamp}] Frame OCR: {item['ocr_text']}\n"
        return formatted_data

    def process_video(self, url):
        try:
            logger.info(f"Downloading video from URL: {url}")
            video_file = self.download_video(url)
            
            if not os.path.exists(video_file):
                raise FileNotFoundError(f"Downloaded video file not found: {video_file}")

            logger.info(f"Extracting audio from {video_file}")
            audio_file = os.path.join(self.base_output_dir, 'video.mp3')  # Standardized audio filename
            ffmpeg_command = [self.ffmpeg_path, "-i", video_file, "-q:a", "0", "-map", "a", audio_file, "-y"]
            logger.info(f"Running FFmpeg command: {' '.join(ffmpeg_command)}")
        
            result = subprocess.run(ffmpeg_command, capture_output=True, text=True)
            if result.returncode != 0:
                logger.error(f"FFmpeg error: {result.stderr}")
                raise RuntimeError(f"FFmpeg failed to extract audio: {result.stderr}")

            if not os.path.exists(audio_file):
                raise FileNotFoundError(f"Audio file was not created: {audio_file}")

            logger.info(f"Audio extracted successfully: {audio_file}")

            logger.info("Transcribing audio")
            transcript = self.transcribe_audio(audio_file)
            logger.info(f"Transcription complete. {len(transcript)} segments found.")

            logger.info("Extracting and saving key frames")
            frames, timestamps = self.extract_keyframes(video_file)
            if not frames:
                logger.warning("No frames were extracted from the video. Skipping frame processing.")
                frame_data = []
            else:
                frame_data = self.save_keyframes(frames, timestamps)
            logger.info(f"Frame extraction complete. {len(frame_data)} frames processed.")

            logger.info("Combining data")
            combined_data = self.combine_data(transcript, frame_data)
            logger.info(f"Data combination complete. {len(combined_data)} total items.")
            
            logger.info("Preparing combined transcript")
            combined_transcript = self.prepare_combined_transcript(combined_data)
            
            logger.info("Saving combined transcript")
            transcript_file = os.path.join(self.base_output_dir, 'video_transcript.txt')  # Standardized transcript filename
            with open(transcript_file, 'w', encoding='utf-8') as f:
                f.write(combined_transcript)

            logger.info("Video processing completed successfully")
            return {
                "video_file": video_file,
                "audio_file": audio_file,
                "transcript_file": transcript_file
            }
        except Exception as e:
            logger.error(f"Error processing video: {str(e)}", exc_info=True)
            raise
            
    def get_video_id(self, url):
        """Extract video ID from YouTube URL"""
        try:
            if 'youtu.be' in url:
                return url.split('/')[-1]
            elif 'watch?v=' in url:
                return url.split('watch?v=')[-1].split('&')[0]
            elif 'shorts' in url:
                return url.split('/')[-1]
            else:
                return url.split('/')[-1]
        except Exception as e:
            logger.error(f"Error extracting video ID: {e}")
            raise

video_service = VideoService()