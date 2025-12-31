#!/bin/bash

echo "Starting Backend..."
cd backend
python3 app.py &
BACKEND_PID=$!

echo "Starting Frontend..."
cd ../frontend
npm start &
FRONTEND_PID=$!

echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"

# Wait for both processes
wait
