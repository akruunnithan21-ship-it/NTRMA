# WealthMaster — Session Handoff / Context Summary

> Paste this into a new Kiro session to restore full context. Last updated end of the UI-overhaul + native-build + QoL session.

---

## 1. Project

Personal AI-powered finance + investment adviser **Android app** (single user).
- Money tracker (expenses, income, budgets, debt/asset, net worth)
- AI BUY/SELL/HOLD signals for NSE/BSE + US stocks (candlestick + technical + fundamental + sentiment)
- Exact INDmoney charges calculator (STT, GST, stamp duty, DP)
- News sentiment, education system
- Goal: grow small capital (₹2,000–3,000/month) with AI signals.

**Repo:** `akruunnithan21-ship-it/wealthmaster`
**Default branch:** `phase3/market-data` (this is the REAL code; `main` is an unrelated old project, `feat/v1wealthfinder` is empty)
**Active work branch / PR:** `feat/ui-overhaul-native-build` → **PR #6** (open, targets `phase3/market-data`)

## 2. Tech stack (PINNED — do not change major versions)

| Layer | Tech | Version |
|---|---|---|
| Mobile | React Native + Expo | **SDK 52**, React **18.3.1**, RN **0.76.6** |
| Navigation | expo-router | ~4.0.0 |
| Backend | Node.js + Fastify + TS | **Node 22 LTS** |
| AI engine | Python + FastAPI | Python 3.14 |
| AI model | Ollama | **qwen2.5:7b** |
| DB | Supabase PostgreSQL (Mumbai) + Prisma | shared by both PCs |
| Cache | Redis (local Docker) | stock prices |
| Market data | yfinance (free) | — |
| Tech analysis | **ta** library (NOT pandas-ta) | — |
| Sentiment | GNews + TextBlob | — |
| UI theme | Dark neon: bg #0A0A0F, cyan #00F0FF, green #39FF14, pink #FF006E | + "refined" backup palette |

**Hardware:** Office PC (Ryzen 9 3900x, RTX 3060 12GB, 32GB). Home PC (similar, 16GB AMD GPU). Only ONE PC runs the backend at a time. Cloudflare tunnel for remote phone access. Auto-start on boot.

## 3. Project structure
```
wealthmaster/
├── mobile/     # Expo app (Android). src/ has components/ui, screens in app/
├── backend/    # Fastify API :3001
├── ai-engine/  # FastAPI + Ollama :8000
├── start.bat / stop.bat / setup-first-time.bat / setup-tunnel.bat / auto-start-on-boot.bat
├── docker-compose.yml (Redis only)
├── BUILD-AND-OTA.md          # Android Studio + EAS Update guide
└── SESSION-HANDOFF.md        # this file
```

## 4. CRITICAL RULES (bugs already fixed — never reintroduce)
1. Node **22 LTS** (NOT 24 — breaks ajv/Expo).
2. Mobile installs: **always** `npm install --legacy-peer-deps` (an `mobile/.npmrc` now forces this automatically).
3. `expo-linking` installed separately (`npx expo install expo-linking`) — now also in package.json.
4. Python: use `ta` (NOT pandas-ta), and always include `python-multipart`.
5. Backend `server.ts`: `logger: true` (NOT pino-pretty transport).
6. Expo SDK **52** (NOT 56). React **18.3.1** (NOT 19).
7. Database is Supabase cloud; Prisma needs `DIRECT_URL` for migrations. Docker only for Redis.
8. AI model is **qwen2.5:7b** (NOT mistral).

---

## 5. WHAT WAS BUILT THIS SESSION (PR #6)

Three commits on `feat/ui-overhaul-native-build`:
- **f9c972b** — futuristic UI overhaul + live backend wiring + native APK/OTA setup
- **c60f5dd** — QoL: persistence, offline banner, error boundary, delete actions
- **31df5fc** — fix `setup-first-time.bat` (legacy-peer-deps + qwen2.5:7b)

### UI/UX
- **Fonts now actually load** (Inter + JetBrains Mono via `@expo-google-fonts`; previously fell back to system font).
- **Theme v2:** `src/theme/palettes.ts` has `neon` (default) + `refined` (backup); swap via `ACTIVE_PALETTE` in `colors.ts`. Added `motion.ts` + `glow()` helper.
- **New UI kit** (`src/components/ui/`): real BlurView `GlassCard`, `GradientText` (MaskedView), typed **Lucide** `Icon` registry, `Screen`/`ScreenHeader`, `StatusPill`, shimmer `Skeleton`, `AuroraBackground`, Reanimated `AnimatedNumber`, `FloatingTabBar` (blurred pill + animated indicator), `OfflineBanner`.
- Replaced all Unicode `◈ ◉ ◆ ⬡ ◎` icons and most emoji with Lucide icons.

### Data / backend
- React Query layer (`src/hooks/queries.ts`) + `src/services/queryClient.ts`.
- **Runtime-configurable backend URL** via Settings, persisted with `expo-secure-store` (`src/store/useConnectionStore.ts`).
- **Backend `/ai` routes now proxy to the Python engine** (today signal, active signals, ask, status, analyze, market-mood) with in-memory caching. Model label fixed to qwen2.5:7b.
- **All mock/seed data removed**; screens show skeletons + offline states.

### New screens (data collection)
`settings`, `add-asset`, `add-debt`, `add-watchlist`, `lesson`, and a real `signal-detail` (factor breakdown, patterns, AI explanation, charges).

### QoL
- **Persistence** via AsyncStorage on finance/networth/portfolio/learn/AI stores (data survives restarts). `partialize` stores only data fields.
- **OfflineBanner** on tabs → taps to Settings.
- **ErrorBoundary** wraps the app (friendly retry screen).
- **Long-press to delete:** watchlist items, transactions, assets, debts.

### Native APK + OTA
- Branded icon + splash generated (`mobile/scripts/gen_assets.py` → `mobile/assets/`); `app.json` references them + `runtimeVersion`; `eas.json` channels added.
- Added deps: `expo-updates`, `expo-dev-client`, `expo-linking`, `lucide-react-native`, `@react-native-masked-view/masked-view`, `@react-native-async-storage/async-storage`. All Expo deps aligned to SDK 52.

**Verification:** `tsc --noEmit` passes for mobile AND backend. App was NOT run on a device from the dev environment — must be built/tested locally.

---

## 6. ALL ERRORS ENCOUNTERED + FIXES

| # | Error / symptom | Cause | Fix |
|---|---|---|---|
| 1 | Repo looked "wiped clean" | Default branch was empty; `main` held an unrelated PWA | Real code lives on `phase3/market-data` (commit 55a9bbd); restored from there |
| 2 | Working dir deleted mid-session | A failed clone removed the folder | Re-cloned the repo |
| 3 | App looked generic / wrong font | Theme referenced Inter/JetBrains but nothing loaded them | Added `@expo-google-fonts/*` + `useFonts` in `app/_layout.tsx` |
| 4 | `npm error code ERESOLVE` | `@react-navigation/bottom-tabs@6` vs v7 deps from expo-router/drawer | Use `npm install --legacy-peer-deps`; added `mobile/.npmrc` (`legacy-peer-deps=true`) |
| 5 | Expo pkgs on SDK 51 versions | package.json pinned old versions (expo-blur ~13, etc.) | `npx expo install --fix` aligned all to SDK 52 |
| 6 | `expo-linear-gradient` TS error | v14 wants a color **tuple**, not `string[]` | Pass gradient tuples directly (no `string[]` cast) |
| 7 | React Query `data` typed `never`/`any` | v5 overload inference quirk | Added explicit generics + coerced data to typed locals |
| 8 | Backend AI was fake | `/ai` routes were stubs (hardcoded TATA MOTORS, label "mistral") | Wired routes to Python engine; cached; label → qwen2.5:7b |
| 9 | `setup-first-time.bat` mobile install failed (ERESOLVE) | Script ran `npm install` without the flag | Script now uses `--legacy-peer-deps` + installs `expo-linking` |
| 10 | Wrong AI model downloaded | Script pulled `mistral:7b` | Script now pulls `qwen2.5:7b` |
| 11 | Script told user to edit server.ts logger / installed pino-pretty | Stale instructions | Removed; server.ts already `logger: true` |
| 12 | `ajv-keywords` crash during `npx expo install` | Post-install validation noise | Non-fatal — packages still install; ignore |
| 13 | Data reset on app restart | Zustand was in-memory only | Added AsyncStorage `persist` to stores |
| 14 | AMD GPU home PC slower AI | Ollama prefers NVIDIA on Windows | Not an error; first signal just takes longer |

---

## 7. HOW TO RUN / BUILD

### Run the backend (the "brain") on a PC
1. `ollama pull qwen2.5:7b`
2. `backend/.env` must have Supabase `DATABASE_URL` (pooler `?pgbouncer=true`) + `DIRECT_URL` (port 5432), `REDIS_URL`, `PORT=3001`, `AI_ENGINE_URL=http://localhost:8000`, `OLLAMA_MODEL=qwen2.5:7b`. (Copy the file from the other PC — both share Supabase.)
3. `start.bat` → backend :3001, AI engine :8000, Redis, tunnel.

### Get the APK on the phone
- **Easiest (EAS cloud):** `cd mobile` → `npm install -g eas-cli` → `eas login` → `eas init` → `eas build -p android --profile preview` → open the link on phone → install.
- **Local (Android Studio):** install Node 22, JDK 17, Android Studio + SDK 35; set ANDROID_HOME/JAVA_HOME; `cd mobile` → `npm install` → `npx expo prebuild -p android` → `npx expo run:android` (USB, live reload) OR `cd android && gradlew assembleRelease` for a standalone APK. Full steps in `BUILD-AND-OTA.md`.
- After install: app → Money → ⚙ Settings → enter PC IPv4 + port 3001 → Test → Save.

### OTA updates
`cd mobile` → `eas update:configure` (once) → after JS changes: `eas update --branch preview`. Native changes need a new APK.

### Daily use
Turn on the active PC → `start.bat` → open app. PC off = app still works as an offline tracker (no live prices/AI). Switching PCs: `stop.bat` on one, `start.bat` on the other (shared Supabase keeps data in sync).

---

## 8. KNOWN STATE / OPEN ITEMS
- **PR #6 is open, not merged.** A fresh `git clone` of `phase3/market-data` does NOT yet include this session's work — checkout `feat/ui-overhaul-native-build` or merge PR #6.
- Mobile data persists **on the device only** (not yet synced to Supabase) — see roadmap P0.

## 9. FUTURE ROADMAP (priority order)
**P0 (most important)**
1. Wire `/finance` + `/portfolio` backend routes to Prisma/Supabase so data syncs across phone + both PCs (currently device-local).
2. Real auth: hash PIN, JWT, store token in secure-store, attach to API calls.

**P1**
3. Charts on Stock Detail (use `/market/historical`; `react-native-svg` already present).
4. Push notifications for new high-confidence signals (`expo-notifications` installed).
5. Persist signal history + real paper-trade win-rate over time.
6. Theme toggle in Settings (neon ↔ refined — refined palette already built).

**P2**
7. Swipe-to-delete/edit; global toast system.
8. First-run onboarding (PIN → backend address → strategy).
9. Convert long lists to FlatList; app-lock timeout; live search; accessibility; error/empty polish.
