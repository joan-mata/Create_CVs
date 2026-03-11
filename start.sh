#!/bin/bash

# Matar procesos previos en estos puertos
lsof -i :8000 -t | xargs kill -9 2>/dev/null || true
lsof -i :5173 -t | xargs kill -9 2>/dev/null || true

echo "🚀 Iniciando Backend (FastAPI)..."
python3 backend/main.py > backend_debug.log 2>&1 &

echo "🚀 Iniciando Frontend (Vite)..."
cd frontend
npm run dev
