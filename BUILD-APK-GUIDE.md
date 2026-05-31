# WealthMaster — Build APK & Home PC Setup Guide

> **Written for**: Someone with basic knowledge who wants a simple "download and use" APK.
> **Your Home PC**: Ryzen 7 7500F, 32GB RAM, Radeon RX 7600 XT (16GB VRAM)

---

## Table of Contents

1. [How the App Works (Big Picture)](#how-the-app-works)
2. [Building the APK (3 Methods)](#building-the-apk)
3. [Home PC Full Setup (Windows 11)](#home-pc-setup)
4. [Running the Backend + AI](#running-backend)
5. [Connecting Phone to PC](#connecting-phone-to-pc)
6. [Common Errors & Fixes](#common-errors)
7. [What Each Piece Does](#what-each-piece-does)

---

## How the App Works (Big Picture) <a name="how-the-app-works"></a>

```
┌─────────────────────────────────────────────────────────┐
│                    YOUR PHONE (APK)                       │
│  React Native app with 5 tabs:                           │
│  Home | Money | Markets | AI | Learn                     │
│                                                          │
│  Connects to your PC via WiFi or Cloudflare Tunnel       │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTP requests (port 3001)
                      ▼
┌─────────────────────────────────────────────────────────┐
│              YOUR PC — Node.js Backend (:3001)            │
│  Fastify server that:                                    │
│  • Handles API requests from phone                       │
│  • Talks to Supabase (cloud database)                    │
│  • Talks to Python AI Engine                             │
│  • Calculates transaction charges                        │
└──────────┬──────────────────────────────┬───────────────┘
           │                              │
           ▼                              ▼
┌────────────────────┐    ┌──────────────────────────────┐
│  Supabase Cloud DB  │    │  Python AI Engine (:8000)     │
│  (Mumbai region)    │    │  • Gets stock prices (yfinance)│
│  Stores your data   │    │  • Technical analysis (RSI,   │
│  across all PCs     │    │    MACD, candlestick patterns)│
│                     │    │  • News sentiment (GNews)     │
│                     │    │  • AI chat (Ollama/qwen2.5)   │
│                     │    │  • BUY/SELL/HOLD signals      │
└────────────────────┘    └──────────────┬───────────────┘
                                          │
                                          ▼
                          ┌──────────────────────────────┐
                          │  Ollama (qwen2.5:7b model)    │
                          │  Local AI brain running on    │
                          │  your RX 7600 XT GPU!         │
                          │  (16GB VRAM = plenty)         │
                          └──────────────────────────────┘
```

### In Plain English:
- **Phone** = your wallet app (shows money, stocks, AI signals)
- **Node Backend** = the receptionist (routes messages between phone, database, AI)
- **Python AI Engine** = the analyst (crunches numbers, reads news, generates signals)
- **Ollama** = the AI brain (answers questions in natural language, runs on YOUR GPU)
- **Supabase** = the filing cabinet in the cloud (stores data safely, syncs between PCs)
- **Redis** = a sticky note pad (caches stock prices for 5 min so we don't spam Yahoo Finance)

---

## Building the APK (3 Methods) <a name="building-the-apk"></a>

### Method 1: EAS Cloud Build (EASIEST — Recommended)

**What it is**: Expo's servers build the APK for you in the cloud. You download it.
**Time**: ~10-15 minutes. **Cost**: Free (30 builds/month).

```powershell
# Open PowerShell in the mobile folder
cd C:\Users\YourName\wealthmaster\mobile

# Install EAS CLI (one-time)
npm install -g eas-cli

# Login to Expo (create free account at expo.dev if you don't have one)
eas login

# Initialize your project with EAS (one-time, links to your Expo account)
eas init

# BUILD THE APK 🎉
eas build -p android --profile preview
```

**What happens**:
1. Your code gets uploaded to Expo's build servers
2. They compile it into a native Android APK
3. You get a download link (also shows in expo.dev dashboard)
4. Download the `.apk` file → transfer to phone → install

**⚠️ First-time on phone**: Go to Settings → Security → Allow "Install from unknown sources"

---

### Method 2: Local Build (For Nerds / Offline)

**What it is**: Build the APK right on your PC. Needs Android SDK.
**Time**: ~5-8 minutes (first time longer). **No internet needed after setup**.

#### One-Time Setup:
```powershell
# 1. Install Android Studio (just for the SDK tools)
#    Download from: https://developer.android.com/studio
#    During install, check "Android SDK" and "Android SDK Platform-Tools"

# 2. Set environment variables (add to System Properties → Environment Variables)
#    ANDROID_HOME = C:\Users\YourName\AppData\Local\Android\Sdk
#    Add to PATH: %ANDROID_HOME%\platform-tools
#    Add to PATH: %ANDROID_HOME%\tools

# 3. Install Java 17 (required for Android builds)
#    Download: https://adoptium.net/temurin/releases/ (Windows x64 .msi)
#    Set JAVA_HOME = C:\Program Files\Eclipse Adoptium\jdk-17...
```

#### Building:
```powershell
cd C:\Users\YourName\wealthmaster\mobile

# Generate native Android project (one-time or after expo config changes)
npx expo prebuild -p android --clean

# Build the APK
npx expo run:android --variant release --no-install
```

The APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

---

### Method 3: EAS Local Build (Best of Both)

**What it is**: Uses EAS build system but runs locally on your machine.
**Needs**: Android SDK + Java 17 (same as Method 2 setup)

```powershell
cd C:\Users\YourName\wealthmaster\mobile
eas build -p android --profile preview --local
```

This creates the APK in your current folder. No upload to Expo servers.

---

## Home PC Full Setup (Windows 11) <a name="home-pc-setup"></a>

### Step 1: Install Core Tools

```powershell
# Open PowerShell as Administrator

# Install Chocolatey (Windows package manager - makes installing stuff easy)
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Close and reopen PowerShell as Admin, then:

# Node.js 22 LTS (NOT 24 — breaks Expo)
choco install nodejs-lts -y --version=22.16.0

# Python (3.12 recommended, 3.14 also works but some libs lag behind)
choco install python312 -y

# Git
choco install git -y

# Docker Desktop (only needed for Redis cache)
choco install docker-desktop -y
```

**Verify installations** (close & reopen PowerShell):
```powershell
node --version    # Should show v22.x.x
python --version  # Should show 3.12.x
git --version     # Should show 2.x.x
docker --version  # Should show Docker version 2x.x.x
```

### Step 2: Install Ollama (Your AI Brain)

```powershell
# Download from: https://ollama.com/download/windows
# Or via chocolatey:
choco install ollama -y

# After install, download the AI model (5.4 GB — one-time download)
ollama pull qwen2.5:7b
```

**Why qwen2.5:7b?**
- 7 billion parameters = smart enough for stock analysis
- Fits easily in your 16GB VRAM (only uses ~5GB)
- Fast inference on your RX 7600 XT (~40 tokens/sec)
- Open source, free forever, runs offline

**Test it works**:
```powershell
ollama run qwen2.5:7b "What is RSI in stock trading? One paragraph."
# Should give you a smart answer in ~5 seconds
```

### Step 3: Clone the Repository

```powershell
cd C:\Users\YourName
git clone https://github.com/akruunnithan21-ship-it/wealthmaster.git
cd wealthmaster
git checkout phase3/market-data
```

### Step 4: Setup Backend

```powershell
cd C:\Users\YourName\wealthmaster\backend

# Install Node packages
npm install

# Create .env file (copy the example and fill in your values)
copy ..\.env.example .env
```

**Edit `.env` file** (use Notepad or VS Code):
```env
# Get these from https://supabase.com → Your Project → Settings → Database
DATABASE_URL=postgresql://postgres.xxxxx:YourPassword@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.xxxxx:YourPassword@aws-0-ap-south-1.pooler.supabase.com:5432/postgres

# Local settings
PORT=3001
HOST=0.0.0.0
REDIS_URL=redis://localhost:6379
AI_ENGINE_URL=http://localhost:8000
OLLAMA_MODEL=qwen2.5:7b

# Secret for JWT tokens (generate a random string)
JWT_SECRET=your-super-secret-key-change-this-to-something-random
```

**Generate Prisma client** (talks to database):
```powershell
npx prisma generate
npx prisma migrate deploy  # Creates tables in Supabase
```

### Step 5: Setup AI Engine

```powershell
cd C:\Users\YourName\wealthmaster\ai-engine

# Create Python virtual environment (isolates packages)
python -m venv venv

# Activate it
.\venv\Scripts\Activate.ps1

# Install Python packages
pip install -r requirements.txt

# Download TextBlob language data (for sentiment analysis)
python -m textblob.download_corpora
```

### Step 6: Setup Mobile App (for building APK)

```powershell
cd C:\Users\YourName\wealthmaster\mobile

# Install packages (MUST use --legacy-peer-deps)
npm install --legacy-peer-deps

# Install EAS CLI globally
npm install -g eas-cli
```

### Step 7: Start Redis (Docker)

```powershell
# Make sure Docker Desktop is running, then:
docker run -d --name wealthmaster-redis -p 6379:6379 --restart unless-stopped redis:alpine
```

This runs Redis in the background. It auto-starts with Docker Desktop.

---

## Running the Backend + AI <a name="running-backend"></a>

### Quick Start (Every Day)

Create `start.bat` in your wealthmaster folder (or use the existing one):

```batch
@echo off
echo ========================================
echo   WealthMaster - Starting All Services
echo ========================================

:: Start Ollama (if not already running)
echo [1/4] Starting Ollama...
start /min ollama serve

:: Wait for Ollama
timeout /t 3 /nobreak >nul

:: Start Redis via Docker (if not running)
echo [2/4] Starting Redis...
docker start wealthmaster-redis 2>nul || docker run -d --name wealthmaster-redis -p 6379:6379 --restart unless-stopped redis:alpine

:: Start AI Engine (Python)
echo [3/4] Starting AI Engine on port 8000...
start "AI Engine" cmd /k "cd /d C:\Users\%USERNAME%\wealthmaster\ai-engine && .\venv\Scripts\activate && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

:: Wait for AI Engine to boot
timeout /t 5 /nobreak >nul

:: Start Node Backend
echo [4/4] Starting Backend on port 3001...
start "Backend" cmd /k "cd /d C:\Users\%USERNAME%\wealthmaster\backend && npm run dev"

echo.
echo ✅ All services starting!
echo    Backend: http://localhost:3001
echo    AI Engine: http://localhost:8000
echo    Ollama: http://localhost:11434
echo    Redis: localhost:6379
echo.
echo 📱 Open your phone app → Settings → Enter this PC's IP + port 3001
echo    Find your IP: ipconfig (look for IPv4 under Wi-Fi)
echo.
pause
```

### Verify Everything Works

Open browser → go to:
- `http://localhost:3001/health` — Should show `{"status":"ok",...}`
- `http://localhost:8000/health` — Should show `{"status":"ok","ollama":"connected",...}`
- `http://localhost:8000/docs` — Interactive API docs (play with endpoints!)

---

## Connecting Phone to PC <a name="connecting-phone-to-pc"></a>

### Option A: Same WiFi (Easiest)

1. Find your PC's IP:
   ```powershell
   ipconfig
   # Look for "IPv4 Address" under "Wireless LAN adapter Wi-Fi"
   # Something like 192.168.1.105
   ```

2. On phone app: Go to **Settings** (gear icon) → Enter `192.168.1.105` and port `3001` → **Test** → **Save**

3. **Windows Firewall**: Allow port 3001:
   ```powershell
   # Run as Admin:
   netsh advfirewall firewall add rule name="WealthMaster Backend" dir=in action=allow protocol=TCP localport=3001
   ```

### Option B: Cloudflare Tunnel (From Anywhere)

This lets you access your home PC from office, commute, anywhere with internet.

```powershell
# Install cloudflared
choco install cloudflared -y

# Login to Cloudflare (free account, any domain works)
cloudflared login

# Create a tunnel (one-time)
cloudflared tunnel create wealthmaster

# Run the tunnel (routes internet traffic to your PC)
cloudflared tunnel --url http://localhost:3001 --name wealthmaster
```

You'll get a URL like: `https://wealthmaster-xxxxx.cfargotunnel.com`
Enter this in phone app Settings as the tunnel URL.

---

## Common Errors & Fixes <a name="common-errors"></a>

### During `npm install` in mobile folder:

| Error | Fix |
|-------|-----|
| `ERESOLVE could not resolve` | You forgot `--legacy-peer-deps`. The `.npmrc` should auto-fix this. |
| `ajv-keywords` crash | Non-fatal noise. Packages still install fine. Ignore. |
| `deprecated @react-navigation/bottom-tabs@6` | Warning only. We need v6 for Expo SDK 52. Ignore. |
| `20 vulnerabilities` | All in dev/build tools, not in your app. Ignore. |

### During `eas build`:

| Error | Fix |
|-------|-----|
| `Missing projectId` | Run `eas init` first. It adds the ID to `app.json`. |
| `Not logged in` | Run `eas login` first. |
| `Build failed: Could not resolve ...` | Make sure you committed your `package.json` changes. EAS builds from git. |
| `Out of free builds` | Use Method 2 (local build) or wait for monthly reset. |

### During `npx expo prebuild` (local build):

| Error | Fix |
|-------|-----|
| `JAVA_HOME not set` | Install Java 17 and set the environment variable. |
| `Android SDK not found` | Install Android Studio, set `ANDROID_HOME`. |
| `license not accepted` | Run: `sdkmanager --licenses` and accept all. |

### During runtime (app on phone):

| Error | Fix |
|-------|-----|
| "Network Error" | Backend not running, or wrong IP in settings. Check firewall. |
| "AI Engine disconnected" | Python engine crashed or Ollama not running. Check terminal. |
| "Stale data" | Backend can't reach AI engine. Restart AI engine terminal. |
| Fonts look wrong (default Android font) | Font loading failed. Check `app/_layout.tsx` has the `useFonts` hook. |
| App crashes on launch | Run `npx expo start` in dev mode to see the error in terminal. |

### Backend/AI Engine:

| Error | Fix |
|-------|-----|
| `pino-pretty` error | We already fixed this. `logger: true` only, no transport. |
| `ECONNREFUSED :6379` | Docker not running or Redis container stopped. Run `docker start wealthmaster-redis`. |
| `Connection to Supabase failed` | Check `.env` DATABASE_URL. The pooler URL must have `?pgbouncer=true`. |
| Ollama "model not found" | Run `ollama pull qwen2.5:7b`. |
| Python `ModuleNotFoundError` | Activate venv: `.\venv\Scripts\activate` then `pip install -r requirements.txt`. |
| `pandas-ta` error | We use `ta` library, NOT `pandas-ta`. Check `requirements.txt`. |

---

## What Each Piece Does <a name="what-each-piece-does"></a>

### Files You Care About:

```
wealthmaster/
├── mobile/                    ← THE PHONE APP
│   ├── app/                   ← Screens (what you see)
│   │   ├── (tabs)/            ← 5 main tabs
│   │   │   ├── index.tsx      ← Home dashboard (net worth, AI signal, market pulse)
│   │   │   ├── money.tsx      ← Expense tracker, budgets, surplus calculator
│   │   │   ├── markets.tsx    ← Watchlist, live prices, signals, sectors
│   │   │   ├── ai.tsx         ← AI adviser, strategy mode, ask questions
│   │   │   └── learn.tsx      ← Education, lessons, glossary
│   │   ├── (modals)/          ← Popup screens
│   │   │   ├── add-expense.tsx  ← Add expense with auto-categorization
│   │   │   ├── add-income.tsx   ← Add income
│   │   │   ├── stock-detail.tsx ← Full stock info + charges calculator
│   │   │   └── signal-detail.tsx← AI signal breakdown
│   │   └── (auth)/            ← PIN / biometric lock
│   ├── src/
│   │   ├── theme/             ← Colors, fonts, spacing (dark neon theme)
│   │   ├── store/             ← App state (Zustand) - what the app remembers
│   │   ├── services/api.ts    ← Talks to your PC backend
│   │   ├── components/ui/     ← Reusable UI pieces (GlassCard, NeonButton, etc.)
│   │   ├── constants/
│   │   │   ├── categories.ts  ← All expense/income categories
│   │   │   └── charges.ts     ← INDmoney charges calculator (STT, GST, etc.)
│   │   └── hooks/             ← Market data fetching logic
│   ├── app.json               ← App config (name, icon, permissions)
│   ├── eas.json               ← Build settings (APK, app bundle)
│   └── package.json           ← Dependencies list
│
├── backend/                   ← THE SERVER (on your PC)
│   ├── src/
│   │   ├── server.ts          ← Starts Fastify on port 3001
│   │   ├── routes/            ← API endpoints
│   │   │   ├── market.routes.ts   ← Stock prices, indices, search
│   │   │   ├── ai.routes.ts      ← AI signals, chat, strategy
│   │   │   ├── finance.routes.ts  ← Transactions, budgets
│   │   │   ├── portfolio.routes.ts← Holdings, paper trading
│   │   │   └── auth.routes.ts    ← PIN verification
│   │   └── utils/
│   │       └── charges-calculator.ts ← Server-side charges math
│   ├── prisma/schema.prisma   ← Database table definitions
│   └── .env                   ← YOUR SECRETS (never commit this!)
│
├── ai-engine/                 ← THE AI BRAIN (Python)
│   ├── app/
│   │   ├── main.py            ← FastAPI server on port 8000
│   │   ├── services/
│   │   │   ├── signal_generator.py    ← BUY/SELL/HOLD logic
│   │   │   ├── technical_analysis.py  ← RSI, MACD, moving averages
│   │   │   ├── candlestick_analyzer.py← 25+ candlestick patterns
│   │   │   ├── fundamental_analysis.py← P/E, ROE, debt-to-equity
│   │   │   ├── sentiment_engine.py   ← News mood analysis
│   │   │   ├── market_data.py        ← Fetches from Yahoo Finance
│   │   │   ├── ollama_client.py      ← Talks to Ollama AI
│   │   │   └── cache.py             ← Redis price caching
│   │   └── routers/           ← API endpoints for the AI engine
│   └── requirements.txt       ← Python packages needed
│
├── docker-compose.yml         ← Starts Redis with one command
├── start.bat                  ← Starts everything (backend + AI + Redis)
└── .env.example               ← Template for secrets
```

### How AI Signals Work:

1. **Every morning at 9:00 AM** (or when you open the app):
2. Python fetches stock data via `yfinance` (free Yahoo Finance API)
3. **Technical Analysis**: Calculates RSI, MACD, Bollinger Bands, 25+ candlestick patterns
4. **Fundamental Analysis**: Checks P/E ratio, ROE, debt levels, profit margins
5. **Sentiment Analysis**: Fetches news from GNews → TextBlob scores positive/negative
6. **Macro Check**: Is the overall market bullish or bearish?
7. **Score Combination**: Weights each factor, generates confidence score
8. **Signal Rules**:
   - Confidence > 65% → **BUY**
   - Confidence < 35% → **SELL**
   - Between 35-65% → **HOLD**
9. **Charges Impact**: Calculates real INDmoney charges to show actual net return
10. **Ollama Explanation**: AI writes human-readable "why this call" reasoning

### How Charges Calculator Works:

When you look at a stock, the app shows you the REAL cost:
- **STT** (Securities Transaction Tax): Government tax on every trade
- **Exchange charges**: NSE/BSE fees
- **GST**: 18% on brokerage + exchange charges
- **Stamp Duty**: State tax on buy side
- **DP Charges**: ₹15.93 per company on sell (CDSL fee)
- **Break-even price**: The minimum price your stock must reach before you actually profit

Example: Buy TATA MOTORS at ₹952 × 1 share
- You pay: ₹952 + ₹0.16 charges = ₹952.16
- Break-even sell price: ₹953.98 (need +0.21% just to not lose money!)

---

## GPU Setup for Ollama (RX 7600 XT) <a name="gpu-setup"></a>

Your RX 7600 XT with 16GB VRAM is PERFECT for local AI. Here's what you need:

### Install ROCm Support (AMD GPU acceleration):

1. **Install latest AMD Adrenalin drivers** from: https://www.amd.com/en/support
2. **Ollama automatically detects AMD GPUs** on Windows via ROCm/HIP
3. Verify GPU is being used:
   ```powershell
   ollama run qwen2.5:7b "Hello" --verbose
   # Look for "gpu" in the output
   ```

### Performance You Can Expect:
- **qwen2.5:7b**: ~35-45 tokens/second (fast enough for real-time chat)
- **VRAM usage**: ~5GB out of your 16GB (plenty of headroom)
- **First response**: ~2-3 seconds
- **Could also run**: qwen2.5:14b (needs ~10GB VRAM, slower but smarter)

### Optional: Try a Bigger Model
```powershell
# If you want even smarter analysis (uses ~10GB VRAM):
ollama pull qwen2.5:14b

# Update your .env:
# OLLAMA_MODEL=qwen2.5:14b
```

---

## Auto-Start on Boot (Task Scheduler)

So everything starts when you turn on your PC:

1. Open **Task Scheduler** (search in Start menu)
2. Click **Create Basic Task**
3. Name: `WealthMaster`
4. Trigger: **When the computer starts**
5. Action: **Start a program**
6. Program: `C:\Users\YourName\wealthmaster\start.bat`
7. ✅ Check "Open properties when finished"
8. In Properties → check **"Run whether user is logged on or not"**
9. Check **"Run with highest privileges"**

Now your backend, AI engine, and Redis start automatically when you boot up!

---

## Quick Reference Card

| What | Command | Where |
|------|---------|-------|
| Start everything | `start.bat` | wealthmaster/ |
| Build APK (cloud) | `eas build -p android --profile preview` | mobile/ |
| Build APK (local) | `npx expo prebuild -p android && npx expo run:android` | mobile/ |
| Check backend | http://localhost:3001/health | Browser |
| Check AI engine | http://localhost:8000/health | Browser |
| Test Ollama | `ollama run qwen2.5:7b "test"` | Any terminal |
| Find your IP | `ipconfig` (look for IPv4 under Wi-Fi) | PowerShell |
| Start Redis | `docker start wealthmaster-redis` | PowerShell |
| Update code | `git pull origin phase3/market-data` | wealthmaster/ |
| TypeScript check | `npx tsc --noEmit` | mobile/ or backend/ |
| Install mobile deps | `npm install --legacy-peer-deps` | mobile/ |
