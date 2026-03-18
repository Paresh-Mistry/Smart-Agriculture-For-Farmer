from fastapi import APIRouter

# from . import cropLists, users
from . import cropLists, users, chat, weather, analytic, orders, request, mandi

from ..config.database import Base, engine


router = APIRouter()

Base.metadata.create_all(bind=engine)


router.include_router(cropLists.router , tags=["Crops"])    
router.include_router(users.router , tags=["User"])
router.include_router(chat.router , tags=["Chat"])
router.include_router(weather.router , tags=["Weather"])
router.include_router(orders.router , tags=["Order"])
router.include_router(request.router , tags=["Request"])
router.include_router(analytic.router , tags=["Analytic"])
router.include_router(mandi.router , tags=["Mandi"])
