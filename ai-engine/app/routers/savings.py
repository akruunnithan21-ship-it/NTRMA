"""AI Savings Adviser Router"""

from fastapi import APIRouter
from pydantic import BaseModel
from app.services.savings_adviser import SavingsAdviser

router = APIRouter()
adviser = SavingsAdviser()


class SpendingData(BaseModel):
    total_spent: float = 0
    income: float = 13000
    categories: dict = {}  # { "dining": 800, "transport": 650, ... }
    necessity: dict = {}  # { 1: 350, 2: 850, 3: 1200, ... }


class MonthlyData(BaseModel):
    months: list = []  # [{ "month": "2026-04", "total_expenses": 9500 }, ...]


@router.post("/weekly-report")
async def get_weekly_savings_report(data: SpendingData) -> dict:
    """Generate AI-powered weekly savings report with suggestions."""
    report = await adviser.generate_weekly_report({
        "total_spent": data.total_spent,
        "categories": data.categories,
        "necessity": data.necessity,
        "income": data.income,
    })
    return report


@router.post("/trends")
async def get_spending_trends(data: MonthlyData) -> dict:
    """Analyze spending trends across months."""
    return await adviser.analyze_spending_trends(data.months)


@router.post("/category/{category}")
async def get_category_insights(category: str, history: list = []) -> dict:
    """Deep dive analysis for a specific category."""
    return await adviser.get_category_insights(category, history)


@router.get("/tips")
async def get_savings_tips() -> dict:
    """Get general savings tips for low-income investors."""
    return {
        "tips": [
            {
                "id": "1",
                "title": "The ₹100 rule",
                "tip": "Before any non-essential purchase over ₹100, wait 24 hours. You'll skip 40% of impulse buys.",
                "category": "general",
            },
            {
                "id": "2",
                "title": "Meal prep Sundays",
                "tip": "Spend 2 hours Sunday prepping meals for the week. Saves ₹200-400/week vs ordering.",
                "category": "dining",
            },
            {
                "id": "3",
                "title": "Monthly pass > daily tickets",
                "tip": "If you commute daily, a monthly metro/bus pass saves 20-30% vs daily tickets.",
                "category": "transport",
            },
            {
                "id": "4",
                "title": "Share subscriptions",
                "tip": "Family plans for Netflix/Spotify/YouTube split 4 ways = 75% savings each.",
                "category": "subscriptions",
            },
            {
                "id": "5",
                "title": "Cash envelope method",
                "tip": "Withdraw weekly cash budget in physical notes. When envelope is empty, stop spending that category.",
                "category": "general",
            },
            {
                "id": "6",
                "title": "Free alternatives",
                "tip": "YouTube instead of paid courses, library books, free Spotify with ads, walking under 2km.",
                "category": "general",
            },
        ]
    }
