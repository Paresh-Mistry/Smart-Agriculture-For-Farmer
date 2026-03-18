from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from ..config.database import Base
import uuid

class CropRequest(Base):
    """Buyer sends request to farmer for a crop"""
    __tablename__ = "crop_requests"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    crop_id = Column(UUID(as_uuid=True), ForeignKey("crop_listings.id"), nullable=False)
    buyer_id = Column(Integer, nullable=False)
    farmer_id = Column(Integer, nullable=False)
    
    # Request details
    quantity_kg = Column(Float, nullable=False)
    requested_price = Column(Float, nullable=True)
    message = Column(Text, nullable=True)
    
    # Status: PENDING, ACCEPTED, REJECTED, CANCELLED
    status = Column(String, default="PENDING", nullable=False)
    farmer_response = Column(Text, nullable=True)
    
    # Counter offer
    counter_offer_price = Column(Float, nullable=True)
    final_price = Column(Float, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    responded_at = Column(DateTime, nullable=True)


class Order(Base):
    """Order created after farmer accepts request"""
    __tablename__ = "orders"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    request_id = Column(UUID(as_uuid=True), ForeignKey("crop_requests.id"), nullable=False)
    crop_id = Column(UUID(as_uuid=True), ForeignKey("crop_listings.id"), nullable=False)
    buyer_id = Column(Integer, nullable=False)
    farmer_id = Column(Integer, nullable=False)
    
    # Order details
    quantity_kg = Column(Float, nullable=False)
    price_per_kg = Column(Float, nullable=False)
    total_amount = Column(Float, nullable=False)
    
    # Delivery details
    delivery_address = Column(Text, nullable=False)
    delivery_phone = Column(String, nullable=False)
    delivery_notes = Column(Text, nullable=True)
    
    # Status: PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED
    status = Column(String, default="PENDING", nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())