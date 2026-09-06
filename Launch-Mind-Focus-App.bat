@echo off
cd /d "%~dp0"
where pythonw >nul 2>&1
if %ERRORLEVEL% equ 0 (
    start "" pythonw run_app.pyw
) else (
    start "" msedge --app="file:///%~dp0index.html" --window-size=1320,860
)
exit
