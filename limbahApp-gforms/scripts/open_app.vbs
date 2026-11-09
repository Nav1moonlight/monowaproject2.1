' LimbahApp Desktop Window Launcher
Set WshShell = CreateObject("WScript.Shell")
strScriptsDir = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
strProjectRoot = CreateObject("Scripting.FileSystemObject").GetParentFolderName(strScriptsDir)

' Pastikan server dan auto-sync aktif
WshShell.Run """" & strScriptsDir & "\silent_startup.vbs""", 0, True

' Buka Native Window App dengan dedicated profile agar tidak bentrok dengan instance browser
strProfileDir = strProjectRoot & "\storage\app_profile"
strEdge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
Set fso = CreateObject("Scripting.FileSystemObject")
If Not fso.FileExists(strEdge) Then
    strEdge = "C:\Program Files\Microsoft\Edge\Application\msedge.exe"
End If

If fso.FileExists(strEdge) Then
    WshShell.Run """" & strEdge & """ --app=""http://127.0.0.1:8088"" --user-data-dir=""" & strProfileDir & """ --window-size=1280,820", 1, False
Else
    WshShell.Run "http://127.0.0.1:8088", 1, False
End If

Set WshShell = Nothing
Set fso = Nothing
