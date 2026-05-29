#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
FE_DIR="$SCRIPT_DIR/frontend"
ROOT_DIR="$SCRIPT_DIR"
RED='\033[0;31m'
NC='\033[0m'

echo -e "${RED}=== E2E Test Runner ===${NC}"
echo ""

# Check prerequisites
if ! command -v docker &> /dev/null; then
    echo -e "${RED}ERROR: docker not found. Install with: sudo apt install docker.io${NC}"
    exit 1
fi

if ! command -v npx &> /dev/null; then
    echo -e "${RED}ERROR: npx not found. Install Node.js.${NC}"
    exit 1
fi

# Check .env file
if [ ! -f "$ROOT_DIR/.env" ]; then
    echo -e "${RED}ERROR: .env file not found at $ROOT_DIR/.env${NC}"
    echo -e "${RED}Create it with:${NC}"
    echo -e "${RED}  OPENROUTER_API_KEY=<your-key>${NC}"
    echo -e "${RED}  LLM_PROVIDERS=Fireworks,Morph${NC}"
    echo -e "${RED}  LLM_NAME=minimax/minimax-m2.7${NC}"
    exit 1
fi

cd "$FE_DIR"

# Install npm dependencies
echo -e "${RED}Installing frontend dependencies...${NC}"
npm install

# Install Playwright browsers
echo -e "${RED}Installing Playwright browsers...${NC}"
npx playwright install

# Run the full test via docker compose
echo -e "${RED}Starting services and running e2e test...${NC}"
npm run test:e2e

echo ""
echo -e "${RED}=== E2E Test Complete ===${NC}"