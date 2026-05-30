"""Signal Generation Router — Production endpoints for BUY/SELL/HOLD signals."""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.services.signal_generator import signal_generator

router = APIRouter()


class SignalRequest(BaseModel):
    symbol: str
    exchange: str = "NSE"
    strategy: str = "aggressive"


class WatchlistRequest(BaseModel):
    symbols: list[dict] = []  # [{"symbol": "RELIANCE", "exchange": "NSE"}, ...]
    strategy: str = "aggressive"


@router.post("/generate")
async def generate_signal(request: SignalRequest) -> dict:
    """Generate a trading signal for a specific stock.
    
    Uses: candlestick patterns + technical indicators + fundamentals + sentiment + macro
    Returns: BUY/SELL/HOLD with confidence %, target, stop-loss, and AI explanation
    """
    signal = await signal_generator.generate_signal(
        symbol=request.symbol,
        exchange=request.exchange,
        strategy=request.strategy,
    )
    return signal


@router.get("/daily")
async def get_daily_signals(strategy: str = "aggressive") -> dict:
    """Get today's top signals from default watchlist (15 stocks).
    
    Scans NIFTY 50 blue-chips and returns:
    - Top pick (highest confidence BUY)
    - All BUY signals (top 5)
    - SELL signals (top 3)
    - HOLD signals (top 3)
    """
    return await signal_generator.get_daily_signals(strategy=strategy)


@router.post("/scan")
async def scan_custom_watchlist(request: WatchlistRequest) -> dict:
    """Scan a custom watchlist for signals.
    
    Send your own list of stocks and get signals for each.
    """
    if not request.symbols:
        return await signal_generator.get_daily_signals(strategy=request.strategy)
    return await signal_generator.get_daily_signals(
        strategy=request.strategy,
        watchlist=request.symbols,
    )


@router.get("/quick/{symbol}")
async def quick_signal(symbol: str, exchange: str = "NSE") -> dict:
    """Quick signal check for a single stock. Fastest response."""
    signal = await signal_generator.generate_signal(symbol=symbol, exchange=exchange)
    if signal.get("error"):
        return signal
    return {
        "symbol": symbol,
        "direction": signal["direction"],
        "confidence": signal["confidence"],
        "entry": signal["entry_price"],
        "target": signal["target_price"],
        "stop_loss": signal["stop_loss"],
        "risk_reward": signal["risk_reward"],
        "patterns": signal["patterns"],
        "trend": signal["trend"],
    }
