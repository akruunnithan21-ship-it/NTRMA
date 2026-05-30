"""
Signal Generator Service — PRODUCTION VERSION
Combines candlestick patterns, technical indicators, fundamental data,
news sentiment, and macro conditions to produce daily BUY/SELL/HOLD signals.

This is the CORE of the AI investment adviser.
"""

import asyncio
from datetime import datetime, timedelta
from typing import Optional
from app.services.market_data import market_data_service
from app.services.candlestick_analyzer import candlestick_analyzer
from app.services.technical_analysis import TechnicalAnalyzer
from app.services.fundamental_analysis import FundamentalAnalyzer
from app.services.sentiment_engine import SentimentEngine
from app.services.ollama_client import OllamaClient


class SignalGenerator:
    """Generates trading signals using multi-factor analysis with real data."""

    def __init__(self):
        self.ta = TechnicalAnalyzer()
        self.fa = FundamentalAnalyzer()
        self.sentiment = SentimentEngine()
        self.ollama = OllamaClient()

        # Factor weights by strategy
        self.weights = {
            "aggressive": {"technical": 0.40, "candlestick": 0.20, "fundamental": 0.15, "sentiment": 0.15, "macro": 0.10},
            "balanced": {"technical": 0.30, "candlestick": 0.15, "fundamental": 0.25, "sentiment": 0.15, "macro": 0.15},
            "protect": {"technical": 0.20, "candlestick": 0.10, "fundamental": 0.35, "sentiment": 0.15, "macro": 0.20},
        }

        # Thresholds
        self.BUY_THRESHOLD = 65
        self.SELL_THRESHOLD = 35
        self.MIN_TRADE_VALUE = 500
        self.MAX_CHARGES_PERCENT = 1.5

        # Default watchlist for daily scan
        self.default_watchlist = [
            {"symbol": "TATAMOTORS", "exchange": "NSE"},
            {"symbol": "RELIANCE", "exchange": "NSE"},
            {"symbol": "HDFCBANK", "exchange": "NSE"},
            {"symbol": "INFY", "exchange": "NSE"},
            {"symbol": "TCS", "exchange": "NSE"},
            {"symbol": "SBIN", "exchange": "NSE"},
            {"symbol": "ICICIBANK", "exchange": "NSE"},
            {"symbol": "BHARTIARTL", "exchange": "NSE"},
            {"symbol": "WIPRO", "exchange": "NSE"},
            {"symbol": "ADANIENT", "exchange": "NSE"},
            {"symbol": "BAJFINANCE", "exchange": "NSE"},
            {"symbol": "MARUTI", "exchange": "NSE"},
            {"symbol": "HINDUNILVR", "exchange": "NSE"},
            {"symbol": "ONGC", "exchange": "NSE"},
            {"symbol": "COALINDIA", "exchange": "NSE"},
        ]

    async def generate_signal(self, symbol: str, exchange: str = "NSE", strategy: str = "aggressive") -> dict:
        """Generate a complete signal for one stock using REAL data."""

        # 1. Get price data
        price_data = market_data_service.get_stock_price(symbol, exchange)
        if price_data.get("error"):
            return {"symbol": symbol, "error": f"Could not fetch price: {price_data['error']}"}

        current_price = price_data["price"]
        if current_price <= 0:
            return {"symbol": symbol, "error": "Invalid price data"}

        # 2. Get historical data for candlestick analysis
        hist = market_data_service.get_historical(symbol, exchange, "3mo")
        hist_data = hist.get("data", [])

        # 3. Run candlestick analysis
        candle_result = await candlestick_analyzer.analyze(symbol, hist_data) if len(hist_data) >= 5 else {}
        candle_score = self._score_candlestick(candle_result)

        # 4. Technical indicators score
        tech_score = self._score_technical(hist_data)

        # 5. Fundamental score
        fund_data = market_data_service.get_stock_info(symbol, exchange)
        fund_score = self._score_fundamental(fund_data)

        # 6. Sentiment score (simplified — uses available data)
        sent_score = await self._score_sentiment(symbol)

        # 7. Macro score
        macro_score = await self._score_macro()

        # 8. Calculate weighted composite
        weights = self.weights.get(strategy, self.weights["aggressive"])
        composite = (
            tech_score * weights["technical"] +
            candle_score * weights["candlestick"] +
            fund_score * weights["fundamental"] +
            sent_score * weights["sentiment"] +
            macro_score * weights["macro"]
        )

        # 9. Determine direction
        if composite >= self.BUY_THRESHOLD:
            direction = "BUY"
        elif composite <= self.SELL_THRESHOLD:
            direction = "SELL"
        else:
            direction = "HOLD"

        confidence = int(min(max(composite, 0), 100))

        # 10. Calculate target and stop-loss from candlestick S/R
        sr = candle_result.get("support_resistance", {})
        target = sr.get("nearest_resistance", round(current_price * 1.10, 2))
        stop_loss = sr.get("nearest_support", round(current_price * 0.95, 2))

        target_pct = round(((target - current_price) / current_price) * 100, 1)
        sl_pct = round(((current_price - stop_loss) / current_price) * 100, 1)
        risk_reward = round(target_pct / sl_pct, 1) if sl_pct > 0 else 0

        # 11. Time horizon based on strategy
        horizons = {"aggressive": "1-3 weeks", "balanced": "1-3 months", "protect": "3-6 months"}

        # 12. Get AI explanation
        explanation = await self._get_explanation(symbol, direction, confidence, {
            "technical": tech_score, "candlestick": candle_score,
            "fundamental": fund_score, "sentiment": sent_score, "macro": macro_score,
        }, candle_result.get("patterns_detected", []))

        return {
            "symbol": symbol,
            "exchange": exchange,
            "direction": direction,
            "confidence": confidence,
            "entry_price": current_price,
            "target_price": target,
            "target_percent": target_pct,
            "stop_loss": stop_loss,
            "stop_loss_percent": sl_pct,
            "risk_reward": f"1:{risk_reward}",
            "time_horizon": horizons.get(strategy, "2-4 weeks"),
            "strategy": strategy,
            "factors": {
                "technical": int(tech_score),
                "candlestick": int(candle_score),
                "fundamental": int(fund_score),
                "sentiment": int(sent_score),
                "macro": int(macro_score),
            },
            "patterns": [p["name"] for p in candle_result.get("patterns_detected", [])],
            "trend": candle_result.get("trend", {}).get("direction", "unknown"),
            "explanation": explanation,
            "generated_at": datetime.now().isoformat(),
        }

    async def get_daily_signals(self, strategy: str = "aggressive", watchlist: list = None) -> dict:
        """Generate signals for entire watchlist. Returns top picks."""
        symbols = watchlist or self.default_watchlist
        signals = []

        for item in symbols:
            try:
                signal = await self.generate_signal(item["symbol"], item.get("exchange", "NSE"), strategy)
                if not signal.get("error"):
                    signals.append(signal)
            except Exception as e:
                continue

        # Sort by confidence (highest first)
        signals.sort(key=lambda s: s["confidence"], reverse=True)

        # Separate by direction
        buys = [s for s in signals if s["direction"] == "BUY"]
        sells = [s for s in signals if s["direction"] == "SELL"]
        holds = [s for s in signals if s["direction"] == "HOLD"]

        # Top pick
        top_pick = buys[0] if buys else (signals[0] if signals else None)

        return {
            "date": datetime.now().strftime("%Y-%m-%d"),
            "strategy": strategy,
            "total_analyzed": len(symbols),
            "signals_generated": len(signals),
            "top_pick": top_pick,
            "buy_signals": buys[:5],
            "sell_signals": sells[:3],
            "hold_signals": holds[:3],
            "generated_at": datetime.now().isoformat(),
        }

    def _score_candlestick(self, result: dict) -> float:
        """Score 0-100 based on candlestick patterns and prediction."""
        if not result or "error" in result:
            return 50.0

        prediction = result.get("prediction", {})
        direction = prediction.get("direction", "NEUTRAL")
        conf = prediction.get("confidence", 50)

        if direction == "UP":
            return min(95, 50 + conf * 0.45)
        elif direction == "DOWN":
            return max(5, 50 - conf * 0.45)
        return 50.0

    def _score_technical(self, hist_data: list) -> float:
        """Score 0-100 based on technical indicators from price data."""
        if not hist_data or len(hist_data) < 14:
            return 50.0

        import numpy as np
        closes = [d["close"] for d in hist_data]
        score = 50.0

        # RSI calculation
        deltas = np.diff(closes)
        gains = np.where(deltas > 0, deltas, 0)
        losses = np.where(deltas < 0, -deltas, 0)
        avg_gain = np.mean(gains[-14:])
        avg_loss = np.mean(losses[-14:])
        rs = avg_gain / avg_loss if avg_loss > 0 else 100
        rsi = 100 - (100 / (1 + rs))

        if 40 < rsi < 60:
            score += 5
        elif rsi < 30:
            score += 20  # Oversold = buying opportunity
        elif rsi > 70:
            score -= 15  # Overbought = risky to buy

        # Trend: price vs moving averages
        if len(closes) >= 20:
            ma20 = np.mean(closes[-20:])
            current = closes[-1]
            if current > ma20:
                score += 15
            else:
                score -= 10

        if len(closes) >= 50:
            ma50 = np.mean(closes[-50:])
            if closes[-1] > ma50:
                score += 10
            else:
                score -= 10

        # Volume trend (if available)
        if hist_data[-1].get("volume", 0) > 0 and len(hist_data) >= 20:
            avg_vol = np.mean([d.get("volume", 0) for d in hist_data[-20:]])
            curr_vol = hist_data[-1]["volume"]
            if curr_vol > avg_vol * 1.5 and closes[-1] > closes[-2]:
                score += 10  # High volume on up day = bullish

        return max(0, min(100, score))

    def _score_fundamental(self, info: dict) -> float:
        """Score 0-100 based on fundamentals."""
        if not info or info.get("error"):
            return 50.0

        score = 50.0
        pe = info.get("pe_ratio", 0)
        roe = info.get("roe", 0)
        de = info.get("debt_to_equity", 0)
        margin = info.get("profit_margin", 0)

        # P/E analysis (lower is better for value)
        if 0 < pe < 15:
            score += 15
        elif 15 <= pe < 25:
            score += 5
        elif pe > 40:
            score -= 10

        # ROE (higher is better)
        if isinstance(roe, (int, float)):
            if roe > 0.20:
                score += 15
            elif roe > 0.15:
                score += 10
            elif roe < 0.05:
                score -= 10

        # Debt (lower is better)
        if isinstance(de, (int, float)):
            if de < 0.5:
                score += 10
            elif de > 2.0:
                score -= 15

        # Profit margin
        if isinstance(margin, (int, float)):
            if margin > 0.15:
                score += 10
            elif margin < 0:
                score -= 15

        return max(0, min(100, score))

    async def _score_sentiment(self, symbol: str) -> float:
        """Score 0-100 based on news sentiment."""
        try:
            result = await self.sentiment.analyze(symbol, ["gnews"])
            sentiment_val = result.get("overall_sentiment", 0)
            # Convert -1 to +1 range to 0-100
            return max(0, min(100, 50 + sentiment_val * 50))
        except Exception:
            return 50.0

    async def _score_macro(self) -> float:
        """Score 0-100 based on macro market conditions."""
        try:
            indices = market_data_service.get_indices()
            if not indices:
                return 50.0

            score = 50.0
            for idx in indices:
                change = idx.get("change_percent", 0)
                if idx.get("name") == "NIFTY 50":
                    if change > 1:
                        score += 15
                    elif change > 0:
                        score += 5
                    elif change < -1:
                        score -= 15
                    else:
                        score -= 5

            return max(0, min(100, score))
        except Exception:
            return 50.0

    async def _get_explanation(self, symbol, direction, confidence, factors, patterns) -> str:
        """Get Qwen 3 explanation for the signal."""
        try:
            pattern_text = ", ".join(patterns) if patterns else "No clear patterns"
            signal_data = {
                "symbol": symbol, "direction": direction, "confidence": confidence,
                "factors": factors, "patterns": pattern_text,
            }
            explanation = await self.ollama.explain_signal(signal_data)
            return explanation
        except Exception:
            factor_text = f"Tech:{factors['technical']}, Candle:{factors['candlestick']}, Fund:{factors['fundamental']}"
            return f"{direction} signal at {confidence}% confidence. Scores: {factor_text}. Patterns: {', '.join(patterns) if patterns else 'None detected'}."


# Singleton
signal_generator = SignalGenerator()
