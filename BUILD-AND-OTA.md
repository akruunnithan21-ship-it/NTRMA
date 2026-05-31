# WealthMaster — Native APK Build + OTA Updates Guide

This guide replaces the Expo Go workflow with a **real installed Android app** and
adds **over‑the‑air (OTA) updates** so you can push JS/UI changes without rebuilding.

> Stack reminder: Expo SDK 52 · React 18.3.1 · RN 0.76.6 · Node 22 LTS.
> Always run `npm install` from the `mobile/` folder (an `.npmrc` there forces
> `legacy-peer-deps=true`, so you no longer need to type the flag).

---

## 0. Concepts in 30 seconds

| Term | Meaning |
|------|---------|
| **Dev build** (`expo-dev-client`) | Your own version of "Expo Go" with your icon. Supports live reload while coding. |
| **Preview APK** | A standalone `.apk` you install once. Opens like any real app. |
| **OTA update** (`expo-updates`) | Push JS + asset changes over the internet. The app downloads them on next launch. **Native changes still need a new APK.** |

---

## 1. One‑time machine setup (Windows 11)

### 1.1 Install the toolchain
1. **Node.js 22 LTS** — verify: `node -v` → `v22.x`.
2. **Java JDK 17** (Temurin/Adoptium). Set `JAVA_HOME` to the JDK folder.
3. **Android Studio** (latest). During setup, install:
   - Android SDK Platform **35** (and 34)
   - Android SDK Build‑Tools
   - Android SDK Command‑line Tools
   - Android Emulator + a Virtual Device (optional; you can use your phone)
   - NDK + CMake (Android Studio will prompt when first building)

### 1.2 Environment variables (System → Environment Variables)
```
ANDROID_HOME = C:\Users\<you>\AppData\Local\Android\Sdk
JAVA_HOME    = C:\Program Files\Eclipse Adoptium\jdk-17...
```
Add to `Path`:
```
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\emulator
```
Verify in a **new** terminal: `adb --version` and `java -version`.

### 1.3 Phone setup (for installing on a real device)
- Enable **Developer Options** → **USB debugging** on the phone.
- Plug in via USB, accept the "Allow USB debugging?" prompt.
- Verify: `adb devices` → your phone is listed.

---

## 2. Generate the native Android project (prebuild)

From the `mobile/` folder:
```bash
npm install
npx expo prebuild -p android
```
This creates the `mobile/android/` folder (Gradle project) using `app.json`
(icon, splash, package name `com.wealthmaster.app`, etc.).

> Re‑run `npx expo prebuild -p android --clean` whenever you add a **native**
> module or change icon/splash/plugins.

---

## 3. Build & run locally

### Option A — Android Studio (GUI)
1. Open Android Studio → **Open** → select `mobile/android`.
2. Let Gradle sync finish (first time downloads dependencies — a few minutes).
3. Select your device/emulator in the toolbar.
4. **Run ▶** (or **Build → Build Bundle(s)/APK(s) → Build APK(s)**).
5. The debug APK lands in:
   `mobile/android/app/build/outputs/apk/debug/app-debug.apk`

### Option B — Command line (faster once set up)
```bash
# Dev build with live reload (keeps a Metro server running):
npx expo run:android

# Or a release APK you can share/install:
cd android
gradlew assembleRelease
# -> android/app/build/outputs/apk/release/app-release.apk
```
Install a built APK on a connected phone:
```bash
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

> First release build needs a signing key. For a personal app, the debug key is
> fine. To make a proper release key:
> ```bash
> keytool -genkeypair -v -storetype PKCS12 -keystore wealthmaster.keystore -alias wm -keyalg RSA -keysize 2048 -validity 10000
> ```
> then reference it in `android/app/build.gradle` (`signingConfigs`). Keep the
> keystore safe — you need the SAME key to ship updates.

---

## 4. Point the app at your backend (no rebuild needed)

1. Start the stack on the active PC (`start.bat`).
2. Open the app → **Money tab → ⚙ Settings** (top‑right).
3. **Local WiFi:** enter your PC's IPv4 (run `ipconfig`, look under your WiFi
   adapter) and port `3001`. **OR Tunnel:** paste the Cloudflare URL.
4. Tap **Test** → status pill turns green ("Online" + shows the PC hostname).
5. Tap **Save**. The address is stored securely on the phone and used everywhere.

---

## 5. OTA updates with EAS Update (optional but recommended)

OTA lets you push UI/logic changes to the installed APK over the internet.

### 5.1 One‑time
```bash
npm install -g eas-cli
eas login                  # free Expo account
cd mobile
eas init                   # creates the project, writes extra.eas.projectId
eas update:configure       # adds updates.url to app.json automatically
```
`runtimeVersion` is already set to `{ "policy": "appVersion" }` and the build
profiles in `eas.json` already declare channels (`development`/`preview`/`production`).

### 5.2 Build once (so the app knows where to fetch updates)
Either rebuild locally (Section 3, after `eas update:configure`) or via cloud:
```bash
eas build -p android --profile preview   # cloud build, returns an installable APK link
```

### 5.3 Push an update (every time after that)
```bash
# after making JS/UI changes:
eas update --branch preview --message "Polish dashboard cards"
```
Open the app → it silently downloads the update and applies it on the next
launch. You can also force a check in **Settings → Check for updates**.

> Reminder: OTA only ships JS + assets. If you add a **native module** (new
> Expo package with native code), you must build and install a fresh APK.

---

## 6. Critical rules (do not regress)

- Node **22 LTS** (not 24 — breaks ajv/Expo).
- Install from `mobile/` (the `.npmrc` forces `legacy-peer-deps`).
- `expo-linking`, `expo-updates`, `expo-dev-client` are already in `package.json`.
- `app.json` now **does** reference real icon/splash files in `mobile/assets/`
  (they exist — generated by `scripts/gen_assets.py`). Don't delete them.
- Backend `server.ts` keeps `logger: true` (no pino‑pretty on Node 24).
- AI model is **qwen2.5:7b** via Ollama.

---

## 7. Troubleshooting

| Symptom | Fix |
|--------|-----|
| `adb devices` empty | Re‑plug, accept USB‑debug prompt, install OEM USB driver. |
| Gradle "SDK location not found" | Set `ANDROID_HOME`; create `android/local.properties` with `sdk.dir=...`. |
| Build fails after adding a package | `npx expo prebuild -p android --clean` then rebuild. |
| App shows "Backend offline" | Same WiFi? Correct IP/port in Settings? `start.bat` running? Firewall allows 3001? |
| Fonts/icons look wrong | Ensure `npm install` pulled `@expo-google-fonts/*` and `lucide-react-native`. |
| Signals never load | First scan can take ~30s (yfinance + Ollama). Ensure Ollama + Python engine are up. |
