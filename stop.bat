@echo off
title WealthMaster - Stopping All Services
color 0C

echo.
echo  ========================================
echo    WEALTHMASTER - Shutting Down...
echo  ========================================
echo.

:: Kill Backend
echo [1/3] Stopping Backend...
taskkill /FI "WINDOWTITLE eq WealthMaster-Backend*" /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001 ^| findstr LISTENING') do (
    taskkill /PID %%a /F >nul 2>&1
)
echo    Backend stopped

:: Kill AI Engine
echo [2/3] Stopping AI Engine...
taskkill /FI "WINDOWTITLE eq WealthMaster-AI-Engine*" /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000 ^| findstr LISTENING') do (
    taskkill /PID %%a /F >nul 2>&1
)
echo    AI Engine stopped

:: Stop Docker containers
echo [3/3] Stopping Database...
cd /d "%~dp0"
docker compose down >nul 2>&1
echo    PostgreSQL + Redis stopped

echo.
echo  ========================================
echo    ALL SERVICES STOPPED
echo  ========================================
echo.
pause
