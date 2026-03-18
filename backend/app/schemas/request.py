from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

# Request Schemas
class CropRequestCreate(BaseModel):
    crop_id: str
    quantity_kg: float = Field(..., gt=0)
    requested_price: Optional[float] = Field(None, gt=0)
    message: Optional[str] = None

class CropRequestResponse(BaseModel):
    id: str
    crop_id: str
    buyer_id: int
    farmer_id: int
    quantity_kg: float
    requested_price: Optional[float]
    message: Optional[str]
    status: str
    farmer_response: Optional[str]
    counter_offer_price: Optional[float]
    final_price: Optional[float]
    created_at: datetime
    updated_at: datetime
    responded_at: Optional[datetime]
    
    # Extra fields
    crop_name: Optional[str] = None
    crop_image: Optional[str] = None
    
    class Config:
        from_attributes = True

class FarmerRequestAction(BaseModel):
    action: str = Field(..., pattern="^(accept|reject|counter)$")
    response_message: Optional[str] = None
    counter_offer_price: Optional[float] = Field(None, gt=0)


# Order Schemas
class OrderCreate(BaseModel):
    request_id: str
    delivery_address: str
    delivery_phone: str
    delivery_notes: Optional[str] = None

class OrderResponse(BaseModel):
    id: str
    request_id: str
    crop_id: str
    buyer_id: int
    farmer_id: int
    quantity_kg: float
    price_per_kg: float
    total_amount: float
    delivery_address: str
    delivery_phone: str
    delivery_notes: Optional[str]
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True