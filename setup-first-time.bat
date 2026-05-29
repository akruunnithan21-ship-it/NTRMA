@echo off
title WealthMaster - First Time Setup
color 0B

echo.
echo  ========================================
echo    WEALTHMASTER - FIRST TIME SETUP
echo    Run this ONCE on a new computer
echo  ========================================
echo.

:: Check prerequisites
echo Checking prerequisites...
echo.

git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo  ERROR: Git not installed! Download from https://git-scm.com
    pause
    exit /b 1
)
echo  [OK] Git installed

node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo  ERROR: Node.js not installed! Download from https://nodejs.org
    pause
    exit /b 1
)
echo  [OK] Node.js installed

python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo  ERROR: Python not installed! Download from https://python.org
    echo  IMPORTANT: Check "Add python.exe to PATH" during install!
    pause
    exit /b 1
)
echo  [OK] Python installed

docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo  ERROR: Docker not installed! Download from https://docker.com
    pause
    exit /b 1
)
echo  [OK] Docker installed

echo.
echo ========================================
echo  Step 1: Installing Backend packages...
echo ========================================
cd /d "%~dp0backend"
call npm install
call npm install pino-pretty
echo.

echo ========================================
echo  Step 2: Setting up Python AI Engine...
echo ========================================
cd /d "%~dp0ai-engine"
python -m venv .venv
call .venv\Scripts\activate
pip install fastapi uvicorn pydantic yfinance ta scikit-learn textblob ollama gnews httpx python-dotenv pyyaml schedule redis pytz numpy pandas python-multipart
echo.

echo ========================================
echo  Step 3: Installing Mobile App packages...
echo ========================================
cd /d "%~dp0mobile"
call npm install
echo.

echo ========================================
echo  Step 4: Downloading AI Model (4GB)...
echo  This may take 5-10 minutes...
echo ========================================
ollama pull mistral:7b
echo.

echo.
echo  ========================================
echo    SETUP COMPLETE!
echo  ========================================
echo.
echo  IMPORTANT: Before first run, edit this file:
echo  backend\src\server.ts
echo.
echo  Find the "logger" section and change it to:
echo    logger: true,
echo.
echo  Then double-click START.BAT to run everything!
echo  ========================================
echo.
pause
