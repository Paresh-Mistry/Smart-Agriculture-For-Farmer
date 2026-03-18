from uuid import UUID
from pydantic import BaseModel, EmailStr
from typing import Optional

class EmailRequest(BaseModel):
    email: EmailStr

class OTPVerifyRequest(BaseModel):
    email: EmailStr
    otp: str
    role: Optional[str] = None  # <-- Add this line

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class CompleteProfileSchema(BaseModel):
    name: str
    phone: str
    location: str | None = None    

class FarmerSchema(BaseModel):
    id: UUID
    name: str
    email: EmailStr | None = None
    phone: str

    class Config:
        from_attributes = True





        