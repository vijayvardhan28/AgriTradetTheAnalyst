# app.py
from flask import Flask, jsonify, request
from flask_cors import CORS
from model import calculate_financials, df_districts, df_crop
from ml_pipeline import run_full_pipeline
from arbitrage import find_best_arbitrage
from credit_score import calculate_credit_score
import os
from dotenv import load_dotenv
from groq_ai import agri_chatbot, detect_crop_disease, disease_treatment

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["https://agritradeanalyst.vercel.app", "http://localhost:5173", "http://127.0.0.1:5173"]}})

# -----------------------
# BASIC OPTION ROUTES
# -----------------------
@app.route('/districts', methods=['GET'])
def get_districts():
    districts = df_districts['District'].unique().tolist()
    return jsonify(sorted(districts))

@app.route('/crops', methods=['GET'])
def get_crops():
    crops = df_districts['Crop'].unique().tolist()
    return jsonify(sorted(crops))

@app.route('/seasons', methods=['GET'])
def get_seasons():
    seasons = df_crop['Season'].unique().tolist()
    return jsonify(sorted(seasons))


# -----------------------
# DYNAMIC ML PREDICTION
# -----------------------
@app.route("/predict-latest", methods=["GET"])
def predict_latest():
    try:
        crop = request.args.get("crop")
        district = request.args.get("district")

        if not crop or not district:
             return jsonify({"error": "Missing crop or district parameters"}), 400

        print(f"ML REQUEST FOR: Crop={crop}, District={district}")

        forecast = run_full_pipeline(crop_name=crop, district_name=district)
        return forecast.to_json(orient="records")

    except Exception as e:
        return {"error": str(e)}, 400


# -----------------------
# LATEST PRICE SCRAPER
# -----------------------
@app.route('/update-latest-prices', methods=['GET'])
def update_latest_prices():
    try:
        import pandas as pd
        from datetime import datetime, timedelta

        url = "https://datamandi.com/Telangana/paddy-price"
        tables = pd.read_html(url)

        if len(tables) == 0:
            return {"error": "No tables found on DataMandi"}, 500

        df = tables[0]
        df.columns = [col.replace(" ", "_") for col in df.columns]

        df["Date"] = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")

        # Fix modal price naming
        if "Modal_Price" not in df.columns:
            for col in df.columns:
                if "Modal" in col or "modal" in col:
                    df.rename(columns={col: "Modal_Price"}, inplace=True)

        df["Commodity"] = "Paddy"
        df["District"] = df["Market"]

        import os
        BASE_DIR = os.path.dirname(os.path.abspath(__file__))
        df.to_csv(os.path.join(BASE_DIR, "datasets", "latest_prices.csv"), index=False)

        print("Latest Data Saved!")

        return {"status": "success", "rows": len(df)}

    except Exception as e:
        return {"error": f"Scraper failed: {str(e)}"}, 500


# -----------------------
# FINANCIAL CALCULATOR
# -----------------------
@app.route('/calculate', methods=['POST'])
def calculate():
    try:
        data = request.get_json()
        result = calculate_financials(
            district=data['district'],
            crop=data['crop'],
            season=data['season'],
            acres=data['acres'],
            start_date="2023-01-01",
            mode=data.get('expenseMode', 'recommended'),
            custom_cost_per_acre=data.get('customExpensePerAcre', 0)
        )
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 400


# -----------------------
# SMART MARKET ARBITRAGE
# -----------------------
@app.route('/arbitrage', methods=['POST'])
def arbitrage():
    try:
        data = request.get_json()
        crop = data.get('crop')
        district = data.get('district')
        
        if not crop or not district:
            return jsonify({"error": "Missing crop or district"}), 400
            
        result = find_best_arbitrage(crop, district)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 400




# -----------------------
# AGRI-CREDIT SCORE
# -----------------------
@app.route('/credit-score', methods=['POST'])
def credit_score():
    try:
        data = request.get_json()
        income = data.get('income')
        expense = data.get('expense')
        crop = data.get('crop')
        
        if income is None or expense is None or not crop:
            return jsonify({"error": "Missing income, expense, or crop"}), 400
            
        # Get ML Forecast for Risk Calculation
        # We need a district to run the pipeline. If not provided, default to Warangal or try to infer?
        # The frontend doesn't send district to /credit-score currently.
        # Let's check if we can get it or default.
        district = data.get('district', 'Warangal') 
        
        try:
            forecast_df = run_full_pipeline(crop_name=crop, district_name=district)
        except:
            forecast_df = None
            
        result = calculate_credit_score(float(income), float(expense), crop, forecast_df)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 400


# -----------------------
# WEATHER & RISK API
# -----------------------
@app.route('/weather', methods=['GET'])
def get_weather():
    try:
        district = request.args.get('district', 'Warangal')
        
        # Coordinates for Telangana Districts
        DISTRICT_COORDS = {
            "Adilabad": {"lat": 19.6759, "lon": 78.5320},
            "Bhadradri Kothagudem": {"lat": 17.5472, "lon": 80.6450},
            "Hanumakonda": {"lat": 18.0000, "lon": 79.5800},
            "Hyderabad": {"lat": 17.3850, "lon": 78.4867},
            "Jagtial": {"lat": 18.7865, "lon": 78.9120},
            "Jangaon": {"lat": 17.7219, "lon": 79.1572},
            "Jayashankar Bhupalpally": {"lat": 18.4333, "lon": 79.8667},
            "Jogulamba Gadwal": {"lat": 16.2333, "lon": 77.7667},
            "Kamareddy": {"lat": 18.3167, "lon": 78.3500},
            "Karimnagar": {"lat": 18.4386, "lon": 79.1288},
            "Khammam": {"lat": 17.2473, "lon": 80.1514},
            "Kumuram Bheem": {"lat": 19.3500, "lon": 79.5000},
            "Mahabubabad": {"lat": 17.6000, "lon": 80.0000},
            "Mahabubnagar": {"lat": 16.7488, "lon": 78.0035},
            "Mancherial": {"lat": 18.8679, "lon": 79.4639},
            "Medak": {"lat": 18.0485, "lon": 78.2656},
            "Medchal-Malkajgiri": {"lat": 17.6300, "lon": 78.4800},
            "Mulugu": {"lat": 18.1833, "lon": 79.9333},
            "Nagarkurnool": {"lat": 16.4833, "lon": 78.3333},
            "Nalgonda": {"lat": 17.0500, "lon": 79.2667},
            "Narayanpet": {"lat": 16.7333, "lon": 77.5000},
            "Nirmal": {"lat": 19.1000, "lon": 78.3500},
            "Nizamabad": {"lat": 18.6725, "lon": 78.0941},
            "Peddapalli": {"lat": 18.6167, "lon": 79.3833},
            "Rajanna Sircilla": {"lat": 18.3833, "lon": 78.8000},
            "Ranga Reddy": {"lat": 17.3000, "lon": 78.5000},
            "Sangareddy": {"lat": 17.6140, "lon": 78.0816},
            "Siddipet": {"lat": 18.1000, "lon": 78.8500},
            "Suryapet": {"lat": 17.1500, "lon": 79.6167},
            "Vikarabad": {"lat": 17.3333, "lon": 77.9000},
            "Wanaparthy": {"lat": 16.3667, "lon": 78.0667},
            "Warangal": {"lat": 17.9689, "lon": 79.5941},
            "Yadadri Bhuvanagiri": {"lat": 17.5167, "lon": 78.8833}
        }

        coords = DISTRICT_COORDS.get(district)
        
        if not coords:
            # Default to Warangal if not found
            coords = DISTRICT_COORDS["Warangal"]

        # Fetch from Open-Meteo
        import requests
        url = f"https://api.open-meteo.com/v1/forecast?latitude={coords['lat']}&longitude={coords['lon']}&current=temperature_2m,relative_humidity_2m,rain,wind_speed_10m&wind_speed_unit=kmh"
        
        response = requests.get(url)
        data = response.json()
        
        current = data.get('current', {})
        
        weather_data = {
            "temp": current.get('temperature_2m', 0),
            "humidity": current.get('relative_humidity_2m', 0),
            "rainfall": current.get('rain', 0),
            "wind_speed": current.get('wind_speed_10m', 0)
        }
        
        # Risk Calculation based on REAL data
        risk = "Low Risk"
        advisory = "Good weather conditions. Suitable for farming activities."
        
        if weather_data['rainfall'] > 10:
            risk = "High Risk"
            advisory = "Heavy rainfall detected. Delay harvest and protect stored crops."
        elif weather_data['humidity'] > 85:
            risk = "High Risk"
            advisory = "High humidity detected. Risk of fungal diseases. Monitor crops."
        elif weather_data['temp'] > 40:
            risk = "Moderate Risk"
            advisory = "Extreme heat. Ensure adequate irrigation to prevent heat stress."
        elif weather_data['wind_speed'] > 20:
            risk = "Moderate Risk"
            advisory = "High winds detected. Avoid spraying pesticides."
            
        return jsonify({
            "district": district,
            "weather": weather_data,
            "risk": risk,
            "advisory": advisory
        })
        
    except Exception as e:
        print(f"Weather Error: {e}")
        return jsonify({"error": str(e)}), 500


# -----------------------
# 30-DAY PROFIT FORECAST
# -----------------------
@app.route('/predict-30-days', methods=['POST'])
def predict_30_days():
    try:
        data = request.get_json()
        crop = data.get('crop')
        district = data.get('district')
        acres = float(data.get('acres', 1))
        # We need the TOTAL expense to calculate profit. 
        # This should be passed from the frontend after /calculate
        total_expense = float(data.get('total_expense', 0))
        
        if not crop or not district:
            return jsonify({"error": "Missing crop or district"}), 400

        # Run ML Pipeline
        forecast_df = run_full_pipeline(crop_name=crop, district_name=district)
        
        # Yield Dictionary (Simple lookup)
        YIELD_PER_ACRE = {
            "Paddy": 20,
            "Maize": 18,
            "Wheat": 12,
            "Cotton": 15,
            "Groundnut": 8,
            "Chilli": 10
        }
        crop_yield = YIELD_PER_ACRE.get(crop.title(), 15) # Default 15 if not found
        
        results = []
        # forecast_df has 'Predicted_Price' (per quintal usually)
        # We need to handle the date. The pipeline sets index as Date but returns records.
        # Let's check run_full_pipeline output format. It returns a DataFrame.
        # We will iterate through it.
        
        # Reset index to get Date as column if it's in index
        if 'Date' not in forecast_df.columns:
            forecast_df = forecast_df.reset_index()
            
        for i, row in forecast_df.iterrows():
            price = row['Predicted_Price']
            
            # Income = Price * Yield * Acres
            predicted_income = price * crop_yield * acres
            
            # Profit = Income - Expense
            predicted_profit = predicted_income - total_expense
            
            # Handle Date
            date_str = f"Day {i+1}"
            if 'Date' in row and row['Date'] is not None:
                try:
                    date_str = row['Date'].strftime('%Y-%m-%d')
                except:
                    date_str = str(row['Date'])
            elif 'index' in row and row['index'] is not None:
                try:
                    date_str = row['index'].strftime('%Y-%m-%d')
                except:
                    date_str = str(row['index'])

            results.append({
                "day": i + 1,
                "date": date_str,
                "price": round(price, 2),
                "income": round(predicted_income, 2),
                "profit": round(predicted_profit, 2)
            })
            
        return jsonify(results)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# -----------------------
# CHATBOT ENDPOINT (GROQ)
# -----------------------
@app.route('/chatbot', methods=['POST'])
def chatbot_endpoint():
    try:
        data = request.get_json()
        message = data.get('message')
        language = data.get('language', 'English')
        
        if not message:
            return jsonify({"error": "Message is required"}), 400
            
        response = agri_chatbot(message, language)
        return jsonify(response)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# -----------------------
# CROP DISEASE DETECTION (GROQ)
# -----------------------
@app.route('/disease-detect', methods=['POST'])
def disease_detect_endpoint():
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No image file provided"}), 400
            
        file = request.files['image']
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400

        # Read image data
        image_data = file.read()
        
        # Detect Disease
        disease_name = detect_crop_disease(image_data)
        
        # Get Treatment
        treatment_info = disease_treatment(disease_name)
        
        return jsonify({
            "disease": disease_name,
            "treatment": treatment_info
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
