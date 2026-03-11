# VidiWise - AI-Powered YouTube Video Analysis
## Video Demo
https://youtu.be/oMrTBRdSBio?si=Kt-dYAx5QSNZgl5R
[![Watch the video](https://img.youtube.com/vi/oMrTBRdSBio/0.jpg)](https://youtu.be/oMrTBRdSBio?si=Kt-dYAx5QSNZgl5R)

## Setup Instructions

### Terminal 1 (Backend):

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv/Scripts/activate
# Linux/Mac:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
# Copy .env.example to .env and fill in your API keys
cp .env.example .env

# Edit .env file and add your API keys:
# GROQ_API_KEY=your_groq_api_key_here (Get from https://console.groq.com)
```

**API Keys Required:**
1. **Groq API Key** (FREE): Get from [console.groq.com](https://console.groq.com)
   - Used for speech-to-text transcription
   - Free tier: 14,400 requests/day
2. **Gemini API Key** (FREE): Get from [aistudio.google.com](https://aistudio.google.com/)
   - Used for AI chat functionality
   - Free tier: Generous usage limits

```bash
# Run the backend server
python app/main.py
```

### Terminal 2 (Frontend):

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

## What's New

- ✅ **Replaced Whisper with Groq STT**: 99% smaller deployment size
- ⚡ **10x Faster**: Audio transcription now takes seconds instead of minutes  
- 🆓 **Free Hosting**: Can now deploy on free platforms (Vercel, Railway, Render)
- 📦 **Size**: Reduced from 3.5GB to ~50MB total

## Features

- 🎥 **YouTube Video Processing**: Download and analyze any YouTube video
- 🤖 **AI-Powered Chat**: Ask questions about video content using Gemini AI
- 📝 **Smart Transcription**: Groq's distil-whisper for fast, accurate speech-to-text
- 🖼️ **Frame Analysis**: OCR text extraction from key video frames
- 🔍 **Scene Detection**: Intelligent keyframe selection
- 👥 **User Authentication**: Firebase Auth with Google Sign-in + Demo mode
- 📱 **Modern UI**: Beautiful, responsive interface with animations

