from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from services import ai_service, db_service
from services.db_service import save_chat_message

router = APIRouter()


class ChatRequest(BaseModel):
    citizen_id: Optional[str] = None
    message: str
    language: str = "en"
    history: Optional[list] = None


class ChatResponse(BaseModel):
    reply: str
    suggested_schemes: list
    action_buttons: list
    language: str


@router.post("/message", response_model=ChatResponse)
async def chat_message(request: ChatRequest):
    """Send a message to Savasetu AI and get a response."""
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    # Fetch citizen profile if ID provided
    citizen_profile = None
    if request.citizen_id:
        try:
            citizen_profile = await db_service.get_citizen(request.citizen_id)
        except Exception:
            pass  # Continue without profile

    result = await ai_service.get_ai_response(
        message=request.message,
        language=request.language,
        citizen_profile=citizen_profile,
        history=request.history or [],
    )

    # Save chat history (non-blocking)
    try:
        await save_chat_message(
            citizen_id=request.citizen_id,
            message=request.message,
            response=result["reply"],
            language=request.language,
        )
    except Exception:
        pass  # Don't fail if DB is unavailable

    return ChatResponse(**result)
