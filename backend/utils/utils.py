from app.models import CropListing
from app.api.mandi import mandi_service
from app.config.database import SessionLocal
from sqlalchemy.orm import Session
from typing import Optional
from app.api.weather import weather_service
from fastapi import Request
from app.services.ip_location import ip_location_service


async def get_db_context(
    request: Request,
    override_lat: Optional[float] = None,
    override_lon: Optional[float] = None,
):
    """
    Get comprehensive context including crops, mandi prices, and weather
    """
    context_text = ""
    db = SessionLocal()

    if override_lat and override_lon:
        latitude = override_lat
        longitude = override_lon
        location_info = {"city": "Manual", "region": "Manual", "source": "manual"}
    else:
        location_data = ip_location_service.get_location_from_request(request)
        latitude = location_data.get("latitude")
        longitude = location_data.get("longitude")
        location_info = location_data
    
    # Add location detection info
    context_text += "=== USER LOCATION (Auto-detected) ===\n\n"
    context_text += f"IP Address: {location_info.get('ip_address', 'N/A')}\n"
    context_text += f"Location: {location_info.get('city')}, {location_info.get('region')}, {location_info.get('country')}\n"
    context_text += f"Coordinates: {latitude}°N, {longitude}°E\n"
    context_text += f"Detection Method: {location_info.get('source')}\n\n"
    
    # 1. Crop Prices from Database
    crops = db.query(CropListing).all()
    
    # 2. Live Mandi Prices (Government Data) - FORMATTED AS TABLE
    mandi_prices = mandi_service.get_all_prices(limit=15)
        
    if mandi_prices:
            context_text += "=== LIVE MANDI PRICES (Government Data) ===\n\n"
            context_text += "| Commodity | Market | State | District | Min Price | Modal Price | Max Price | Date |\n"
            context_text += "|-----------|--------|-------|----------|-----------|-------------|-----------|------|\n"
            
            for price in mandi_prices[:10]:
                context_text += (
                    f"| {price.get('commodity', 'N/A')} | "
                    f"{price.get('market', 'N/A')} | "
                    f"{price.get('state', 'N/A')} | "
                    f"{price.get('district', 'N/A')} | "
                    f"₹{price.get('min_price', 0)} | "
                    f"₹{price.get('modal_price', 0)} | "
                    f"₹{price.get('max_price', 0)} | "
                    f"{price.get('arrival_date', 'N/A')} |\n"
                )
            context_text += "\n"
    else:
            context_text += "No live mandi data available.\n\n"

    if crops:
        context_text += "=== CROP PRICES (From Database) ===\n\n"
        context_text += "| Crop Name | Price per kg | Category | Quantity Available | Location |\n"
        context_text += "|-----------|--------------|----------|-------------------|----------|\n"
        
        for crop in crops[:15]:  # Limit to 15 for context size
            context_text += (
                f"| {crop.crop_name} | ₹{crop.price_per_kg} | {crop.category} | "
                f"{crop.quantity_kg} kg | {crop.location} |\n"
            )
        context_text += "\n"    
    else:
        context_text += "No crop data available in database.\n\n"        
    
    # 3. Current Weather Conditions
    if latitude and longitude:
        try:
            weather = await weather_service.get_weather_by_coordinates(latitude, longitude)
            
            context_text += "=== CURRENT WEATHER CONDITIONS ===\n\n"
            context_text += f"Location: {weather.location}, {weather.region}, {weather.country}\n"
            context_text += f"Coordinates: {weather.latitude}°N, {weather.longitude}°E\n\n"
            
            context_text += "Weather Details:\n"
            context_text += f"- Condition: {weather.condition}\n"
            context_text += f"- Temperature: {weather.temperature}°C (Feels like: {weather.feels_like}°C)\n"
            context_text += f"- Humidity: {weather.humidity}%\n"
            context_text += f"- Wind: {weather.wind_speed} km/h {weather.wind_direction}\n"
            context_text += f"- Pressure: {weather.pressure} mb\n"
            context_text += f"- Visibility: {weather.visibility} km\n"
            context_text += f"- Cloud Cover: {weather.clouds}%\n"
            context_text += f"- UV Index: {weather.uv_index}\n"
            context_text += f"- Last Updated: {weather.timestamp.strftime('%Y-%m-%d %H:%M:%S')}\n\n"
            
            # Agricultural insights based on weather
            context_text += "Agricultural Weather Insights:\n"
            
            # Temperature insights
            if weather.temperature > 35:
                context_text += "⚠️ High temperature - ensure adequate irrigation\n"
            elif weather.temperature < 10:
                context_text += "⚠️ Low temperature - protect sensitive crops from cold\n"
            
            # Humidity insights
            if weather.humidity > 80:
                context_text += "⚠️ High humidity - monitor for fungal diseases\n"
            elif weather.humidity < 30:
                context_text += "⚠️ Low humidity - increase irrigation frequency\n"
            
            # Wind insights
            if weather.wind_speed > 40:
                context_text += "⚠️ High wind speed - secure plants and structures\n"
            
            # UV insights
            if weather.uv_index > 7:
                context_text += "⚠️ High UV index - consider shade for sensitive crops\n"
            
            context_text += "\n"
            
        except Exception as e:
            context_text += f"Weather data unavailable. Error: {str(e)}\n\n"
    
    return context_text, location_info



import math

def distance_km(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)

    a = (
        math.sin(dlat/2)**2 +
        math.cos(math.radians(lat1)) *
        math.cos(math.radians(lat2)) *
        math.sin(dlon/2)**2
    )
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
