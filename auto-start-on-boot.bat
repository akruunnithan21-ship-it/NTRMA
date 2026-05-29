@echo off
title WealthMaster - Auto-Start on Boot Setup
color 0B

echo.
echo  ========================================================
echo    WEALTHMASTER - Auto-Start on Boot Setup
echo.
echo    This will make WealthMaster start automatically
echo    every time your PC turns on. Your PC becomes a
echo    24/7 AI server!
echo.
echo    RIGHT-CLICK THIS FILE and "Run as administrator"
echo  ========================================================
echo.

:: Check admin rights
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo    ERROR: Please right-click this file and select
    echo           "Run as administrator"
    echo.
    pause
    exit /b 1
)

set "TASK_NAME=WealthMaster-AutoStart"
set "START_SCRIPT=%~dp0start-silent.bat"

:: ============================================
:: Create the silent start script
:: ============================================
echo [1/3] Creating silent startup script...

(
echo @echo off
echo :: WealthMaster Silent Start - runs on boot
echo :: Wait for Windows to fully load
echo timeout /t 45 /nobreak ^>nul
echo.
echo :: Start Docker containers
echo cd /d "%~dp0"
echo docker compose up -d postgres redis 2^>nul
echo timeout /t 15 /nobreak ^>nul
echo.
echo :: Kill zombies on our ports
echo for /f "tokens=5" %%%%a in ^('netstat -ano ^^^| findstr :3001 ^^^| findstr LISTENING 2^^^>nul'^) do taskkill /PID %%%%a /F ^>nul 2^>^&1
echo for /f "tokens=5" %%%%a in ^('netstat -ano ^^^| findstr :8000 ^^^| findstr LISTENING 2^^^>nul'^) do taskkill /PID %%%%a /F ^>nul 2^>^&1
echo.
echo :: Start Backend
echo start "WealthMaster-Backend" /min cmd /c "cd /d "%~dp0backend" ^&^& npm run dev"
echo timeout /t 5 /nobreak ^>nul
echo.
echo :: Start AI Engine
echo start "WealthMaster-AI" /min cmd /c "cd /d "%~dp0ai-engine" ^&^& .venv\Scripts\activate ^&^& uvicorn app.main:app --host 0.0.0.0 --port 8000"
echo timeout /t 5 /nobreak ^>nul
echo.
echo :: Start Cloudflare Tunnel if available
echo if exist "%~dp0cloudflared.exe" ^(
echo     start "WealthMaster-Tunnel" /min cmd /c ""%~dp0cloudflared.exe" tunnel run wealthmaster"
echo ^)
) > "%START_SCRIPT%"

echo    [OK] Created start-silent.bat
echo.

:: ============================================
:: Register with Task Scheduler
:: ============================================
echo [2/3] Registering with Windows Task Scheduler...

schtasks /delete /tn "%TASK_NAME%" /f >nul 2>&1
schtasks /create /tn "%TASK_NAME%" /tr "\"%START_SCRIPT%\"" /sc onlogon /rl highest /f >nul 2>&1

if %errorlevel% equ 0 (
    echo    [OK] Scheduled task created!
    echo    WealthMaster will auto-start when you log in.
) else (
    echo    [WARN] Task Scheduler failed.
    echo    ALTERNATIVE: Press Win+R, type shell:startup
    echo    Copy start-silent.bat into that folder.
)
echo.

:: ============================================
:: Disable PC sleep
:: ============================================
echo [3/3] Preventing PC from sleeping (for 24/7 operation)...

powercfg /change standby-timeout-ac 0
powercfg /change hibernate-timeout-ac 0
powercfg /change monitor-timeout-ac 30

echo    [OK] PC will NOT sleep when plugged in.
echo    (Monitor still turns off after 30 min to save power)
echo.

echo.
echo  ========================================================
echo         AUTO-START SETUP COMPLETE!
echo  ========================================================
echo.
echo  What happens now:
echo    1. PC turns on or restarts
echo    2. You log into Windows
echo    3. After 45 seconds, WealthMaster starts silently
echo    4. Backend + AI Engine + Tunnel all launch
echo    5. Open app on phone - it just works!
echo.
echo  To UNDO this later:
echo    schtasks /delete /tn "WealthMaster-AutoStart" /f
echo  ========================================================
echo.
pause
