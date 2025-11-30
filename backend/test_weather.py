import requests
import json

def test_weather():
    url = "http://localhost:5000/weather?district=Warangal"
    try:
        response = requests.get(url)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print("Response Data:")
            print(json.dumps(data, indent=2))
            
            # Basic validation
            if "weather" in data and "temp" in data["weather"]:
                print("\nSUCCESS: Weather data received.")
                print(f"Temperature: {data['weather']['temp']}°C")
            else:
                print("\nFAILURE: Unexpected response structure.")
        else:
            print(f"\nFAILURE: Server returned {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"\nERROR: Could not connect to server. {e}")

if __name__ == "__main__":
    test_weather()
