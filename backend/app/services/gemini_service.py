import requests
import json
import os

class GeminiChatbot:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.api_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"
        self.transcript_content = None

    def read_transcript(self, file_path: str) -> bool:
        """Read and store transcript file contents."""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                self.transcript_content = file.read()
            return True
        except Exception as e:
            print(f"Error reading transcript file: {str(e)}")
            return False

    def send_message(self, query: str) -> str:
        """Send message to Gemini API with transcript context."""
        try:
            prompt = f"""Based on this video transcript:

{self.transcript_content}

Question: {query}

Please provide a detailed answer based only on the information in the transcript."""

            data = {
                "contents": [{
                    "parts": [{
                        "text": prompt
                    }]
                }]
            }

            headers = {
                "Content-Type": "application/json"
            }

            response = requests.post(self.api_url, json=data, headers=headers)
            
            if response.status_code == 200:
                result = response.json()
                if 'candidates' in result:
                    return result['candidates'][0]['content']['parts'][0]['text']
                else:
                    return "Error: Unexpected response format from API"
            else:
                return f"Error: API returned status code {response.status_code}"

        except Exception as e:
            return f"Error sending message: {str(e)}"