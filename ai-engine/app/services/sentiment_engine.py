"""
News Sentiment Analysis Engine — PRODUCTION
Fetches financial news via GNews API and scores sentiment using TextBlob.
"""

import os
from typing import Optional
from datetime import datetime

try:
    from textblob import TextBlob
    HAS_TEXTBLOB = True
except ImportError:
    HAS_TEXTBLOB = False

try:
    from gnews import GNews
    HAS_GNEWS = True
except ImportError:
    HAS_GNEWS = False


class SentimentEngine:
    """Analyzes market sentiment from news sources."""

    def __init__(self):
        self.gnews = GNews(language='en', country='IN', max_results=10) if HAS_GNEWS else None

    async def analyze(self, query: str, sources: list[str] = ["gnews"]) -> dict:
        """Analyze sentiment for a stock/topic."""
        articles = self._fetch_news(query)
        if not articles:
            return {"query": query, "overall_sentiment": 0, "sentiment_label": "neutral", "confidence": 0, "article_count": 0, "headlines": []}

        sentiments = []
        headlines = []
        for article in articles[:10]:
            title = article.get("title", "")
            score = self._score_text(title)
            sentiments.append(score)
            headlines.append({"title": title, "sentiment": round(score, 2), "published": article.get("published date", ""), "source": article.get("publisher", {}).get("title", "Unknown")})

        avg = sum(sentiments) / len(sentiments) if sentiments else 0
        label = "bullish" if avg > 0.15 else "bearish" if avg < -0.15 else "neutral"
        confidence = min(95, int(abs(avg) * 100 + len(articles) * 3))

        return {
            "query": query,
            "overall_sentiment": round(avg, 3),
            "sentiment_label": label,
            "confidence": confidence,
            "article_count": len(articles),
            "headlines": headlines,
            "analyzed_at": datetime.now().isoformat(),
        }

    async def get_stock_news(self, symbol: str, limit: int = 10) -> list:
        """Get news for a specific stock with sentiment."""
        query = f"{symbol} stock India NSE"
        articles = self._fetch_news(query)
        results = []
        for a in articles[:limit]:
            title = a.get("title", "")
            score = self._score_text(title)
            results.append({"title": title, "sentiment": round(score, 2), "label": "positive" if score > 0.1 else "negative" if score < -0.1 else "neutral", "published": a.get("published date", ""), "source": a.get("publisher", {}).get("title", ""), "url": a.get("url", "")})
        return results

    async def get_market_mood(self) -> dict:
        """Overall market mood from broad financial news."""
        queries = ["Indian stock market today", "NIFTY Sensex today", "RBI economy India"]
        all_scores = []
        for q in queries:
            articles = self._fetch_news(q)
            for a in articles[:5]:
                score = self._score_text(a.get("title", ""))
                all_scores.append(score)

        avg = sum(all_scores) / len(all_scores) if all_scores else 0
        mood_score = int(50 + avg * 50)  # 0-100 scale (50 = neutral)

        if mood_score >= 70:
            mood = "greedy"
        elif mood_score >= 55:
            mood = "bullish"
        elif mood_score >= 45:
            mood = "neutral"
        elif mood_score >= 30:
            mood = "bearish"
        else:
            mood = "fearful"

        return {"mood": mood, "score": mood_score, "articles_analyzed": len(all_scores), "analyzed_at": datetime.now().isoformat()}

    async def get_upcoming_events(self) -> list:
        """Get market-moving events."""
        articles = self._fetch_news("India RBI earnings results IPO")
        events = []
        for a in articles[:5]:
            events.append({"title": a.get("title", ""), "source": a.get("publisher", {}).get("title", ""), "date": a.get("published date", "")})
        return events

    def _fetch_news(self, query: str) -> list:
        """Fetch news from GNews."""
        if not self.gnews:
            return []
        try:
            return self.gnews.get_news(query) or []
        except Exception:
            return []

    def _score_text(self, text: str) -> float:
        """Score sentiment of text. Returns -1 (bearish) to +1 (bullish)."""
        if not text or not HAS_TEXTBLOB:
            return 0.0
        try:
            blob = TextBlob(text)
            polarity = blob.sentiment.polarity
            # Boost financial keywords
            text_lower = text.lower()
            boost = 0
            bullish_words = ['surge', 'rally', 'gain', 'profit', 'record', 'high', 'growth', 'bullish', 'upgrade', 'outperform', 'buy']
            bearish_words = ['crash', 'fall', 'loss', 'decline', 'low', 'bearish', 'downgrade', 'sell', 'warning', 'risk', 'debt']
            for w in bullish_words:
                if w in text_lower:
                    boost += 0.1
            for w in bearish_words:
                if w in text_lower:
                    boost -= 0.1
            return max(-1, min(1, polarity + boost))
        except Exception:
            return 0.0
