# LimbahApp-GForms Background Runner & Google Sheets Synchronizer
param(
    [switch]$OpenBrowser,
    [switch]$Quiet
)

$projectRoot = (Resolve-Path "$PSScriptRoot\..").Path
Set-Location $projectRoot

# 1. Deteksi executable PHP
$phpBin = $null
if (Get-Command php -ErrorAction SilentlyContinue) {
    $phpBin = (Get-Command php).Source
} elseif (Test-Path "$env:USERPROFILE\.config\herd-lite\bin\php.exe") {
    $phpBin = "$env:USERPROFILE\.config\herd-lite\bin\php.exe"
} elseif (Test-Path "C:\php\php.exe") {
    $phpBin = "C:\php\php.exe"
}

if (-not $phpBin) {
    Write-Error "[LimbahApp GForms] PHP binary tidak ditemukan."
    exit 1
}

$logsDir = Join-Path $projectRoot "storage\logs"
if (-not (Test-Path $logsDir)) {
    New-Item -ItemType Directory -Path $logsDir -Force | Out-Null
}

$serverLog = Join-Path $logsDir "server.log"
$schedLog = Join-Path $logsDir "scheduler.log"
$port = 8088

# 2. Cek apakah Web Server (Port 8088) sudah aktif
$serverConn = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
if (-not $serverConn) {
    if (-not $Quiet) { Write-Host "[1/2] Menjalankan LimbahApp (GForms) di Port $port..." -ForegroundColor Cyan }
    $cmdArg = "/c `"`"$phpBin`" artisan serve --host=0.0.0.0 --port=$port >> `"$serverLog`" 2>&1`""
    Start-Process -FilePath "cmd.exe" -ArgumentList $cmdArg -WorkingDirectory $projectRoot -WindowStyle Hidden
} else {
    if (-not $Quiet) { Write-Host "[1/2] Web Server sudah aktif di port $port." -ForegroundColor Green }
}

# 3. Cek apakah Scheduler (schedule:work untuk auto-sync Google Sheets) sudah aktif
$existingScheduler = Get-CimInstance Win32_Process -Filter "Name = 'php.exe'" -ErrorAction SilentlyContinue |
    Where-Object { $_.CommandLine -like "*limbahApp-gforms*schedule:work*" }

if (-not $existingScheduler) {
    if (-not $Quiet) { Write-Host "[2/2] Menjalankan Auto-Sync Scheduler Google Sheets (tiap 1 menit)..." -ForegroundColor Cyan }
    $schedCmdArg = "/c `"`"$phpBin`" artisan schedule:work >> `"$schedLog`" 2>&1`""
    Start-Process -FilePath "cmd.exe" -ArgumentList $schedCmdArg -WorkingDirectory $projectRoot -WindowStyle Hidden
} else {
    if (-not $Quiet) { Write-Host "[2/2] Background Scheduler Google Sheets sudah aktif." -ForegroundColor Green }
}

# 4. Initial Sync saat start
$syncCmdArg = "/c `"`"$phpBin`" artisan sheets:sync`""
Start-Process -FilePath "cmd.exe" -ArgumentList $syncCmdArg -WorkingDirectory $projectRoot -WindowStyle Hidden

Start-Sleep -Seconds 3

if (-not $Quiet) {
    Write-Host ""
    Write-Host "LimbahApp (GForms) siap digunakan di: http://127.0.0.1:$port" -ForegroundColor Green
}

if ($OpenBrowser) {
    Start-Process "http://127.0.0.1:$port"
}
