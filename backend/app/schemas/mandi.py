from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime

class MandiPriceResponse(BaseModel):
    id: str
    state: str
    district: str
    market: str
    commodity: str
    variety: Optional[str]
    grade: Optional[str]
    min_price: float
    max_price: float
    modal_price: float
    arrival_date: date
    created_at: datetime
    
    class Config:
        from_attributes = True


class MandiPriceSearch(BaseModel):
    state: Optional[str] = None
    district: Optional[str] = None
    commodity: Optional[str] = None
    date_from: Optional[date] = None
    date_to: Optional[date] = None


class LivePriceResponse(BaseModel):
    commodity: str
    state: str
    district: str
    market: str
    modal_price: float
    min_price: float
    max_price: float
    date: str
    trend: Optional[str] = None  # up, down, stable


class PriceTrendResponse(BaseModel):
    commodity: str
    dates: List[str]
    prices: List[float]
    average_price: float
    min_price: float
    max_price: float
    trend: str