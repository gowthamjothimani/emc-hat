#!/bin/bash
set -e

echo "Starting Backend..."
cd backend/app
python3 app.py &
BACKEND_PID=$!

echo "Starting Frontend..."
cd ../../frontend
npm start &
FRONTEND_PID=$!

echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"

trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait
