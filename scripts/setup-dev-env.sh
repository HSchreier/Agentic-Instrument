#!/bin/bash
# Setup development environment with nvm (Node 22) and pyenv (Python 3.11)
# Usage: source scripts/setup-dev-env.sh

set -e

echo "🔧 Setting up development environment..."

# ─── NVM Setup ───────────────────────────────────────────────────────────
echo ""
echo "📦 Checking nvm..."

export NVM_DIR="$HOME/.nvm"

if [ ! -d "$NVM_DIR" ]; then
  echo "   Installing nvm..."
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
  echo "   ✓ nvm installed"
else
  echo "   ✓ nvm already installed"
fi

if [ -s "$NVM_DIR/nvm.sh" ]; then
  source "$NVM_DIR/nvm.sh"
  echo "   ✓ nvm sourced"
fi

# Load Node 22
echo "   Loading Node 22..."
nvm install 22 --latest-npm
nvm use 22
NODE_VER=$(node --version)
echo "   ✓ Node $NODE_VER ready"

# ─── Pyenv Setup ─────────────────────────────────────────────────────────
echo ""
echo "🐍 Checking pyenv..."

export PYENV_ROOT="$HOME/.pyenv"

if [ ! -d "$PYENV_ROOT" ]; then
  echo "   Installing pyenv..."
  curl https://pyenv.run | bash
  echo "   ✓ pyenv installed"
else
  echo "   ✓ pyenv already installed"
fi

if [ -d "$PYENV_ROOT/bin" ]; then
  export PATH="$PYENV_ROOT/bin:$PATH"
fi

if command -v pyenv &> /dev/null; then
  eval "$(pyenv init -)"
  echo "   ✓ pyenv initialized"
fi

# Load Python 3.11
echo "   Loading Python 3.11..."
pyenv install 3.11.0 2>&1 | grep -v "already exists" || true
if cd backend 2>/dev/null; then
  pyenv local 3.11 2>/dev/null || true
  cd ..
fi
PYTHON_VER=$(python --version)
echo "   ✓ Python $PYTHON_VER ready"

# ─── Backend Dependencies ────────────────────────────────────────────────
echo ""
echo "📚 Installing backend dependencies..."
cd backend
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
cd ..
echo "   ✓ Backend dependencies installed"

# ─── Frontend Dependencies ───────────────────────────────────────────────
echo ""
echo "📦 Installing frontend dependencies..."
cd frontend
npm ci
cd ..
echo "   ✓ Frontend dependencies installed"

echo ""
echo "✅ Development environment ready!"
echo ""
echo "   Node:   $(node --version)"
echo "   npm:    $(npm --version)"
# Check backend Python version specifically
BACKEND_PYTHON=$(cd backend 2>/dev/null && python --version 2>&1 || echo "Python 3.11 (backend)")
echo "   Python: $BACKEND_PYTHON"
echo ""
echo "Next steps:"
echo "  • Run tests: npm run test (frontend) or pytest (backend)"
echo "  • Start dev: npm run dev (frontend) or python -m main (backend)"
echo ""
echo "Frontend work:   cd frontend && npm run dev"
echo "Backend work:    cd backend && python -m main"
