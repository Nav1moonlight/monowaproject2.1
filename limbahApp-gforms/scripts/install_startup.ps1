$wsh = New-Object -ComObject WScript.Shell
$startupPath = [Environment]::GetFolderPath('Startup')
$shortcutPath = Join-Path $startupPath 'LimbahApp_GForms.lnk'
$shortcut = $wsh.CreateShortcut($shortcutPath)
$shortcut.TargetPath = 'wscript.exe'
$shortcut.Arguments = '"c:\Users\Anaxagoras\.gemini\antigravity\scratch\limbahApp-gforms\scripts\silent_startup.vbs"'
$shortcut.WorkingDirectory = 'c:\Users\Anaxagoras\.gemini\antigravity\scratch\limbahApp-gforms'
$shortcut.Description = 'Auto-start LimbahApp GForms Server and Auto-Sync Scheduler'
$shortcut.Save()
Write-Host "Shortcut created at: $shortcutPath"
