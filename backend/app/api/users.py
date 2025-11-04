from fastapi import APIRouter, HTTPException, Depends, Form, Response, Request
from sqlalchemy.orm import Session
from ..schemas.users import UserRole, UserOut, Token
from ..models.model import Users
from ..config.database import get_db, engine  
from fastapi import Depends, Cookie
from ..core.security import hasHPassword, verifyPassword, accessToken, decodeToken


router = APIRouter()


def get_user_email(email:str, db:Session = Depends(get_db)) -> Users|None:
   
   user = db.query(Users).filter(Users.email == email).first()

   try:
     user = user
     print({"user":user})
    #  if user:
    #    print("Finding user in db")
    #    raise HTTPException(status_code=409, detail=f"User Already Exists, Error - {str(e)} , {user.email}")
     print("Working...")
     return user
   except Exception as e:
     raise HTTPException(status_code=404 , detail=f"No User Found, Error - {str(e)}, {user.name}")


@router.post("/register/", response_model=UserOut)
def register(
    name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    location: str = Form(...),
    phone: str = Form(None),
    role: UserRole = Form(UserRole.user),
    db: Session = Depends(get_db)
):
    try:
        user = get_user_email(email, db)

        if user:
            raise HTTPException(status_code=401, detail=f"User Already Exists")
        
        # new_user = createUser(
        #     db=db,
        #     name = name ,
        #     email = email,
        #     phone=phone,
        #     password=hasHPassword(password),
        #     role=role
        # )
    
        new_user = Users(
        name=name,
        email=email,
        password=password,
        location=location,
        phone=phone,
        role=role
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)   

        return new_user
    except Exception as err:
        raise HTTPException(status_code=404, detail=f"Error is {str(err)}")



@router.post('/login/', response_model=Token )
def login(
        response:Response,
        email: str = Form(...),
        password: str = Form(...),
        db: Session = Depends(get_db)
):
    
    try:
        user = get_user_email(email, db)

        if not user or not verifyPassword(password, user.password):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        token = accessToken({"data":user.email})
        response.set_cookie(
            key="access_token",
            value=token,
            httponly=True,
            max_age=400,  # 15 minutes = 900 seconds
            expires=400,
            samesite="Lax",
            secure=False  # change to True in production (HTTPS)
        )
        
        print(email)

        return {
            "access_token": token,
            "token_type": "bearer"
        }
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Error is {str(e)}")



@router.get("/me")
def get_me(request:Request, db: Session = Depends(get_db)):
    print("\n\n starts \n\n")
    token = request.cookies.get("access_token")
    if not token :
       raise HTTPException(status_code=404 , detail="Invalid Credentials.")
        
    
    payload = decodeToken(token)
    print({"payload":payload})
    user = get_user_email(payload['data'] , db)
    return user
