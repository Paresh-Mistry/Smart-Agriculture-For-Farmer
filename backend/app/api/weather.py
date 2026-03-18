from fastapi import HTTPException, Query
import httpx
from datetime import datetime
from ..schemas.weather import WeatherData
from fastapi import APIRouter
import os 
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

class WeatherService:
    def __init__(self):
        self.api_key = os.getenv("WEATHER_API_KEY")
        self.base_url = "https://api.weatherapi.com/v1"
        self.cache = {}

    async def get_weather_by_coordinates(self, lat: float, lon: float) -> WeatherData:
        cache_key = f"{lat}:{lon}"

        # Cache for 30 minutes
        if cache_key in self.cache:
            data, ts = self.cache[cache_key]
            if (datetime.now() - ts).seconds < 1800:
                return data

        try:
            url = f"{self.base_url}/current.json"

            print("Running Weather API Call")
            params = {
                "key": self.api_key,
                "q": f"{lat},{lon}",
                "aqi": "no"
            }

            async with httpx.AsyncClient(timeout=10) as client:
                res = await client.get(url, params=params)
                res.raise_for_status()
                data = res.json()

            weather = WeatherData(
                location=data["location"]["name"],
                region=data["location"]["region"],
                country=data["location"]["country"],
                latitude=data["location"]["lat"],
                longitude=data["location"]["lon"],

                temperature=data["current"]["temp_c"],
                feels_like=data["current"]["feelslike_c"],
                humidity=data["current"]["humidity"],
                wind_speed=data["current"]["wind_kph"],
                wind_direction=data["current"]["wind_dir"],
                pressure=data["current"]["pressure_mb"],
                visibility=data["current"]["vis_km"],
                clouds=data["current"]["cloud"],
                uv_index=data["current"]["uv"],

                condition=data["current"]["condition"]["text"],
                icon=data["current"]["condition"]["icon"],
                timestamp=datetime.now()
            )

            self.cache[cache_key] = (weather, datetime.now())
            return weather

        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
        
weather_service = WeatherService()        

@router.get("/current")
async def get_current_weather(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude")
):
    """
    Example:
    /api/weather/current?lat=25.3333&lon=73.0
    """
    return await weather_service.get_weather_by_coordinates(lat, lon)        