import os
import base64
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

# Initialize Groq Client
client = Groq(
    api_key=os.environ.get("GROQ_API_KEY"),
)

def agri_chatbot(message, language="English"):
    """
    Chatbot function using llama-3.1-70b-versatile
    """
    system_prompt = f"""
    You are an expert agricultural assistant. Your purpose is to help farmers and agriculture enthusiasts with their questions.
    
    RULES:
    1. You must ONLY answer questions related to agriculture, farming, crops, soil, weather for farming, pest control, livestock, and government agricultural schemes.
    2. If a user asks a question that is NOT related to agriculture (e.g., movies, sports, coding, general knowledge, politics), you must politely decline and explain that you can only assist with agriculture-related topics.
    3. Provide accurate, practical, and helpful advice.
    4. Keep responses concise and easy to understand for farmers.
    5. If the query is ambiguous, ask for clarification in the context of agriculture.
    6. IMPORTANT: You must answer in the {language} language.
    """

    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": system_prompt,
                },
                {
                    "role": "user",
                    "content": message,
                }
            ],
            model="llama-3.3-70b-versatile",
        )
        return {"reply": chat_completion.choices[0].message.content}
    except Exception as e:
        return {"error": str(e)}

def detect_crop_disease(image_bytes):
    """
    Disease detection function using llama-3.2-vision-preview
    """
    try:
        # Encode image to base64
        base64_image = base64.b64encode(image_bytes).decode('utf-8')
        
        prompt = """
        Identify the crop disease in this image. 
        If healthy, say 'Healthy Plant'. 
        Provide just the disease name.
        """

        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}",
                            },
                        },
                    ],
                }
            ],
            model="meta-llama/llama-4-scout-17b-16e-instruct",
        )
        
        disease_name = chat_completion.choices[0].message.content.strip()
        return disease_name
    except Exception as e:
        return f"Error detecting disease: {str(e)}"

def disease_treatment(disease_name, crop_name="Unknown Crop"):
    """
    Disease treatment function using llama-3.3-70b-versatile
    """
    try:
        prompt = f"""
        Provide treatment steps for the disease '{disease_name}' in '{crop_name}'.
        Also provide prevention tips.
        
        Format the response in clean Markdown:
        - Use '### Treatment' and '### Prevention' as headers.
        - Use bullet points for steps.
        - Keep it concise and practical for farmers.
        """

        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="llama-3.3-70b-versatile",
        )
        
        return chat_completion.choices[0].message.content
    except Exception as e:
        return f"Error getting treatment: {str(e)}"
