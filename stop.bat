@echo off
title WealthMaster - Stopping All Services
color 0C

echo.
echo  ╔══════════════════════════════════════╗
echo  ║   WEALTHMASTER - Shutting Down...   ║
echo  ╚══════════════════════════════════════╝
echo.

:: Kill Backend window
echo [1/4] Stopping Backend...
taskkill /FI "WINDOWTITLE eq WealthMaster-Backend*" /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001 ^| findstr LISTENING 2^>nul') do (
    taskkill /PID %%a /F >nul 2>&1
)
echo    [OK] Backend stopped

:: Kill AI Engine window
echo [2/4] Stopping AI Engine...
taskkill /FI "WINDOWTITLE eq WealthMaster-AI*" /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000 ^| findstr LISTENING 2^>nul') do (
    taskkill /PID %%a /F >nul 2>&1
)
echo    [OK] AI Engine stopped

:: Stop Docker containers
echo [3/4] Stopping Database...
cd /d "%~dp0"
docker compose down >nul 2>&1
echo    [OK] PostgreSQL + Redis stopped

:: Note about Ollama
echo [4/4] Ollama...
echo    (Ollama stays running in background - this is fine)

echo.
echo  ╔══════════════════════════════════════╗
echo  ║      ALL SERVICES STOPPED           ║
echo  ╚══════════════════════════════════════╝
echo.
pause
