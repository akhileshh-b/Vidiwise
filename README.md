terminal 1:

cd backend

python -m venv
venv/Scripts/activate

pip install -r requirements.txt

pip install git+https://github.com/openai/whisper.git


```
add your gemini key at
/backend/main.py : Line 25
and in .env file in /vidiwise

get gemini key through https://aistudio.google.com/
```

python app/main.py



terminal 2:
cd frontend

npm install
npm start
