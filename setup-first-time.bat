@echo off
title WealthMaster - First Time Setup
color 0B
echo.
echo  ╔═══════════════════════════════════════════════════╗
echo  ║     WealthMaster — First-Time PC Setup            ║
echo  ║     Run this ONCE on a new PC                     ║
echo  ╚═══════════════════════════════════════════════════╝
echo.

:: ============================================================
:: Check prerequisites
:: ============================================================
echo [Checking] Node.js...
node --version 2>nul
if %ERRORLEVEL% neq 0 (
    echo   ❌ Node.js NOT installed!
    echo   Download Node 22 LTS from: https://nodejs.org
    echo   IMPORTANT: Install version 22, NOT version 24!
    pause
    exit /b 1
)

echo [Checking] Python...
python --version 2>nul
if %ERRORLEVEL% neq 0 (
    echo   ❌ Python NOT installed!
    echo   Download from: https://python.org
    pause
    exit /b 1
)

echo [Checking] Docker...
docker --version 2>nul
if %ERRORLEVEL% neq 0 (
    echo   ⚠ Docker not found. Redis cache won't work without it.
    echo   Download Docker Desktop from: https://docker.com
    echo   Continuing without Docker...
)

echo [Checking] Ollama...
ollama --version 2>nul
if %ERRORLEVEL% neq 0 (
    echo   ❌ Ollama NOT installed!
    echo   Download from: https://ollama.com/download/windows
    pause
    exit /b 1
)

echo.
echo ✓ All prerequisites found!
echo.

:: ============================================================
:: Pull AI Model
:: ============================================================
echo [1/5] Pulling AI model (qwen2.5:7b — ~5GB download)...
echo       This takes 5-15 minutes on first run...
ollama pull qwen2.5:7b
echo       ✓ Model ready!
echo.

:: ============================================================
:: Setup Backend
:: ============================================================
echo [2/5] Installing Backend dependencies...
pushd %~dp0backend
call npm install
echo       ✓ Backend packages installed
echo.

:: Check if .env exists
if not exist .env (
    echo   ⚠ No .env file found in backend/
    echo   Creating from template...
    copy ..\env.example .env 2>nul || (
        echo DATABASE_URL=postgresql://postgres:password@localhost:5432/wealthmaster > .env
        echo DIRECT_URL=postgresql://postgres:password@localhost:5432/wealthmaster >> .env
        echo PORT=3001 >> .env
        echo HOST=0.0.0.0 >> .env
        echo REDIS_URL=redis://localhost:6379 >> .env
        echo AI_ENGINE_URL=http://localhost:8000 >> .env
        echo OLLAMA_MODEL=qwen2.5:7b >> .env
        echo JWT_SECRET=change-me-to-something-random >> .env
    )
    echo   ⚠ IMPORTANT: Edit backend\.env with your Supabase credentials!
    echo   Get them from: https://supabase.com → Project → Settings → Database
)

echo [3/5] Generating Prisma client...
call npx prisma generate 2>nul
echo       ✓ Prisma client ready
popd
echo.

:: ============================================================
:: Setup AI Engine
:: ============================================================
echo [4/5] Setting up AI Engine (Python)...
pushd %~dp0ai-engine

if not exist venv (
    echo       Creating Python virtual environment...
    python -m venv venv
)

echo       Installing Python packages (this takes a few minutes)...
call venv\Scripts\activate.bat
pip install -r requirements.txt --quiet
python -m textblob.download_corpora lite 2>nul
deactivate
echo       ✓ AI Engine ready
popd
echo.

:: ============================================================
:: Setup Mobile
:: ============================================================
echo [5/5] Setting up Mobile app (for APK builds)...
pushd %~dp0mobile
call npm install --legacy-peer-deps
echo       ✓ Mobile packages installed

:: Install EAS CLI
call npm install -g eas-cli 2>nul
echo       ✓ EAS CLI installed (for building APKs)
popd
echo.

:: ============================================================
:: Setup Redis Container
:: ============================================================
echo [Bonus] Setting up Redis cache...
docker ps 2>nul
if %ERRORLEVEL% equ 0 (
    docker run -d --name wealthmaster-redis -p 6379:6379 --restart unless-stopped redis:alpine 2>nul
    echo       ✓ Redis container created
) else (
    echo       ⚠ Docker not running. Start Docker Desktop and run:
    echo         docker run -d --name wealthmaster-redis -p 6379:6379 --restart unless-stopped redis:alpine
)
echo.

:: ============================================================
:: Done!
:: ============================================================
echo.
echo  ╔═══════════════════════════════════════════════════╗
echo  ║  ✅ Setup Complete!                                ║
echo  ║                                                    ║
echo  ║  NEXT STEPS:                                       ║
echo  ║  1. Edit backend\.env with Supabase credentials    ║
echo  ║  2. Run start.bat to launch all services           ║
echo  ║  3. Build APK: cd mobile ^& eas build -p android   ║
echo  ║     --profile preview                              ║
echo  ║  4. Install APK on phone                           ║
echo  ║  5. Open app → Settings → Enter PC IP + 3001      ║
echo  ║                                                    ║
echo  ║  See BUILD-APK-GUIDE.md for full instructions!     ║
echo  ╚═══════════════════════════════════════════════════╝
echo.
pause
