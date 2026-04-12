@echo off
cd /d "%~dp0"
echo Installing dependencies...
call npm install
echo.
echo Starting Assessor2...
call npm run dev
pause
