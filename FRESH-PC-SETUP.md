# 🖥️ WealthMaster — Fresh PC Setup Guide

> Complete guide to set up WealthMaster on a brand new Windows 11 computer.
> Written for absolute beginners. Follow every step exactly.

---

## 📋 WHAT YOU'RE SETTING UP

| Thing | What it does (simple) | Analogy |
|-------|----------------------|---------|
| **Docker** | Runs the database that stores your money data | A filing cabinet |
| **Node.js Backend** | Answers your app's questions | A waiter at a restaurant |
| **Python AI Engine** | Analyzes stocks, finds patterns | The chef cooking your food |
| **Ollama** | The actual AI brain that thinks | The chef's brain |
| **Mobile App** | What you see on your phone | The menu + dining table |

**All of this runs on YOUR PC. Your data never leaves your computer.**

---

## ⬇️ STEP 1: Install 5 Programs (One-Time)

Do these in order. Restart PC after Docker.

### 1A. Install Git
- Go to: https://git-scm.com/download/win
- Download → Run → Click "Next" on everything → Done

### 1B. Install Node.js
- Go to: https://nodejs.org
- Click the big green **LTS** button
- Download → Run → Click "Next" on everything → Done

### 1C. Install Python
- Go to: https://python.org/downloads
- Click "Download Python"
- Run the installer
- **⚠️ ON THE FIRST SCREEN: CHECK THE BOX "Add python.exe to PATH"**
- Click "Install Now" → Done

### 1D. Install Docker Desktop
- Go to: https://docker.com/products/docker-desktop
- Download → Run installer
- **⚠️ RESTART YOUR PC after this**
- After restart, open Docker Desktop from Start Menu
- Wait until bottom-left says "Engine running" (30-60 seconds)

### 1E. Install Ollama
- Go to: https://ollama.com/download
- Download Windows version → Run installer
- It auto-starts (llama icon appears in taskbar near clock)

### 1F. Install Expo Go on Phone
- Open Google Play Store on your Android phone
- Search "Expo Go" → Install

---

## ⬇️ STEP 2: Download the Code

Open **Command Prompt** (press Windows key, type `cmd`, press Enter):

```
cd Desktop
git clone https://github.com/akruunnithan21-ship-it/wealthmaster.git
cd wealthmaster
git fetch --all
git checkout phase3/market-data
```

You now have a folder called `wealthmaster` on your Desktop.

---

## ⬇️ STEP 3: Download the AI Brain (4GB, one-time)

In the same Command Prompt:
```
ollama pull qwen3:8b
```

Wait 5-10 minutes for download. When done, test it:
```
ollama run qwen3:8b "What is a mutual fund in one sentence?"
```

If it answers → AI brain works! Type `/bye` to exit.

---

## ⚙️ STEP 4: First-Time Setup

### 4A. Install Backend packages

Open a **NEW** Command Prompt:
```
cd Desktop\wealthmaster\backend
npm install
```

Wait 1-2 minutes. Ignore warnings about "vulnerabilities" — that's normal.

### 4B. Install AI Engine packages

Open a **NEW** Command Prompt:
```
cd Desktop\wealthmaster\ai-engine
python -m venv .venv
.venv\Scripts\activate
pip install fastapi uvicorn pydantic yfinance ta scikit-learn textblob ollama gnews httpx python-dotenv pyyaml schedule redis pytz numpy pandas python-multipart
```

Wait 3-5 minutes for download.

### 4C. Install Mobile App packages

Open a **NEW** Command Prompt:
```
cd Desktop\wealthmaster\mobile
npm install
```

Wait 2-3 minutes.

---

## 🚀 STEP 5: Start Everything (Daily Use)

**Make sure Docker Desktop is open and showing "Engine running".**

Then just double-click: **`start.bat`** (in the wealthmaster folder on Desktop)

It will:
1. Start the database
2. Clear any zombie processes
3. Start the backend server
4. Start the AI engine
5. Check Ollama is running

**All done in 10 seconds. One click.**

---

## 📱 STEP 6: See the App on Your Phone

### 6A. Find your PC's IP address

Open Command Prompt, type:
```
ipconfig
```

Look for this section:
```
Wireless LAN adapter Wi-Fi:
   IPv4 Address. . . . . . . : 192.168.1.105
```

That number (like `192.168.1.105`) is your PC's IP. Write it down.

### 6B. Update the app config

Open this file in Notepad:
```
Desktop\wealthmaster\mobile\src\services\api.ts
```

Find this line near the top:
```
LOCAL_IP: '192.168.1.100',
```

Change `192.168.1.100` to YOUR IP from step 6A. Save the file.

### 6C. Start the app

Open a **NEW** Command Prompt:
```
cd Desktop\wealthmaster\mobile
npx expo start
```

A QR code appears in the terminal.

### 6D. Connect your phone

1. Make sure phone and PC are on **same WiFi**
2. Open **Expo Go** app on your phone
3. Tap "Scan QR Code"
4. Point camera at the QR code in your terminal
5. **APP OPENS ON YOUR PHONE!** 🎉

---

## 🌐 STEP 7: Access From Anywhere (Optional)

Want to use the app when you're NOT on home WiFi? (At office, outside, etc.)

### 7A. Set up Cloudflare Tunnel

Double-click: **`setup-tunnel.bat`** (in wealthmaster folder)

It will:
1. Download Cloudflare tunnel tool
2. Open browser to log in (create free Cloudflare account if needed)
3. Create a secure tunnel to your PC
4. Give you a URL like: `https://wealthmaster-api.cfargotunnel.com`

### 7B. Update app config for tunnel

Open `mobile\src\services\api.ts` in Notepad.

Find:
```
TUNNEL_URL: '',
```

Change to your tunnel URL:
```
TUNNEL_URL: 'https://wealthmaster-api.cfargotunnel.com',
```

Now your app works from ANYWHERE in the world!

---

## 🔄 STEP 8: Auto-Start on Boot (Optional)

Want WealthMaster to start automatically when PC turns on?

Right-click **`auto-start-on-boot.bat`** → "Run as administrator"

After this:
- PC turns on → You log in → WealthMaster auto-starts in 30 seconds
- PC never sleeps (stays on for AI)
- App works on phone immediately

---

## 📊 HOW TO CHECK EVERYTHING WORKS

Open your browser and visit:

| URL | What you should see |
|-----|-------------------|
| http://localhost:3001/health | `{"status":"ok"}` |
| http://localhost:8000 | `{"service":"WealthMaster AI Engine"}` |
| http://localhost:8000/docs | Interactive API docs page |

---

## ⚠️ ERRORS AND FIXES

### "Docker: no configuration file provided"
**Cause:** You're not in the wealthmaster folder OR wrong branch.
**Fix:**
```
cd Desktop\wealthmaster
git checkout phase3/market-data
```

### "Docker: failed to connect to docker API"
**Cause:** Docker Desktop is not open.
**Fix:** Open Docker Desktop from Start Menu. Wait 30 seconds. Try again.

### "EADDRINUSE: address already in use 0.0.0.0:3001"
**Cause:** A previous run is still holding the port.
**Fix:** Close ALL Command Prompt windows. Reopen and try again. Or use `stop.bat`.

### "Cannot install on Python 3.14; only <3.14 supported"
**Cause:** Some libraries don't support newest Python yet.
**Fix:** Already fixed! We use `ta` instead of `pandas-ta`. Just run the pip install command from Step 4B exactly as written.

### "Form data requires python-multipart"
**Cause:** Missing package.
**Fix:** Already included in the pip install command in Step 4B.

### "unable to determine transport target for pino-pretty"
**Cause:** Old logging config incompatible with Node.js v24.
**Fix:** Already fixed! server.ts now uses `logger: true`.

### "Phone can't connect to app"
**Cause:** Wrong IP or different WiFi network.
**Fix:**
1. Make sure phone + PC are on same WiFi
2. Check your IP with `ipconfig`
3. Update `api.ts` with correct IP
4. Restart the expo server

### "Ollama: model not found"
**Cause:** Haven't downloaded the model yet.
**Fix:** `ollama pull mistral:7b`

---

## 🗂️ FILE REFERENCE

| File | What it does |
|------|-------------|
| `start.bat` | Double-click to start everything |
| `stop.bat` | Double-click to stop everything |
| `setup-first-time.bat` | Installs all packages (run once) |
| `setup-tunnel.bat` | Sets up Cloudflare tunnel (run once) |
| `auto-start-on-boot.bat` | Makes PC auto-start WealthMaster (run once as admin) |

---

## 💡 DAILY USAGE (After Setup is Done)

**Every day:**
1. Turn on PC (if auto-start is set up, skip to step 3)
2. Double-click `start.bat`
3. Open app on phone
4. Done!

**When finished:**
1. Double-click `stop.bat` (or just leave it running)

---

## 🔧 UPDATING THE APP (When I Push New Code)

When I build new features, get them by:
```
cd Desktop\wealthmaster
git pull
cd backend && npm install
cd ..\ai-engine && .venv\Scripts\activate && pip install -r requirements.txt
cd ..\mobile && npm install
```

Then restart with `stop.bat` → `start.bat`.

---

## 💻 MINIMUM PC REQUIREMENTS

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| RAM | 8GB | 16GB+ |
| CPU | 4 cores | 8+ cores |
| GPU | None (CPU works) | NVIDIA with 6GB+ VRAM |
| Disk | 15GB free | 25GB free |
| OS | Windows 10/11 | Windows 11 |
| Internet | Required for market data | Broadband |

---

**That's everything! From zero to working app in about 30 minutes.** 🚀
