import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv(dotenv_path="backend/.env")

api_key = os.getenv("GROQ_API_KEY")
client = Groq(api_key=api_key)

# We need a dummy image URL or base64 for vision test.
# Groq supports image URLs. Let's use a placeholder.
image_url = "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg"

models_to_test = [
    "meta-llama/llama-4-scout-17b-16e-instruct",
    "meta-llama/llama-4-maverick-17b-128e-instruct"
]

with open("debug_vision_result.txt", "w", encoding="utf-8") as f:
    for model in models_to_test:
        f.write(f"Testing {model}...\n")
        try:
            chat_completion = client.chat.completions.create(
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": "What's in this image?"},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": image_url,
                                },
                            },
                        ],
                    }
                ],
                model=model,
            )
            f.write(f"SUCCESS: {chat_completion.choices[0].message.content[:50]}...\n")
        except Exception as e:
            f.write(f"FAILED: {str(e)}\n")
