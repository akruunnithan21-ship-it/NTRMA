"""Market Data Router - Live prices, indices, search, historical data."""

from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import Optional
from app.services.market_data import market_data_service
from app.services.cache import cache_service

router = APIRouter()


class BatchPriceRequest(BaseModel):
    symbols: list[dict]  # [{"symbol": "RELIANCE", "exchange": "NSE"}, ...]


# ===== STOCK PRICES =====

@router.get("/price/{symbol}")
async def get_stock_price(symbol: str, exchange: str = "NSE") -> dict:
    """Get current price for a single stock."""
    # Check cache first
    cached = cache_service.get_price(symbol, exchange)
    if cached:
        cached["_cached"] = True
        return cached

    # Fetch fresh data
    data = market_data_service.get_stock_price(symbol, exchange)
    if not data.get("error"):
        cache_service.set_price(symbol, exchange, data, data.get("market_open", False))
    return data


@router.post("/prices/batch")
async def get_batch_prices(request: BatchPriceRequest) -> dict:
    """Get prices for multiple stocks."""
    results = []
    for item in request.symbols:
        sym = item["symbol"]
        exch = item.get("exchange", "NSE")

        cached = cache_service.get_price(sym, exch)
        if cached:
            cached["_cached"] = True
            results.append(cached)
        else:
            data = market_data_service.get_stock_price(sym, exch)
            if not data.get("error"):
                cache_service.set_price(sym, exch, data, data.get("market_open", False))
            results.append(data)

    return {"prices": results, "count": len(results)}


# ===== INDICES =====

@router.get("/indices")
async def get_indices() -> dict:
    """Get major market indices (NIFTY, SENSEX, S&P 500, etc.)."""
    cached = cache_service.get_indices()
    if cached:
        return {"indices": cached, "_cached": True}

    data = market_data_service.get_indices()
    if data:
        cache_service.set_indices(data)
    return {"indices": data}


# ===== STOCK INFO =====

@router.get("/info/{symbol}")
async def get_stock_info(symbol: str, exchange: str = "NSE") -> dict:
    """Get detailed stock fundamentals."""
    cached = cache_service.get_stock_info(symbol, exchange)
    if cached:
        cached["_cached"] = True
        return cached

    data = market_data_service.get_stock_info(symbol, exchange)
    if not data.get("error"):
        cache_service.set_stock_info(symbol, exchange, data)
    return data


# ===== HISTORICAL DATA =====

@router.get("/historical/{symbol}")
async def get_historical(
    symbol: str,
    exchange: str = "NSE",
    period: str = "1mo",
) -> dict:
    """Get historical OHLCV data for charts."""
    cached = cache_service.get_historical(symbol, exchange, period)
    if cached:
        cached["_cached"] = True
        return cached

    data = market_data_service.get_historical(symbol, exchange, period)
    if not data.get("error"):
        cache_service.set_historical(symbol, exchange, period, data)
    return data


# ===== SEARCH =====

@router.get("/search")
async def search_stocks(q: str = Query(..., min_length=1), limit: int = 10) -> dict:
    """Search for stocks by symbol or name."""
    cached = cache_service.get_search(q)
    if cached:
        return {"results": cached, "_cached": True}

    results = market_data_service.search_stocks(q, limit)
    if results:
        cache_service.set_search(q, results)
    return {"results": results}


# ===== SECTORS =====

@router.get("/sectors")
async def get_sector_performance() -> dict:
    """Get sector-wise performance."""
    cached = cache_service.get_sectors()
    if cached:
        return {"sectors": cached, "_cached": True}

    data = market_data_service.get_sector_performance()
    if data:
        cache_service.set_sectors(data)
    return {"sectors": data}


# ===== CACHE MANAGEMENT =====

@router.post("/cache/flush")
async def flush_cache() -> dict:
    """Force refresh all market data cache."""
    success = cache_service.flush_market_data()
    return {"success": success, "message": "Market cache flushed" if success else "No cache available"}


@router.get("/status")
async def market_status() -> dict:
    """Get market status and cache health."""
    from app.services.market_data import _is_market_open
    return {
        "nse_open": _is_market_open("NSE"),
        "us_open": _is_market_open("NYSE"),
        "cache_connected": cache_service.is_connected,
    }
