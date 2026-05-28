# 🤖 Ollama Setup Guide for WealthMaster

This guide walks you through setting up the local AI engine using Ollama.

---

## What is Ollama?

Ollama lets you run AI models (like Mistral, Llama, Phi) locally on your PC.
- **Free forever** — no API costs
- **Private** — your data never leaves your machine
- **Fast** — runs entirely on your hardware

---

## Hardware Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| RAM | 8GB | 16GB+ |
| GPU | Not required | NVIDIA GPU with 6GB+ VRAM |
| Disk | 10GB free | 20GB free |
| CPU | Any modern 4-core | 8-core+ |

**Mistral 7B (our primary model):**
- Uses ~4.5GB RAM (Q4 quantization)
- Works on CPU-only (slower but functional)
- With GPU: responses in 2-5 seconds
- Without GPU: responses in 10-30 seconds

---

## Installation

### Windows
1. Download from [ollama.com/download](https://ollama.com/download)
2. Run the installer
3. Ollama will start automatically as a system service

### Linux
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### macOS
```bash
brew install ollama
```

---

## Setup Steps

### Step 1: Start Ollama
```bash
ollama serve
```
This starts the Ollama server on `http://localhost:11434`

### Step 2: Download the AI model
```bash
# Primary model (recommended - best balance of quality and speed)
ollama pull mistral:7b

# Alternative: Lighter model (if you have less RAM)
ollama pull phi4:latest

# Alternative: More powerful (needs 16GB+ RAM)
ollama pull llama3.1:8b
```

### Step 3: Test it works
```bash
ollama run mistral:7b "What is the P/E ratio of a stock?"
```

You should get a response about P/E ratios. If this works, you're good!

### Step 4: Verify WealthMaster connection
```bash
curl http://localhost:8000/health
```

Should show:
```json
{
  "status": "ok",
  "ollama": "connected",
  "available_models": ["mistral:7b"]
}
```

---

## Model Recommendations

| Use Case | Model | RAM Needed | Speed |
|----------|-------|-----------|-------|
| **Daily use (recommended)** | `mistral:7b` | ~5GB | Fast |
| **Low RAM PC** | `phi4:latest` | ~3GB | Very fast |
| **Better analysis** | `llama3.1:8b` | ~6GB | Medium |
| **Best quality** | `mixtral:8x7b` | ~26GB | Slow (needs GPU) |

**We recommend starting with `mistral:7b`** — it's the best balance of financial reasoning quality and speed.

---

## How WealthMaster Uses Ollama

The AI engine does **NOT** rely on Ollama for trading signals. Here's the split:

| Task | Who Does It | Depends on Ollama? |
|------|------------|-------------------|
| Technical indicators (RSI, MACD, etc.) | Python (pandas-ta) | ❌ No |
| Signal generation (BUY/SELL/HOLD) | Python (ML models) | ❌ No |
| Fundamental analysis | Python (yfinance) | ❌ No |
| Sentiment scoring | Python (TextBlob) | ❌ No |
| **Signal explanation** | Ollama | ✅ Yes |
| **"Ask the AI" chat** | Ollama | ✅ Yes |
| **News summarization** | Ollama | ✅ Yes |
| **Learning content** | Ollama | ✅ Yes |

**Key point:** Even without Ollama running, the app still generates signals, tracks your money, and shows market data. Ollama adds the "explain why" and chat features.

---

## Custom Financial Prompt

WealthMaster uses a specialized system prompt that makes Ollama focus on:
- Indian and US stock market knowledge
- Risk-aware recommendations
- Small capital optimization (₹2,000-3,000/month strategies)
- Simple explanations for beginners
- Transaction cost awareness

This is already configured in the code — no manual setup needed.

---

## Performance Tips

### Speed up responses:
1. **Use GPU acceleration** — If you have an NVIDIA GPU, Ollama auto-detects it
2. **Keep Ollama running** — First response is slower (model loading), subsequent ones are fast
3. **Use quantized models** — Already default (Q4_K_M quantization)

### Reduce RAM usage:
1. Use `phi4:latest` instead of `mistral:7b`
2. Close other heavy apps while using
3. Set `OLLAMA_NUM_PARALLEL=1` environment variable

### If Ollama is too slow:
- The app works fine without it (signals still generate)
- Consider running it only when you need the chat/explanation features
- Start Ollama before market hours, leave it running

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "connection refused" | Run `ollama serve` first |
| "model not found" | Run `ollama pull mistral:7b` |
| Out of memory | Use `phi4:latest` (smaller model) |
| Slow responses | Normal on CPU-only. Consider GPU. |
| Port conflict (11434) | Check if another Ollama instance is running |

---

## Verifying the Full Pipeline

```bash
# 1. Make sure Ollama is running
ollama list  # Should show mistral:7b

# 2. Test via WealthMaster AI Engine
curl -X POST http://localhost:8000/chat/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "Should I invest in Tata Motors at ₹950?"}'

# 3. Check status
curl http://localhost:8000/chat/status
```

---

## Upgrading Models

As better models release, you can switch:
```bash
# Download new model
ollama pull <new-model-name>

# Update .env file
OLLAMA_MODEL=<new-model-name>

# Restart AI engine
# The app will use the new model automatically
```

---

**You're all set! 🚀 The AI is ready to analyze markets for you.**
