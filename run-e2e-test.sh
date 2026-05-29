#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
FE_DIR="$SCRIPT_DIR/frontend"

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

cd "$FE_DIR"

# Install dependencies
echo "Installing dependencies..."
npm install

# Install Playwright browsers
echo "Installing Playwright browsers..."
npx playwright install

# Run the test
echo "Running e2e test..."
npm run test:e2e