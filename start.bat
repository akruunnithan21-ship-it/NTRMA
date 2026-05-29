@echo off
title WealthMaster - Starting All Services
color 0A

echo.
echo  ========================================
echo    WEALTHMASTER - Starting Up...
echo  ========================================
echo.

:: Check Docker is running
echo [1/5] Checking Docker...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo    ERROR: Docker Desktop is not running!
    echo    Please open Docker Desktop and wait for it to start.
    echo    Then run this script again.
    pause
    exit /b 1
)
echo    Docker is running
echo.

:: Start Database + Cache
echo [2/5] Starting Database + Cache...
cd /d "%~dp0"
docker compose up -d postgres redis
echo    PostgreSQL + Redis started
echo.

:: Start Backend (Node.js) in new window
echo [3/5] Starting Backend Server...
start "WealthMaster-Backend" cmd /k "cd /d %~dp0backend && npm run dev"
timeout /t 3 >nul
echo    Backend starting on port 3001
echo.

:: Start AI Engine (Python) in new window
echo [4/5] Starting AI Engine...
start "WealthMaster-AI-Engine" cmd /k "cd /d %~dp0ai-engine && .venv\Scripts\activate && uvicorn app.main:app --reload --port 8000"
timeout /t 3 >nul
echo    AI Engine starting on port 8000
echo.

:: Check Ollama
echo [5/5] Checking Ollama...
ollama list >nul 2>&1
if %errorlevel% neq 0 (
    echo    Ollama not running. Starting it...
    start "" ollama serve
    timeout /t 2 >nul
)
echo    Ollama is ready
echo.

echo  ========================================
echo    ALL SERVICES STARTED!
echo  ========================================
echo  Backend:    http://localhost:3001
echo  AI Engine:  http://localhost:8000
echo  AI Docs:    http://localhost:8000/docs
echo  Ollama:     http://localhost:11434
echo  ========================================
echo.
echo  To start Mobile App, open new terminal:
echo  cd mobile
echo  npx expo start
echo  ========================================
echo.
pause
