import pandas as pd
import numpy as np
from statsmodels.tsa.statespace.sarimax import SARIMAX
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

YIELD_PER_ACRE = {
    "Paddy": 20,
    "Maize": 18,
    "Wheat": 12,
    "Cotton": 15,
    "Groundnut": 8
}

def load_and_preprocess_data():
    """Load and preprocess both datasets with enhanced type handling"""
    # Load datasets
    df_districts = pd.read_csv(os.path.join(BASE_DIR, "datasets", "DISTRTICTS_DATASET final.csv"))
    df_crop = pd.read_csv(os.path.join(BASE_DIR, "datasets", "Cropcost.csv"))

    # Process districts data
    df_districts = df_districts.rename(columns={
        'District Name': 'District',
        'Commodity': 'Crop',
        'Modal Price (Rs./Quintal)': 'Price',
        'Price Date': 'Date',
        'qn_per_acre': 'qn_per_acre'
    })

    # Convert date and handle errors
    df_districts['Date'] = pd.to_datetime(
        df_districts['Date'], 
        format='%d-%m-%Y', 
        errors='coerce'
    )
    
    # Clean numeric columns
    df_districts['Price'] = pd.to_numeric(
        df_districts['Price'].astype(str).str.replace(',', ''),
        errors='coerce'
    )
    
    df_districts['qn_per_acre'] = pd.to_numeric(
        df_districts['qn_per_acre'].astype(str).str.replace(',', ''),
        errors='coerce'
    )

    # Clean and standardize crop names
    df_districts['Crop'] = (
        df_districts['Crop']
        .str.lower()
        .str.replace(r'\(.*\)', '', regex=True)
        .str.replace('common', '', regex=False)
        .str.strip()
    )

    # Drop invalid rows
    df_districts = df_districts.dropna(subset=['Date', 'Price', 'qn_per_acre'])

    # Process crop cost data
    df_crop['Crop_Type'] = (
        df_crop['Crop_Type']
        .str.lower()
        .str.strip()
    )
    df_crop['Season'] = (
        df_crop['Season']
        .str.strip()
        .str.title()
    )    
    # Clean expenditure data
    df_crop['Total_Expenditure'] = pd.to_numeric(
        df_crop['Total_Expenditure'].astype(str).str.replace(',', ''),
        errors='coerce'
    )
    
    return df_districts, df_crop

# Load preprocessed data
df_districts, df_crop = load_and_preprocess_data()

import pandas as pd

from ml_pipeline import predict_price_for_district

def calculate_financials(district, crop, season, acres, start_date, mode="recommended", custom_cost_per_acre=0):
    """
    Calculates financials using ML-predicted price (Revenue) and flexible expense logic.
    
    1. REVENUE = ML Predicted Price * Yield * Acres
    2. EXPENSE = (Recommended OR Custom Cost) * Acres
    3. PROFIT = Revenue - Expense
    """
    
    # ------- 1. REVENUE CALCULATION (ML Based) -------
    # Always use ML prediction on static data for revenue
    predicted_price = predict_price_for_district(crop, district)
    
    if predicted_price == 0:
        # Fallback to static data if ML fails (though ML should work on static data)
        print(f"[WARNING] ML Prediction failed for {crop} in {district}. Using static fallback.")
        static_row = df_districts[
            (df_districts["Crop"].str.lower() == crop.lower()) &
            (df_districts["District"].str.lower() == district.lower())
        ].sort_values(by="Date", ascending=False)
        
        if not static_row.empty:
            predicted_price = float(static_row.iloc[0]["Price"])
        else:
            raise ValueError(f"No data found for {crop} in {district}")

    # Get Yield
    # Try to get specific yield from static dataset if available, else default
    static_row_yield = df_districts[
        (df_districts["Crop"].str.lower() == crop.lower()) &
        (df_districts["District"].str.lower() == district.lower())
    ]
    
    if not static_row_yield.empty:
        qn_per_acre = float(static_row_yield.iloc[0]["qn_per_acre"])
    else:
        qn_per_acre = YIELD_PER_ACRE.get(crop.title(), 15)

    total_income = predicted_price * qn_per_acre * acres
    price_source = "ML Predicted (Static Data)"

    # ------- 2. EXPENSE CALCULATION -------
    if mode == "custom":
        cost_per_acre = float(custom_cost_per_acre)
        print(f"Using CUSTOM cost per acre: {cost_per_acre}")
    else:
        # Load recommended cost
        cost_row = df_crop[
            (df_crop["Crop_Type"].str.lower() == crop.lower()) &
            (df_crop["Season"].str.lower() == season.lower())
        ]
        
        if cost_row.empty:
            # Fallback or error? User said "If recommended... use CropCost.csv"
            # If missing, maybe default to 0 or raise error. 
            # Let's assume 0 with warning to avoid crash, or raise if strict.
            print(f"[WARNING] No recommended cost found for {crop} - {season}")
            cost_per_acre = 0
        else:
            cost_per_acre = float(cost_row.iloc[0]["Total_Expenditure"])
            print(f"Using RECOMMENDED cost per acre: {cost_per_acre}")

    total_expense = cost_per_acre * acres

    # ------- 3. PROFIT CALCULATION -------
    balance = total_income - total_expense

    return {
        "modalPrice": round(predicted_price, 2),
        "priceSource": price_source,
        "costPerAcre": cost_per_acre,
        "yieldPerAcre": qn_per_acre,
        "totalIncome": round(total_income, 2),
        "totalExpense": round(total_expense, 2),
        "balance": round(balance, 2),
        "pricePerQuintal": round(predicted_price, 2),
        "quintalsPerAcre": qn_per_acre
    }
