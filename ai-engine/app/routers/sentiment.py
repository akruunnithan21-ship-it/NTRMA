"""News Sentiment Analysis Router"""

from fastapi import APIRouter
from pydantic import BaseModel
from app.services.sentiment_engine import SentimentEngine

router = APIRouter()
engine = SentimentEngine()


class SentimentRequest(BaseModel):
    query: str
    sources: list[str] = ["gnews", "rss"]


@router.post("/analyze")
async def analyze_sentiment(request: SentimentRequest) -> dict:
    """Analyze sentiment for a query (stock name, sector, event)."""
    result = await engine.analyze(request.query, request.sources)
    return result


@router.get("/news/{symbol}")
async def get_stock_news(symbol: str, limit: int = 10) -> dict:
    """Get latest news for a stock with sentiment scores."""
    news = await engine.get_stock_news(symbol, limit)
    return {"symbol": symbol, "news": news}


@router.get("/market-mood")
async def get_market_mood() -> dict:
    """Get overall market sentiment (bull/bear/neutral)."""
    mood = await engine.get_market_mood()
    return mood


@router.get("/events")
async def get_upcoming_events() -> dict:
    """Get market-moving events (earnings, RBI policy, etc.)."""
    events = await engine.get_upcoming_events()
    return {"events": events}
