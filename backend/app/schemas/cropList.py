# schemas/cropList.py - SIMPLIFIED VERSION
from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date, datetime
from enum import Enum
from uuid import UUID as PyUUID
from .users import FarmerSchema

class Category(str, Enum):
    GRAINS = "Grains"
    FRUITS = "Fruits"
    VEGETABLES = "Vegetables"
    LEGUMES = "Legumes"
    SPICES = "Spices"
    OILSEEDS = "Oilseeds"
    OTHER = "Other"

# class Category(str, Enum):
#     GRAINS = "GRAINS"
#     FRUITS = "FRUITS"
#     VEGETABLES = "VEGETABLES"
#     LEGUMES = "LEGUMES"
#     SPICES = "SPICES"
#     OILSEEDS = "OILSEEDS"
#     OTHER = "OTHER"


class Status(str, Enum):
    AVAILABLE = "AVAILABLE"
    SOLD = "SOLD"
    PENDING = "PENDING"
    RESERVED = "RESERVED"

class CropListingResponse(BaseModel):
    """Schema for crop listing API response."""
    id: PyUUID   
    crop_name: str
    description: Optional[str] = None
    quantity_kg: float
    price_per_kg: float
    discount_percent: float
    harvest_date: date
    expiry_date: Optional[date] = None
    category: Category
    status: Status
    location: str
    image_url: Optional[str] = None
    views_count: int = 0
    favorites_count: int = 0
    created_at: datetime
    updated_at: Optional[datetime] = None
    farmer: FarmerSchema

    model_config = ConfigDict(from_attributes=True)



class SoilWeatherInput(BaseModel):
    Nitrogen: float
    Phosphorus: float
    Potassium: float
    Temperature: float
    Humidity: float
    pH_Value: float
    Rainfall: float


class ExistingCropInput(BaseModel):
    Crop: str
    Nitrogen: float
    Phosphorus: float
    Potassium: float
    Temperature: float
    Humidity: float
    pH_Value: float
    Rainfall: float