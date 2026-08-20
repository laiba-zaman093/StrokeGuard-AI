@echo off
title StrokeGuard AI - Launcher
color 0B

echo.
echo =========================================================
echo    StrokeGuard AI - Auto Launcher
echo =========================================================
echo.

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is NOT installed or not in PATH.
    echo Please install Python 3.9+.
    pause
    exit /b 1
)

echo [OK] Python detected.

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is NOT installed or not in PATH.
    echo Please install Node.js LTS.
    pause
    exit /b 1
)

echo [OK] Node.js detected.

echo.
echo =========================================================
echo Installing Python dependencies...
echo =========================================================
python -m pip install -r requirements.txt

echo.
echo =========================================================
echo Installing frontend dependencies...
echo =========================================================
cd frontend
call npm install

echo.
echo =========================================================
echo Starting StrokeGuard AI...
echo =========================================================

cd ..

start "StrokeGuard AI Backend" cmd /k "python api.py"

cd frontend
start "StrokeGuard AI Frontend" cmd /k "npm run dev"

timeout /t 5 /nobreak >nul

start http://localhost:5173

echo.
echo =========================================================
echo StrokeGuard AI is starting!
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:8000
echo =========================================================
echo.
pause