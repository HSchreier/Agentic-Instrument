# Testing & CI/CD Guide

Comprehensive testing strategy and continuous integration/deployment setup.

## 📋 Test Structure

```
frontend/
├── src/__tests__/
│   ├── setup.ts                 # Test configuration
│   ├── lib/
│   │   └── api.test.ts         # API client tests
│   └── components/
│       ├── PatternGenerator.test.tsx
│       ├── DeviceSelector.test.tsx
│       └── ...

backend/
└── tests/
    ├── __init__.py
    ├── test_api.py             # FastAPI endpoint tests
    ├── test_generator.py       # Pattern generation tests
    ├── test_sender.py          # MIDI sender tests
    └── conftest.py             # Shared fixtures
```

## 🧪 Frontend Testing (Vitest + React Testing Library)

### Setup

```bash
cd frontend
bun install
```

### Running Tests

```bash
# Run all tests
bun run test

# Watch mode (auto-rerun on changes)
bun run test --watch

# UI mode (interactive browser)
bun run test:ui

# Coverage report
bun run test:coverage
```

### Test Examples

#### Unit Test: API Client

```typescript
// src/__tests__/lib/api.test.ts
import { describe, it, expect, vi } from 'vitest'
import { generatePattern } from '@/lib/api'

describe('generatePattern', () => {
  it('should send POST request', async () => {
    const result = await generatePattern({
      style: 'techno',
      tempo: 128,
    })
    expect(result.metadata.style).toBe('techno')
  })
})
```

#### Component Test: Pattern Generator

```typescript
import { render, screen, userEvent } from '@testing-library/react'
import { PatternGenerator } from '@/components/PatternGenerator'

test('generates pattern on button click', async () => {
  const onGenerate = vi.fn()
  render(<PatternGenerator onGenerate={onGenerate} />)

  const button = screen.getByRole('button', { name: /generate/i })
  await userEvent.click(button)

  expect(onGenerate).toHaveBeenCalled()
})
```

### Coverage Targets

| Component | Target |
|-----------|--------|
| Core APIs | >90% |
| Utilities | >80% |
| Components | >70% |
| Hooks | >80% |

### Best Practices

- ✅ Test user interactions, not implementation
- ✅ Mock external APIs (Axios)
- ✅ Use semantic queries (byRole, byLabelText)
- ✅ Keep tests focused and readable
- ❌ Don't test implementation details
- ❌ Avoid snapshot tests (brittle)

---

## 🐍 Backend Testing (Pytest + FastAPI)

### Setup

```bash
cd backend
pip install -r requirements-test.txt
```

### Running Tests

```bash
# Run all tests
pytest -v

# Run specific test file
pytest tests/test_api.py -v

# Run with coverage
pytest --cov=backend --cov-report=html

# Run only unit tests
pytest -m "not integration" -v

# Run with output
pytest -s -v
```

### Test Examples

#### API Endpoint Test

```python
# tests/test_api.py
def test_generate_pattern():
    """Should generate pattern successfully."""
    response = client.post(
        "/api/v1/patterns/generate",
        json={"style": "techno", "tempo": 128}
    )
    assert response.status_code == 200
    assert "metadata" in response.json()
    assert "events" in response.json()
```

#### Unit Test: Generator

```python
# tests/test_generator.py
def test_generate_pattern_returns_events():
    """Should return list of MIDI events."""
    events = generate_pattern(style="techno", tempo=128)
    assert isinstance(events, list)
    assert len(events) > 0
    
    # Verify event structure
    for channel, note, velocity in events:
        assert channel in [1, 10]
        assert 0 <= note <= 127
        assert 0 <= velocity <= 127
```

#### Parametrized Tests

```python
@pytest.mark.parametrize("style", ["techno", "house", "tech_house", "minimal"])
def test_all_styles(style):
    """All styles should generate patterns."""
    events = generate_pattern(style=style)
    assert len(events) > 0
```

### Coverage Targets

| Component | Target |
|-----------|--------|
| API routes | >90% |
| Business logic | >85% |
| Error handling | >80% |
| Utilities | >75% |

### Test Fixtures

```python
# tests/conftest.py
import pytest
from fastapi.testclient import TestClient
from backend.main import app

@pytest.fixture
def client():
    """FastAPI test client."""
    return TestClient(app)

@pytest.fixture
def valid_pattern():
    """Valid test pattern."""
    return {
        "metadata": {"style": "techno", "tempo": 128, "num_events": 24},
        "events": [...]
    }
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflows

#### 1. Test Workflow (`.github/workflows/test.yml`)

Runs on every push and PR:

```yaml
jobs:
  frontend:
    - Install dependencies
    - Type check
    - Lint
    - Run tests
    - Upload coverage
  
  backend:
    - Install dependencies
    - Run tests
    - Lint
    - Upload coverage
  
  integration:
    - Build frontend
    - Verify backend
    - Check Docker files
```

**Triggers:** `push` and `pull_request` on `dev` and `main`

#### 2. Build Workflow (`.github/workflows/build.yml`)

Builds Docker images:

```yaml
jobs:
  build-cli:
    - Build CLI container
  
  build-backend:
    - Build FastAPI container
  
  build-frontend:
    - Build React container
```

**Triggers:** Changes to Dockerfiles or docker-compose.yml

#### 3. Deploy Workflow (`.github/workflows/deploy.yml`)

Deploys to dev environment:

```yaml
jobs:
  deploy:
    - Create deployment
    - Send Slack notification
    - Verify deployment
```

**Triggers:** Successful tests on `dev` branch

### Workflow Status Checks

Before merging to `dev` or `main`, all checks must pass:

- ✅ Frontend tests
- ✅ Backend tests
- ✅ Type checking
- ✅ Linting
- ✅ Docker builds
- ✅ Integration tests

---

## 📊 Quality Metrics

### Code Coverage

Track coverage via Codecov (optional):

```bash
# Generate coverage reports
frontend: bun run test:coverage
backend: pytest --cov=backend --cov-report=xml
```

Coverage badges can be added to README.

### Test Performance

| Phase | Target Time |
|-------|-------------|
| Frontend tests | <30s |
| Backend tests | <20s |
| Docker builds | <5m |
| Full pipeline | <10m |

### Flaky Tests

If tests are flaky:

1. Mark with `@pytest.mark.flaky(reruns=3)`
2. Investigate root cause
3. Add retry logic or improve stability
4. Document in comments

---

## 🚀 Local Development Workflow

### Pre-commit Checklist

Before pushing:

```bash
# Frontend
cd frontend
bun run type-check
bun run lint
bun run test

# Backend
cd backend
pytest -v
pytest --cov

# Docker
docker compose build
```

### Git Hooks (Optional)

Install pre-commit hook:

```bash
# .git/hooks/pre-commit
#!/bin/bash
cd frontend && bun run type-check && bun run test || exit 1
cd ../backend && pytest -q || exit 1
```

---

## 📈 Improving Test Coverage

### Finding Gaps

```bash
# Generate HTML coverage report
frontend: bun run test:coverage
backend: pytest --cov=backend --cov-report=html
# Open htmlcov/index.html
```

### High-Impact Areas

1. **API Endpoints** — Critical for integration
2. **Generator Logic** — Core business logic
3. **Error Handling** — Prevents production bugs
4. **Components** — User-facing features

### Low-Impact Areas

1. **Constants** — Don't need unit tests
2. **Type definitions** — Checked by TypeScript
3. **CSS** — Manual testing is fine

---

## 🔍 Debugging Tests

### Frontend

```bash
# Run single test
bun run test -- PatternGenerator.test.tsx

# Debug mode
node --inspect-brk ./node_modules/.bin/vitest

# UI mode (interactive)
bun run test:ui
```

### Backend

```bash
# Run single test
pytest tests/test_api.py::test_generate_pattern -v

# Print debug output
pytest -s -v

# Drop into debugger
pytest --pdb
```

---

## 📚 Resources

- [Vitest Documentation](https://vitest.dev)
- [React Testing Library](https://testing-library.com/react)
- [Pytest Documentation](https://docs.pytest.org)
- [FastAPI Testing](https://fastapi.tiangolo.com/advanced/testing-dependencies/)
- [GitHub Actions](https://github.com/features/actions)

---

## ✅ Release Checklist

Before releasing to production:

- [ ] All tests pass locally and in CI
- [ ] Coverage targets met (>80%)
- [ ] No linting errors
- [ ] Docker images build successfully
- [ ] Deployment verified in dev environment
- [ ] Manual testing on hardware completed
- [ ] Documentation updated
- [ ] Changelog updated
- [ ] Version bumped (semver)
- [ ] Tag created in git

---

**Next Step:** Run tests locally and verify CI pipeline is working!
