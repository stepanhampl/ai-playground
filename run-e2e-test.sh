#!/bin/bash
set -e

cd "$(dirname "$0")/frontend"

echo "Installing Playwright browsers..."
npx playwright install

echo "Running e2e test..."
npm run test:e2e