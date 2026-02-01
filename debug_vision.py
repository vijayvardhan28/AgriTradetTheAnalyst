import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv(dotenv_path="backend/.env")

api_key = os.getenv("GROQ_API_KEY")
client = Groq(api_key=api_key)

models_to_test = [
    "llama-3.2-11b-vision-preview",
    "llama-3.2-90b-vision-preview",
    "llama-3.2-vision-preview" 
]

with open("debug_vision.txt", "w", encoding="utf-8") as f:
    for model in models_to_test:
        f.write(f"Testing {model}...\n")
        try:
            # Vision models need an image url or base64. 
            # We'll use a tiny dummy base64 image or just a text prompt if it allows (some might fail without image).
            # But let's try to list models instead? No, let's try a completion.
            
            # Actually, listing models is the best way to see what's available.
            # But let's try a simple chat completion first as listing might not be exposed easily in this client version without looking up docs.
            # Wait, client.models.list() is standard.
            
            pass
        except Exception as e:
            f.write(f"Error: {e}\n")

    try:
        f.write("\nListing available models:\n")
        models = client.models.list()
        for m in models.data:
            f.write(f"- {m.id}\n")
    except Exception as e:
        f.write(f"Error listing models: {e}\n")
