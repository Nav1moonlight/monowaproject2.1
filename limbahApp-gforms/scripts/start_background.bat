@echo off
cd /d "c:\Users\Anaxagoras\.gemini\antigravity\scratch\limbahApp-gforms"

REM Cek apakah port 8088 sudah aktif
netstat -ano | findstr ":8088" | findstr "LISTENING" >nul
if errorlevel 1 (
    start "LimbahApp Server" /B "C:\Users\Anaxagoras\.config\herd-lite\bin\php.exe" artisan serve --host=127.0.0.1 --port=8088
)

REM Cek apakah scheduler sudah aktif
tasklist /FI "IMAGENAME eq php.exe" /V | findstr "schedule:work" >nul
if errorlevel 1 (
    start "LimbahApp Scheduler" /B "C:\Users\Anaxagoras\.config\herd-lite\bin\php.exe" artisan schedule:work
)

REM Lakukan sync awal
start "LimbahApp Initial Sync" /B "C:\Users\Anaxagoras\.config\herd-lite\bin\php.exe" artisan sheets:sync
