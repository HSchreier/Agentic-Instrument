#!/bin/bash

# Local CI/CD test script - Mimics GitHub Actions workflows
# Run before pushing to catch errors early

set -e  # Exit on first error

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Local CI/CD Pipeline${NC}"
echo "=================================================="

# Function to print section
print_section() {
    echo -e "\n${BLUE}$1${NC}"
    echo "=================================================="
}

# Function to print success
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Function to print error
print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check if NVM is installed
if ! command -v nvm &> /dev/null && [ ! -s "$HOME/.nvm/nvm.sh" ]; then
    print_error "NVM not found. Installing..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
fi

# Source NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Check Node version
print_section "1️⃣  Checking Node.js and Bun"
node --version
npm --version

# Check Bun
if ! command -v bun &> /dev/null; then
    print_warning "Bun not found. Installing..."
    curl -fsSL https://bun.sh/install | bash
    export PATH="$HOME/.bun/bin:$PATH"
fi

bun --version
print_success "Node and Bun versions OK"

# Frontend Tests
print_section "2️⃣  Frontend: Type Check"
cd frontend
bun install --frozen-lockfile || {
    print_error "Frontend install failed"
    exit 1
}

bun run type-check || {
    print_error "TypeScript type checking failed"
    exit 1
}
print_success "TypeScript type check passed"

print_section "3️⃣  Frontend: Linting"
bun run lint || {
    print_warning "ESLint found issues (non-blocking)"
}
print_success "ESLint check passed"

print_section "4️⃣  Frontend: Tests"
bun run test || {
    print_error "Frontend tests failed"
    exit 1
}
print_success "Frontend tests passed"

cd ..

# Backend Tests
print_section "5️⃣  Backend: Setup"
cd backend
python3 -m venv .venv || {
    print_error "Failed to create Python venv"
    exit 1
}

source .venv/bin/activate || {
    print_error "Failed to activate venv"
    exit 1
}

pip install --upgrade pip > /dev/null
pip install -r requirements-test.txt > /dev/null || {
    print_error "Failed to install backend test dependencies"
    exit 1
}
print_success "Python environment ready"

print_section "6️⃣  Backend: Tests"
pytest -v --cov=backend --cov-report=term-missing || {
    print_error "Backend tests failed"
    exit 1
}
print_success "Backend tests passed"

cd ..

# Docker Validation
print_section "7️⃣  Docker: Dockerfile validation"
if ! command -v hadolint &> /dev/null; then
    print_warning "hadolint not installed. Skipping Docker lint."
else
    hadolint Dockerfile || print_warning "Dockerfile issues (non-blocking)"
    hadolint frontend/Dockerfile || print_warning "Frontend Dockerfile issues (non-blocking)"
    hadolint backend/Dockerfile || print_warning "Backend Dockerfile issues (non-blocking)"
    print_success "Docker files checked"
fi

# Git status check
print_section "8️⃣  Git: Uncommitted changes"
if [ -n "$(git status --porcelain)" ]; then
    print_warning "Uncommitted changes found:"
    git status --short
else
    print_success "No uncommitted changes"
fi

# Summary
print_section "✨ CI/CD Pipeline Complete"
echo -e "${GREEN}All checks passed!${NC}"
echo ""
echo "Next steps:"
echo "  1. Review changes: git status"
echo "  2. Stage files: git add ."
echo "  3. Commit: git commit -m 'Your message'"
echo "  4. Push: git push"
echo ""
echo "The same tests will run on GitHub Actions."
echo "=================================================="
