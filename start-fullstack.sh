#!/bin/bash

# AnansiAI Full-Stack Startup Script
# This script starts both the .NET backend and React frontend

echo "🚀 Starting AnansiAI Full-Stack Application..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Check if .NET 8 is installed
if ! command -v dotnet &> /dev/null; then
    echo "❌ .NET 8 SDK is not installed. Please install it from: https://dotnet.microsoft.com/download/dotnet/8.0"
    exit 1
fi

# Check if Node.js is installed
if ! command -v npm &> /dev/null; then
    echo "❌ Node.js/npm is not installed. Please install Node.js from: https://nodejs.org/"
    exit 1
fi

echo -e "${BLUE}🔍 Checking prerequisites...${NC}"

# Check if backend port is available
if check_port 5001; then
    echo "⚠️  Port 5001 is already in use. Please stop the existing service."
    exit 1
fi

# Check if frontend port is available
if check_port 8080; then
    echo "⚠️  Port 8080 is already in use. Please stop the existing service."
    exit 1
fi

echo -e "${GREEN}✅ All prerequisites met!${NC}"

# Install frontend dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
    npm install
fi

# Install backend dependencies if needed
if [ ! -d "AnansiAI.Api/bin" ]; then
    echo -e "${YELLOW}📦 Restoring backend packages...${NC}"
    cd AnansiAI.Api
    dotnet restore
    cd ..
fi

echo -e "${BLUE}🎯 Starting backend API...${NC}"

# Start the .NET backend in the background
cd AnansiAI.Api
dotnet run --urls="https://localhost:5001;http://localhost:5000" &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 5

# Check if backend started successfully
if check_port 5001; then
    echo -e "${GREEN}✅ Backend API started successfully on https://localhost:5001${NC}"
else
    echo "❌ Backend failed to start"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo -e "${BLUE}🎯 Starting frontend application...${NC}"

# Start the React frontend
npm run dev &
FRONTEND_PID=$!

# Wait for frontend to start
echo "⏳ Waiting for frontend to start..."
sleep 3

# Check if frontend started successfully
if check_port 8080; then
    echo -e "${GREEN}✅ Frontend started successfully on http://localhost:8080${NC}"
else
    echo "❌ Frontend failed to start"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 AnansiAI Full-Stack Application is now running!${NC}"
echo ""
echo "📱 Frontend: http://localhost:8080"
echo "🔗 Backend API: https://localhost:5001"
echo "📋 API Documentation: https://localhost:5001/swagger"
echo "🏥 Health Check: https://localhost:5001/health"
echo ""
echo "🔐 Super Admin Login:"
echo "   Login ID: SUP-ADM-001"
echo "   Password: admin123"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop both servers${NC}"

# Function to cleanup processes on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    echo "✅ Servers stopped"
    exit 0
}

# Trap Ctrl+C and call cleanup
trap cleanup INT

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
