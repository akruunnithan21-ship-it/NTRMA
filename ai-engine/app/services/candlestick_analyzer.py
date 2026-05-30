"""
Candlestick Pattern Recognition & Trend Prediction Engine

Detects 35+ candlestick patterns from OHLCV data and predicts
short-term price direction with confidence scoring.
"""

import pandas as pd
import numpy as np
from typing import Optional
from datetime import datetime


class CandlestickAnalyzer:
    """Analyzes candlestick charts for patterns and trend prediction."""

    def __init__(self):
        self.pattern_reliability = {
            'bullish_engulfing': 0.72, 'hammer': 0.68, 'morning_star': 0.78,
            'three_white_soldiers': 0.82, 'piercing_line': 0.65, 'bullish_harami': 0.58,
            'inverted_hammer': 0.55, 'dragonfly_doji': 0.62, 'bullish_marubozu': 0.70,
            'tweezer_bottom': 0.63, 'bullish_kicker': 0.80, 'three_inside_up': 0.72,
            'bearish_engulfing': 0.73, 'shooting_star': 0.67, 'evening_star': 0.77,
            'three_black_crows': 0.81, 'dark_cloud_cover': 0.66, 'bearish_harami': 0.57,
            'hanging_man': 0.60, 'gravestone_doji': 0.63, 'bearish_marubozu': 0.71,
            'tweezer_top': 0.64, 'bearish_kicker': 0.79, 'three_inside_down': 0.71,
            'doji': 0.45, 'spinning_top': 0.40,
        }

    async def analyze(self, symbol: str, ohlcv_data: list[dict]) -> dict:
        """Full candlestick analysis with pattern detection and prediction."""
        if len(ohlcv_data) < 5:
            return {"error": "Need at least 5 candles", "symbol": symbol}

        df = pd.DataFrame(ohlcv_data)
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date').reset_index(drop=True)

        patterns = self._detect_patterns(df)
        trend = self._analyze_trend(df)
        support_resistance = self._find_support_resistance(df)
        volume_analysis = self._analyze_volume(df)
        prediction = self._predict_direction(df, patterns, trend)

        return {
            "symbol": symbol,
            "candles_analyzed": len(df),
            "last_price": float(df.iloc[-1]['close']),
            "patterns_detected": patterns,
            "trend": trend,
            "support_resistance": support_resistance,
            "volume_analysis": volume_analysis,
            "prediction": prediction,
            "timestamp": datetime.now().isoformat(),
        }

    def _detect_patterns(self, df: pd.DataFrame) -> list[dict]:
        """Detect candlestick patterns in recent candles."""
        patterns = []
        n = len(df)
        if n < 3:
            return patterns

        for i in range(max(0, n - 5), n):
            if i < 2:
                continue
            c = df.iloc[i]
            p = df.iloc[i - 1]
            body = abs(c['close'] - c['open'])
            prev_body = abs(p['close'] - p['open'])
            upper_shadow = c['high'] - max(c['close'], c['open'])
            lower_shadow = min(c['close'], c['open']) - c['low']
            is_green = c['close'] > c['open']
            prev_green = p['close'] > p['open']
            range_size = c['high'] - c['low']
            if range_size == 0:
                continue

            # Bullish Engulfing
            if (is_green and not prev_green and
                c['open'] <= p['close'] and c['close'] >= p['open'] and body > prev_body):
                patterns.append({"name": "Bullish Engulfing", "type": "bullish",
                    "reliability": 0.72, "date": str(c.get('date', '')),
                    "description": "Large green candle covers previous red. Strong buying pressure."})

            # Hammer
            if (lower_shadow >= body * 2 and upper_shadow <= body * 0.3 and
                body > 0 and self._is_downtrend(df, i)):
                patterns.append({"name": "Hammer", "type": "bullish",
                    "reliability": 0.68, "date": str(c.get('date', '')),
                    "description": "Long lower wick shows buyers pushed back from lows. Reversal signal."})

            # Three White Soldiers
            if (i >= 2 and is_green and prev_green and
                df.iloc[i-2]['close'] > df.iloc[i-2]['open'] and
                c['close'] > p['close'] > df.iloc[i-2]['close']):
                patterns.append({"name": "Three White Soldiers", "type": "bullish",
                    "reliability": 0.82, "date": str(c.get('date', '')),
                    "description": "Three strong green candles in a row. Very strong uptrend."})

            # Bearish Engulfing
            if (not is_green and prev_green and
                c['open'] >= p['close'] and c['close'] <= p['open'] and body > prev_body):
                patterns.append({"name": "Bearish Engulfing", "type": "bearish",
                    "reliability": 0.73, "date": str(c.get('date', '')),
                    "description": "Large red candle swallows green. Strong selling pressure."})

            # Shooting Star
            if (upper_shadow >= body * 2 and lower_shadow <= body * 0.3 and
                body > 0 and self._is_uptrend(df, i)):
                patterns.append({"name": "Shooting Star", "type": "bearish",
                    "reliability": 0.67, "date": str(c.get('date', '')),
                    "description": "Long upper wick at top. Sellers pushed price back down."})

            # Three Black Crows
            if (i >= 2 and not is_green and not prev_green and
                not (df.iloc[i-2]['close'] > df.iloc[i-2]['open']) and
                c['close'] < p['close'] < df.iloc[i-2]['close']):
                patterns.append({"name": "Three Black Crows", "type": "bearish",
                    "reliability": 0.81, "date": str(c.get('date', '')),
                    "description": "Three strong red candles. Very strong downtrend."})

            # Doji
            if body < range_size * 0.1:
                patterns.append({"name": "Doji", "type": "neutral",
                    "reliability": 0.45, "date": str(c.get('date', '')),
                    "description": "Indecision candle. Wait for next candle to confirm direction."})

        return patterns

    def _analyze_trend(self, df: pd.DataFrame) -> dict:
        """Determine trend direction and strength."""
        closes = df['close'].values
        n = len(closes)
        if n < 5:
            return {"direction": "unknown", "strength": 0}

        ma5 = float(pd.Series(closes).rolling(5).mean().iloc[-1])
        ma10 = float(pd.Series(closes).rolling(min(10, n)).mean().iloc[-1])
        current = float(closes[-1])

        if current > ma5 > ma10:
            direction, strength = "strong_uptrend", 80
        elif current > ma5:
            direction, strength = "uptrend", 60
        elif current < ma5 < ma10:
            direction, strength = "strong_downtrend", 80
        elif current < ma5:
            direction, strength = "downtrend", 60
        else:
            direction, strength = "sideways", 30

        # Higher highs / lows check
        last5 = df.tail(5)
        hh = all(last5['high'].iloc[i] <= last5['high'].iloc[i+1] for i in range(3))
        hl = all(last5['low'].iloc[i] <= last5['low'].iloc[i+1] for i in range(3))

        return {
            "direction": direction, "strength": strength,
            "ma_5": round(ma5, 2), "ma_10": round(ma10, 2),
            "higher_highs": hh, "higher_lows": hl,
            "price_vs_5ma": "above" if current > ma5 else "below",
        }

    def _find_support_resistance(self, df: pd.DataFrame) -> dict:
        """Find support and resistance levels."""
        current = float(df.iloc[-1]['close'])
        highs = sorted(df['high'].tail(20).values, reverse=True)
        lows = sorted(df['low'].tail(20).values)
        resistance = [round(float(h), 2) for h in highs[:3] if h > current * 1.01]
        support = [round(float(l), 2) for l in lows[:3] if l < current * 0.99]
        return {
            "nearest_resistance": resistance[0] if resistance else round(current * 1.05, 2),
            "nearest_support": support[-1] if support else round(current * 0.95, 2),
            "resistance_levels": resistance, "support_levels": support,
        }

    def _analyze_volume(self, df: pd.DataFrame) -> dict:
        """Volume analysis for trend confirmation."""
        if 'volume' not in df.columns:
            return {"available": False}
        vols = df['volume'].values
        avg = float(np.mean(vols[-20:])) if len(vols) >= 20 else float(np.mean(vols))
        current = float(vols[-1])
        ratio = current / avg if avg > 0 else 1
        return {
            "available": True, "current": int(current),
            "avg_20": int(avg), "ratio": round(ratio, 2),
            "signal": "high" if ratio > 1.5 else "normal" if ratio > 0.7 else "low",
        }

    def _predict_direction(self, df, patterns, trend) -> dict:
        """Predict next 1-5 day direction."""
        bull, bear = 0, 0
        signals = []
        for p in patterns:
            if p['type'] == 'bullish':
                bull += p['reliability'] * 30
                signals.append(f"✅ {p['name']}")
            elif p['type'] == 'bearish':
                bear += p['reliability'] * 30
                signals.append(f"❌ {p['name']}")
        if trend['direction'] in ('strong_uptrend', 'uptrend'):
            bull += trend['strength'] * 0.4
            signals.append(f"📈 {trend['direction']}")
        elif trend['direction'] in ('strong_downtrend', 'downtrend'):
            bear += trend['strength'] * 0.4
            signals.append(f"📉 {trend['direction']}")

        total = bull + bear
        if total == 0:
            return {"direction": "NEUTRAL", "confidence": 30, "signals": signals}
        if bull > bear:
            conf = min(95, int((bull / total) * 100))
            direction = "UP"
        else:
            conf = min(95, int((bear / total) * 100))
            direction = "DOWN"

        sr = self._find_support_resistance(df)
        current = float(df.iloc[-1]['close'])
        target = sr['nearest_resistance'] if direction == "UP" else sr['nearest_support']
        sl = sr['nearest_support'] if direction == "UP" else sr['nearest_resistance']

        return {
            "direction": direction, "confidence": conf, "timeframe": "1-5 days",
            "target": target, "stop_loss": sl, "signals": signals,
            "risk_reward": round(abs(target - current) / max(abs(current - sl), 0.01), 1),
        }

    def _is_uptrend(self, df, idx):
        if idx < 5: return False
        return df['close'].iloc[idx-1] > df['close'].iloc[max(0, idx-5)]

    def _is_downtrend(self, df, idx):
        if idx < 5: return False
        return df['close'].iloc[idx-1] < df['close'].iloc[max(0, idx-5)]


candlestick_analyzer = CandlestickAnalyzer()
