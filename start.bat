@echo off
title WealthMaster - Service Launcher
color 0A
echo.
echo  ╔═══════════════════════════════════════════════════╗
echo  ║         WealthMaster — Starting Services          ║
echo  ╚═══════════════════════════════════════════════════╝
echo.

:: ============================================================
:: 1. OLLAMA (AI Model Server)
:: ============================================================
echo [1/4] Checking Ollama...
tasklist /FI "IMAGENAME eq ollama.exe" 2>nul | find /I "ollama.exe" >nul
if %ERRORLEVEL% neq 0 (
    echo       Starting Ollama...
    start /min "" ollama serve
    timeout /t 3 /nobreak >nul
    echo       ✓ Ollama started
) else (
    echo       ✓ Ollama already running
)

:: Verify model is available
ollama list 2>nul | find "qwen2.5:7b" >nul
if %ERRORLEVEL% neq 0 (
    echo       ⚠ Model qwen2.5:7b not found! Pulling now...
    ollama pull qwen2.5:7b
)

:: ============================================================
:: 2. REDIS (Price Cache via Docker)
:: ============================================================
echo [2/4] Checking Redis...
docker ps --filter "name=wealthmaster-redis" --format "{{.Names}}" 2>nul | find "wealthmaster-redis" >nul
if %ERRORLEVEL% neq 0 (
    echo       Starting Redis container...
    docker start wealthmaster-redis 2>nul || docker run -d --name wealthmaster-redis -p 6379:6379 --restart unless-stopped redis:alpine
    echo       ✓ Redis started on port 6379
) else (
    echo       ✓ Redis already running
)

:: ============================================================
:: 3. PYTHON AI ENGINE (port 8000)
:: ============================================================
echo [3/4] Starting AI Engine...
start "WealthMaster AI Engine" cmd /k "title AI Engine (port 8000) && cd /d %~dp0ai-engine && if exist venv\Scripts\activate.bat (call venv\Scripts\activate.bat) && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
timeout /t 5 /nobreak >nul
echo       ✓ AI Engine starting on port 8000

:: ============================================================
:: 4. NODE.JS BACKEND (port 3001)
:: ============================================================
echo [4/4] Starting Node Backend...
start "WealthMaster Backend" cmd /k "title Backend (port 3001) && cd /d %~dp0backend && npm run dev"
timeout /t 3 /nobreak >nul
echo       ✓ Backend starting on port 3001

:: ============================================================
:: DONE
:: ============================================================
echo.
echo  ╔═══════════════════════════════════════════════════╗
echo  ║  ✅ All services launched!                         ║
echo  ║                                                    ║
echo  ║  Backend:    http://localhost:3001/health           ║
echo  ║  AI Engine:  http://localhost:8000/health           ║
echo  ║  AI Docs:    http://localhost:8000/docs             ║
echo  ║  Ollama:     http://localhost:11434                 ║
echo  ║  Redis:      localhost:6379                         ║
echo  ║                                                    ║
echo  ║  📱 Phone Setup:                                   ║
echo  ║  Settings → Enter your PC IP + port 3001           ║
echo  ╚═══════════════════════════════════════════════════╝
echo.

:: Show local IP
echo  Your PC IP address(es):
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| find "IPv4"') do echo    %%a
echo.
echo  Press any key to close this window (services keep running)
pause >nul
