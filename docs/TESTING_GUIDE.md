# Testing Strategy & Guide

Complete guide to testing the Rhythm Wolf MIDI application locally and in GitHub Actions.

## 🎯 Testing Philosophy

**Graceful Degradation:** Tests pass whether or not optional dependencies are available.
- Core features (pattern generation) always tested
- Optional features (Claude chat) tested conditionally
- No hard failures on missing API keys or packages

---

## 📋 Test Levels

### Level 1: Local Pre-Push Validation
**Run before every push:**
```bash
bash scripts/validate-all.sh
```

Checks:
- ✅ Git working tree clean
- ✅ TypeScript type checking
- ✅ ESLint linting
- ✅ Python syntax
- ✅ File structure
- ✅ Dependencies

### Level 2: Local Unit Tests

**Frontend:**
```bash
cd frontend
bun run test              # Run Vitest
bun run test:coverage     # With coverage
bun run type-check        # Type checking
bun run lint              # ESLint
```

**Backend:**
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-test.txt
pytest -v --cov=backend  # Run pytest
```

### Level 3: GitHub Actions CI/CD

Automatically runs on every push to `dev` or `main`:

**Frontend Job:**
- Setup Bun
- Install dependencies (frozen-lockfile)
- Type check
- Lint (non-blocking)
- Run Vitest tests
- Coverage report

**Backend Job:**
- Setup Python 3.10
- Install dependencies
- Run pytest
- Coverage report
- Flake8 linting

**Integration Job:**
- Build frontend (Vite)
- Verify backend imports
- Validate Docker files

---

## 🧪 Test Files

### Frontend Tests

**Location:** `frontend/src/__tests__/`

```
lib/api.test.ts          # API client tests
  ✅ Pattern generation
  ✅ Device listing
  ✅ Error handling
```

**Run:**
```bash
bun run test
```

### Backend Tests

**Location:** `backend/tests/`

```
test_api.py              # API endpoint tests (20+ tests)
  ✅ Health check
  ✅ Device listing
  ✅ Pattern generation
  ✅ Style/template info
  ✅ Chat endpoint (optional)
  ✅ OpenAPI docs

test_generator.py        # Pattern generator tests
  ✅ Pattern generation
  ✅ Parameter validation
```

**Run:**
```bash
pytest -v --cov=backend --cov-report=html
```

---

## 🔧 Test Scenarios

### Scenario 1: No Optional Dependencies
**When:** GitHub Actions without anthropic

```
Backend tests:
  ✅ All core endpoints pass
  ✅ Chat endpoint returns 503 (graceful fail)
  ✅ Core app works fine

Frontend tests:
  ✅ All tests pass
  ✅ Chat component loads
  ✅ Chat sends request but gets 503
```

### Scenario 2: Missing API Key
**When:** anthropic installed but ANTHROPIC_API_KEY not set

```
Chat endpoint:
  ✅ Endpoint exists
  ✅ Returns 503 "Claude API not configured"
  ✅ Doesn't crash server

Tests:
  ✅ Chat test expects 503
  ✅ All other tests pass
```

### Scenario 3: Full Stack (All Dependencies + API Key)
**When:** Local development or production

```
Chat endpoint:
  ✅ Full Claude API integration
  ✅ Pattern generation from natural language
  ✅ Real-time responses

Tests:
  ✅ Chat returns 200 with pattern
  ✅ All features work
```

---

## ✅ Expected Test Results

### GitHub Actions Status

| Step | Status | Notes |
|------|--------|-------|
| Frontend type-check | ✅ PASS | Always |
| Frontend lint | ✅ PASS | Non-blocking |
| Frontend test | ✅ PASS | Vitest runs |
| Backend pytest | ✅ PASS | Chat test graceful |
| Integration | ✅ PASS | Builds work |

### Failure Handling

**Non-blocking failures (don't stop CI):**
- Linting warnings
- Codecov upload
- Network timeouts on pip
- Optional package missing

**Blocking failures (stop CI):**
- TypeScript errors
- Syntax errors
- Core test failures
- Import errors in main modules

---

## 🚀 Before Pushing

**1. Run validation script:**
```bash
bash scripts/validate-all.sh
```

**2. Check specific concerns:**
```bash
# Frontend
cd frontend
bun run type-check
bun run test

# Backend
cd backend
pytest tests/test_api.py::TestChat -v
pytest tests/test_api.py::TestPatternGeneration -v
```

**3. Review git log:**
```bash
git log --oneline -5
git diff origin/dev
```

**4. Push when ready:**
```bash
git push origin dev
```

---

## 🔍 Debugging Failed Tests

### TypeScript Errors
```bash
cd frontend
bun run type-check
```

### ESLint Issues
```bash
bun run lint
# Fix with:
bun run lint -- --fix
```

### Vitest Failures
```bash
bun run test -- --reporter=verbose
bun run test -- --reporter=verbose path/to/test.test.ts
```

### Pytest Failures
```bash
pytest -v --tb=short
pytest tests/test_api.py::TestPatternGeneration::test_generate_pattern_success -v
pytest tests/test_api.py::TestChat -v
```

### Chat Endpoint Issues
```bash
# Check if anthropic installed
python3 -c "import anthropic; print('OK')"

# Check if API key set
echo $ANTHROPIC_API_KEY

# Test endpoint locally
curl -X POST http://localhost:8000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message":"test"}'
```

---

## 📊 Coverage Goals

**Frontend:**
- Minimum: 50% coverage
- Target: 70%+
- Focus: API client, utils

**Backend:**
- Minimum: 60% coverage
- Target: 80%+
- Focus: endpoints, generators

---

## 🎓 Learning Resources

### For Testing Skills

1. **Vitest Documentation**
   - https://vitest.dev
   - Testing React components
   - Coverage reports

2. **Pytest Documentation**
   - https://docs.pytest.org
   - FastAPI testing
   - Fixtures and mocking

3. **GitHub Actions**
   - https://docs.github.com/en/actions
   - Workflow syntax
   - Secrets management

4. **Our Project**
   - Examine `backend/tests/test_api.py` for patterns
   - Examine `frontend/src/__tests__/` for React testing
   - Study `.github/workflows/test.yml` for CI/CD

---

## 🛠️ Common Issues & Solutions

### Issue: "No module named pytest"
**Solution:**
```bash
cd backend
pip install -r requirements-test.txt
```

### Issue: "bun: command not found"
**Solution:**
```bash
curl -fsSL https://bun.sh/install | bash
export PATH="$HOME/.bun/bin:$PATH"
```

### Issue: "TypeError: Cannot find module 'anthropic'"
**Expected:** This is fine! Chat endpoint returns 503.
**Solution:** None needed - it's intentional.

### Issue: "ANTHROPIC_API_KEY not found"
**Expected:** Tests still pass.
**Solution:** Set in GitHub Secrets for production chat.

### Issue: "Network error: Failed to install packages"
**Solution:** Network-dependent, not a code issue. GitHub Actions will retry.

---

## 📝 Adding New Tests

### Add Frontend Test
```typescript
// frontend/src/__tests__/features.test.ts
import { describe, it, expect } from 'vitest'
import { someFunction } from '@/lib/api'

describe('Feature Name', () => {
  it('should do something', () => {
    const result = someFunction()
    expect(result).toBe(expected)
  })
})
```

### Add Backend Test
```python
# backend/tests/test_new_feature.py
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

class TestNewFeature:
    def test_something(self):
        response = client.post(
            "/api/v1/new-endpoint",
            json={"data": "test"}
        )
        assert response.status_code == 200
```

---

## 🚀 CI/CD Secrets (GitHub)

To enable full chat functionality in GitHub Actions:

1. **Go to:** Settings → Secrets and variables → Actions
2. **Create secret:**
   - Name: `ANTHROPIC_API_KEY`
   - Value: Your Claude API key

Then push and GitHub Actions will have full chat support!

---

**Last Updated:** 2026-11-22

