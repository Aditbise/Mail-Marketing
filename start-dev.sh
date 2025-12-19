#!/bin/bash

# Mail Marketing App - Quick Start Script
# This script starts both the backend and frontend servers

echo ""
echo "========================================"
echo "Mail Marketing Application - Quick Start"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed or not in PATH"
    echo "Please install Node.js from https://nodejs.org"
    exit 1
fi

echo "Starting Backend Server..."
echo ""

# Start backend in background
cd Server
npm start &
BACKEND_PID=$!

echo ""
echo "Waiting 3 seconds before starting Frontend..."
sleep 3

echo ""
echo "Starting Frontend Development Server..."
echo ""

# Start frontend
cd ../Front\ end
npm run dev

# Cleanup: Kill backend when frontend is closed
kill $BACKEND_PID 2>/dev/null

echo ""
echo "Application stopped."
echo ""
