from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..config.database import get_db
from ..models.order import CropRequest, Order
from ..models.crop import CropListing
from ..schemas.request import OrderCreate, OrderResponse
from .users import get_current_user_from_token
from typing import List

router = APIRouter()


@router.post("/orders", response_model=OrderResponse, status_code=201)
async def create_order(
    order_data: OrderCreate,
    current_user: dict = Depends(get_current_user_from_token),
    db: Session = Depends(get_db)
):
    """Buyer creates an order after request is accepted"""
    try:
        # Get request
        request = db.query(CropRequest).filter(CropRequest.id == order_data.request_id).first()
        
        if not request:
            raise HTTPException(status_code=404, detail="Request not found")
        
        if request.buyer_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        if request.status != "ACCEPTED":
            raise HTTPException(status_code=400, detail="Request must be accepted first")
        
        # Check if order already exists
        existing = db.query(Order).filter(Order.request_id == request.id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Order already exists")
        
        # Get crop
        crop = db.query(CropListing).filter(CropListing.id == request.crop_id).first()
        
        # Calculate total
        price_per_kg = request.final_price or crop.price_per_kg
        total_amount = price_per_kg * request.quantity_kg
        
        # Create order
        new_order = Order(
            request_id=request.id,
            crop_id=request.crop_id,
            buyer_id=request.buyer_id,
            farmer_id=request.farmer_id,
            quantity_kg=request.quantity_kg,
            price_per_kg=price_per_kg,
            total_amount=total_amount,
            delivery_address=order_data.delivery_address,
            delivery_phone=order_data.delivery_phone,
            delivery_notes=order_data.delivery_notes,
            status="PENDING"
        )
        
        db.add(new_order)
        db.commit()
        db.refresh(new_order)
        
        return new_order
        
    except HTTPException:
        raise
    except Exception as error:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(error))


@router.get("/orders/buyer", response_model=List[OrderResponse])
async def get_buyer_orders(
    status: str = None,
    current_user: dict = Depends(get_current_user_from_token),
    db: Session = Depends(get_db)
):
    """Get all orders for buyer"""
    try:
        query = db.query(Order).filter(Order.buyer_id == current_user.id)
        
        if status:
            query = query.filter(Order.status == status.upper())
        
        orders = query.order_by(Order.created_at.desc()).all()
        return orders
        
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@router.get("/orders/farmer", response_model=List[OrderResponse])
async def get_farmer_orders(
    status: str = None,
    current_user: dict = Depends(get_current_user_from_token),
    db: Session = Depends(get_db)
):
    """Get all orders for farmer"""
    try:
        query = db.query(Order).filter(Order.farmer_id == current_user.id)
        
        if status:
            query = query.filter(Order.status == status.upper())
        
        orders = query.order_by(Order.created_at.desc()).all()
        return orders
        
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@router.get("/orders/{order_id}", response_model=OrderResponse)
async def get_order_details(
    order_id: str,
    current_user: dict = Depends(get_current_user_from_token),
    db: Session = Depends(get_db)
):
    """Get order details"""
    try:
        order = db.query(Order).filter(Order.id == order_id).first()
        
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        if order.buyer_id != current_user.id and order.farmer_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        return order
        
    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@router.put("/orders/{order_id}/status")
async def update_order_status(
    order_id: str,
    status: str,
    current_user: dict = Depends(get_current_user_from_token),
    db: Session = Depends(get_db)
):
    """Update order status (farmer only)"""
    try:
        order = db.query(Order).filter(Order.id == order_id).first()
        
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        if order.farmer_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        order.status = status.upper()
        
        # If delivered, update crop quantity
        if status.upper() == "DELIVERED":
            crop = db.query(CropListing).filter(CropListing.id == order.crop_id).first()
            if crop:
                crop.quantity_kg -= order.quantity_kg
                if crop.quantity_kg <= 0:
                    crop.status = "SOLD"
        
        db.commit()
        db.refresh(order)
        
        return {"message": f"Order status updated to {status}", "order": order}
        
    except HTTPException:
        raise
    except Exception as error:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(error))