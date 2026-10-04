#!/usr/bin/env bash

set -euo pipefail

echo "======================================"
echo " Password Security Toolkit"
echo " Phase 11 Test Suite"
echo "======================================"

echo
echo "[1/4] Linting..."
npm run lint

echo
echo "[2/4] Running tests..."
npm run test:run

echo
echo "[3/4] Generating coverage..."
npm run test:coverage

echo
echo "[4/4] Production build..."
npm run build

echo
echo "======================================"
echo " ALL PHASE 11 CHECKS PASSED"
echo "======================================"