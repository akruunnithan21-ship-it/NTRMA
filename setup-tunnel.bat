@echo off
title WealthMaster - Cloudflare Tunnel Setup
color 0D

echo.
echo  ╔══════════════════════════════════════════════╗
echo  ║  WEALTHMASTER - Cloudflare Tunnel Setup      ║
echo  ║                                              ║
echo  ║  This makes your app work from ANYWHERE.     ║
echo  ║  Your phone connects to your home PC          ║
echo  ║  even when you're outside.                   ║
echo  ║                                              ║
echo  ║  100%% FREE. No port forwarding needed.       ║
echo  ╚══════════════════════════════════════════════╝
echo.

:: Check if cloudflared already exists
if exist "%~dp0cloudflared.exe" (
    echo    [OK] cloudflared.exe already downloaded.
    goto :setup
)

:: Download cloudflared
echo [1/4] Downloading Cloudflare Tunnel (cloudflared)...
echo    This is a small 30MB download...
echo.
curl -L -o "%~dp0cloudflared.exe" https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe

if not exist "%~dp0cloudflared.exe" (
    echo.
    echo    ERROR: Download failed!
    echo    Please manually download from:
    echo    https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe
    echo    Save it as "cloudflared.exe" in the wealthmaster folder.
    pause
    exit /b 1
)
echo    [OK] Downloaded cloudflared.exe
echo.

:setup
echo [2/4] Logging into Cloudflare...
echo.
echo    A browser window will open. 
echo    1. Log in to Cloudflare (create free account if needed)
echo    2. Select any domain OR use the free .cfargotunnel.com domain
echo    3. Come back here after authorizing.
echo.
"%~dp0cloudflared.exe" tunnel login
echo.
echo    [OK] Logged in!
echo.

echo [3/4] Creating tunnel named "wealthmaster"...
"%~dp0cloudflared.exe" tunnel create wealthmaster
echo.

:: Get tunnel ID
for /f "tokens=*" %%i in ('"%~dp0cloudflared.exe" tunnel list ^| findstr wealthmaster') do set "TUNNEL_INFO=%%i"
echo    Tunnel created: %TUNNEL_INFO%
echo.

:: Create config file
echo [4/4] Creating tunnel configuration...
if not exist "%USERPROFILE%\.cloudflared" mkdir "%USERPROFILE%\.cloudflared"

(
echo tunnel: wealthmaster
echo credentials-file: %USERPROFILE%\.cloudflared\wealthmaster.json
echo.
echo ingress:
echo   - hostname: wealthmaster-api.cfargotunnel.com
echo     service: http://localhost:3001
echo   - service: http_status:404
) > "%USERPROFILE%\.cloudflared\config.yml"

echo    [OK] Configuration saved!
echo.

echo.
echo  ╔══════════════════════════════════════════════════════╗
echo  ║          TUNNEL SETUP COMPLETE!                     ║
echo  ╠══════════════════════════════════════════════════════╣
echo  ║                                                      ║
echo  ║  To START the tunnel (run after start.bat):          ║
echo  ║                                                      ║
echo  ║    cloudflared.exe tunnel run wealthmaster           ║
echo  ║                                                      ║
echo  ║  Your app URL will be:                               ║
echo  ║  https://wealthmaster-api.cfargotunnel.com           ║
echo  ║                                                      ║
echo  ║  Put this URL in your app's config and it            ║
echo  ║  works from ANYWHERE in the world!                   ║
echo  ║                                                      ║
echo  ║  The auto-start-on-boot.bat already includes         ║
echo  ║  tunnel startup if cloudflared.exe exists.           ║
echo  ╚══════════════════════════════════════════════════════╝
echo.
echo  NEXT STEPS:
echo  1. Run: cloudflared.exe tunnel route dns wealthmaster wealthmaster-api
echo     (This connects your tunnel to the URL)
echo.
echo  2. Update your app config with the tunnel URL
echo     (I'll explain this in the setup guide)
echo.
pause
