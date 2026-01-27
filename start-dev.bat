@echo off
REM Mail Marketing App - Quick Start

where node >nul 2>nul
if errorlevel 1 (
    echo Node.js is not installed
    pause
    exit /b 1
)

echo Starting Backend...
start cmd /k "cd Server && npm start"

timeout /t 2

echo Starting Frontend...
start cmd /k "cd \"Front end\" && npm run dev"

pause

