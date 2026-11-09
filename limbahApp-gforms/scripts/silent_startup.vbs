' LimbahApp (GForms Edition) - Silent Startup on Windows Login
Set WshShell = CreateObject("WScript.Shell")
strScriptsDir = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
strProjectRoot = CreateObject("Scripting.FileSystemObject").GetParentFolderName(strScriptsDir)
WshShell.CurrentDirectory = strProjectRoot
WshShell.Run "powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden -File """ & strProjectRoot & "\scripts\app_runner.ps1"" -Quiet", 0, False
Set WshShell = Nothing
