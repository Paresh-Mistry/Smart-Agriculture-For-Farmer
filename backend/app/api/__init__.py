from fastapi import APIRouter

# from . import cropLists, users
from . import cropLists, users

from ..config.database import Base, engine


router = APIRouter()

Base.metadata.create_all(bind=engine)


router.include_router(cropLists.router , tags=["Crops"])
router.include_router(users.router , tags=["User"])
