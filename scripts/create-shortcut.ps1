$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("C:\Users\ram\Desktop\Mind Focus Books (Official App).lnk")
$Shortcut.TargetPath = "C:\Users\ram\Desktop\Mind Focus Books.exe"
$Shortcut.WorkingDirectory = "C:\Users\ram\Desktop"
$Shortcut.Description = "Mind Focus Books Desktop App v0.0.96"
$Shortcut.Save()
Write-Output "Shortcut created successfully"
