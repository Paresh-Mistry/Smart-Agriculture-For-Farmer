from pydantic import BaseModel
from datetime import date, datetime
from enum import Enum

class CropStatus(str, Enum):
    Available = "Available"
    Sold = "Sold"
    Pending = "Pending"

class CropListingBase(BaseModel):   
    # farmer_id: int
    crop_name: str
    quantity_kg: float
    price_per_kg: float
    harvest_date: date
    location: str
    image_url: str | None = None
    description: str | None = None

class CropListingCreate(CropListingBase):
    pass

class CropListingResponse(CropListingBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True
