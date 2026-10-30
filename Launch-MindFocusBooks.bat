@echo off
title Mind Focus Books - Desktop Edition
cd /d "%~dp0"

echo ====================================================
echo        MIND FOCUS BOOKS - DESKTOP EDITION
echo ====================================================
echo.
echo Launching Mind Focus Books native desktop window...
echo.

:: Check if electron is runnable
where npx >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Starting with Electron runtime...
    start "" npx electron .
    exit /b 0
)

:: Fallback: Launch using Edge/Chrome App Mode (Instant Native Window)
if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" --app="file:///%~dp0index.html" --window-size=1366,860
    exit /b 0
)

if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" --app="file:///%~dp0index.html" --window-size=1366,860
    exit /b 0
)

if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" --app="file:///%~dp0index.html" --window-size=1366,860
    exit /b 0
)

:: Default browser fallback
start "" "%~dp0index.html"
exit /b 0
