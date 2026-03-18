from pydantic import BaseModel, Field
from typing import List, Optional, Dict

class ChatRequest(BaseModel):
    message: str
    longitude: Optional[float] = None
    latitude: Optional[float] = None
    location: Optional[str] = None
    session_id: Optional[str] = None
    model: str
    
class ChatResponse(BaseModel):
    session_id: str
    message: str
    model: str = "sike_aditya/AgriLlama"