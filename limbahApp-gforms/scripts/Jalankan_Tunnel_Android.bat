@echo off
title LimbahApp (GForms) - Cloudflare Tunnel Runner
cd /d "%~dp0\.."

echo ========================================================
echo   LimbahApp (GForms) - Online Tunnel untuk Android
echo ========================================================
echo.

"C:\Program Files (x86)\cloudflared\cloudflared.exe" tunnel --url http://127.0.0.1:8088
pause
