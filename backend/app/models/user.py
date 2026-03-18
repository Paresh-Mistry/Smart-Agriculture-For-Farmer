"""
User model - handles user authentication and profiles.
"""
from sqlalchemy import Column, Integer, String, DateTime, Enum, Index
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
from ..config.database import Base
from .enums import UserRole


class User(Base):
    """User model for authentication and user management."""
    
    __tablename__ = "users"
    
    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    
    # User Information
    # name = Column(String(100), nullable=False)
    # phone = Column(String(15), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=True)
    phone = Column(String(15), unique=True, nullable=True)
    email = Column(String(255), unique=True, nullable=True, index=True)
    password = Column(String(255), nullable=False)
    
    # Profile Information
    location = Column(String(255), nullable=True)
    profile_image = Column(String(500), nullable=True)
    
    # Role & Status
    # role = Column(Enum(UserRole, name="userrole"), nullable=True)
    role = Column(String(20), nullable=True)

    is_active = Column(Integer, default=1)  # 1=active, 0=inactive
    is_verified = Column(Integer, default=0)  # 1=verified, 0=not verified
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    crops = relationship("CropListing", back_populates="farmer")
    
    # Indexes for better query performance
    __table_args__ = (
        Index('idx_user_phone_email', 'phone', 'email'),
        Index('idx_user_role', 'role'),
    )
    
    def __repr__(self):
        return f"<User(id={self.id}, name={self.name}, role={self.role})>"
