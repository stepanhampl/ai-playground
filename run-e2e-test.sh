#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
FE_DIR="$SCRIPT_DIR/frontend"
ROOT_DIR="$SCRIPT_DIR"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m'

# Run a command silently; on failure print its output and a red failure message, then exit.
# On success print a green passed message.
run_cmd() {
    local label="$1"
    shift
    local output
    output=$("$@" 2>&1)
    if [ $? -ne 0 ]; then
        echo "$output"
        echo -e "${RED}'${label}' failed${NC}"
        exit 1
    fi
    echo -e "${GREEN}'${label}' passed${NC}"
}

echo -e "${YELLOW}=== E2E Test Runner ===${NC}"
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

# Ensure docker compose down runs on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Stopping services...${NC}"
    cd "$ROOT_DIR" && docker compose down > /dev/null 2>&1
    echo -e "${GREEN}'docker compose down' passed${NC}"
}
trap cleanup EXIT

cd "$FE_DIR"
run_cmd "npm install" npm install

cd "$ROOT_DIR"
run_cmd "docker compose down" docker compose down
run_cmd "docker compose up --build -d" docker compose up --build -d

# Wait for frontend service to be ready
echo -e "${YELLOW}Waiting for services to be ready...${NC}"
for i in $(seq 1 30); do
    if docker compose ps | grep -q "frontend.*running\|frontend.*Up"; then
        echo -e "${GREEN}Services are up.${NC}"
        break
    fi
    sleep 2
done

# Run Playwright tests (don't abort on failure — we still need cleanup)
echo -e "${YELLOW}Running Playwright tests...${NC}"
cd "$FE_DIR"
npx playwright test
TEST_EXIT_CODE=$?

echo ""
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}=== E2E Tests Passed ===${NC}"
else
    echo -e "${RED}=== E2E Tests Failed (exit code: $TEST_EXIT_CODE) ===${NC}"
fi

exit $TEST_EXIT_CODE
