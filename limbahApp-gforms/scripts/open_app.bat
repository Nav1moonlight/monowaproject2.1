@echo off
title LimbahApp (GForms Edition)
cd /d "%~dp0\.."

REM 1. Cek apakah background server & scheduler sudah aktif
netstat -ano | findstr ":8088" | findstr "LISTENING" >nul
if errorlevel 1 (
    echo Mengaktifkan background server & auto-sync...
    wscript.exe "%~dp0silent_startup.vbs"
    timeout /t 2 >nul
)

REM 2. Deteksi Microsoft Edge untuk Native Window App Mode
set "EDGE_EXE=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if not exist "%EDGE_EXE%" (
    set "EDGE_EXE=C:\Program Files\Microsoft\Edge\Application\msedge.exe"
)

REM 3. Buka jendela aplikasi desktop
if exist "%EDGE_EXE%" (
    start "" "%EDGE_EXE%" --app="http://127.0.0.1:8088" --window-size=1280,820
) else (
    start "" "http://127.0.0.1:8088"
)

exit
