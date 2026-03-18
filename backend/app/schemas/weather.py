from pydantic import BaseModel
from datetime import datetime


class WeatherData(BaseModel):
    location: str
    region: str
    country: str
    latitude: float
    longitude: float

    temperature: float
    feels_like: float
    humidity: int
    wind_speed: float
    wind_direction: str
    pressure: float
    visibility: float
    clouds: int
    uv_index: float

    condition: str
    icon: str
    timestamp: datetime
