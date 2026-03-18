from fastapi import FastAPI

from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

import uvicorn

import sys
sys.dont_write_bytecode = True

from .api import router


app = FastAPI(debug=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
    
origin=[    
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",    
    "http://127.0.0.1:3001"
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origin,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(router)


if __name__ == "__main__":
    print("Starting server at http://127.0.0.1:8000")
    uvicorn.run(app , host='127.0.0.1' , port=8000)