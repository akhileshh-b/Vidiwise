#!/bin/bash

echo "🔒 VidiWise Environment Setup Script"
echo "======================================"

# Backend environment setup
echo ""
echo "📦 Setting up Backend environment..."
if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env from template"
else
    echo "⚠️  backend/.env already exists"
fi

# Frontend environment setup
echo ""
echo "🌐 Setting up Frontend environment..."
if [ ! -f "frontend/.env" ]; then
    cp frontend/.env.example frontend/.env
    echo "✅ Created frontend/.env from template"
else
    echo "⚠️  frontend/.env already exists"
fi

echo ""
echo "🔑 REQUIRED: Get your API keys:"
echo "  1. Groq API (FREE): https://console.groq.com"
echo "  2. Gemini API (FREE): https://aistudio.google.com"
echo ""
echo "📝 Edit these files and add your API keys:"
echo "  - backend/.env (GROQ_API_KEY, GEMINI_API_KEY)"
echo "  - frontend/.env (Firebase + REACT_APP_API_URL)"
echo ""
echo "⚠️  NEVER commit .env files to git!"
echo "✅ All secrets are now environment-based - no hardcoded values!" 