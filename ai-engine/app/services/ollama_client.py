"""
Ollama Client Service
Interfaces with locally running Ollama for financial analysis and chat
"""

from typing import Optional


SYSTEM_PROMPT = """You are WealthMaster AI, a highly knowledgeable financial analyst and investment adviser.
You specialize in Indian (NSE/BSE) and US stock markets.

Your role:
- Analyze stocks, mutual funds, and market conditions
- Provide clear, actionable investment insights
- Explain complex financial concepts in simple language
- Consider risk management and position sizing
- Account for transaction charges and tax implications

Rules:
- Always mention risks alongside opportunities
- Never guarantee returns
- Consider the user has limited capital (₹2,000-3,000/month)
- Focus on strategies that work with small amounts
- Be honest about uncertainty

Format your responses clearly with bullet points when listing factors.
"""


class OllamaClient:
    """Communicates with local Ollama instance for AI reasoning."""

    def __init__(self):
        self.model = "qwen2.5:7b"  # Primary model (best reasoning + financial analysis)
        self.fallback_model = "mistral:7b"  # Fallback if primary not available
        self.base_url = "http://localhost:11434"

    async def ask(self, question: str, context: dict = {}) -> dict:
        """Ask the AI a financial question."""
        try:
            import ollama

            # Build context-enriched prompt
            prompt = self._build_prompt(question, context)

            response = ollama.chat(
                model=self.model,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": prompt},
                ],
            )

            return {
                "answer": response.message.content,
                "model": self.model,
                "sources": [],
                "confidence": 70,
            }
        except Exception as e:
            return {
                "answer": f"AI unavailable: {str(e)}. Make sure Ollama is running with `ollama serve`",
                "model": None,
                "sources": [],
                "confidence": 0,
                "error": True,
            }

    async def explain_signal(self, signal_data: dict) -> str:
        """Generate plain-English explanation for a signal."""
        try:
            import ollama

            prompt = f"""Explain this trading signal to a beginner investor in simple language:

Stock: {signal_data.get('symbol')}
Direction: {signal_data.get('direction')}
Confidence: {signal_data.get('confidence')}%
Entry: ₹{signal_data.get('entry_price')}
Target: ₹{signal_data.get('target_price')}
Stop Loss: ₹{signal_data.get('stop_loss')}
Factors: {signal_data.get('factors')}

Explain WHY this call was made, what factors are strongest, and what risks exist.
Keep it under 100 words. Use simple language."""

            response = ollama.chat(
                model=self.model,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": prompt},
                ],
            )
            return response.message.content
        except Exception:
            return "AI explanation unavailable. Connect Ollama to enable."

    async def check_status(self) -> dict:
        """Check Ollama connection and available models."""
        try:
            import ollama

            models = ollama.list()
            model_names = [m.model for m in models.models] if models.models else []

            return {
                "connected": True,
                "models": model_names,
                "active_model": self.model if self.model in model_names else None,
                "recommendation": (
                    "Ready to use"
                    if self.model in model_names
                    else f"Run `ollama pull {self.model}` to download the model"
                ),
            }
        except ImportError:
            return {
                "connected": False,
                "error": "ollama package not installed. Run: pip install ollama",
                "models": [],
            }
        except Exception as e:
            return {
                "connected": False,
                "error": f"Ollama not running. Start with: ollama serve",
                "models": [],
            }

    def _build_prompt(self, question: str, context: dict) -> str:
        """Build a context-enriched prompt."""
        parts = [question]

        if context.get("portfolio"):
            parts.append(f"\nMy current portfolio: {context['portfolio']}")
        if context.get("market_data"):
            parts.append(f"\nCurrent market conditions: {context['market_data']}")
        if context.get("budget"):
            parts.append(f"\nMy monthly investable amount: ₹{context['budget']}")

        return "\n".join(parts)
