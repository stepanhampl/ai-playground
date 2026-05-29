#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
FE_DIR="$SCRIPT_DIR/frontend"
ROOT_DIR="$SCRIPT_DIR"

echo "=== E2E Test Runner ==="
echo ""

# Check prerequisites
if ! command -v docker &> /dev/null; then
    echo "ERROR: docker not found. Install with: sudo apt install docker.io"
    exit 1
fi

if ! command -v npx &> /dev/null; then
    echo "ERROR: npx not found. Install Node.js."
    exit 1
fi

# Check .env file
if [ ! -f "$ROOT_DIR/.env" ]; then
    echo "ERROR: .env file not found at $ROOT_DIR/.env"
    echo "Create it with:"
    echo "  OPENROUTER_API_KEY=<your-key>"
    echo "  LLM_PROVIDERS=Fireworks,Morph"
    echo "  LLM_NAME=minimax/minimax-m2.7"
    exit 1
fi

cd "$FE_DIR"

# Install npm dependencies
echo "Installing frontend dependencies..."
npm install

# Install Playwright browsers
echo "Installing Playwright browsers..."
npx playwright install

# Run the full test via docker compose
echo "Starting services and running e2e test..."
npm run test:e2e

echo ""
echo "=== E2E Test Complete ==="