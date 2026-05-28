"""Technical & Fundamental Analysis Router"""

from fastapi import APIRouter
from app.services.technical_analysis import TechnicalAnalyzer
from app.services.fundamental_analysis import FundamentalAnalyzer

router = APIRouter()
ta = TechnicalAnalyzer()
fa = FundamentalAnalyzer()


@router.get("/{symbol}")
async def full_analysis(symbol: str, exchange: str = "NSE") -> dict:
    """Get complete technical + fundamental analysis for a stock."""
    technical = await ta.analyze(symbol, exchange)
    fundamental = await fa.analyze(symbol, exchange)

    return {
        "symbol": symbol,
        "exchange": exchange,
        "technical": technical,
        "fundamental": fundamental,
        "overall_score": (technical.get("score", 50) + fundamental.get("score", 50)) / 2,
    }


@router.get("/{symbol}/technical")
async def technical_analysis(symbol: str, exchange: str = "NSE") -> dict:
    """Get technical analysis with all indicators."""
    return await ta.analyze(symbol, exchange)


@router.get("/{symbol}/fundamental")
async def fundamental_analysis(symbol: str, exchange: str = "NSE") -> dict:
    """Get fundamental analysis (P/E, debt, earnings, etc.)."""
    return await fa.analyze(symbol, exchange)


@router.get("/{symbol}/indicators")
async def get_indicators(symbol: str, timeframe: str = "1D") -> dict:
    """Get all technical indicators for a symbol."""
    return await ta.get_all_indicators(symbol, timeframe)
