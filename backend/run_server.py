#!/usr/bin/env python3
"""
VidiWise Backend Server Runner
Loads environment variables and starts the FastAPI server
"""

import os
import sys
from pathlib import Path

# Add the app directory to Python path
current_dir = Path(__file__).resolve().parent
app_dir = current_dir / "app"
sys.path.insert(0, str(app_dir))

# Load environment variables from .env file if it exists
env_file = current_dir / ".env"
if env_file.exists():
    print("Loading environment variables from .env file...")
    with open(env_file, 'r') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                os.environ[key] = value
                print(f"Set {key}=***")

# Check for required environment variables
required_vars = ["GROQ_API_KEY"]
missing_vars = []

for var in required_vars:
    if not os.getenv(var):
        missing_vars.append(var)

if missing_vars:
    print(f"\n❌ ERROR: Missing required environment variables: {', '.join(missing_vars)}")
    print("\n📝 Please:")
    print("1. Copy .env.example to .env")
    print("2. Edit .env and add your API keys")
    print("3. Get Groq API key (FREE) from: https://console.groq.com")
    sys.exit(1)

print("\n✅ All environment variables loaded successfully!")
print("🚀 Starting VidiWise backend server...")

# Import and run the FastAPI app
if __name__ == "__main__":
    import uvicorn
    # Change to app directory and run with correct module path
    os.chdir(app_dir)
    uvicorn.run("main:app", host="0.0.0.0", port=8080, reload=True) 