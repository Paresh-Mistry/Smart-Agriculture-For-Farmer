import enum
import uuid
from sqlalchemy import Column, Integer, String, Text, Float, Date, DateTime, Enum, func
from ..config.database import Base
from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from ..config.database import Base 
from ..schemas.users import UserOut, UserRole
from sqlalchemy.dialects.postgresql import UUID


class UserRole(enum.Enum):
    user = "user"
    organizer = "organizer"

class Users(Base):
    __tablename__ = "userslist"

    id = Column(Integer, primary_key=True, index=True, default=uuid.uuid4)
    name = Column(String, nullable=False)  
    phone = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=True)
    password = Column(String, nullable=False)
    location = Column(String, nullable=True)
    role = Column(Enum(UserRole), default=UserRole.user)
    created_at = Column(DateTime, default=datetime.utcnow)




class CropStatus(enum.Enum):
    Available = "Available"
    Sold = "Sold"
    Pending = "Pending"

class CropListing(Base):
    __tablename__ = "crops_listings"

    id = Column(Integer, primary_key=True, index=True)
    crop_name = Column(String, nullable=False)
    quantity_kg = Column(Float, nullable=False)
    price_per_kg = Column(Float, nullable=False)
    harvest_date = Column(Date, nullable=False)
    location = Column(String, nullable=False)
    image_url = Column(Text, nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())




