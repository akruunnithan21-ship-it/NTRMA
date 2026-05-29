"""
Market Data Service
Fetches real-time and historical data from Yahoo Finance.
Supports NSE, BSE, and US stocks.
"""

import yfinance as yf
import pandas as pd
from typing import Optional
from datetime import datetime, timedelta
import pytz


# NSE/BSE symbols need .NS/.BO suffix for yfinance
def _resolve_symbol(symbol: str, exchange: str = "NSE") -> str:
    """Convert a plain symbol to yfinance-compatible format."""
    symbol = symbol.upper().strip()
    if exchange == "NSE":
        if not symbol.endswith(".NS"):
            return f"{symbol}.NS"
    elif exchange == "BSE":
        if not symbol.endswith(".BO"):
            return f"{symbol}.BO"
    # US stocks don't need a suffix
    return symbol


def _is_market_open(exchange: str = "NSE") -> bool:
    """Check if market is currently open."""
    ist = pytz.timezone("Asia/Kolkata")
    now = datetime.now(ist)
    weekday = now.weekday()  # 0=Mon, 6=Sun

    if weekday >= 5:  # Weekend
        return False

    if exchange in ("NSE", "BSE"):
        market_open = now.replace(hour=9, minute=15, second=0)
        market_close = now.replace(hour=15, minute=30, second=0)
        return market_open <= now <= market_close
    elif exchange in ("NYSE", "NASDAQ"):
        # US market: 7:00 PM - 1:30 AM IST (next day)
        us_open = now.replace(hour=19, minute=0, second=0)
        us_close_next = now.replace(hour=1, minute=30, second=0) + timedelta(days=1)
        return now >= us_open or now.hour < 2
    return False


class MarketDataService:
    """Fetches market data from Yahoo Finance."""

    def get_stock_price(self, symbol: str, exchange: str = "NSE") -> dict:
        """Get current/latest price for a stock."""
        try:
            yf_symbol = _resolve_symbol(symbol, exchange)
            ticker = yf.Ticker(yf_symbol)
            info = ticker.fast_info

            # Get today's history for OHLCV
            hist = ticker.history(period="2d")
            if hist.empty:
                return self._error_response(symbol, "No data available")

            latest = hist.iloc[-1]
            prev_close = hist.iloc[-2]["Close"] if len(hist) >= 2 else latest["Close"]
            change = latest["Close"] - prev_close
            change_pct = (change / prev_close) * 100 if prev_close > 0 else 0

            return {
                "symbol": symbol,
                "exchange": exchange,
                "price": round(float(latest["Close"]), 2),
                "open": round(float(latest["Open"]), 2),
                "high": round(float(latest["High"]), 2),
                "low": round(float(latest["Low"]), 2),
                "close": round(float(latest["Close"]), 2),
                "prev_close": round(float(prev_close), 2),
                "change": round(float(change), 2),
                "change_percent": round(float(change_pct), 2),
                "volume": int(latest["Volume"]),
                "market_open": _is_market_open(exchange),
                "timestamp": datetime.now().isoformat(),
                "error": None,
            }
        except Exception as e:
            return self._error_response(symbol, str(e))

    def get_batch_prices(self, symbols: list[dict]) -> list[dict]:
        """Get prices for multiple stocks at once.
        Each item: { "symbol": "RELIANCE", "exchange": "NSE" }
        """
        results = []
        for item in symbols:
            result = self.get_stock_price(item["symbol"], item.get("exchange", "NSE"))
            results.append(result)
        return results

    def get_indices(self) -> list[dict]:
        """Get major market indices."""
        index_symbols = [
            {"symbol": "^NSEI", "name": "NIFTY 50", "exchange": "NSE"},
            {"symbol": "^BSESN", "name": "SENSEX", "exchange": "BSE"},
            {"symbol": "^NSEBANK", "name": "BANK NIFTY", "exchange": "NSE"},
            {"symbol": "^GSPC", "name": "S&P 500", "exchange": "NYSE"},
            {"symbol": "^IXIC", "name": "NASDAQ", "exchange": "NASDAQ"},
        ]

        results = []
        for idx in index_symbols:
            try:
                ticker = yf.Ticker(idx["symbol"])
                hist = ticker.history(period="2d")
                if hist.empty:
                    continue
                latest = hist.iloc[-1]
                prev = hist.iloc[-2]["Close"] if len(hist) >= 2 else latest["Close"]
                change = latest["Close"] - prev
                change_pct = (change / prev) * 100 if prev > 0 else 0

                results.append({
                    "symbol": idx["symbol"],
                    "name": idx["name"],
                    "exchange": idx["exchange"],
                    "price": round(float(latest["Close"]), 2),
                    "change": round(float(change), 2),
                    "change_percent": round(float(change_pct), 2),
                    "market_open": _is_market_open(idx["exchange"]),
                })
            except Exception:
                continue

        return results

    def get_stock_info(self, symbol: str, exchange: str = "NSE") -> dict:
        """Get detailed stock information (fundamentals)."""
        try:
            yf_symbol = _resolve_symbol(symbol, exchange)
            ticker = yf.Ticker(yf_symbol)
            info = ticker.info

            return {
                "symbol": symbol,
                "exchange": exchange,
                "name": info.get("longName") or info.get("shortName", symbol),
                "sector": info.get("sector", "N/A"),
                "industry": info.get("industry", "N/A"),
                "market_cap": info.get("marketCap", 0),
                "pe_ratio": info.get("trailingPE", 0),
                "pb_ratio": info.get("priceToBook", 0),
                "eps": info.get("trailingEps", 0),
                "dividend_yield": info.get("dividendYield", 0),
                "roe": info.get("returnOnEquity", 0),
                "debt_to_equity": info.get("debtToEquity", 0),
                "revenue": info.get("totalRevenue", 0),
                "profit_margin": info.get("profitMargins", 0),
                "52w_high": info.get("fiftyTwoWeekHigh", 0),
                "52w_low": info.get("fiftyTwoWeekLow", 0),
                "avg_volume": info.get("averageVolume", 0),
                "beta": info.get("beta", 0),
                "description": info.get("longBusinessSummary", ""),
                "error": None,
            }
        except Exception as e:
            return {"symbol": symbol, "exchange": exchange, "error": str(e)}

    def get_historical(self, symbol: str, exchange: str = "NSE", period: str = "1mo") -> dict:
        """Get historical price data for charts.
        period: 1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, max
        """
        try:
            yf_symbol = _resolve_symbol(symbol, exchange)
            ticker = yf.Ticker(yf_symbol)
            hist = ticker.history(period=period)

            if hist.empty:
                return {"symbol": symbol, "data": [], "error": "No data"}

            data = []
            for idx, row in hist.iterrows():
                data.append({
                    "date": idx.strftime("%Y-%m-%d"),
                    "open": round(float(row["Open"]), 2),
                    "high": round(float(row["High"]), 2),
                    "low": round(float(row["Low"]), 2),
                    "close": round(float(row["Close"]), 2),
                    "volume": int(row["Volume"]),
                })

            return {
                "symbol": symbol,
                "exchange": exchange,
                "period": period,
                "data": data,
                "count": len(data),
                "error": None,
            }
        except Exception as e:
            return {"symbol": symbol, "data": [], "error": str(e)}

    def search_stocks(self, query: str, limit: int = 10) -> list[dict]:
        """Search for stocks by name or symbol."""
        try:
            # Use yfinance search
            results = []
            # Try direct symbol lookup
            for suffix, exchange in [(".NS", "NSE"), (".BO", "BSE"), ("", "US")]:
                try:
                    test_symbol = f"{query.upper()}{suffix}"
                    ticker = yf.Ticker(test_symbol)
                    info = ticker.fast_info
                    if hasattr(info, "last_price") and info.last_price:
                        results.append({
                            "symbol": query.upper(),
                            "exchange": exchange,
                            "name": query.upper(),
                            "price": round(float(info.last_price), 2),
                        })
                except Exception:
                    continue

            return results[:limit]
        except Exception:
            return []

    def get_sector_performance(self) -> list[dict]:
        """Get Indian sector index performance."""
        sector_indices = [
            {"symbol": "^CNXIT", "name": "IT", "exchange": "NSE"},
            {"symbol": "^CNXPHARMA", "name": "Pharma", "exchange": "NSE"},
            {"symbol": "^CNXAUTO", "name": "Auto", "exchange": "NSE"},
            {"symbol": "^CNXFMCG", "name": "FMCG", "exchange": "NSE"},
            {"symbol": "^CNXMETAL", "name": "Metal", "exchange": "NSE"},
            {"symbol": "^CNXREALTY", "name": "Realty", "exchange": "NSE"},
            {"symbol": "^CNXENERGY", "name": "Energy", "exchange": "NSE"},
            {"symbol": "^CNXINFRA", "name": "Infra", "exchange": "NSE"},
        ]

        results = []
        for sector in sector_indices:
            try:
                ticker = yf.Ticker(sector["symbol"])
                hist = ticker.history(period="2d")
                if hist.empty or len(hist) < 2:
                    continue
                latest = hist.iloc[-1]["Close"]
                prev = hist.iloc[-2]["Close"]
                change_pct = ((latest - prev) / prev) * 100

                results.append({
                    "name": sector["name"],
                    "change_percent": round(float(change_pct), 2),
                    "direction": "up" if change_pct > 0 else "down",
                })
            except Exception:
                continue

        return sorted(results, key=lambda x: x["change_percent"], reverse=True)

    def _error_response(self, symbol: str, error: str) -> dict:
        return {
            "symbol": symbol,
            "price": 0,
            "change": 0,
            "change_percent": 0,
            "error": error,
            "timestamp": datetime.now().isoformat(),
        }


# Singleton instance
market_data_service = MarketDataService()
