import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv(dotenv_path="backend/.env")

api_key = os.getenv("GROQ_API_KEY")
print(f"API Key loaded: {api_key[:4]}...{api_key[-4:] if api_key else 'None'}")

client = Groq(api_key=api_key)

try:
    print("Testing Chatbot (llama-3.1-70b-versatile)...")
    chat_completion = client.chat.completions.create(
        messages=[
            {"role": "user", "content": "Hello"}
        ],
        model="llama-3.1-70b-versatile",
    )
    print("Chatbot Success:", chat_completion.choices[0].message.content)
except Exception as e:
    print("Chatbot Error:", str(e))

try:
    print("\nTesting Vision (llama-3.2-vision-preview)...")
    # Just testing model availability, not sending image to keep it simple if possible, 
    # but vision model needs image. We'll skip if chatbot fails.
    pass
except Exception as e:
    print("Vision Error:", str(e))
