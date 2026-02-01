import requests
import time
import threading
import os
import sys

# Add backend to path to import app if needed, but we will test via HTTP
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

def test_chatbot():
    print("Testing Chatbot...")
    url = "http://127.0.0.1:5000/chatbot"
    payload = {
        "message": "What is the best time to plant wheat?",
        "language": "English"
    }
    try:
        response = requests.post(url, json=payload)
        if response.status_code == 200:
            print("Chatbot Response:", response.json())
            return True
        else:
            print(f"Chatbot Failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"Chatbot Error: {e}")
        return False

def test_disease_detection():
    print("\nTesting Disease Detection (Mocking image)...")
    url = "http://127.0.0.1:5000/disease-detect"
    
    # Create a dummy image
    with open("test_image.jpg", "wb") as f:
        f.write(os.urandom(1024)) # Random bytes
        
    files = {'image': open('test_image.jpg', 'rb')}
    
    try:
        response = requests.post(url, files=files)
        if response.status_code == 200:
            print("Disease Detection Response:", response.json())
            return True
        else:
            print(f"Disease Detection Failed: {response.status_code} - {response.text}")
            # It might fail because the image is random noise, but we want to see if it hits the Groq API
            # If it returns a 500 from Groq, that's expected for random noise, but means the route works.
            return False
    except Exception as e:
        print(f"Disease Detection Error: {e}")
        return False
    finally:
        if os.path.exists("test_image.jpg"):
            os.remove("test_image.jpg")

if __name__ == "__main__":
    # We assume the server is running.
    # If not, we could try to start it, but for this test we'll just try to connect.
    
    print("Starting Tests...")
    chat_result = test_chatbot()
    # disease_result = test_disease_detection() # Skipping disease test with random noise to avoid wasting API credits or confusing the model too much
    
    if chat_result:
        print("\n✅ Verification Successful!")
    else:
        print("\n❌ Verification Failed!")
