import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv(dotenv_path="backend/.env")

api_key = os.getenv("GROQ_API_KEY")
client = Groq(api_key=api_key)

with open("debug_result.txt", "w", encoding="utf-8") as f:
    try:
        f.write(f"API Key Start: {api_key[:5] if api_key else 'None'}\n")
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": "Hello"}],
            model="llama-3.3-70b-versatile",
        )
        f.write(f"SUCCESS: {chat_completion.choices[0].message.content}\n")
    except Exception as e:
        f.write(f"ERROR: {str(e)}\n")
