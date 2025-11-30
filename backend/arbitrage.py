
import pandas as pd
import numpy as np
from model import df_districts

# -----------------------------------------
# REALISTIC DISTANCE MAP (Approx KM)
# -----------------------------------------
DISTANCE_MAP = {
    tuple(sorted(("Khammam", "Warangal"))): 120,
    tuple(sorted(("Khammam", "Nalgonda"))): 110,
    tuple(sorted(("Khammam", "Karimnagar"))): 180,
    tuple(sorted(("Warangal", "Nalgonda"))): 90,
    tuple(sorted(("Warangal", "Karimnagar"))): 70,
    tuple(sorted(("Nalgonda", "Mahbubnagar"))): 140,
    tuple(sorted(("Adilabad", "Karimnagar"))): 170,
    tuple(sorted(("Adilabad", "Nizamabad"))): 150,
    tuple(sorted(("Nizamabad", "Karimnagar"))): 130,
    tuple(sorted(("Nizamabad", "Medak"))): 110,
    tuple(sorted(("Medak", "Warangal"))): 140,
    tuple(sorted(("Medak", "Hyderabad"))): 100,
    tuple(sorted(("Hyderabad", "Nalgonda"))): 100,
    tuple(sorted(("Hyderabad", "Mahbubnagar"))): 100,
    tuple(sorted(("Rangareddy", "Hyderabad"))): 40,
    tuple(sorted(("Rangareddy", "Nalgonda"))): 120,
}

DEFAULT_DISTANCE = 100  # Fallback if not found
TRANSPORT_RATE_PER_KM = 10  # ₹10 per km

def get_distance(d1, d2):
    if d1.lower() == d2.lower():
        return 0
    # Try exact match
    key = tuple(sorted((d1, d2)))
    if key in DISTANCE_MAP:
        return DISTANCE_MAP[key]
    
    # Try case-insensitive match
    for k, v in DISTANCE_MAP.items():
        if k[0].lower() == d1.lower() and k[1].lower() == d2.lower():
            return v
        if k[1].lower() == d1.lower() and k[0].lower() == d2.lower():
            return v
            
    return DEFAULT_DISTANCE

from ml_pipeline import predict_price_for_district

def find_best_arbitrage(crop, user_district):
    """
    ML-Powered Arbitrage Finder (Static Data).
    - Uses predict_price_for_district (ML) for ALL districts.
    - Calculates Net Gain = (Target ML Price - User ML Price) - Transport Cost.
    - Returns Top 5.
    """
    if df_districts.empty:
        raise ValueError("Static dataset not loaded")

    # 1. Get All Unique Districts that have data for this crop
    # This optimization prevents trying to predict for districts that don't grow this crop
    crop_districts = df_districts[df_districts["Crop"].str.lower() == crop.lower()]["District"].unique().tolist()
    
    if not crop_districts:
        raise ValueError(f"No districts found with data for crop: {crop}")
    
    # 2. Get User District Price (ML)
    user_price = predict_price_for_district(crop, user_district)
    
    if user_price == 0:
        raise ValueError(f"Could not predict price for {crop} in {user_district}")
        
    results = []
    
    # 3. Compare with Other Districts
    for district in crop_districts:
        # Skip user's own district
        if district.lower() == user_district.lower():
            continue
            
        # Predict Target Price (ML)
        target_price = predict_price_for_district(crop, district)
        
        if target_price == 0:
            continue # Skip if prediction fails
            
        # Calculate Logic
        distance = get_distance(user_district, district)
        transport_cost = distance * TRANSPORT_RATE_PER_KM
        
        price_diff = target_price - user_price
        net_gain = price_diff - transport_cost
        
        results.append({
            "district": district,
            "price": round(target_price, 2),
            "price_diff": round(price_diff, 2),
            "distance": distance,
            "transport_cost": transport_cost,
            "net_gain": round(net_gain, 2)
        })
        
    # 4. Sort by Net Gain (Descending)
    results.sort(key=lambda x: x["net_gain"], reverse=True)
    
    # 5. Return Top 5
    return {
        "user_district": user_district,
        "user_price": round(user_price, 2),
        "opportunities": results[:5]
    }
