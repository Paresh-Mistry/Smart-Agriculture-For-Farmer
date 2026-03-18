from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..config.database import get_db
from ..models.order import CropRequest
from ..models.crop import CropListing
from ..schemas.request import (
    CropRequestCreate, 
    CropRequestResponse, 
    FarmerRequestAction
)
from .users import get_current_user_from_token
from datetime import datetime
from typing import List

router = APIRouter()


@router.post("/requests", response_model=CropRequestResponse, status_code=201)
async def create_crop_request(
    request_data: CropRequestCreate,
    current_user: dict = Depends(get_current_user_from_token),
    db: Session = Depends(get_db)
):
    """Buyer sends a request to farmer for a crop"""
    try:
        # Get crop
        crop = db.query(CropListing).filter(CropListing.id == request_data.crop_id).first()
        
        if not crop:
            raise HTTPException(status_code=404, detail="Crop not found")
        
        if crop.status != "AVAILABLE":
            raise HTTPException(status_code=400, detail="Crop is not available")
        
        if crop.farmer_id == current_user.id:
            raise HTTPException(status_code=400, detail="Cannot request your own crop")
        
        if request_data.quantity_kg > crop.quantity_kg:
            raise HTTPException(
                status_code=400, 
                detail=f"Requested quantity exceeds available ({crop.quantity_kg} kg)"
            )
        
        # Create request
        new_request = CropRequest(
            crop_id=request_data.crop_id,
            buyer_id=current_user.id,
            farmer_id=crop.farmer_id,
            quantity_kg=request_data.quantity_kg,
            requested_price=request_data.requested_price,
            message=request_data.message,
            status="PENDING"
        )
        
        db.add(new_request)
        db.commit()
        db.refresh(new_request)
        
        # Add crop details
        response = CropRequestResponse.from_orm(new_request)
        response.crop_name = crop.crop_name
        response.crop_image = crop.image_url
        
        return response
        
    except HTTPException:
        raise
    except Exception as error:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(error))


@router.get("/requests/buyer", response_model=List[CropRequestResponse])
async def get_buyer_requests(
    status: str = None,
    current_user: dict = Depends(get_current_user_from_token),
    db: Session = Depends(get_db)
):
    """Get all requests made by the buyer"""
    try:
        query = db.query(CropRequest).filter(CropRequest.buyer_id == current_user.id)
        
        if status:
            query = query.filter(CropRequest.status == status.upper())
        
        requests = query.order_by(CropRequest.created_at.desc()).all()
        
        # Add crop details
        response_list = []
        for req in requests:
            crop = db.query(CropListing).filter(CropListing.id == req.crop_id).first()
            req_response = CropRequestResponse.from_orm(req)
            if crop:
                req_response.crop_name = crop.crop_name
                req_response.crop_image = crop.image_url
            response_list.append(req_response)
        
        return response_list
        
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@router.get("/requests/farmer", response_model=List[CropRequestResponse])
async def get_farmer_requests(
    status: str = None,
    current_user: dict = Depends(get_current_user_from_token),
    db: Session = Depends(get_db)
):
    """Get all requests received by the farmer"""
    try:
        query = db.query(CropRequest).filter(CropRequest.farmer_id == current_user.id)
        
        if status:
            query = query.filter(CropRequest.status == status.upper())
        
        requests = query.order_by(CropRequest.created_at.desc()).all()
        
        # Add crop details
        response_list = []
        for req in requests:
            crop = db.query(CropListing).filter(CropListing.id == req.crop_id).first()
            req_response = CropRequestResponse.from_orm(req)
            if crop:
                req_response.crop_name = crop.crop_name
                req_response.crop_image = crop.image_url
            response_list.append(req_response)
        
        return response_list
        
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@router.put("/requests/{request_id}/respond", response_model=CropRequestResponse)
async def farmer_respond_to_request(
    request_id: str,
    action_data: FarmerRequestAction,
    current_user: dict = Depends(get_current_user_from_token),
    db: Session = Depends(get_db)
):
    """Farmer responds to a request (accept/reject/counter)"""
    try:
        request = db.query(CropRequest).filter(CropRequest.id == request_id).first()
        
        if not request:
            raise HTTPException(status_code=404, detail="Request not found")
        
        if request.farmer_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        if request.status != "PENDING":
            raise HTTPException(status_code=400, detail="Request already responded to")
        
        crop = db.query(CropListing).filter(CropListing.id == request.crop_id).first()
        
        if action_data.action == "accept":
            request.status = "ACCEPTED"
            request.final_price = request.requested_price or crop.price_per_kg
            request.farmer_response = action_data.response_message or "Request accepted"
            
        elif action_data.action == "reject":
            request.status = "REJECTED"
            request.farmer_response = action_data.response_message or "Request rejected"
            
        elif action_data.action == "counter":
            if not action_data.counter_offer_price:
                raise HTTPException(status_code=400, detail="Counter offer price required")
            
            request.counter_offer_price = action_data.counter_offer_price
            request.farmer_response = action_data.response_message or f"Counter offer: ₹{action_data.counter_offer_price}/kg"
        
        request.responded_at = datetime.now()
        
        db.commit()
        db.refresh(request)
        
        response = CropRequestResponse.from_orm(request)
        if crop:
            response.crop_name = crop.crop_name
            response.crop_image = crop.image_url
        
        return response
        
    except HTTPException:
        raise
    except Exception as error:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(error))


@router.put("/requests/{request_id}/accept-counter", response_model=CropRequestResponse)
async def buyer_accept_counter_offer(
    request_id: str,
    current_user: dict = Depends(get_current_user_from_token),
    db: Session = Depends(get_db)
):
    """Buyer accepts farmer's counter offer"""
    try:
        request = db.query(CropRequest).filter(CropRequest.id == request_id).first()
        
        if not request:
            raise HTTPException(status_code=404, detail="Request not found")
        
        if request.buyer_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        if not request.counter_offer_price:
            raise HTTPException(status_code=400, detail="No counter offer to accept")
        
        request.status = "ACCEPTED"
        request.final_price = request.counter_offer_price
        
        db.commit()
        db.refresh(request)
        
        crop = db.query(CropListing).filter(CropListing.id == request.crop_id).first()
        response = CropRequestResponse.from_orm(request)
        if crop:
            response.crop_name = crop.crop_name
            response.crop_image = crop.image_url
        
        return response
        
    except HTTPException:
        raise
    except Exception as error:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(error))


@router.delete("/requests/{request_id}")
async def cancel_request(
    request_id: str,
    current_user: dict = Depends(get_current_user_from_token),
    db: Session = Depends(get_db)
):
    """Buyer cancels a request"""
    try:
        request = db.query(CropRequest).filter(CropRequest.id == request_id).first()
        
        if not request:
            raise HTTPException(status_code=404, detail="Request not found")
        
        if request.buyer_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        if request.status != "PENDING":
            raise HTTPException(status_code=400, detail="Can only cancel pending requests")
        
        request.status = "CANCELLED"
        
        db.commit()
        
        return {"message": "Request cancelled successfully"}
        
    except HTTPException:
        raise
    except Exception as error:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(error))