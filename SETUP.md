# 🛠️ WealthMaster - Local Development Setup

Complete guide to run WealthMaster on your machine.

## Prerequisites

Install these before starting:

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 22+ | [nvm](https://github.com/nvm-sh/nvm) or [nodejs.org](https://nodejs.org) |
| Python | 3.11+ | [python.org](https://python.org) |
| Docker Desktop | Latest | [docker.com](https://docker.com/products/docker-desktop) |
| Git | Latest | [git-scm.com](https://git-scm.com) |
| Expo CLI | Latest | `npm install -g expo-cli` |
| Expo Go (Android) | Latest | [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent) |
| Ollama | Latest | [ollama.com](https://ollama.com) |

---

## 🚀 Quick Start (5 minutes)

### Step 1: Clone the repo
```bash
git clone https://github.com/akruunnithan21-ship-it/wealthmaster.git
cd wealthmaster
```

### Step 2: Start the database & cache
```bash
docker compose up -d postgres redis
```

### Step 3: Set up the backend
```bash
cd backend
cp ../.env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```
Backend will be running at `http://localhost:3001`

### Step 4: Set up the AI engine
```bash
cd ai-engine
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
AI Engine will be running at `http://localhost:8000`

### Step 5: Set up Ollama (see OLLAMA_GUIDE.md)
```bash
ollama serve  # Start Ollama
ollama pull mistral:7b  # Download the model (~4.1GB)
```

### Step 6: Run the mobile app
```bash
cd mobile
npm install
npx expo start
```
Scan the QR code with Expo Go on your Android phone.

---

## 🐳 Full Docker Setup (Alternative)

Run everything with one command:
```bash
docker compose up -d
```

This starts:
- PostgreSQL on port 5432
- Redis on port 6379
- Backend API on port 3001
- AI Engine on port 8000

---

## 📱 Mobile App Development

### Running on physical device
1. Install **Expo Go** from Play Store
2. Make sure phone and PC are on the same WiFi
3. Run `npx expo start` in the `mobile/` directory
4. Scan the QR code with Expo Go

### Running on Android emulator
1. Install Android Studio
2. Create a virtual device (Pixel 6, API 34)
3. Start the emulator
4. Run `npx expo start` then press `a` to open in emulator

### Building APK
```bash
cd mobile
npx eas build --platform android --profile preview
```

---

## 🔧 Common Commands

| Command | Location | What it does |
|---------|----------|-------------|
| `npm run dev` | backend/ | Start backend dev server |
| `npx expo start` | mobile/ | Start Expo dev server |
| `uvicorn app.main:app --reload` | ai-engine/ | Start AI engine |
| `docker compose up -d` | root | Start all services |
| `docker compose down` | root | Stop all services |
| `npx prisma studio` | backend/ | Open DB viewer |
| `npx prisma migrate dev` | backend/ | Run DB migrations |
| `ollama serve` | anywhere | Start Ollama |
| `ollama pull mistral:7b` | anywhere | Download AI model |

---

## 🔍 Verifying Everything Works

1. **Backend health:** `curl http://localhost:3001/health`
2. **AI Engine health:** `curl http://localhost:8000/health`
3. **Database:** `npx prisma studio` (opens in browser)
4. **Ollama:** `ollama list` (should show mistral:7b)
5. **Mobile:** Scan QR → App opens with dark neon UI

---

## ⚠️ Troubleshooting

| Issue | Fix |
|-------|-----|
| Port already in use | `lsof -i :3001` then `kill -9 <PID>` |
| Docker won't start | Restart Docker Desktop |
| Prisma error | `npx prisma generate` then retry |
| Expo can't connect | Check both devices on same WiFi |
| Ollama model not found | `ollama pull mistral:7b` |
| Python venv issues | Delete `.venv/` and recreate |

---

## 📂 Project Structure Quick Reference

```
wealthmaster/
├── mobile/        → React Native app (Expo)
├── backend/       → Node.js API (Fastify)
├── ai-engine/     → Python AI service (FastAPI)
├── shared/        → Shared types
├── docker-compose.yml
└── .env.example
```
