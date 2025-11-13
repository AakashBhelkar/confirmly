#!/bin/bash
# Bash script to start preview servers
# Usage: ./scripts/start-preview.sh

echo "🚀 Starting Confirmly Preview..."

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ PNPM is not installed. Please install it first."
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    pnpm install
fi

# Check for environment files
if [ ! -f "apps/api/.env" ]; then
    echo "⚠️  Warning: apps/api/.env not found. Creating example file..."
    cp apps/api/.env.example apps/api/.env 2>/dev/null || true
fi

if [ ! -f "apps/web/.env.local" ]; then
    echo "⚠️  Warning: apps/web/.env.local not found. Creating example file..."
    cp apps/web/.env.example apps/web/.env.local 2>/dev/null || true
fi

echo ""
echo "Starting servers..."
echo ""

# Start API server in background
echo "📡 Starting API server on http://localhost:4000"
cd apps/api && pnpm dev &
API_PID=$!
cd ../..

# Wait a bit
sleep 3

# Start Web server in background
echo "🌐 Starting Web server on http://localhost:3000"
cd apps/web && pnpm dev &
WEB_PID=$!
cd ../..

echo ""
echo "✅ Servers starting..."
echo ""
echo "📍 Access points:"
echo "   Frontend: http://localhost:3000"
echo "   API:      http://localhost:4000"
echo "   API Docs: http://localhost:4000/docs"
echo ""
echo "Press Ctrl+C to stop servers"

# Wait for user interrupt
trap "kill $API_PID $WEB_PID; exit" INT TERM
wait

