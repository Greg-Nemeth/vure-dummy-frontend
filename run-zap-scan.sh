#!/bin/bash

# Script to run vulnerability scan with OWASP ZAP
set -e

echo "🚀 Starting frontend application and OWASP ZAP scanner..."
echo ""

if ! command -v docker >/dev/null 2>&1; then
    echo "❌ Docker CLI not found on PATH. Install Docker first."
    exit 1
fi

if ! docker info >/dev/null 2>&1; then
    cat <<'EOF'
❌ Cannot talk to the Docker daemon as the current user.

To run this script without sudo, add yourself to the docker group:
  sudo usermod -aG docker $USER
  newgrp docker  # or log out and back in
Then rerun this script.
EOF
    exit 1
fi

REPORT_DIR="zap-reports"
mkdir -p "$REPORT_DIR"
chmod 777 "$REPORT_DIR"

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

set +e
docker compose up zap
scan_status=$?
set -e

if [ "$scan_status" -ne 0 ] && [ "$scan_status" -ne 2 ]; then
    echo "❌ OWASP ZAP scan failed (exit code $scan_status)"
    docker compose logs zap
    exit "$scan_status"
fi

# Check scan results
echo ""
echo "📊 Scan complete! Results saved in ./$REPORT_DIR/"
echo ""
if ls "$REPORT_DIR"/zap-report.* >/dev/null 2>&1; then
    echo "Reports generated:"
    ls -lh "$REPORT_DIR"/zap-report.*
else
    echo "⚠️  No report files were generated."
fi

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
