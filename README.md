# 💰 WealthMaster

> Personal AI-powered wealth-building app for Android. Track money, get AI trading signals, and grow your investments.

![Status](https://img.shields.io/badge/Phase-1%20Foundation-blue)
![Platform](https://img.shields.io/badge/Platform-Android-green)
![AI](https://img.shields.io/badge/AI-Ollama%20Local-purple)

---

## 🎯 What is this?

WealthMaster is a personal finance + AI investment adviser app that:

- **Tracks your money** — Income, expenses, budgets, savings goals
- **Monitors markets** — Real-time Indian (NSE/BSE) + US stock data
- **Generates AI signals** — BUY/SELL/HOLD calls with confidence scores
- **Calculates real costs** — Exact INDmoney charges (STT, GST, DP, stamp duty)
- **Teaches you** — Built-in financial education for beginners
- **Runs locally** — AI powered by Ollama on your PC (free, private)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile App | React Native + Expo SDK 56 |
| Backend API | Node.js + Fastify + TypeScript |
| AI Engine | Python + FastAPI + Ollama |
| Database | PostgreSQL + Redis |
| ML/Analysis | pandas-ta + scikit-learn |
| Market Data | Yahoo Finance + NSE APIs |

---

## 📱 Quick Start

```bash
# 1. Start infrastructure
docker compose up -d postgres redis

# 2. Start backend
cd backend && npm install && npm run dev

# 3. Start AI engine
cd ai-engine && pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# 4. Start mobile app
cd mobile && npm install && npx expo start
```

See [SETUP.md](./SETUP.md) for detailed instructions.
See [OLLAMA_GUIDE.md](./OLLAMA_GUIDE.md) for AI setup.

---

## 📂 Structure

```
wealthmaster/
├── mobile/          # React Native (Expo) Android app
├── backend/         # Node.js Fastify API server
├── ai-engine/       # Python FastAPI AI/ML service
├── shared/          # Shared types & constants
└── docker-compose.yml
```

---

## 🚀 Roadmap

- [x] Phase 1: Foundation (navigation, theme, UI components, project structure)
- [ ] Phase 2: Finance tracker (income/expense/budget)
- [ ] Phase 3: Market data integration
- [ ] Phase 4: AI engine + signal generation
- [ ] Phase 5: Portfolio + paper trading
- [ ] Phase 6: News intelligence
- [ ] Phase 7: Education system
- [ ] Phase 8: Polish + animations
- [ ] Phase 9: Production APK

---

## 📄 License

Private project. Not for distribution.
