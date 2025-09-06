@echo off
title AnansiAI Full-Stack Application

echo 🚀 Starting AnansiAI Full-Stack Application...

REM Check if .NET 8 is installed
dotnet --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ .NET 8 SDK is not installed. Please install it from: https://dotnet.microsoft.com/download/dotnet/8.0
    pause
    exit /b 1
)

REM Check if Node.js is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js/npm is not installed. Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

echo 🔍 Checking prerequisites...

REM Install frontend dependencies if needed
if not exist "node_modules" (
    echo 📦 Installing frontend dependencies...
    npm install
)

REM Install backend dependencies if needed
if not exist "AnansiAI.Api\bin" (
    echo 📦 Restoring backend packages...
    cd AnansiAI.Api
    dotnet restore
    cd ..
)

echo 🎯 Starting backend API...

REM Start the .NET backend
start "AnansiAI Backend" cmd /k "cd AnansiAI.Api && dotnet run --urls=https://localhost:5001;http://localhost:5000"

REM Wait for backend to start
echo ⏳ Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo 🎯 Starting frontend application...

REM Start the React frontend
start "AnansiAI Frontend" cmd /k "npm run dev"

REM Wait for frontend to start
echo ⏳ Waiting for frontend to start...
timeout /t 3 /nobreak > nul

echo.
echo 🎉 AnansiAI Full-Stack Application is starting!
echo.
echo 📱 Frontend: http://localhost:8080
echo 🔗 Backend API: https://localhost:5001
echo 📋 API Documentation: https://localhost:5001/swagger
echo 🏥 Health Check: https://localhost:5001/health
echo.
echo 🔐 Super Admin Login:
echo    Login ID: SUP-ADM-001
echo    Password: admin123
echo.
echo ✅ Both servers are starting in separate windows
echo    Close those windows to stop the servers
echo.
pause
