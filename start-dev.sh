#!/bin/bash

# Mail Marketing App - Quick Start

if ! command -v node &> /dev/null; then
    echo "Node.js is not installed"
    exit 1
fi

echo "Starting Backend..."
cd Server
npm start &
BACKEND_PID=$!

sleep 2

echo "Starting Frontend..."
cd ../Front\ end
npm run dev

kill $BACKEND_PID 2>/dev/null

