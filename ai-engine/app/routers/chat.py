"""AI Chat Router - Ollama Integration"""

from fastapi import APIRouter
from pydantic import BaseModel
from app.services.ollama_client import OllamaClient

router = APIRouter()
ollama = OllamaClient()


class ChatRequest(BaseModel):
    question: str
    context: dict = {}  # Optional market context to include


class ChatResponse(BaseModel):
    answer: str
    sources: list[str] = []
    confidence: int = 0


@router.post("/ask")
async def ask_ai(request: ChatRequest) -> dict:
    """Ask the AI a financial question. Uses Ollama locally."""
    response = await ollama.ask(request.question, request.context)
    return response


@router.post("/explain-signal")
async def explain_signal(signal_data: dict) -> dict:
    """Get a plain-English explanation of why a signal was generated."""
    explanation = await ollama.explain_signal(signal_data)
    return {"explanation": explanation}


@router.get("/status")
async def ollama_status() -> dict:
    """Check Ollama connection status and available models."""
    return await ollama.check_status()
