import pandas as pd
from statsmodels.tsa.statespace.sarimax import SARIMAX
from datetime import datetime
import warnings
warnings.filterwarnings("ignore")

import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Global Cache
STATIC_DATA_CACHE = None
PREDICTION_CACHE = {}

def load_static_data():
    """
    Load the static district dataset with caching.
    """
    global STATIC_DATA_CACHE
    if STATIC_DATA_CACHE is not None:
        return STATIC_DATA_CACHE

    try:
        # Load the static dataset
        df = pd.read_csv(os.path.join(BASE_DIR, "datasets", "DISTRTICTS_DATASET final.csv"))
        STATIC_DATA_CACHE = df
        return df
    except Exception as e:
        print(f"Error loading static dataset: {e}")
        raise e


def preprocess_static(df, crop_name, district_name):
    """
    Filter the static district dataset for the given crop & district,
    create a proper time series indexed by Date, and keep a single price column.
    """
    # Rename columns to standard names if needed
    rename_map = {
        'District Name': 'District',
        'Commodity': 'Crop',
        'Modal Price (Rs./Quintal)': 'Price',
        'Price Date': 'Date'
    }
    df = df.rename(columns=rename_map)
    
    # Filter by crop (case-insensitive)
    if "Crop" in df.columns:
        df = df[df["Crop"].str.contains(crop_name, case=False, na=False)]
    
    # Filter by district (case-insensitive)
    if "District" in df.columns:
        df = df[df["District"].str.contains(district_name, case=False, na=False)]
        
    if df.empty:
        raise ValueError(f"No data found for Crop: {crop_name} in District: {district_name}")

    # Ensure Price exists
    if "Price" not in df.columns:
        price_cols = [c for c in df.columns if "Price" in c]
        if price_cols:
            df["Price"] = df[price_cols[0]]
        else:
            raise ValueError("Price column missing from static dataset")

    # Clean Price column
    df["Price"] = df["Price"].astype(str).str.replace(",", "", regex=False)
    df["Price"] = pd.to_numeric(df["Price"], errors="coerce")

    # Ensure Date exists
    if "Date" not in df.columns:
        raise ValueError("Date column missing from static dataset")

    # Convert Date to datetime
    df["Date"] = pd.to_datetime(df["Date"], errors="coerce", dayfirst=True)

    # Drop missing dates or prices
    df = df.dropna(subset=["Date", "Price"])

    # Sort by date
    df = df.sort_values("Date")

    # Set index for SARIMAX
    df.set_index("Date", inplace=True)
    
    return df[["Price"]]


def train_model(df):
    # Ensure we have enough data
    if len(df) < 5:
        return None

    try:
        model = SARIMAX(
            df["Price"],
            order=(1,1,1),
            seasonal_order=(1,1,1,7),
            enforce_stationarity=False,
            enforce_invertibility=False
        )
        return model.fit(disp=False)
    except Exception as e:
        print(f"Model training failed: {e}")
        return None


def generate_forecast(model, steps=30):
    if model is None:
        return pd.DataFrame()

    fc = model.get_forecast(steps)
    mean = fc.predicted_mean
    ci = fc.conf_int()

    df_fc = pd.DataFrame({
        "Predicted_Price": mean,
        "Lower_Bound": ci.iloc[:, 0],
        "Upper_Bound": ci.iloc[:, 1]
    })
    
    # Clip predicted prices
    df_fc["Predicted_Price"] = df_fc["Predicted_Price"].clip(lower=0, upper=15000)
    
    # Apply rolling mean
    df_fc["Predicted_Price"] = df_fc["Predicted_Price"].rolling(3, min_periods=1).mean()
    
    return df_fc


def run_full_pipeline(crop_name, district_name, steps=30):
    df_static = load_static_data()
    df_clean = preprocess_static(df_static, crop_name, district_name)
    
    if len(df_clean) < 10:
        pass

    model = train_model(df_clean)
    forecast = generate_forecast(model, steps)
    
    if not forecast.empty:
        forecast = forecast.reset_index()
        forecast.rename(columns={'index': 'Date'}, inplace=True)
    
    return forecast

def predict_price_for_district(crop, district, days=30):
    """
    Predicts the average price for a crop in a district over the next 'days'.
    Returns the average price.
    Uses caching to avoid re-training models for the same inputs.
    """
    cache_key = f"{crop}_{district}_{days}"
    
    if cache_key in PREDICTION_CACHE:
        return PREDICTION_CACHE[cache_key]

    try:
        forecast = run_full_pipeline(crop, district, steps=days)
        if not forecast.empty:
            avg_price = float(forecast['Predicted_Price'].mean())
            PREDICTION_CACHE[cache_key] = avg_price
            return avg_price
        return 0.0
    except Exception as e:
        print(f"Prediction failed for {district}: {e}")
        return 0.0
