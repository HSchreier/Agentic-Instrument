# Developer Setup Guide

## Quick Start (Recommended)

**One command to set up everything:**

```bash
# bash
source scripts/setup-dev-env.sh

# or fish
source scripts/setup-dev-env.fish
```

This installs and configures:
- ✅ nvm (Node Version Manager) + Node 22
- ✅ pyenv (Python Version Manager) + Python 3.11
- ✅ All backend & frontend dependencies

## Manual Setup

### Node Version Management (nvm)

This project requires **Node 22** for all frontend work.

#### Automatic per-directory loading:

The `.nvmrc` file tells nvm which version to use. When you `cd` into the project:

```bash
nvm use
```

#### Manual version selection:

```bash
nvm use 22
```

### Why Node 22?

- Frontend deps require Node 20+ (eslint-visitor-keys, minimatch)
- GitHub Actions uses Node 18 for some legacy compat
- Local development needs Node 22 to avoid ESLint parser errors
- Docker uses correct versions automatically

## Python Version Management (pyenv)

This project requires **Python 3.11** for all backend work.

### Automatic per-directory loading:

The `backend/.python-version` file tells pyenv which version to use. When you `cd backend/`:

```bash
pyenv local
```

(pyenv auto-applies the version from `.python-version`)

### Manual version selection:

```bash
cd backend
pyenv shell 3.11
```

### Why Python 3.11?

- Backend requires Python 3.11+ for type hints and stdlib features
- Flask, pytest, and all deps tested against 3.11
- Docker uses correct version automatically
