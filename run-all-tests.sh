#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

bash "$SCRIPT_DIR/run-e2e-test.sh"

echo "Running mypy type checks..."
mypy backend --explicit-package-bases --strict
