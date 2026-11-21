# CI/CD Setup & Deployment Guide

Complete walkthrough of the testing and deployment pipeline.

## 🚀 Quick Start

### 1. Local Testing (Before Pushing)

```bash
# Frontend tests
cd frontend
bun install
bun run type-check
bun run lint
bun run test

# Backend tests
cd backend
pip install -r requirements-test.txt
pytest -v --cov

# Docker builds (optional locally)
docker compose build
```

### 2. Create a Feature Branch

```bash
git checkout -b feature/your-feature dev
# Make changes...
git add .
git commit -m "feat: Your feature description"
git push -u origin feature/your-feature
```

### 3. Create Pull Request

```bash
# GitHub CLI
gh pr create --base dev --title "Your PR Title"

# Or via GitHub web UI
```

### 4. Automated Checks Run

GitHub Actions automatically runs:

✅ Frontend tests (Vitest + React Testing Library)  
✅ Backend tests (pytest)  
✅ Type checking (TypeScript, mypy)  
✅ Linting (ESLint, flake8)  
✅ Docker builds  
✅ Integration tests  

### 5. Code Review

Once all checks pass ✅, your PR can be reviewed and merged to `dev`.

### 6. Automatic Deploy to Dev

Upon merge to `dev`, the deploy workflow:

1. Triggers automatically
2. Builds Docker images
3. Runs final verification
4. Deploys to development environment
5. Sends Slack notification (optional)

---

## 📊 Workflow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Local Development                                           │
│ ├─ Write code                                              │
│ ├─ Run: bun run test (frontend)                           │
│ ├─ Run: pytest (backend)                                 │
│ └─ Commit: git push -u origin feature/name               │
└──────────────┬──────────────────────────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────────────────────────┐
│ GitHub Actions: Pull Request                               │
│ ├─ Trigger: push to any branch with PR to dev/main       │
│ ├─ Jobs:                                                   │
│ │  ├─ frontend: type-check, lint, test                   │
│ │  ├─ backend: pytest, flake8, coverage                  │
│ │  └─ integration: docker build, verify                  │
│ └─ Status: ✅ All checks pass → Ready to merge           │
└──────────────┬──────────────────────────────────────────────┘
               │
               ↓ (after PR review)
┌─────────────────────────────────────────────────────────────┐
│ GitHub: Merge PR to dev                                     │
│ └─ Commits code to dev branch                             │
└──────────────┬──────────────────────────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────────────────────────┐
│ GitHub Actions: Deploy to Dev                               │
│ ├─ Trigger: push to dev branch (after successful tests)    │
│ ├─ Jobs:                                                    │
│ │  ├─ Build Docker images                                 │
│ │  ├─ Verify deployment                                   │
│ │  └─ Slack notification 📢                              │
│ └─ Status: ✅ Deployed to dev environment                │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 GitHub Actions Workflows

### Test Workflow (`.github/workflows/test.yml`)

**Triggers:** 
- `push` to `dev` or `main`
- `pull_request` to `dev` or `main`

**Jobs:**

#### Frontend
```yaml
- Install Bun dependencies
- Type check (tsc)
- Lint (ESLint)
- Run tests (Vitest)
- Upload coverage to Codecov
```

#### Backend
```yaml
- Install Python dependencies
- Run pytest
- Flake8 linting
- Upload coverage to Codecov
```

#### Integration
```yaml
- Build React with Vite
- Verify backend imports
- Check Dockerfiles with Hadolint
```

**Status Check:**
- All jobs must pass before merge
- Badges can be added to README

### Build Workflow (`.github/workflows/build.yml`)

**Triggers:**
- `push` to `dev` or `main`
- Changes to any Dockerfile or docker-compose.yml

**Jobs:**
```yaml
build-cli:
  - Build CLI Docker image
  - Tag: rhythm-wolf:cli-{sha}
  
build-backend:
  - Build FastAPI Docker image
  - Tag: rhythm-wolf:backend-{sha}
  
build-frontend:
  - Build React Docker image
  - Tag: rhythm-wolf:frontend-{sha}
```

**Purpose:** Verify Docker images build without errors

### Deploy Workflow (`.github/workflows/deploy.yml`)

**Triggers:**
- Successful `test.yml` workflow on `dev`
- Manual trigger from GitHub Actions tab

**Jobs:**
```yaml
deploy:
  - Create GitHub deployment record
  - Send Slack notification
  - Verify deployment
```

**Output:**
- Deployment status in GitHub
- Slack message in #deployments channel (optional)
- Build artifacts tagged and ready

---

## ✅ Quality Gates

### Required Status Checks

Before merging to `dev` or `main`:

| Check | Purpose |
|-------|---------|
| Frontend Tests | Vitest suite passes |
| Backend Tests | pytest suite passes |
| Type Checking | No TypeScript errors |
| Linting | Code style compliance |
| Docker Build | All images build |
| Integration | Full stack verified |

### Coverage Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| Frontend | 70% | 80%+ |
| Backend | 75% | 85%+ |
| Critical paths | 85% | 95%+ |

---

## 🚨 Troubleshooting

### Tests Fail Locally but Pass in CI

```bash
# Update dependencies
bun install --frozen-lockfile
pip install -r requirements-test.txt

# Clear cache
rm -rf node_modules .vitest
rm -rf .pytest_cache __pycache__

# Re-run tests
bun run test
pytest -v
```

### Linting Errors

```bash
# Frontend
cd frontend
bun run lint --fix

# Backend
pip install black
black backend/
```

### Docker Build Fails

```bash
# Check Dockerfile syntax
docker build -f Dockerfile .

# Check dependencies
docker compose config
```

### CI Takes Too Long

**Optimize:**
- Remove slow/unnecessary tests
- Cache dependencies (usually automatic)
- Run tests in parallel (already enabled)
- Skip Docker builds on docs-only changes

---

## 📈 Monitoring & Metrics

### View Test Results

**GitHub:**
1. Go to Pull Request
2. Click "Checks" tab
3. See detailed results per job

**Codecov (Optional):**
1. Set `CODECOV_TOKEN` secret in GitHub
2. Coverage reports auto-uploaded
3. View trends on codecov.io

### Performance Metrics

```bash
# Check test execution time
pytest --durations=10

# Frontend coverage
bun run test:coverage
# Check coverage/index.html
```

---

## 🔐 Security

### Secrets Management

Add GitHub Secrets for:
- `SLACK_WEBHOOK_URL` (optional, for notifications)
- `CODECOV_TOKEN` (optional, for coverage)

Do NOT commit:
- `.env` files
- API keys
- Credentials

### Code Review Requirements

Require code review before merge:

```yaml
# In GitHub repo settings
Branch protection rules:
  ├─ Require pull request review
  ├─ Require status checks to pass
  └─ Dismiss stale pull request approvals
```

---

## 🚀 Deployment Stages

### Stage 1: Dev (Automatic)

```
PR merged to dev
  ↓
Tests pass
  ↓
Deploy workflow triggers
  ↓
Services updated on dev
```

**Access:** Internal testing only

### Stage 2: Staging (Manual, Future)

```
Manual trigger from GitHub UI
  ↓
Run full integration tests
  ↓
Deploy to staging
```

**Access:** Beta testers

### Stage 3: Production (Manual, Future)

```
Approval required
  ↓
Run smoke tests
  ↓
Canary deployment
  ↓
Full production rollout
```

**Access:** Public

---

## 📋 Developer Checklist

Before creating a PR:

- [ ] Code passes `bun run type-check`
- [ ] Code passes `bun run lint` (or use `--fix`)
- [ ] Code passes `bun run test`
- [ ] Backend passes `pytest -v`
- [ ] New tests added for new features
- [ ] Coverage maintained (>80%)
- [ ] Commits follow convention (`feat:`, `fix:`, `docs:`)
- [ ] PR description is clear and links issue (if any)
- [ ] No secrets committed
- [ ] Docs updated if needed

---

## 🔄 Git Workflow

### Conventional Commits

Commit messages help automate changelog & versioning:

```
feat: Add new feature
fix: Fix a bug
docs: Update documentation
style: Format code
refactor: Refactor code
test: Add tests
chore: Update dependencies
```

### Branch Naming

```
feature/user-auth
fix/midi-timing
docs/readme-update
chore/update-deps
```

### Merge Strategy

```bash
# From feature branch to dev
git checkout dev
git pull origin dev
git merge --no-ff feature/name
git push origin dev

# Or use GitHub UI for auto-merge
```

---

## 📞 Support

### Common Issues

**Q: My tests pass locally but fail in CI**  
A: Ensure all dependencies are pinned in requirements-test.txt/package.json

**Q: Codecov is not uploading**  
A: Set `CODECOV_TOKEN` secret in GitHub Settings

**Q: Deploy workflow didn't run after merge**  
A: Check that all status checks passed before merge

**Q: Docker image too large**  
A: Use `.dockerignore` to exclude unnecessary files

---

## 📚 Resources

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Vitest Docs](https://vitest.dev)
- [pytest Docs](https://docs.pytest.org)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)

---

**Everything is set up and ready to go!** 🎉

To get started, create a feature branch and push your first PR to `dev`.
