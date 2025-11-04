from pydantic import BaseModel, EmailStr
from datetime import datetime
from enum import Enum
from typing import Optional


# =================
# AUTHENTICATION 
# =================

# 1. Enum for User Roles
class UserRole(Enum):
    user = "user"
    organizer = "organizer"



# 2. User Schemas
class UserBase(BaseModel):
    name: str
    email: EmailStr
    location: str
    phone: Optional[str] = None
    role: UserRole = UserRole.user
    


# Schema for creating a new user
class UserCreate(UserBase):
    password: str


# Schema for returning user data (e.g., API response)
class UserOut(UserBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True


class Token(BaseModel):
    access_token: str
    token_type: str




        