#!/bin/bash

set -euo pipefail

AUTO_CLEANUP_MODE=${ZAP_AUTO_CLEANUP:-prompt}

show_help() {
    cat <<'EOF'
Usage: ./run-zap-scan.sh [options]

Options:
  --auto-cleanup       Always stop and remove containers when the scan finishes.
  --keep-containers    Leave containers running after the scan completes.
  --help               Show this message and exit.

Environment:
  ZAP_AUTO_CLEANUP=always   Behaves like --auto-cleanup.
  ZAP_AUTO_CLEANUP=never    Behaves like --keep-containers.
EOF
}

while [[ $# -gt 0 ]]; do
    case "$1" in
        --auto-cleanup)
            AUTO_CLEANUP_MODE="always"
            shift
            ;;
        --keep-containers)
            AUTO_CLEANUP_MODE="never"
            shift
            ;;
        --help|-h)
            show_help
            exit 0
            ;;
        *)
            echo "Unknown option: $1" >&2
            show_help >&2
            exit 2
            ;;
    esac
done

cleanup() {
    rm -f zap-automation.yaml
}
trap cleanup EXIT

printf '🚀 Starting frontend application and OWASP ZAP scanner...\n\n'

if ! command -v docker >/dev/null 2>&1; then
    echo "❌ Docker CLI not found on PATH. Install Docker first."
    exit 1
fi

if ! command -v python3 >/dev/null 2>&1; then
    echo "❌ python3 is required to render zap-automation.yaml from the template."
    exit 1
fi

if ! command -v curl >/dev/null 2>&1; then
    echo "❌ curl is required to pre-seed users via the API."
    exit 1
fi

if ! docker info >/dev/null 2>&1; then
    cat <<'EOF_DOCKER'
❌ Cannot talk to the Docker daemon as the current user.

To run this script without sudo, add yourself to the docker group:
  sudo usermod -aG docker $USER
  newgrp docker  # or log out and back in
Then rerun this script.
EOF_DOCKER
    exit 1
fi

REPORT_DIR="zap-reports"
mkdir -p "$REPORT_DIR"
chmod 777 "$REPORT_DIR"

ZAP_USERNAME="zapuser-$(date +%s)@example.com"
ZAP_PASSWORD="ZapPass!$(date +%S)${RANDOM:0:2}"
export ZAP_USERNAME ZAP_PASSWORD

python3 - <<'PY'
import os
import sys
from pathlib import Path

template_path = Path('zap-automation.template.yaml')
if not template_path.exists():
    sys.exit('Missing zap-automation.template.yaml. Cannot continue.')

username = os.environ['ZAP_USERNAME']
password = os.environ['ZAP_PASSWORD']
content = template_path.read_text()
content = content.replace('${ZAP_USERNAME}', username)
content = content.replace('${ZAP_PASSWORD}', password)
Path('zap-automation.yaml').write_text(content)
PY

chmod 600 zap-automation.yaml

printf '👤 Using temporary test credentials: %s / %s\n' "$ZAP_USERNAME" "$ZAP_PASSWORD"

printf '\n📦 Building frontend container...\n'
docker compose build frontend >/dev/null

printf '🌐 Starting frontend application...\n'
docker compose up -d frontend >/dev/null

printf '⏳ Waiting for frontend to be ready...\n'
timeout=60
elapsed=0
until docker compose ps frontend | grep -q "healthy"; do
    if [ $elapsed -ge $timeout ]; then
        echo "❌ Frontend failed to start within ${timeout}s"
        docker compose logs frontend
        exit 1
    fi
    sleep 2
    elapsed=$((elapsed + 2))
done

echo "✅ Frontend is ready!"

printf '\n🆕 Registering fresh user via API...\n'
register_payload=$(printf '{"username":"%s","password":"%s"}' "$ZAP_USERNAME" "$ZAP_PASSWORD")
tmp_response=$(mktemp)
set +e
reg_status=$(curl -s -o "$tmp_response" -w "%{http_code}" \
    -H 'Content-Type: application/json' \
    --data "$register_payload" \
    http://localhost:8000/api/register)
curl_exit=$?
set -e

reg_body=$(cat "$tmp_response")
rm -f "$tmp_response"

if [ $curl_exit -ne 0 ]; then
    echo "❌ Failed to reach registration endpoint (curl exit $curl_exit)."
    docker compose logs frontend
    exit 1
fi

case "$reg_status" in
    200|201)
        echo "✅ Registration succeeded."
        ;;
    409)
        echo "ℹ️  User already existed; continuing with login using the same credentials."
        ;;
    *)
        echo "❌ Registration failed with status $reg_status"
        echo "Response: $reg_body"
        docker compose logs frontend
        exit 1
        ;;
esac

printf '\n🔍 Running OWASP ZAP vulnerability scan... (this may take a few minutes)\n\n'

set +e
docker compose up zap
scan_status=$?
set -e

if [ "$scan_status" -ne 0 ] && [ "$scan_status" -ne 2 ]; then
    echo "❌ OWASP ZAP scan failed (exit code $scan_status)"
    docker compose logs zap
    exit "$scan_status"
fi

echo ""
echo "📊 Scan complete! Results saved in ./$REPORT_DIR/"
if ls "$REPORT_DIR"/zap-report.* >/dev/null 2>&1; then
    echo "Reports generated:"
    ls -lh "$REPORT_DIR"/zap-report.*
else
    echo "⚠️  No report files were generated."
fi

echo ""
case "$AUTO_CLEANUP_MODE" in
    always)
        docker compose down
        echo "✅ Containers stopped and removed"
        ;;
    never)
        echo "ℹ️  Containers still running. Stop with: docker compose down"
        ;;
    *)
        if [ -t 0 ]; then
            read -p "🧹 Stop and remove containers? (y/N) " -r reply
            echo
            if [[ $reply =~ ^[Yy]$ ]]; then
                docker compose down
                echo "✅ Containers stopped and removed"
            else
                echo "ℹ️  Containers still running. Stop with: docker compose down"
            fi
        else
            echo "ℹ️  No interactive terminal detected. Auto-removing containers."
            docker compose down
            echo "✅ Containers stopped and removed"
        fi
        ;;
esac
