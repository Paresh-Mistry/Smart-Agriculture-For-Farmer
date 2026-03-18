


import os
from uuid import uuid4
from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect, Request, Depends
from app.config.database import SessionLocal, get_db
from dotenv import load_dotenv
from google import genai
from sqlalchemy.orm import Session
from ..schemas.chat import ChatRequest, ChatResponse
from utils.utils import get_db_context
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()
session_memories = {}

# ✅ Load API key from .env
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")


if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in environment variables")

# ✅ Initialize Gemini client correctly
client = genai.Client(api_key=GEMINI_API_KEY)


# ============================
# 🚜 Chat Endpoint
# ============================
@router.post("/chat", response_model=ChatResponse)
async def chat(
    chat_request: ChatRequest,
    request: Request,
    db: Session = Depends(get_db)
):

    session_id = chat_request.session_id or str(uuid4())

    try:    
        db_context, location_info = await get_db_context(
            request=request,
            override_lat=chat_request.latitude,
            override_lon=chat_request.longitude
        )

        chat_history = session_memories.get(session_id, [])
        formatted_history = "\n".join(chat_history)

        prompt = f"""
You are an intelligent agriculture assistant AI helping farmers.

Use the database context, weather context, and conversation history carefully before answering.

Database Context:
{db_context}

Conversation History:
{formatted_history}

Farmer Question:
{chat_request.message}

Important Instructions:
1. When showing mandi prices or any tabular data, ALWAYS format as a proper markdown table
2. For weather information, provide actionable farming advice based on conditions
3. Be specific with prices and use ₹ symbol
4. Reference the user's detected location ({location_info.get('city')}, {location_info.get('region')}) naturally
5. For fertilizer recommendations, suggest based on crop type, weather, and location
6. Its must give simplified answers that a farmer can easily understand and act upon. Avoid technical jargon.
7. Use emojis sparingly for better readability (🌾 🌤️ 💰 📊)
8. If you don't know something, say so honestly

Provide a clear, practical answer suitable for a farmer.
"""

        print("Calling Gemini...")
        print(f"Calling Gemini for session: {session_id}")
        print(f"User location: {location_info.get('city')}, {location_info.get('region')}")


        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )

        print("Gemini response received.")

        # ✅ Safe extraction
        if not response or not response.text:
            raise Exception("Empty respons  e from Gemini")

        print(response)
        response_text = response.text

        # Save conversation memory
        chat_history.append(f"Farmer: {chat_request.message}")
        chat_history.append(f"AI: {response_text}")
        session_memories[session_id] = chat_history

        return ChatResponse(
            session_id=session_id,
            message=response_text,
            detected_location=location_info
        )

    except Exception as e:
        print("CHAT ERROR:", str(e))
        raise HTTPException(status_code=500, detail=str(e))


# ============================
# 📜 Session Info
# ============================
@router.get("/session/{session_id}/info")
async def session_info(session_id: str):
    if session_id not in session_memories:
        raise HTTPException(status_code=404, detail="Session not found")

    return {
        "session_id": session_id,
        "conversation_turns": len(session_memories[session_id]) // 2,
        "history": session_memories[session_id]
    }


# ============================
# 🗑 Delete Session
# ============================
@router.delete("/session/{session_id}")
async def delete_session(session_id: str):
    deleted = session_memories.pop(session_id, None) is not None
    return {
        "message": "Session deleted" if deleted else "Session not found",
        "session_id": session_id
    }


# ============================
# 🌐 WebSocket Chat
# ============================
connections = {}

@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await websocket.accept()
    connections[user_id] = websocket

    try:
        while True:
            data = await websocket.receive_json()
            receiver = data["to"]
            message = data["message"]

            if receiver in connections:
                await connections[receiver].send_json({
                    "from": user_id,
                    "message": message
                })

    except WebSocketDisconnect:
        connections.pop(user_id, None)


# ============================
# ❤️ Health Check
# ============================
@router.get("/health")
async def health():
    return {
        "status": "healthy",
        "active_sessions": len(session_memories)
    }
