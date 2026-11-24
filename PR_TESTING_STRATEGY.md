# PR Testing Strategy — Agentic Instrument v2.1.0

## Overview

Automated testing on every pull request to catch bugs before merge. Uses GitHub Actions + existing test suite.

---

## Current CI/CD Pipeline

**File:** `.github/workflows/test.yml`

### Current Jobs
- ✅ **Security**: gitleaks scan (no secrets)
- ✅ **Frontend**: TypeScript, ESLint, tests, build
- ✅ **Backend**: Python tests, flake8, imports
- ✅ **Integration**: Docker files validation

### Current Status
- Runs on: `push` to dev/main, `pull_request` to dev/main
- Passes: ✅ 61 backend tests, ✅ Frontend builds

---

## Enhanced PR Testing Strategy

### **Tier 1: Automated (Always Run)**

#### 1.1 Unit Tests (Current ✅)
```yaml
- Backend: pytest (61 tests, <1 sec)
- Frontend: vitest (38 tests, <2 sec)
- Devices: 22 integration tests
- Coverage: >90% device drivers
```

#### 1.2 Type & Lint (Current ✅)
```yaml
- TypeScript: tsc --noEmit (0 errors)
- ESLint: eslint frontend/src
- Python: flake8 backend/
```

#### 1.3 Security (Current ✅)
```yaml
- gitleaks: No secrets in code
- Dependency audit: npm audit, pip audit
```

#### 1.4 Docker Build (Current ⚠️)
```yaml
- Build multi-stage Docker image
- Verify image size <1.5GB
- Scan for vulnerabilities (trivy)
```

#### 1.5 API Contract Tests (NEW)
```yaml
- REST endpoints: Health, devices, send
- WebSocket connection: Can connect
- Error responses: Correct status codes
```

---

### **Tier 2: Performance Benchmarks (Optional)**

```yaml
# Performance regression detection
- Pattern conversion: Must stay <1ms
- Memory usage: Flag if >500MB on 100 patterns
- WebSocket latency: Must stay <50ms
```

**Implementation:**
```python
# backend/tests/test_performance.py
def test_pattern_conversion_speed():
    """Pattern conversion must stay <1ms"""
    start = time.time()
    for _ in range(1000):
        toDevice(pattern, adapter)
    duration = (time.time() - start) / 1000
    assert duration < 0.001, f"Conversion too slow: {duration}ms"
```

---

### **Tier 3: Mock MIDI Testing (Medium Effort)**

**Can test without real hardware using mock mido:**

```python
# backend/tests/test_device_drivers_mock.py
import unittest.mock as mock

def test_send_pattern_to_rhythm_wolf():
    """Test RhythmWolf driver with mocked MIDI port"""
    with mock.patch('mido.open_output') as mock_port:
        driver = RhythmWolfDriver()
        driver.connect('mock_port')
        
        # Mock port tracks calls
        mock_instance = mock_port.return_value
        driver.send_pattern(pattern, velocity=100)
        
        # Verify correct MIDI messages sent
        assert mock_instance.send.call_count == 48  # 8 voices × 16 steps
        
        # Verify correct note numbers
        for call in mock_instance.send.call_args_list:
            msg = call[0][0]
            assert msg.note in [36, 38, 42, 46, 43, 50]  # Valid Rhythm Wolf notes
```

**All 8 device drivers can be mocked similarly.**

---

### **Tier 4: Real Hardware Testing (Advanced)**

**For post-merge validation or nightly builds:**

#### Option A: GitHub Actions Runners with USB Passthrough
```yaml
# .github/workflows/hardware-tests.yml
name: Hardware Integration Tests
on:
  schedule:
    - cron: '0 2 * * *'  # Nightly at 2am UTC

jobs:
  hardware-tests:
    runs-on: ubuntu-latest
    # Would need:
    # - USB MIDI device connected to runner
    # - Docker with --device /dev/snd passthrough
    # - Per-device test script
    steps:
      - name: Test Rhythm Wolf
        run: |
          docker-compose up -d
          python backend/tests/hardware/test_rhythm_wolf.py
```

#### Option B: Self-Hosted Runner
```yaml
# Runner with physical MIDI device connected
runs-on: [self-hosted, midi-device]
# Runs hardware tests only on machine with device
```

#### Option C: User Feedback Testing
```
- Release as v2.1.0-rc (release candidate)
- Invite DJ testers
- Collect feedback via GitHub Discussions
- Fix issues before v2.1.0 final
```

---

## Recommended PR Testing Pipeline

### **Phase 1: Immediate (Ready Now)**

```yaml
# .github/workflows/test.yml (ENHANCED)

jobs:
  security:
    - gitleaks scan ✅
    - npm audit ✅
    - pip audit ✅

  frontend:
    - npm install ✅
    - tsc --noEmit ✅
    - npm run lint ✅
    - npm run test -- --run ✅
    - npm run build ✅

  backend:
    - pip install -r requirements.txt ✅
    - pytest tests/ -v ✅
    - flake8 backend/ ✅

  docker:
    - docker build -t agentic-instrument:test . ✅
    - docker-compose config ✅
    - trivy scan image (NEW)

  api-contract:
    - Start container ✅
    - Test /api/health (NEW)
    - Test /api/devices (NEW)
    - Test /api/send (NEW)
    - Test WebSocket connection (NEW)

  integration:
    - Build frontend
    - Build backend
    - Verify imports
    - Verify exports
```

**Expected:** ~2-3 minutes per PR

---

### **Phase 2: Mock Testing (Medium Effort)**

Add without real hardware:

```yaml
  device-drivers-mock:
    - pytest backend/tests/test_device_drivers_mock.py -v
    - All 8 devices tested with mocks
    - Pattern transmission verified
    - Error cases validated
```

**Expected:** ~30 seconds additional

---

### **Phase 3: Performance Benchmarks (Nice to Have)**

```yaml
  performance:
    - Pattern conversion speed (<1ms check)
    - Memory baseline (note if >500MB)
    - WebSocket latency (<50ms check)
    - Report regression if detected
```

**Expected:** ~1 minute, allows regressions to be caught

---

### **Phase 4: Hardware Tests (Post-Merge)**

```yaml
# Runs nightly or on manual trigger
# Requires self-hosted runner with USB MIDI device
# Tests real device communication
```

---

## Implementation Example

### **GitHub Actions Workflow Enhancement**

```yaml
# .github/workflows/test.yml

name: Test & Lint

on:
  push:
    branches: [dev, main]
  pull_request:
    branches: [dev, main]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run gitleaks
        uses: gitleaks/gitleaks-action@v2

  backend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./backend
    strategy:
      matrix:
        python-version: ["3.11"]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v4
        with:
          python-version: ${{ matrix.python-version }}
      - name: Install dependencies
        run: |
          pip install --upgrade pip
          pip install -r requirements.txt
          pip install -r requirements-test.txt
      - name: Run tests
        run: pytest tests/ -v --cov=. --cov-report=xml
      - name: Run flake8
        run: flake8 . --count --select=E9,F63,F7,F82 --show-source
      - name: Mock device tests
        run: pytest tests/test_device_drivers_mock.py -v

  docker:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build Docker image
        run: docker build -t agentic-instrument:test .
      - name: Validate docker-compose
        run: docker-compose config > /dev/null
      - name: Scan image (trivy)
        run: |
          docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
            aquasec/trivy image agentic-instrument:test

  api-contract:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up Docker
        run: docker-compose up -d
      - name: Wait for backend
        run: |
          until curl -f http://localhost:5000/api/health; do sleep 1; done
      - name: Test /api/health
        run: |
          curl -f http://localhost:5000/api/health | grep -q "ok"
      - name: Test /api/devices
        run: |
          curl -f http://localhost:5000/api/devices | grep -q "devices"
      - name: Cleanup
        run: docker-compose down

  all-checks:
    if: always()
    needs: [security, backend, docker, api-contract]
    runs-on: ubuntu-latest
    steps:
      - name: Decide pass/fail
        run: |
          if [[ "${{ needs.security.result }}" == "success" && \
                "${{ needs.backend.result }}" == "success" && \
                "${{ needs.docker.result }}" == "success" && \
                "${{ needs.api-contract.result }}" == "success" ]]; then
            exit 0
          else
            exit 1
          fi
```

---

## Test Coverage by PR Type

| PR Type | Tests Run | Effort |
|---------|-----------|--------|
| **Backend changes** | Backend + Docker + API | 2 min |
| **Frontend changes** | Frontend + TypeScript | 1 min |
| **Device driver changes** | Backend + Mock devices | 2 min |
| **Docker/infra changes** | Docker build + compose | 1 min |
| **Security changes** | gitleaks + audits | 30 sec |
| **All changes** | Full suite | 3 min |

---

## Real Hardware Testing Strategy

### **For v2.1.0 Release Validation**

#### Option A: Self-Hosted CI Runner
```
1. Set up GitHub Actions self-hosted runner
2. Connect USB MIDI device to runner machine
3. Run nightly hardware tests
4. Report results to GitHub
5. Failure blocks merge to main
```

#### Option B: Pre-Release Beta Testing
```
1. Release v2.1.0-rc to users
2. Collect hardware test feedback via GitHub Discussions
3. Fix bugs found in real hardware
4. Release v2.1.0 final
```

#### Option C: Manual Approval Gate
```
1. Require manual testing on real device
2. Add check: "Hardware tested" before merge
3. Developer verifies locally with device
4. Marks check as approved
```

---

## Recommended Approach

**Phase 1 (NOW):** Enhance `.github/workflows/test.yml` with:
- ✅ All existing tests
- ✅ Docker build + scan (trivy)
- ✅ Mock device tests (8 devices)
- ✅ API contract tests (health, devices, send)
- **Est. time:** 2-3 minutes per PR

**Phase 2 (v2.1.0 Release):** Add:
- ⏳ Performance benchmarks
- ⏳ Beta testing period (collect real hardware feedback)
- ⏳ Fix issues from beta feedback

**Phase 3 (Future):** Consider:
- ⏳ Self-hosted runner with real MIDI device
- ⏳ Nightly hardware validation
- ⏳ Cross-platform testing (Mac/Windows/Linux CI)

---

## Implementation Timeline

| Phase | Work | Timeline |
|-------|------|----------|
| **Phase 1** | Add docker + mock + API tests to CI | 1 hour |
| **Phase 2** | Release v2.1.0-rc, gather feedback | 1-2 weeks |
| **Phase 3** | Setup self-hosted hardware runner | 1-2 weeks |

---

## Success Metrics

After implementing:

```
✅ Every PR automatically tested (61 backend + 38 frontend tests)
✅ No broken changes merge to dev
✅ Docker builds verified before merge
✅ All 8 device drivers mocked and tested
✅ API contracts validated
✅ Security scans run on every PR
✅ Performance regressions caught early
✅ Ready for real hardware testing before release
```

---

## Next Steps

**To implement Phase 1 (Ready now):**

1. Update `.github/workflows/test.yml` with enhanced jobs
2. Add `backend/tests/test_device_drivers_mock.py` (mock tests)
3. Add `backend/tests/test_api_contract.py` (API tests)
4. Run one PR with new pipeline
5. Verify all tests pass

**Timeline:** 1 hour to implement, 2-3 minutes per PR thereafter

---

**Ready to implement? Or want to adjust the strategy first?**
