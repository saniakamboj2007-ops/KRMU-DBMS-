@echo off
title BHOOKH Full-Stack Launcher
echo =================================================================
echo   BHOOKH — Multi-Restaurant Food Ordering Application
echo   Launching Backend (Port 5000) and Frontend (Port 3000)...
echo =================================================================
echo.

start "BHOOKH Backend (Port 5000)" cmd /k "cd /d \"%~dp0backend\" && node src/server.js"
start "BHOOKH Frontend (Port 3000)" cmd /k "cd /d \"%~dp0frontend\" && npm.cmd run dev"

echo.
echo Servers launched in separate windows!
echo   • Frontend UI: http://localhost:3000
echo   • Backend API & App: http://localhost:5000
echo.
pause
