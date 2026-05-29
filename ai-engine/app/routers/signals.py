"""Signal Generation Router"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.services.signal_generator import SignalGenerator

router = APIRouter()
generator = SignalGenerator()


class SignalRequest(BaseModel):
    symbol: str
    exchange: str = "NSE"
    strategy: str = "aggressive"  # aggressive, balanced, protect


class SignalResponse(BaseModel):
    symbol: str
    direction: str  # BUY, SELL, HOLD
    confidence: int  # 0-100
    entry_price: float
    target_price: float
    stop_loss: float
    risk_reward: str
    time_horizon: str
    explanation: str
    factors: dict
    charges_impact: float
    net_expected_return: float


@router.post("/generate")
async def generate_signal(request: SignalRequest) -> dict:
    """Generate a trading signal for a given stock."""
    signal = await generator.generate(
        symbol=request.symbol,
        exchange=request.exchange,
        strategy=request.strategy,
    )
    return signal


@router.get("/daily")
async def get_daily_signals() -> dict:
    """Get today's top signals across watchlist."""
    signals = await generator.get_daily_top_signals()
    return {"signals": signals, "generated_at": "2026-05-28T09:15:00"}


@router.get("/backtest/{symbol}")
async def backtest_strategy(symbol: str, days: int = 90) -> dict:
    """Backtest signal strategy on historical data."""
    results = await generator.backtest(symbol=symbol, days=days)
    return results
