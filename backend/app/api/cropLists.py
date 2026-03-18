import os
from pyexpat import features
from fastapi import APIRouter, Response, Form, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from ..schemas.cropList import CropListingResponse, Category, SoilWeatherInput, Status, ExistingCropInput
from ..config.database import get_db
from datetime import datetime 
from typing import List, Optional
from ..core.logging import logger
import pandas as pd
import joblib
from ..models.crop import CropListing
from uuid import UUID, uuid4
from .users import get_current_user_from_token

router = APIRouter()
UPLOAD_DIR = "uploads"

# create folder if not exists
os.makedirs(UPLOAD_DIR, exist_ok=True)

def save_image(file: UploadFile):
    ext = file.filename.split(".")[-1]
    filename = f"{uuid4()}.{ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as f:
        f.write(file.file.read())

    return f"{filename}" 


def parse_date(date_str: Optional[str]) -> Optional[datetime.date]:
    """Parse date string to date object."""
    if not date_str:
        return None
    try:
        return datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid date format: {date_str}. Use YYYY-MM-DD")


@router.post("/cropslist", response_model=CropListingResponse, status_code=201)
async def create_crop_listing(
    crop_name: str = Form(...),
    description: str = Form(...),
    quantity_kg: float = Form(..., gt=0),
    price_per_kg: float = Form(..., gt=0),
    harvest_date: str = Form(...),
    expiry_date: Optional[str] = Form(None),
    location: str = Form(...),
    category: str = Form(...),
    status: str = Form(Status.AVAILABLE),
    discount_percent: float = Form(0, ge=0, le=100),
    image: UploadFile = File(...),
    current_user: dict = Depends(get_current_user_from_token),
    db: Session = Depends(get_db)
):
    """
    Create a new crop listing with image upload to Cloudinary.
    
    Form Fields:
    - crop_name: Name of the crop
    - description: Detailed description
    - quantity_kg: Available quantity in kg (must be > 0)
    - price_per_kg: Price per kg (must be > 0)
    - harvest_date: Harvest date (YYYY-MM-DD format)
    - expiry_date: Optional expiry date (YYYY-MM-DD format)
    - location: Location of the crop
    - category: Crop category (Grains, Fruits, Vegetables, Legumes, Spices, Oilseeds, Other)
    - status: Crop status (Available, Sold, Pending)
    - discount_percent: Discount percentage (0-100)
    - image: Crop image file
    """
    try:
        logger.info(f"Processing new crop listing: {crop_name}")
        
        # Validate dates
        harvest_date_obj = parse_date(harvest_date)
        expiry_date_obj = parse_date(expiry_date)
        
        # Validate expiry date is after harvest date
        if expiry_date_obj and harvest_date_obj and expiry_date_obj <= harvest_date_obj:
            raise HTTPException(
                status_code=400, 
                detail="Expiry date must be after harvest date"
            )
        
        # Validate category
        try:
            Category(category)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid category. Must be one of: {', '.join([c.value for c in Category])}"
            )
        
        # Validate status
        try:
            Status(status)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid status. Must be one of: {', '.join([s.value for s in Status])}"
            )
        
        # Upload image to Cloudinary
        image_url = save_image(image)
        logger.info("Uploading image to Cloudinary...")
        # image_url = upload_image_to_cloudinary(image)
        
        # Create crop listing
        crop = CropListing(
            crop_name=crop_name,
            description=description,
            quantity_kg=quantity_kg,
            price_per_kg=price_per_kg,
            harvest_date=harvest_date_obj,
            expiry_date=expiry_date_obj,
            location=location,
            category=category,
            status=status,
            image_url=image_url,
            discount_percent=discount_percent,
            farmer_id=current_user.id
        )
        
        print({"crop":crop})

        db.add(crop)
        db.commit()
        db.refresh(crop)
        
        logger.info(f"Crop '{crop_name}' added successfully with ID {crop.id}")
        return crop
        
    except HTTPException:
        raise
    except Exception as error:
        db.rollback()
        logger.error(f"Error creating crop listing: {error}")
        raise HTTPException(status_code=500, detail=f"Failed to create crop listing: {str(error)}")


@router.get("/get_crops", response_model=List[CropListingResponse], status_code=200)
async def get_all_crops(
    skip: int = 0,
    limit: int = 100,
    
    # Filters
    category: Optional[str] = None,
    status: Optional[str] = None,
    location: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    search: Optional[str] = None,
    
    # Sorting
    sort_by: str = "created_at",
    sort_order: str = "desc",
    
    db: Session = Depends(get_db)
):
    """
    Get all crop listings with filtering, search, sorting and pagination.
    
    Query Parameters:
    - skip: Number of records to skip (default: 0)
    - limit: Maximum records to return (default: 100, max: 500)
    - category: Filter by category
    - status: Filter by status
    - location: Search in location (partial match)
    - min_price: Minimum price per kg
    - max_price: Maximum price per kg
    - search: Search in crop name and description
    - sort_by: Sort field (created_at, price_per_kg, views_count, crop_name)
    - sort_order: Sort direction (asc, desc)
    """
    try:
        # Validate pagination
        if limit > 500:
            limit = 500
        if skip < 0:
            skip = 0
        
        # Validate sort parameters
        valid_sort_fields = ["created_at", "price_per_kg", "views_count", "crop_name", "harvest_date"]
        if sort_by not in valid_sort_fields:
            sort_by = "created_at"
        
        if sort_order not in ["asc", "desc"]:
            sort_order = "desc"
        
        # Build query
        query = db.query(CropListing)
        
        # Apply filters
        if category:
            query = query.filter(CropListing.category == category)
        
        if status:
            status = status.upper()
            query = query.filter(CropListing.status == status)
    
        
        if location:
            query = query.filter(CropListing.location.ilike(f"%{location}%"))
        
        if min_price is not None and min_price >= 0:
            query = query.filter(CropListing.price_per_kg >= min_price)
        
        if max_price is not None and max_price >= 0:
            query = query.filter(CropListing.price_per_kg <= max_price)
        
        # Search in crop_name and description
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                (CropListing.crop_name.ilike(search_term)) |
                (CropListing.description.ilike(search_term))
            )
        
        # Apply sorting
        sort_column = getattr(CropListing, sort_by)
        if sort_order == "desc":
            query = query.order_by(sort_column.desc())
        else:
            query = query.order_by(sort_column.asc())
        
        # Apply pagination
        crops = query.offset(skip).limit(limit).all()
        
        logger.info(f"Fetched {len(crops)} crops (skip={skip}, limit={limit})")
        
        return crops
        
    except Exception as error:
        logger.error(f"Error fetching crops: {error}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch crops \n error - {error}")

@router.get("/my_crops", response_model=List[CropListingResponse], status_code=200)
async def get_my_crops(
    skip: int = 0,
    limit: int = 100,
    
    # Filters
    category: Optional[str] = None,
    status: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    search: Optional[str] = None,
    
    # Sorting
    sort_by: str = "created_at",
    sort_order: str = "desc",
    
    current_user: dict = Depends(get_current_user_from_token),
    db: Session = Depends(get_db)
):
    """
    Get all crop listings for the authenticated farmer with filtering, search, sorting and pagination.
    
    Query Parameters:
    - skip: Number of records to skip (default: 0)
    - limit: Maximum records to return (default: 100, max: 500)
    - category: Filter by category
    - status: Filter by status
    - min_price: Minimum price per kg
    - max_price: Maximum price per kg
    - search: Search in crop name and description
    - sort_by: Sort field (created_at, price_per_kg, views_count, crop_name, harvest_date)
    - sort_order: Sort direction (asc, desc)
    """
    try:
        # Validate pagination
        if limit > 500:
            limit = 500
        if skip < 0:
            skip = 0
        
        # Validate sort parameters
        valid_sort_fields = ["created_at", "price_per_kg", "views_count", "crop_name", "harvest_date"]
        if sort_by not in valid_sort_fields:
            sort_by = "created_at"
        
        if sort_order not in ["asc", "desc"]:
            sort_order = "desc"
        
        # Build query - filter by current user's farmer_id
        query = db.query(CropListing).filter(CropListing.farmer_id == current_user.id)
        
        # Apply filters
        if category:
            try:
                Category(category)
                query = query.filter(CropListing.category == category)
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid category. Must be one of: {', '.join([c.value for c in Category])}"
                )
        
        if status:
            status = status.upper()
            try:
                Status(status)
                query = query.filter(CropListing.status == status)
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid status. Must be one of: {', '.join([s.value for s in Status])}"
                )
        
        if min_price is not None and min_price >= 0:
            query = query.filter(CropListing.price_per_kg >= min_price)
        
        if max_price is not None and max_price >= 0:
            query = query.filter(CropListing.price_per_kg <= max_price)
        
        # Search in crop_name and description
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                (CropListing.crop_name.ilike(search_term)) |
                (CropListing.description.ilike(search_term))
            )
        
        # Apply sorting
        sort_column = getattr(CropListing, sort_by)
        if sort_order == "desc":
            query = query.order_by(sort_column.desc())
        else:
            query = query.order_by(sort_column.asc())
        
        # Apply pagination
        crops = query.offset(skip).limit(limit).all()
        
        logger.info(f"Fetched {len(crops)} crops for farmer {current_user.id} (skip={skip}, limit={limit})")
        
        return crops
        
    except HTTPException:
        raise
    except Exception as error:
        logger.error(f"Error fetching crops for farmer {current_user.id}: {error}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch your crops: {str(error)}")



@router.get("/get_category/{category}", response_model=List[CropListingResponse], status_code=200)
async def get_crops_by_category(
    category: str,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Get crops by specific category with pagination.
    """
    try:
        # Normalize category to title case first
        
        # Validate category
        try:
            Category(category)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid category. Must be one of: {', '.join([c.value for c in Category])}"
            )
        
        category = category.strip().upper()

        logger.debug(f"Categories - {category}")    
        crops = (
            db.query(CropListing)
            .filter(CropListing.category == category)
            .order_by(CropListing.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
        
        return crops
        
    except HTTPException:
        raise
    except Exception as error:
        logger.error(f"Error fetching crops by category: {error}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch crops by category - {error}")


@router.get("/get_crops/{crop_id}", response_model=CropListingResponse, status_code=200)
async def get_crop_by_id(crop_id: UUID, db: Session = Depends(get_db)):
    """
    Get a specific crop listing by ID and increment view count.
    """
    try:
        crop = db.query(CropListing).filter(CropListing.id == crop_id).first()
        
        if not crop:
            raise HTTPException(
                status_code=404, 
                detail=f"Crop with ID {crop_id} not found"
            )
        
        # Increment view count
        crop.views_count += 1
        db.commit()
        db.refresh(crop)
        
        return crop
        
    except HTTPException:
        raise
    except Exception as error:
        logger.error(f"Error fetching crop {crop_id}: {error}")
        raise HTTPException(status_code=500, detail="Failed to fetch crop")


@router.put("/update_crops/{crop_id}", response_model=CropListingResponse, status_code=200)
async def update_crop_listing(
    crop_id: int,
    crop_name: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    quantity_kg: Optional[float] = Form(None),
    price_per_kg: Optional[float] = Form(None),
    harvest_date: Optional[str] = Form(None),
    expiry_date: Optional[str] = Form(None),
    location: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    status: Optional[str] = Form(None),
    discount_percent: Optional[float] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    """
    Update an existing crop listing (all fields optional).
    """
    try:
        crop = db.query(CropListing).filter(CropListing.id == crop_id).first()
        
        if not crop:
            raise HTTPException(status_code=404, detail="Crop not found")
        
        # Update fields if provided
        if crop_name:
            crop.crop_name = crop_name
        
        if description:
            crop.description = description
        
        if quantity_kg is not None:
            if quantity_kg <= 0:
                raise HTTPException(status_code=400, detail="Quantity must be greater than 0")
            crop.quantity_kg = quantity_kg
        
        if price_per_kg is not None:
            if price_per_kg <= 0:
                raise HTTPException(status_code=400, detail="Price must be greater than 0")
            crop.price_per_kg = price_per_kg
        
        if harvest_date:
            crop.harvest_date = parse_date(harvest_date)
        
        if expiry_date:
            crop.expiry_date = parse_date(expiry_date)
        
        if location:
            crop.location = location
        
        if category:
            try:
                Category(category)
                crop.category = category
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid category. Must be one of: {', '.join([c.value for c in Category])}"
                )
        
        if status:
            try:
                Status(status)
                crop.status = status
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid status. Must be one of: {', '.join([s.value for s in Status])}"
                )
        
        if discount_percent is not None:
            if discount_percent < 0 or discount_percent > 100:
                raise HTTPException(status_code=400, detail="Discount must be between 0 and 100")
            crop.discount_percent = discount_percent
        
        # Update image if new one provided
        # if image:
        #     new_image_url = upload_image_to_cloudinary(image)
        #     crop.image_url = new_image_url
        
        db.commit()
        db.refresh(crop)
        
        logger.info(f"Crop {crop_id} updated successfully")
        return crop
        
    except HTTPException:
        raise
    except Exception as error:
        db.rollback()
        logger.error(f"Error updating crop {crop_id}: {error}")
        raise HTTPException(status_code=500, detail="Failed to update crop")


@router.delete("/delete_crops/{crop_id}", status_code=204)
async def delete_crop_listing(crop_id: int, db: Session = Depends(get_db)):
    """
    Delete a crop listing permanently.
    """
    try:
        crop = db.query(CropListing).filter(CropListing.id == crop_id).first()
        
        if not crop:
            raise HTTPException(status_code=404, detail="Crop not found")
        
        db.delete(crop)
        db.commit()
        
        logger.info(f"Crop {crop_id} deleted successfully")
        return Response(status_code=204)
        
    except HTTPException:
        raise
    except Exception as error:
        db.rollback()
        logger.error(f"Error deleting crop {crop_id}: {error}")
        raise HTTPException(status_code=500, detail="Failed to delete crop")


@router.get("/get_crops_count", status_code=200)
async def get_crops_count(
    category: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get total count of crops with optional filters.
    """
    try:
        query = db.query(CropListing)
        
        if category:
            query = query.filter(CropListing.category == category)
        
        if status:
            query = query.filter(CropListing.status == status)
        
        total_count = query.count()
        
        return {
            "total_count": total_count,
            "category": category,
            "status": status
        }
        
    except Exception as error:
        logger.error(f"Error fetching crop count: {error}")
        raise HTTPException(status_code=500, detail="Failed to fetch crop count")
    

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
FERT_MODEL_PATH = os.path.join(BASE_DIR, "app", "services","data", "fertilizer_model.pkl")
SOIL_MODEL_PATH = os.path.join(BASE_DIR, "app", "services","data", "crop_model.pkl")

crop_model = joblib.load(SOIL_MODEL_PATH)  
fert_model = joblib.load(FERT_MODEL_PATH)  
print({"crop_model":crop_model, "fert_model":fert_model, "SOIL_MODEL_PATH":SOIL_MODEL_PATH, "FERT_MODEL_PATH":FERT_MODEL_PATH, "BASE_DIR":BASE_DIR})  


@router.post("/recommend")
def recommend_crop(data: SoilWeatherInput):

    features = pd.DataFrame([data.dict()])

    prediction = crop_model.predict(features)


    print({"features":features, "prediction":prediction})
    return {
        "recommended_crop": prediction[0],
        "message": "Crop recommendation based on soil and weather conditions"
    }


@router.post("/recommend-existing")
def recommend_fertilizer_existing(data: ExistingCropInput):

    features = pd.DataFrame([{
        "Nitrogen": data.Nitrogen,
        "Phosphorus": data.Phosphorus,
        "Potassium": data.Potassium,
        "Temperature": data.Temperature,
        "Humidity": data.Humidity,
        "pH_Value": data.pH_Value,
        "Rainfall": data.Rainfall
    }])

    prediction = fert_model.predict(features)

    return {
        "crop": data.Crop,
        "recommended_fertilizer": prediction[0],
        "accuracy": "Model accuracy is around 90% based on training data",
        "input_conditions": data.dict(),
    }


