#!/usr/bin/env fish
# Setup development environment with nvm (Node 22) and pyenv (Python 3.11)
# Usage: source scripts/setup-dev-env.fish

echo "🔧 Setting up development environment..."

# ─── NVM Setup ───────────────────────────────────────────────────────────
echo ""
echo "📦 Checking nvm..."

set -gx NVM_DIR "$HOME/.nvm"

if not test -d "$NVM_DIR"
  echo "   Installing nvm..."
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
  echo "   ✓ nvm installed"
else
  echo "   ✓ nvm already installed"
end

if test -s "$NVM_DIR/nvm.sh"
  source "$NVM_DIR/nvm.sh" --no-use
  echo "   ✓ nvm sourced"
end

# Load Node 22
echo "   Loading Node 22..."
nvm install 22 --latest-npm
nvm use 22 >/dev/null
set NODE_VER (node --version)
echo "   ✓ Node $NODE_VER ready"

# ─── Pyenv Setup ─────────────────────────────────────────────────────────
echo ""
echo "🐍 Checking pyenv..."

set -gx PYENV_ROOT "$HOME/.pyenv"

if not test -d "$PYENV_ROOT"
  echo "   Installing pyenv..."
  curl https://pyenv.run | bash
  echo "   ✓ pyenv installed"
else
  echo "   ✓ pyenv already installed"
end

if test -d "$PYENV_ROOT/bin"
  set -gx PATH "$PYENV_ROOT/bin" $PATH
end

if command -v pyenv &>/dev/null
  pyenv init - | source
  echo "   ✓ pyenv initialized"
end

# Load Python 3.11
echo "   Loading Python 3.11..."
pyenv install 3.11.0 2>/dev/null; or true
cd backend 2>/dev/null; and pyenv local 3.11; and cd .. 2>/dev/null; or true
set PYTHON_VER (python --version)
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
echo "   Node:   "(node --version)
echo "   npm:    "(npm --version)
echo "   Python: "(python --version)
echo ""
echo "Next steps:"
echo "  • Run tests: npm run test (frontend) or pytest (backend)"
echo "  • Start dev: npm run dev (frontend) or python -m main (backend)"
