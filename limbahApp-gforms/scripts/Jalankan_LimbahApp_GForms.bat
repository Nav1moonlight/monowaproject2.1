@echo off
title LimbahApp (GForms Edition) Launcher
cd /d "%~dp0\.."

echo ========================================================
echo   LimbahApp (GForms) - Local Server & Auto-Sync Runner
echo ========================================================
echo.

REM Jalankan Silent Launcher
wscript.exe "%~dp0silent_startup.vbs"

echo Server sedang berjalan di background:
echo URL Dashboard : http://127.0.0.1:8088
echo Auto-Sync     : Berjalan otomatis setiap 1 menit
echo.
timeout /t 3 >nul
start http://127.0.0.1:8088
