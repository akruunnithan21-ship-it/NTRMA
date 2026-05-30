@echo off
title WealthMaster - Starting All Services
color 0A

echo.
echo  ╔══════════════════════════════════════╗
echo  ║   WEALTHMASTER - Starting Up...     ║
echo  ╚══════════════════════════════════════╝
echo.

cd /d "%~dp0"

:: ============================================
:: [1/5] CHECK DOCKER (for Redis cache only)
:: ============================================
echo [1/5] Checking Docker...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo    WARNING: Docker not running. Redis cache won't work.
    echo    App still works but stock prices won't be cached.
    echo    (Open Docker Desktop if you want faster market data)
    echo.
) else (
    echo    [OK] Docker is running
    docker compose up -d redis 2>nul
    echo    [OK] Redis cache started
    echo.
)

:: ============================================
:: [2/5] CHECK .env FILE EXISTS
:: ============================================
echo [2/5] Checking configuration...
if not exist "backend\.env" (
    echo    WARNING: backend\.env not found!
    echo    Copy .env.example to backend\.env and add your Supabase URL.
    echo    See FRESH-PC-SETUP.md for instructions.
    echo.
) else (
    echo    [OK] Config file found
    echo.
)

:: ============================================
:: [3/5] KILL ZOMBIE PROCESSES
:: ============================================
echo [3/5] Clearing old processes...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001 ^| findstr LISTENING 2^>nul') do (
    taskkill /PID %%a /F >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000 ^| findstr LISTENING 2^>nul') do (
    taskkill /PID %%a /F >nul 2>&1
)
echo    [OK] Ports 3001 and 8000 cleared
echo.

:: ============================================
:: [4/5] START BACKEND (Node.js)
:: ============================================
echo [4/5] Starting Backend Server...
start "WealthMaster-Backend" /min cmd /k "cd /d "%~dp0backend" && npm run dev"
timeout /t 4 /nobreak >nul
echo    [OK] Backend starting on http://localhost:3001
echo.

:: ============================================
:: [5/5] START AI ENGINE (Python)
:: ============================================
echo [5/5] Starting AI Engine...
start "WealthMaster-AI" /min cmd /k "cd /d "%~dp0ai-engine" && .venv\Scripts\activate && uvicorn app.main:app --host 0.0.0.0 --port 8000"
timeout /t 4 /nobreak >nul
echo    [OK] AI Engine starting on http://localhost:8000
echo.

:: ============================================
:: CHECK OLLAMA
:: ============================================
echo Checking Ollama...
ollama list >nul 2>&1
if %errorlevel% neq 0 (
    echo    Starting Ollama...
    start "" /min ollama serve
    timeout /t 3 /nobreak >nul
)
echo    [OK] Ollama ready (Qwen 3)
echo.

:: ============================================
:: DONE
:: ============================================
echo.
echo  ╔══════════════════════════════════════════════════╗
echo  ║         ALL SERVICES STARTED!                   ║
echo  ╠══════════════════════════════════════════════════╣
echo  ║  Backend:    http://localhost:3001               ║
echo  ║  AI Engine:  http://localhost:8000               ║
echo  ║  AI Docs:    http://localhost:8000/docs          ║
echo  ║  Database:   Supabase Cloud (always available)  ║
echo  ╠══════════════════════════════════════════════════╣
echo  ║  To start Mobile App:                           ║
echo  ║  1. Open new terminal                           ║
echo  ║  2. cd Desktop\wealthmaster\mobile              ║
echo  ║  3. npx expo start                              ║
echo  ║  4. Scan QR with Expo Go                        ║
echo  ╚══════════════════════════════════════════════════╝
echo.
echo  (This window can be minimized. Don't close it.)
echo.
pause
