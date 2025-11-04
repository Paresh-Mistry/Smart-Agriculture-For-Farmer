from fastapi import APIRouter, Response, Form, Depends, HTTPException
from sqlalchemy.orm import Session
from ..schemas.cropList import CropListingResponse, CropStatus
from ..config.database import get_db
from datetime import datetime 
from typing import List
from ..core.logging import logger
from ..models.model import CropListing
import cloudinary.uploader 

router = APIRouter()

@router.post("/cropslist", response_model=CropListingResponse, status_code=200)
def cropslist(
    response: Response,
    crop_name: str = Form(...),
    quantity_kg: float = Form(...),
    price_per_kg: float = Form(...),
    harvest_date: str = Form(...),
    location: str = Form(...),
    image_url: str = Form(...),
    description: str = Form(...),
    db: Session = Depends(get_db)
):
    try:
        harvest_date_obj = datetime.strptime(harvest_date, "%Y-%m-%d").date()
        logger.info("Received new crop listing request.")

        logger.info("Uploading image to Cloudinary...")
        # upload_result = cloudinary.uploader.upload(image.file, folder="crop_images")
        # image_url = upload_result.get("secure_url")

        crops_list = CropListing(
            crop_name=crop_name,
            quantity_kg=quantity_kg,
            price_per_kg=price_per_kg,
            harvest_date=harvest_date_obj,
            location=location,
            image_url=image_url,
            description=description,
        )

        db.add(crops_list)
        db.commit()
        db.refresh(crops_list)

        return crops_list

    except Exception as error:
        db.rollback()
        logger.error(f"Error inserting crop: {error}")
        raise HTTPException(status_code=400, detail=f"Could not insert crop: {error}")


@router.get("/get_cropslists", response_model=List[CropListingResponse], status_code=200)
async def get_cropslist(db: Session = Depends(get_db)):
    try:
        events_data = db.query(CropListing).all()

        if not events_data:
            raise HTTPException(status_code=404, detail="No crops found")

        return events_data

    except Exception as error:
        raise HTTPException(status_code=400, detail=f"Can't fetch crops data due to {error}")


@router.get("/get_crops/{cropsId}", response_model=CropListingResponse, status_code=200)
def get_event(cropsId: int, db: Session = Depends(get_db)):
    event = db.query(CropListing).filter(CropListing.id == cropsId).first()

    if not event:
        raise HTTPException(status_code=404, detail="Crop not found")

    return event
