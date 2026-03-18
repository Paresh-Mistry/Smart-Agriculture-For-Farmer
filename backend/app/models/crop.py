"""
Crop listing model - handles agricultural product listings.
"""
from sqlalchemy import Column, ForeignKey, Integer, String, Text, Float, Date, DateTime, Enum, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..config.database import Base
from .enums import CropStatus, CropCategory
from sqlalchemy.dialects.postgresql import UUID
import uuid


class CropListing(Base):
    """Crop listing model for agricultural products."""
    
    __tablename__ = "crop_listings"
    
    # Primary Key
    id = Column(
    UUID(as_uuid=True),
    primary_key=True,
    default=uuid.uuid4,
    unique=True,    
    nullable=False
    )
    # Basic Information
    crop_name = Column(String(100), nullable=False, index=True)
    description = Column(Text, nullable=True)
    # Quantity & Pricing
    quantity_kg = Column(Float, nullable=False)
    price_per_kg = Column(Float, nullable=False)
    discount_percent = Column(Float, default=0.0)
    # Dates
    harvest_date = Column(Date, nullable=False)
    expiry_date = Column(Date, nullable=True)
    # Classification
    category = Column(Enum(CropCategory), nullable=False, default=CropCategory.OTHER, index=True)
    status = Column(Enum(CropStatus), nullable=False, default=CropStatus.AVAILABLE, index=True)
    # Location & Media
    location = Column(String(255), nullable=False, index=True)
    image_url = Column(Text, nullable=True)
    # Seller Information (if needed - add foreign key to User)
    # seller_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=True)
    # Analytics
    views_count = Column(Integer, default=0)
    favorites_count = Column(Integer, default=0)
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    farmer_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=True
    )

    farmer = relationship("User", back_populates="crops")

    
    # Indexes for better query performance
    __table_args__ = (
        Index('idx_crop_category_status', 'category', 'status'),
        Index('idx_crop_location', 'location'),
        Index('idx_crop_price', 'price_per_kg'),
        Index('idx_crop_dates', 'harvest_date', 'expiry_date'),
    )
    
    def __repr__(self):
        return f"<CropListing(id={self.id}, crop_name={self.crop_name}, status={self.status})>"
    
    @property
    def final_price(self) -> float:
        """Calculate final price after discount."""
        if self.discount_percent > 0:
            return round(self.price_per_kg * (1 - self.discount_percent / 100), 2)
        return self.price_per_kg
    
    @property
    def is_expired(self) -> bool:
        """Check if crop has expired."""
        if self.expiry_date:
            from datetime import date
            return date.today() > self.expiry_date
        return False
