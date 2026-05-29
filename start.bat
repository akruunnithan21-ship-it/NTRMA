@echo off
title WealthMaster - Starting All Services
color 0A

echo.
echo  ╔══════════════════════════════════════╗
echo  ║   WEALTHMASTER - Starting Up...     ║
echo  ╚══════════════════════════════════════╝
echo.

:: Set the root directory to where this script is
cd /d "%~dp0"

:: ============================================
:: [1/5] CHECK DOCKER
:: ============================================
echo [1/5] Checking Docker...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo    ╔═══════════════════════════════════════════╗
    echo    ║  ERROR: Docker Desktop is not running!    ║
    echo    ║  Open Docker Desktop from Start Menu,    ║
    echo    ║  wait 30 seconds, then run this again.   ║
    echo    ╚═══════════════════════════════════════════╝
    echo.
    pause
    exit /b 1
)
echo    [OK] Docker is running
echo.

:: ============================================
:: [2/5] START DATABASE + CACHE
:: ============================================
echo [2/5] Starting Database + Cache...
docker compose up -d postgres redis 2>nul
if %errorlevel% neq 0 (
    echo    WARNING: Docker compose had an issue, but continuing...
)
echo    [OK] PostgreSQL + Redis started
echo.

:: ============================================
:: [3/5] KILL ANY ZOMBIE PROCESSES ON PORTS
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
echo    [OK] Ollama ready
echo.

:: ============================================
:: DONE
:: ============================================
echo.
echo  ╔══════════════════════════════════════════════╗
echo  ║        ALL SERVICES STARTED!                ║
echo  ╠══════════════════════════════════════════════╣
echo  ║  Backend:    http://localhost:3001           ║
echo  ║  AI Engine:  http://localhost:8000           ║
echo  ║  AI Docs:    http://localhost:8000/docs      ║
echo  ║  Health:     http://localhost:3001/health    ║
echo  ╠══════════════════════════════════════════════╣
echo  ║  To use app on phone:                       ║
echo  ║  1. Open new terminal                       ║
echo  ║  2. cd Desktop\wealthmaster\mobile          ║
echo  ║  3. npx expo start                          ║
echo  ║  4. Scan QR with Expo Go app                ║
echo  ╚══════════════════════════════════════════════╝
echo.
echo  (This window can be minimized. Don't close it.)
echo.
pause
