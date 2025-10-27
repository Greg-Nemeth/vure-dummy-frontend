#!/bin/bash

# Script to run vulnerability scan with OWASP ZAP
set -e

echo "🚀 Starting frontend application and OWASP ZAP scanner..."
echo ""

# Build and start the frontend
echo "📦 Building frontend container..."
docker compose build frontend

# Start frontend in detached mode
echo "🌐 Starting frontend application..."
docker compose up -d frontend

# Wait for frontend to be healthy
echo "⏳ Waiting for frontend to be ready..."
timeout=60
elapsed=0
while [ $elapsed -lt $timeout ]; do
    if docker compose ps frontend | grep -q "healthy"; then
        echo "✅ Frontend is ready!"
        break
    fi
    sleep 2
    elapsed=$((elapsed + 2))
done

if [ $elapsed -ge $timeout ]; then
    echo "❌ Frontend failed to start within ${timeout}s"
    docker compose logs frontend
    exit 1
fi

# Run ZAP scan
echo ""
echo "🔍 Running OWASP ZAP vulnerability scan..."
echo "This may take a few minutes..."
echo ""

docker compose up zap

# Check scan results
echo ""
echo "📊 Scan complete! Results saved in ./zap-reports/"
echo ""
echo "Reports generated:"
ls -lh zap-reports/

# Cleanup
echo ""
read -p "🧹 Stop and remove containers? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker compose down
    echo "✅ Containers stopped and removed"
else
    echo "ℹ️  Containers still running. Stop with: docker compose down"
fi
