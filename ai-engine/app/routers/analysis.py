"""Technical, Fundamental & Candlestick Analysis Router"""

from fastapi import APIRouter
from app.services.technical_analysis import TechnicalAnalyzer
from app.services.fundamental_analysis import FundamentalAnalyzer
from app.services.candlestick_analyzer import candlestick_analyzer
from app.services.market_data import market_data_service

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


@router.get("/{symbol}/candlestick")
async def candlestick_analysis(symbol: str, exchange: str = "NSE", period: str = "1mo") -> dict:
    """Analyze candlestick patterns and predict trend direction.
    
    Returns:
    - Detected patterns (Bullish Engulfing, Hammer, etc.)
    - Current trend (uptrend/downtrend/sideways + strength)
    - Support & resistance levels
    - Volume confirmation
    - Price prediction (UP/DOWN/NEUTRAL + confidence %)
    """
    # Get historical data
    hist = market_data_service.get_historical(symbol, exchange, period)
    
    if hist.get("error") or not hist.get("data"):
        return {"error": f"Could not fetch data for {symbol}", "symbol": symbol}
    
    # Run candlestick analysis
    result = await candlestick_analyzer.analyze(symbol, hist["data"])
    return result


@router.get("/{symbol}/predict")
async def predict_price_direction(symbol: str, exchange: str = "NSE") -> dict:
    """Quick prediction: Will this stock go UP or DOWN in next 1-5 days?
    
    Uses candlestick patterns + trend + volume to predict.
    Returns direction, confidence, target, and stop-loss.
    """
    hist = market_data_service.get_historical(symbol, exchange, "3mo")
    
    if hist.get("error") or not hist.get("data"):
        return {"error": f"Could not fetch data for {symbol}", "symbol": symbol}
    
    result = await candlestick_analyzer.analyze(symbol, hist["data"])
    
    if "error" in result:
        return result
    
    return {
        "symbol": symbol,
        "exchange": exchange,
        "prediction": result["prediction"],
        "trend": result["trend"],
        "patterns": [p["name"] for p in result["patterns_detected"]],
        "last_price": result["last_price"],
    }
