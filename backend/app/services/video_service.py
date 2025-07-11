import yt_dlp
import os
from groq import Groq
import cv2
import numpy as np
import pytesseract
from datetime import timedelta
import logging
import subprocess
import shutil
import imagehash
from PIL import Image
from concurrent.futures import ThreadPoolExecutor, as_completed
from collections import defaultdict
import hashlib
import re

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class VideoService:
    def __init__(self):
        self.ffmpeg_path = r'C:/ffmpeg/bin/ffmpeg.exe'
        self.base_output_dir = 'video_findings'
        self.current_video_dir = None
        
        # Initialize Groq client for speech-to-text
        self.groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        
        self.max_frames = 50
        self.similarity_threshold = 0.80
        self.scene_threshold = 30.0
        self.hash_threshold = 10
        self.final_max_frames = 15

    def create_unique_folder(self, url):
        """Create unique folder name based on video URL."""
        try:
            video_id = self.get_video_id(url)
            
            # Create a safe folder name combining video ID and hash
            url_hash = hashlib.md5(url.encode()).hexdigest()[:8]
            safe_video_id = re.sub(r'[^\w\-_]', '', video_id)[:20]
            
            folder_name = f"{safe_video_id}_{url_hash}"
            video_dir = os.path.join(self.base_output_dir, folder_name)
            
            # Create the directory
            os.makedirs(video_dir, exist_ok=True)
            os.makedirs(self.base_output_dir, exist_ok=True)
            
            self.current_video_dir = video_dir
            logger.info(f"Created unique folder: {video_dir}")
            return video_dir
            
        except Exception as e:
            logger.error(f"Error creating unique folder: {str(e)}")
            # Fallback to timestamp-based folder
            import time
            folder_name = f"video_{int(time.time())}"
            video_dir = os.path.join(self.base_output_dir, folder_name)
            os.makedirs(video_dir, exist_ok=True)
            self.current_video_dir = video_dir
            return video_dir

    def extract_lightweight_features(self, frame):
        """Extract HSV histogram features for frame comparison."""
        try:
            hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
            
            hist_h = cv2.calcHist([hsv], [0], None, [50], [0, 180])
            hist_s = cv2.calcHist([hsv], [1], None, [50], [0, 256])
            hist_v = cv2.calcHist([hsv], [2], None, [50], [0, 256])
            
            hist_h = cv2.normalize(hist_h, hist_h).flatten()
            hist_s = cv2.normalize(hist_s, hist_s).flatten()
            hist_v = cv2.normalize(hist_v, hist_v).flatten()
            
            features = np.concatenate([hist_h, hist_s, hist_v])
            return features
        except Exception as e:
            logger.error(f"Error in extract_lightweight_features: {str(e)}")
            return np.mean(frame.reshape(-1, 3), axis=0)

    def get_perceptual_hash(self, frame):
        """Generate perceptual hash for similarity detection."""
        try:
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            pil_image = Image.fromarray(rgb_frame)
            hash_val = imagehash.phash(pil_image, hash_size=8)
            return hash_val
        except Exception as e:
            logger.error(f"Error in get_perceptual_hash: {str(e)}")
            return None

    def calculate_hash_distance(self, hash1, hash2):
        """Calculate Hamming distance between perceptual hashes."""
        try:
            if hash1 is None or hash2 is None:
                return float('inf')
            return hash1 - hash2
        except Exception as e:
            logger.error(f"Error calculating hash distance: {str(e)}")
            return float('inf')

    def are_frames_similar_fast(self, frame_data1, frame_data2):
        """Multi-stage similarity detection using hash and feature comparison."""
        try:
            if frame_data1.get('hash') and frame_data2.get('hash'):
                hash_distance = self.calculate_hash_distance(frame_data1['hash'], frame_data2['hash'])
                if hash_distance <= self.hash_threshold:
                    return True
            
            if frame_data1.get('features') is not None and frame_data2.get('features') is not None:
                try:
                    correlation = np.corrcoef(frame_data1['features'], frame_data2['features'])[0, 1]
                    if not np.isnan(correlation) and correlation > self.similarity_threshold:
                        return True
                except Exception:
                    pass
                    
            return False
        except Exception as e:
            logger.error(f"Error in similarity detection: {str(e)}")
            return False

    def detect_scene_changes(self, video_path):
        """Detect scene changes using histogram correlation analysis."""
        cap = cv2.VideoCapture(video_path)
        scene_frames = []
        prev_hist = None
        frame_count = 0
        
        fps = cap.get(cv2.CAP_PROP_FPS)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        duration = total_frames / fps if fps > 0 else 0
        
        logger.info(f"Video stats: {total_frames} frames, {fps:.2f} FPS, {duration:.2f}s duration")
        
        if duration > 0:
            sample_interval = max(1, int(fps * 2))
            max_samples = min(self.max_frames * 2, total_frames // sample_interval)
        else:
            sample_interval = max(1, total_frames // 100)
            max_samples = 100
            
        logger.info(f"Using sample interval: {sample_interval}, max samples: {max_samples}")
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
                
            if frame_count % sample_interval != 0:
                frame_count += 1
                continue
                
            if frame.size == 0:
                frame_count += 1
                continue
                
            hist = cv2.calcHist([frame], [0, 1, 2], None, [8, 8, 8], [0, 256, 0, 256, 0, 256])
            hist = cv2.normalize(hist, hist).flatten()
            
            timestamp = cap.get(cv2.CAP_PROP_POS_MSEC)
            
            if prev_hist is not None:
                correlation = cv2.compareHist(hist, prev_hist, cv2.HISTCMP_CORREL)
                if correlation < (1.0 - self.scene_threshold / 100.0):
                    scene_frames.append((frame.copy(), timestamp))
                    logger.info(f"Scene change detected at {timestamp/1000:.2f}s")
            else:
                scene_frames.append((frame.copy(), timestamp))
                
            prev_hist = hist
            frame_count += 1
            
            if len(scene_frames) >= max_samples:
                break
                
        cap.release()
        
        if len(scene_frames) < 10:
            logger.info("Few scene changes detected, adding interval-based frames")
            additional_frames = self.get_interval_frames(video_path, 10 - len(scene_frames))
            scene_frames.extend(additional_frames)
            
        logger.info(f"Detected {len(scene_frames)} key frames")
        return scene_frames

    def get_interval_frames(self, video_path, num_frames):
        """Extract frames at regular intervals as fallback method."""
        cap = cv2.VideoCapture(video_path)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        if total_frames == 0:
            cap.release()
            return []
            
        interval = max(1, total_frames // (num_frames + 1))
        frames = []
        
        for i in range(1, num_frames + 1):
            frame_num = i * interval
            cap.set(cv2.CAP_PROP_POS_FRAMES, frame_num)
            ret, frame = cap.read()
            
            if ret and frame.size > 0:
                timestamp = cap.get(cv2.CAP_PROP_POS_MSEC)
                frames.append((frame.copy(), timestamp))
                
        cap.release()
        return frames

    def process_frame_parallel(self, frame_data):
        """Process individual frame for feature extraction and hashing."""
        frame, timestamp = frame_data
        try:
            features = self.extract_lightweight_features(frame)
            phash = self.get_perceptual_hash(frame)
            
            return {
                'frame': frame,
                'timestamp': timestamp,
                'features': features,
                'hash': phash
            }
        except Exception as e:
            logger.error(f"Error processing frame at {timestamp}: {str(e)}")
            return None

    def filter_similar_frames_fast(self, processed_frames):
        """Aggressive similarity filtering with multi-stage detection."""
        if not processed_frames:
            return [], []
            
        logger.info(f"Starting aggressive similarity filtering on {len(processed_frames)} frames")
        
        processed_frames.sort(key=lambda x: x['timestamp'])
        
        unique_frames = []
        
        for frame_data in processed_frames:
            if not frame_data:
                continue
                
            is_unique = True
            
            for existing_frame in unique_frames:
                if self.are_frames_similar_fast(frame_data, existing_frame):
                    is_unique = False
                    logger.debug(f"Frame at {frame_data['timestamp']/1000:.2f}s rejected as similar")
                    break
            
            if is_unique:
                unique_frames.append(frame_data)
                logger.info(f"Frame at {frame_data['timestamp']/1000:.2f}s accepted as unique")
        
        if len(unique_frames) > self.final_max_frames:
            logger.info(f"Still {len(unique_frames)} frames, applying final clustering to get {self.final_max_frames}")
            unique_frames = self.final_clustering(unique_frames)
        
        logger.info(f"Final result: {len(unique_frames)} unique frames from {len(processed_frames)} original frames")
        return [f['frame'] for f in unique_frames], [f['timestamp'] for f in unique_frames]

    def final_clustering(self, frames_data):
        """Apply temporal clustering to reduce frames to target count."""
        if len(frames_data) <= self.final_max_frames:
            return frames_data
        
        segments = self.final_max_frames
        frames_per_segment = len(frames_data) // segments
        
        if frames_per_segment == 0:
            return frames_data[:self.final_max_frames]
        
        clustered_frames = []
        
        for i in range(segments):
            start_idx = i * frames_per_segment
            end_idx = (i + 1) * frames_per_segment if i < segments - 1 else len(frames_data)
            segment_frames = frames_data[start_idx:end_idx]
            
            if segment_frames:
                middle_idx = len(segment_frames) // 2
                clustered_frames.append(segment_frames[middle_idx])
        
        return clustered_frames

    def extract_keyframes(self, video_path, num_frames=None):
        """Extract keyframes using scene detection and similarity filtering."""
        logger.info("Starting optimized keyframe extraction")
        
        scene_frames = self.detect_scene_changes(video_path)
        
        if not scene_frames:
            logger.warning("No frames extracted from scene detection")
            return [], []
        
        logger.info(f"Processing {len(scene_frames)} frames in parallel")
        processed_frames = []
        
        with ThreadPoolExecutor(max_workers=4) as executor:
            future_to_frame = {executor.submit(self.process_frame_parallel, frame_data): frame_data 
                             for frame_data in scene_frames}
            
            for future in as_completed(future_to_frame):
                result = future.result()
                if result:
                    processed_frames.append(result)
        
        unique_frames, unique_timestamps = self.filter_similar_frames_fast(processed_frames)
        
        target_frames = num_frames or self.final_max_frames
        if len(unique_frames) > target_frames:
            indices = np.linspace(0, len(unique_frames)-1, target_frames, dtype=int)
            unique_frames = [unique_frames[i] for i in indices]
            unique_timestamps = [unique_timestamps[i] for i in indices]
            logger.info(f"Applied final frame limiting to {target_frames} frames")
        
        logger.info(f"Final keyframe extraction: {len(unique_frames)} frames selected")
        return unique_frames, unique_timestamps

    def download_video(self, url):
        """Download video to unique folder."""
        if not self.current_video_dir:
            self.create_unique_folder(url)
            
        ydl_opts = {
            'format': 'worst[height<=480]/worst[height<=720]/worst',  # Progressive fallback
            'outtmpl': os.path.join(self.current_video_dir, 'video.%(ext)s'),
            'ffmpeg_location': self.ffmpeg_path,
            # Aggressive anti-detection measures
            'http_headers': {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': '*/*',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'same-origin',
            },
            # Retry and timing options
            'extractor_retries': 5,
            'fragment_retries': 5,
            'retries': 5,
            'sleep_interval': 2,
            'max_sleep_interval': 10,
            # YouTube specific options
            'youtube_include_dash_manifest': False,
            'youtube_include_hls_manifest': False,
            'extract_flat': False,
            # Bypass age restrictions and other checks
            'age_limit': 18,
            'ignoreerrors': True,
            'no_warnings': True,
        }
        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                logger.info("Attempting to extract video info and download...")
                info = ydl.extract_info(url, download=True)
                
                # Check multiple possible file extensions
                possible_files = [
                    os.path.join(self.current_video_dir, 'video.mp4'),
                    os.path.join(self.current_video_dir, 'video.webm'),
                    os.path.join(self.current_video_dir, 'video.mkv'),
                ]
                
                # Find the actual downloaded file
                downloaded_file = None
                for file_path in possible_files:
                    if os.path.exists(file_path):
                        downloaded_file = file_path
                        logger.info(f"Found downloaded video: {file_path}")
                        break
                
                # Check if any video file was downloaded
                if not downloaded_file:
                    # List all files in the directory to see what was actually downloaded
                    if os.path.exists(self.current_video_dir):
                        files = os.listdir(self.current_video_dir)
                        logger.error(f"No expected video file found. Files in directory: {files}")
                        
                        # Look for any video file
                        video_extensions = ['.mp4', '.webm', '.mkv', '.avi', '.mov']
                        for file in files:
                            if any(file.endswith(ext) for ext in video_extensions):
                                downloaded_file = os.path.join(self.current_video_dir, file)
                                logger.info(f"Found alternative video file: {downloaded_file}")
                                break
                
                if not downloaded_file:
                    raise Exception("Video download failed - no video file was created. This video may be restricted or unavailable.")
                
                return downloaded_file
                
        except Exception as e:
            error_msg = str(e)
            logger.error(f"Download error: {error_msg}")
            
            if "Sign in to confirm you're not a bot" in error_msg or "429" in error_msg:
                logger.error("YouTube bot detection triggered.")
                raise Exception("YouTube blocked this request due to bot detection. Try a different video.")
            elif "Failed to extract any player response" in error_msg:
                logger.error("YouTube API structure changed - yt-dlp needs updating.")
                raise Exception("YouTube API error - this video cannot be processed right now. Try a different video or wait for system updates.")
            elif "Private video" in error_msg or "unavailable" in error_msg:
                raise Exception("This video is private, unavailable, or restricted.")
            else:
                raise Exception(f"Video download failed: {error_msg}")

    def perform_ocr(self, frame):
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        text = pytesseract.image_to_string(gray)
        return text.strip()

    def save_keyframes(self, frames, timestamps):
        """Save keyframes to unique video folder."""
        frames_dir = os.path.join(self.current_video_dir, 'frames')
        os.makedirs(frames_dir, exist_ok=True)
        frame_data = []
        
        def process_frame_ocr(args):
            i, frame, timestamp = args
            path = os.path.join(frames_dir, f'frame_{i}.jpg')
            cv2.imwrite(path, frame)
            ocr_text = self.perform_ocr(frame)
            return {
                'path': path,
                'timestamp': timestamp,
                'ocr_text': ocr_text
            }
        
        with ThreadPoolExecutor(max_workers=4) as executor:
            args_list = [(i, frame, timestamp) for i, (frame, timestamp) in enumerate(zip(frames, timestamps))]
            results = list(executor.map(process_frame_ocr, args_list))
            frame_data = results
        
        return frame_data

    def transcribe_audio(self, audio_file):
        """Transcribe audio using Groq's distil-whisper-large-v3-en"""
        try:
            logger.info(f"Starting Groq transcription for: {audio_file}")
            
            with open(audio_file, "rb") as file:
                transcription = self.groq_client.audio.transcriptions.create(
                    file=file,
                    model="distil-whisper-large-v3-en",
                    response_format="verbose_json",  # Get timestamps
                    temperature=0.0
                )
            
            # Convert Groq response to match existing code format
            segments = []
            if hasattr(transcription, 'segments') and transcription.segments:
                for segment in transcription.segments:
                    segments.append({
                        'start': segment.get('start', 0),
                        'end': segment.get('end', 0), 
                        'text': segment.get('text', '')
                    })
            else:
                # Fallback: create a single segment with full text
                segments.append({
                    'start': 0,
                    'end': 0,
                    'text': transcription.text if hasattr(transcription, 'text') else ''
                })
            
            logger.info(f"Groq transcription completed successfully. {len(segments)} segments found.")
            return segments
            
        except Exception as e:
            logger.error(f"Groq transcription failed: {str(e)}")
            # Return empty segments to prevent crashes
            return []

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
            logger.info(f"Processing video from URL: {url}")
            
            # Create unique folder for this video
            self.create_unique_folder(url)
            logger.info(f"Using folder: {self.current_video_dir}")
            
            logger.info(f"Downloading video from URL: {url}")
            video_file = self.download_video(url)
            
            if not os.path.exists(video_file):
                raise FileNotFoundError(f"Downloaded video file not found: {video_file}")

            logger.info(f"Extracting audio from {video_file}")
            audio_file = os.path.join(self.current_video_dir, 'video.mp3')
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

            logger.info("Extracting and saving key frames with optimized method")
            frames, timestamps = self.extract_keyframes(video_file)
            if not frames:
                logger.warning("No frames were extracted from the video. Skipping frame processing.")
                frame_data = []
            else:
                frame_data = self.save_keyframes(frames, timestamps)
            logger.info(f"Optimized frame extraction complete. {len(frame_data)} frames processed.")

            logger.info("Combining data")
            combined_data = self.combine_data(transcript, frame_data)
            logger.info(f"Data combination complete. {len(combined_data)} total items.")
            
            logger.info("Preparing combined transcript")
            combined_transcript = self.prepare_combined_transcript(combined_data)
            
            logger.info("Saving combined transcript")
            transcript_file = os.path.join(self.current_video_dir, 'video_transcript.txt')
            with open(transcript_file, 'w', encoding='utf-8') as f:
                f.write(combined_transcript)

            logger.info("Optimized video processing completed successfully")
            return {
                "video_file": video_file,
                "audio_file": audio_file,
                "transcript_file": transcript_file,
                "video_folder": self.current_video_dir
            }
        except Exception as e:
            logger.error(f"Error processing video: {str(e)}", exc_info=True)
            raise
            
    def get_video_id(self, url):
        """Extract video ID from YouTube URL."""
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