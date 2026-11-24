# Developer Setup Guide

## Node Version Management (nvm)

This project requires **Node 22** for all frontend work.

### Automatic Setup (Recommended)

```bash
# One-time setup
source .nvm-setup.sh
```

This will:
- Auto-load Node 22 when you `cd` into this project
- Never cause version conflicts again

### Manual Setup

If you prefer manual control:
```bash
nvm use 22
```

The `.nvmrc` file tells nvm which version to use.

### Why Node 22?

- Frontend deps require Node 20+ (eslint-visitor-keys, minimatch)
- GitHub Actions uses Node 18 for some legacy compat
- Local development needs Node 22 to avoid ESLint parser errors
- Docker uses correct versions automatically
