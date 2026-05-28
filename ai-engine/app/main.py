"""
WealthMaster AI Engine
FastAPI service for market analysis, signal generation, and AI chat.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import signals, analysis, sentiment, chat, savings

app = FastAPI(
    title="WealthMaster AI Engine",
    description="Market analysis, signal generation, and AI advisory",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(signals.router, prefix="/signals", tags=["Signals"])
app.include_router(analysis.router, prefix="/analysis", tags=["Analysis"])
app.include_router(sentiment.router, prefix="/sentiment", tags=["Sentiment"])
app.include_router(chat.router, prefix="/chat", tags=["Chat"])
app.include_router(savings.router, prefix="/savings", tags=["Savings"])


@app.get("/health")
async def health_check():
    """Check AI engine health and Ollama connectivity."""
    ollama_status = "disconnected"
    try:
        import ollama
        models = ollama.list()
        ollama_status = "connected"
        available_models = [m.model for m in models.models] if models.models else []
    except Exception:
        available_models = []

    return {
        "status": "ok",
        "ollama": ollama_status,
        "available_models": available_models,
        "services": {
            "technical_analysis": "ready",
            "sentiment_engine": "ready",
            "signal_generator": "ready",
        },
    }


@app.get("/")
async def root():
    return {
        "service": "WealthMaster AI Engine",
        "version": "1.0.0",
        "docs": "/docs",
    }
