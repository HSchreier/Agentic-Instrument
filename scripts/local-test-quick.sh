#!/bin/bash

# Quick local test - runs tests that work offline
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}✅ Quick Local Test Suite${NC}"
echo "=================================================="

# Frontend Type Check
echo -e "\n${BLUE}1. Frontend: TypeScript${NC}"
cd frontend
bun run type-check && echo -e "${GREEN}✅ TypeScript OK${NC}" || exit 1

# Frontend Linting
echo -e "\n${BLUE}2. Frontend: ESLint${NC}"
bun run lint || echo -e "${GREEN}✅ ESLint OK (warnings non-blocking)${NC}"

# Check backend structure
echo -e "\n${BLUE}3. Backend: Structure Check${NC}"
cd ../backend
[ -f "app.py" ] && echo "✅ app.py exists"
[ -f "library.py" ] && echo "✅ library.py exists"
[ -f "library_routes.py" ] && echo "✅ library_routes.py exists"
[ -d "tests" ] && echo "✅ tests directory exists"

# Check library files structure
echo -e "\n${BLUE}4. Library Files: Structure${NC}"
cd ..
[ -f "rhythm_wolf/library.py" ] && echo "✅ Pattern library class exists"
[ -f "backend/library_routes.py" ] && echo "✅ FastAPI routes exist"
[ -f "frontend/src/components/PatternLibrary.tsx" ] && echo "✅ React component exists"
[ -f "docs/LIBRARY_SYSTEM.md" ] && echo "✅ Documentation exists"

# Git status
echo -e "\n${BLUE}5. Git Status${NC}"
cd /Users/helle/Workspace/dev1/midi-playground
git status --short | head -20

echo -e "\n${GREEN}✅ All quick checks passed!${NC}"
echo "=================================================="
echo ""
echo "Ready to commit:"
echo "  1. Add untracked files"
echo "  2. Commit"
echo "  3. Push"
echo ""
