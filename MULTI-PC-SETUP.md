# 🖥️🖥️ Multi-PC Setup: Office + Home (One Active at a Time)

> Run WealthMaster on TWO computers but only ONE active at any time.
> Switch between office and home seamlessly.

---

## 🤔 Why Only One at a Time?

Your app connects to ONE backend server. If both PCs run the backend simultaneously:
- Database conflicts (both trying to write)
- Ollama confusion (duplicate AI responses)
- Phone doesn't know which one to connect to

**Solution: ONE runs, the other sleeps.**

---

## 🏗️ Setup (Do This ONCE on Each PC)

### On BOTH PCs (Home + Office):

1. Install everything (Git, Node, Python, Docker, Ollama)
2. Clone the repo: `git clone https://github.com/akruunnithan21-ship-it/wealthmaster.git`
3. `cd wealthmaster && git checkout phase3/market-data`
4. Run `setup-first-time.bat`
5. Download AI model: `ollama pull qwen3:8b`

Both PCs are now ready. But only START one at a time.

---

## 🔄 Daily Workflow: Switching Between PCs

### Morning (Office):
```
1. On Office PC: Double-click START.BAT
2. On Phone: App connects to Office PC (via WiFi or tunnel)
3. Use app all day
```

### Evening (leaving office):
```
1. On Office PC: Double-click STOP.BAT
2. Go home
```

### At Home:
```
1. On Home PC: Double-click START.BAT
2. On Phone: App automatically connects to Home PC
3. Use app all evening
```

---

## 🌐 Setup for Automatic Switching (Recommended)

### Option A: Same WiFi at Both Locations (Simplest)

If both office and home use different WiFi networks:

**On your phone's api.ts config:**
```typescript
// The app will try whichever PC is currently running
const API_CONFIG = {
  LOCAL_IP: '192.168.1.105',  // This will be different at each location
  TUNNEL_URL: '',
  MODE: 'local',
};
```

**Problem:** Your IP changes between office and home WiFi.

**Fix:** Use Cloudflare Tunnel (Option B below).

---

### Option B: Cloudflare Tunnel (Works EVERYWHERE — Recommended)

Set up Cloudflare Tunnel on BOTH PCs but use the SAME tunnel name:

**On BOTH PCs:**
1. Run `setup-tunnel.bat`
2. When it asks for tunnel name, use: `wealthmaster` (same on both)
3. Use the SAME Cloudflare account on both PCs

**In your phone's api.ts:**
```typescript
const API_CONFIG = {
  LOCAL_IP: '192.168.1.105',
  TUNNEL_URL: 'https://wealthmaster-api.cfargotunnel.com',
  MODE: 'tunnel',  // Always uses tunnel
};
```

**How it works:**
- Only the PC that's currently running `start.bat` will be serving the tunnel
- Phone always connects to the same URL
- When you switch PCs (stop one, start other), the tunnel automatically switches
- Takes ~30 seconds for the switch to propagate

---

## ⚠️ IMPORTANT RULES

| Rule | Why |
|------|-----|
| Never run start.bat on BOTH PCs at same time | Database conflicts |
| Always run stop.bat before switching | Releases the port and tunnel |
| Wait 30 seconds after stopping before starting other PC | Tunnel DNS needs time to update |
| Both PCs must have same code version | Run `git pull` on both periodically |

---

## 🔄 Keeping Both PCs in Sync

When I push new code updates, run this on BOTH PCs:

```
cd Desktop\wealthmaster
git pull origin phase3/market-data
cd backend && npm install
cd ..\ai-engine && .venv\Scripts\activate && pip install -r requirements.txt
cd ..\mobile && npm install
```

---

## 📱 Phone Configuration

Your phone app config (api.ts) should use the TUNNEL URL so it works at both locations:

```typescript
const API_CONFIG = {
  LOCAL_IP: '192.168.1.100',           // Fallback (home WiFi)
  TUNNEL_URL: 'https://your-tunnel-url.cfargotunnel.com',
  MODE: 'auto',                         // Try tunnel first, fallback to local
};
```

With `MODE: 'auto'`:
- If tunnel works → uses tunnel (works from anywhere)
- If tunnel fails → tries local IP (works on same WiFi)

---

## 🏠 Home PC: Auto-Start on Boot

If your home PC is the "always on" one:
- Right-click `auto-start-on-boot.bat` → Run as Administrator
- PC auto-starts WealthMaster when turned on
- Never sleeps
- App works 24/7

**Office PC:** Just manually run `start.bat` when you arrive, `stop.bat` when you leave.

---

## 🔍 How to Check Which PC is Active

Open your phone browser and go to:
```
https://your-tunnel-url.cfargotunnel.com/health
```

It will show:
```json
{
  "status": "ok",
  "hostname": "OFFICE-PC"  // or "HOME-PC"
}
```

This tells you which PC is currently serving.

---

## 💡 Best Practice Setup

| PC | Role | Auto-start? | Tunnel? |
|----|------|------------|---------|
| **Home PC (Ryzen 9)** | Primary (24/7 if possible) | ✅ Yes | ✅ Yes |
| **Office PC** | Secondary (work hours only) | ❌ No (manual) | ✅ Yes (same tunnel) |

**Ideal flow:**
- Home PC runs 24/7 (AI analyzes overnight, sends morning notifications)
- At office: Home PC handles everything via tunnel
- Only switch to office PC if home internet is down

---

## 🆘 Troubleshooting

| Issue | Fix |
|-------|-----|
| "Connection refused" on phone | Neither PC is running. Start one. |
| App shows old data | Wait 30 sec after switching PCs for tunnel to update |
| "Port already in use" | stop.bat on both PCs, wait 10 sec, start on one |
| Different data on each PC | Both PCs use same cloud DB (PostgreSQL in Docker). Data is identical. |

---

**That's it! Two PCs, one app, seamless switching.** 🚀
