"""
AI Savings Adviser Service
Analyzes spending patterns and generates actionable savings suggestions
"""

from typing import Optional


class SavingsAdviser:
    """Analyzes spending data and produces savings recommendations."""

    async def generate_weekly_report(self, spending_data: dict) -> dict:
        """Generate a weekly savings report with suggestions."""
        total_spent = spending_data.get("total_spent", 0)
        category_breakdown = spending_data.get("categories", {})
        necessity_breakdown = spending_data.get("necessity", {})
        income = spending_data.get("income", 13000)

        suggestions = []

        # 1. Dining out analysis
        dining_spent = category_breakdown.get("dining", 0)
        if dining_spent > 500:
            cook_savings = round(dining_spent * 0.4)
            suggestions.append({
                "id": "reduce_dining",
                "category": "dining",
                "title": "🍕 Reduce food delivery",
                "message": f"You spent ₹{dining_spent} on dining/delivery. Cooking 2 meals instead saves ~₹{cook_savings}/month.",
                "potential_saving": cook_savings,
                "difficulty": "medium",
                "priority": 1,
            })

        # 2. Subscription audit
        sub_spent = category_breakdown.get("subscriptions", 0)
        if sub_spent > 300:
            suggestions.append({
                "id": "audit_subscriptions",
                "category": "subscriptions",
                "title": "🔄 Subscription audit",
                "message": f"₹{sub_spent}/month on subscriptions. Review if all are used regularly. Consider family plans or lower tiers.",
                "potential_saving": round(sub_spent * 0.3),
                "difficulty": "easy",
                "priority": 2,
            })

        # 3. Transport optimization
        transport_spent = category_breakdown.get("transport", 0)
        if transport_spent > 600:
            suggestions.append({
                "id": "optimize_transport",
                "category": "transport",
                "title": "🚌 Transport savings",
                "message": f"₹{transport_spent} on transport. Walk/cycle for trips under 2km. Monthly metro pass saves vs daily tickets.",
                "potential_saving": round(transport_spent * 0.25),
                "difficulty": "easy",
                "priority": 3,
            })

        # 4. Necessity level analysis
        luxury_spent = necessity_breakdown.get(1, 0) + necessity_breakdown.get(2, 0)
        if luxury_spent > 300:
            suggestions.append({
                "id": "cut_luxuries",
                "category": "general",
                "title": "✂️ Cut non-essentials",
                "message": f"₹{luxury_spent} spent on luxury/nice-to-have items. Halving these frees up ₹{round(luxury_spent * 0.5)} for investments.",
                "potential_saving": round(luxury_spent * 0.5),
                "difficulty": "medium",
                "priority": 4,
            })

        # 5. Shopping impulse
        shopping_spent = category_breakdown.get("shopping", 0)
        if shopping_spent > 500:
            suggestions.append({
                "id": "reduce_shopping",
                "category": "shopping",
                "title": "🛍️ 24-hour rule for shopping",
                "message": f"₹{shopping_spent} on shopping. Try the 24-hour rule: wait a day before buying anything non-essential.",
                "potential_saving": round(shopping_spent * 0.5),
                "difficulty": "medium",
                "priority": 5,
            })

        # 6. Grocery optimization
        grocery_spent = category_breakdown.get("groceries", 0)
        if grocery_spent > 2500:
            suggestions.append({
                "id": "optimize_groceries",
                "category": "groceries",
                "title": "🛒 Buy in bulk weekly",
                "message": "Weekly bulk shopping (DMart/BigBasket) is 15-20% cheaper than daily kirana purchases.",
                "potential_saving": round(grocery_spent * 0.15),
                "difficulty": "easy",
                "priority": 6,
            })

        # Calculate total potential savings
        total_potential = sum(s["potential_saving"] for s in suggestions)

        # Sort by priority
        suggestions.sort(key=lambda s: s["priority"])

        return {
            "period": "weekly",
            "total_spent": total_spent,
            "income": income,
            "saved": income - total_spent,
            "suggestions": suggestions,
            "total_potential_saving": total_potential,
            "investable_after_cuts": (income - total_spent) + total_potential,
            "message": f"By following these suggestions, you could save an extra ₹{total_potential}/month — that's ₹{total_potential} more for investments!",
        }

    async def analyze_spending_trends(self, monthly_data: list) -> dict:
        """Analyze spending trends across months."""
        if len(monthly_data) < 2:
            return {"trend": "insufficient_data", "months_analyzed": len(monthly_data)}

        latest = monthly_data[-1]
        previous = monthly_data[-2]

        change = latest.get("total_expenses", 0) - previous.get("total_expenses", 0)
        change_percent = (
            round((change / previous["total_expenses"]) * 100, 1)
            if previous.get("total_expenses", 0) > 0
            else 0
        )

        trend = "increasing" if change > 0 else "decreasing" if change < 0 else "stable"

        return {
            "trend": trend,
            "change": change,
            "change_percent": change_percent,
            "months_analyzed": len(monthly_data),
            "recommendation": (
                "Spending is trending up. Review recent additions to routine expenses."
                if trend == "increasing"
                else "Great! Your spending discipline is improving."
                if trend == "decreasing"
                else "Spending is stable. Look for specific categories to optimize."
            ),
        }

    async def get_category_insights(self, category: str, history: list) -> dict:
        """Deep dive analysis for a specific category."""
        if not history:
            return {"category": category, "insight": "No data yet for this category."}

        total = sum(item.get("amount", 0) for item in history)
        avg = total / len(history) if history else 0
        max_item = max(history, key=lambda x: x.get("amount", 0)) if history else None

        return {
            "category": category,
            "total_this_month": total,
            "average_per_transaction": round(avg),
            "transaction_count": len(history),
            "biggest_expense": max_item,
            "insight": f"You spend an average of ₹{round(avg)} per transaction in this category.",
        }
