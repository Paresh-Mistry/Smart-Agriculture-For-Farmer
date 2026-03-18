


import os
import uuid
from fastapi import APIRouter, File, HTTPException, Depends, Form, UploadFile
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError

from ..config.database import get_db
from ..models.enums import UserRole
from ..models.user import User
from ..core.security import generate_otp, send_email, create_access_token
from ..core.settings import settings
from ..schemas.users import EmailRequest, TokenResponse, OTPVerifyRequest, CompleteProfileSchema

router = APIRouter()

# ------------------ IN-MEMORY OTP STORAGE ------------------
otp_storage = {}

# ------------------ UPLOAD DIRECTORY ------------------
UPLOAD_DIR = "uploads/profile_images"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ------------------ OAuth2 ------------------
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/verify-otp")


# ------------------ SEND OTP ------------------
@router.post("/auth/send-otp")
async def send_otp(request: EmailRequest):
    email = request.email
    otp = generate_otp()

    # Store OTP with expiry and attempts
    otp_storage[email] = {
        "otp": otp,
        "expiry": datetime.utcnow() + timedelta(minutes=5),
        "attempts": 0
    }

    # Send OTP email
    if send_email(email, otp):
        return {"message": "OTP sent successfully", "status": "OK"}
    else:
        raise HTTPException(status_code=500, detail="Failed to send email")


# ------------------ VERIFY OTP ------------------
@router.post("/auth/verify-otp", response_model=TokenResponse)
async def verify_otp(request: OTPVerifyRequest, db: Session = Depends(get_db)):
    email = request.email
    otp = request.otp

    stored = otp_storage.get(email)
    if not stored:
        raise HTTPException(status_code=400, detail="OTP not found or expired")

    if datetime.utcnow() > stored["expiry"]:
        del otp_storage[email]
        raise HTTPException(status_code=400, detail="OTP expired")

    if stored["attempts"] >= 3:
        del otp_storage[email]
        raise HTTPException(status_code=400, detail="Too many attempts")

    if stored["otp"] != otp:
        stored["attempts"] += 1
        raise HTTPException(status_code=400, detail="Invalid OTP")

    # OTP verified → delete it
    del otp_storage[email]

    # Check if user exists
    user = db.query(User).filter(User.email == email).first()

    if not user:
        # Create a temporary user (profile to be completed later)
        # role = (
        #     UserRole[request.role.upper()] if request.role and request.role.upper() in UserRole.__members__
        #     else UserRole.BUYER
        # )
        # role=UserRole[request.role.upper()].value if getattr(request, "role", None) else UserRole.BUYER.value,

        # user = User(
        #     email=email,
        #     password="OTP_AUTH",
        #     is_verified=1,
        # )

        user = User(
            email=email,
            name="",
            phone="",
            password="OTP_AUTH",
            is_verified=1,
            role="FARMER"  # or from request
        )


        print({"user_role_creation":user.role})
        db.add(user)
        db.commit()
        db.refresh(user)

    access_token = create_access_token(data={"sub": str(user.id), "email": user.email})

    return TokenResponse(access_token=access_token)


# ------------------ GET CURRENT USER ------------------
def get_current_user_from_token(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")

        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")

        return user

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


# ------------------ UPLOAD PROFILE IMAGE ------------------
@router.post("/auth/upload-profile-image")
async def upload_profile_image(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user_from_token),
    db: Session = Depends(get_db),
):
    if file.content_type not in ["image/jpeg", "image/png", "image/jpg"]:
        raise HTTPException(status_code=400, detail="Invalid image type")

    file_ext = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    # Save file to disk
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    # Save path in DB
    user.profile_image = f"/{UPLOAD_DIR}/{filename}"
    db.commit()
    db.refresh(user)

    return {"message": "Profile image uploaded successfully", "profile_image": user.profile_image}



@router.post("/auth/complete-profile")
def complete_profile(
    payload: CompleteProfileSchema,
    user: User = Depends(get_current_user_from_token),
    db: Session = Depends(get_db),
):
    user.name = payload.name
    user.phone = payload.phone
    user.location = payload.location

    db.commit()
    db.refresh(user)

    return {
        "message": "Profile completed successfully",
        "user": {
            "id": str(user.id),
            "name": user.name,
            "email": user.email,
            "phone": user.phone,
            "location": user.location,
        },
    }

@router.post("/auth/logout")
def logout_user(
    user: User = Depends(get_current_user_from_token),
    db: Session = Depends(get_db),
):
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}

# ------------------ GET CURRENT USER DETAILS ------------------
@router.get("/auth/me")
async def get_current_user(
    user: User = Depends(get_current_user_from_token),
):
    return {
        "id": str(user.id),
        "name": user.name,
        "email": user.email,
        "phone": user.phone,
        "role": user.role,
        "is_verified": user.is_verified,
        "profile_image": user.profile_image,
        "location": user.location,
    }


@router.get("/get_users") 
def getUser(db: Session = Depends(get_db),):
    user = db.query(User).all()
    return user 
    

