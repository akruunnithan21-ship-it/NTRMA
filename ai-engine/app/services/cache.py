"""
Redis Caching Layer for Market Data
- 5 min TTL for live prices during market hours
- 30 min TTL for prices outside market hours
- 24 hour TTL for stock info/fundamentals
- 1 hour TTL for indices and sectors
"""

import json
import os
from typing import Optional
from datetime import datetime
import pytz


# TTL constants (seconds)
TTL_PRICE_LIVE = 300        # 5 minutes during market hours
TTL_PRICE_CLOSED = 1800     # 30 minutes when market closed
TTL_INDICES = 300           # 5 minutes
TTL_SECTORS = 3600          # 1 hour
TTL_STOCK_INFO = 86400      # 24 hours (fundamentals don't change often)
TTL_HISTORICAL = 3600       # 1 hour (historical data is static for past dates)
TTL_SEARCH = 86400          # 24 hours


class CacheService:
    """Redis-backed cache with TTL management."""

    def __init__(self):
        self._redis = None
        self._connected = False
        self._init_redis()

    def _init_redis(self):
        """Initialize Redis connection."""
        try:
            import redis
            redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
            self._redis = redis.from_url(redis_url, decode_responses=True)
            self._redis.ping()
            self._connected = True
        except Exception as e:
            print(f"[Cache] Redis not available: {e}. Running without cache.")
            self._connected = False

    @property
    def is_connected(self) -> bool:
        return self._connected

    def get(self, key: str) -> Optional[dict]:
        """Get cached value. Returns None if not found or expired."""
        if not self._connected:
            return None
        try:
            raw = self._redis.get(key)
            if raw:
                return json.loads(raw)
            return None
        except Exception:
            return None

    def set(self, key: str, value: dict, ttl: int = TTL_PRICE_LIVE) -> bool:
        """Set cache value with TTL in seconds."""
        if not self._connected:
            return False
        try:
            self._redis.setex(key, ttl, json.dumps(value, default=str))
            return True
        except Exception:
            return False

    def delete(self, key: str) -> bool:
        """Delete a cache key."""
        if not self._connected:
            return False
        try:
            self._redis.delete(key)
            return True
        except Exception:
            return False

    def flush_market_data(self) -> bool:
        """Flush all market data cache (useful for forced refresh)."""
        if not self._connected:
            return False
        try:
            keys = self._redis.keys("market:*")
            if keys:
                self._redis.delete(*keys)
            return True
        except Exception:
            return False

    # ===== Domain-specific cache methods =====

    def get_price(self, symbol: str, exchange: str) -> Optional[dict]:
        key = f"market:price:{exchange}:{symbol}"
        return self.get(key)

    def set_price(self, symbol: str, exchange: str, data: dict, market_open: bool = False):
        key = f"market:price:{exchange}:{symbol}"
        ttl = TTL_PRICE_LIVE if market_open else TTL_PRICE_CLOSED
        self.set(key, data, ttl)

    def get_indices(self) -> Optional[list]:
        return self.get("market:indices")

    def set_indices(self, data: list):
        self.set("market:indices", data, TTL_INDICES)

    def get_stock_info(self, symbol: str, exchange: str) -> Optional[dict]:
        key = f"market:info:{exchange}:{symbol}"
        return self.get(key)

    def set_stock_info(self, symbol: str, exchange: str, data: dict):
        key = f"market:info:{exchange}:{symbol}"
        self.set(key, data, TTL_STOCK_INFO)

    def get_historical(self, symbol: str, exchange: str, period: str) -> Optional[dict]:
        key = f"market:hist:{exchange}:{symbol}:{period}"
        return self.get(key)

    def set_historical(self, symbol: str, exchange: str, period: str, data: dict):
        key = f"market:hist:{exchange}:{symbol}:{period}"
        self.set(key, data, TTL_HISTORICAL)

    def get_sectors(self) -> Optional[list]:
        return self.get("market:sectors")

    def set_sectors(self, data: list):
        self.set("market:sectors", data, TTL_SECTORS)

    def get_search(self, query: str) -> Optional[list]:
        key = f"market:search:{query.lower()}"
        return self.get(key)

    def set_search(self, query: str, data: list):
        key = f"market:search:{query.lower()}"
        self.set(key, data, TTL_SEARCH)


# Singleton
cache_service = CacheService()
