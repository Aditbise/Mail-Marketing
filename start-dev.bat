@echo off
REM Mail Marketing App - Quick Start Script
REM This script starts both the backend and frontend servers

echo.
echo ========================================
echo Mail Marketing Application - Quick Start
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if errorlevel 1 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo Starting Backend Server...
echo.
start cmd /k "cd Server && npm start"

echo.
echo Waiting 3 seconds before starting Frontend...
timeout /t 3

echo.
echo Starting Frontend Development Server...
echo.
start cmd /k "cd \"Front end\" && npm run dev"

echo.
echo ========================================
echo Application is starting!
echo ========================================
echo.
echo Backend: http://localhost:3001
echo Frontend: http://localhost:5173
echo.
echo Press Ctrl+C in either window to stop the respective server
echo.
pause
