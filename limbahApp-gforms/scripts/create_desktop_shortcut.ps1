$wsh = New-Object -ComObject WScript.Shell
$desktopPath = [Environment]::GetFolderPath('Desktop')
$shortcutPath = Join-Path $desktopPath 'LimbahApp (GForms).lnk'
$shortcut = $wsh.CreateShortcut($shortcutPath)
$shortcut.TargetPath = 'wscript.exe'
$shortcut.Arguments = '"c:\Users\Anaxagoras\.gemini\antigravity\scratch\limbahApp-gforms\scripts\open_app.vbs"'
$shortcut.WorkingDirectory = 'c:\Users\Anaxagoras\.gemini\antigravity\scratch\limbahApp-gforms'
$shortcut.IconLocation = 'c:\Users\Anaxagoras\.gemini\antigravity\scratch\limbahApp-gforms\app_icon.ico, 0'
$shortcut.Description = 'Buka Aplikasi LimbahApp EHS Monitoring System'
$shortcut.Save()
Write-Host "Desktop shortcut created at: $shortcutPath"
