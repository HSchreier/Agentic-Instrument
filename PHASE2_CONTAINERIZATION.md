# 🐳 Phase 2: Containerized Agentic Instrument

**Status:** Planning (v2.1.0-container)
**Base:** v2.0.0-web (tagged, stable)

---

## Vision

Move from browser-only Web MIDI to containerized native MIDI solution for:
- ✅ Direct hardware USB access (bypass browser limitations)
- ✅ Heavy MIDI packet handling (no memory leaks)
- ✅ Global Mac/Windows/Linux compatibility
- ✅ Pre-compiled device drivers
- ✅ Offline-first operation
- ✅ Production-grade reliability

---

## Architecture

```
Agentic Instrument v2.1 Container
├── Dockerfile (multi-stage build)
├── Frontend
│   └── React web app (same as v2.0)
├── Backend MIDI Service (NEW)
│   ├── Node.js/Python server
│   ├── WebSocket API
│   └── Hardware Layer
│       ├── libmidi bindings
│       └── Device Drivers (compiled)
│           ├── RhythmWolf.so/.dll
│           ├── Elektron.so/.dll
│           ├── Roland.so/.dll
│           ├── OP-Z.so/.dll
│           ├── Volca.so/.dll
│           ├── Maschine.so/.dll
│           └── Generic.so/.dll
└── docker-compose.yml
```

---

## Phase 2 Milestones

### M1: Backend Service Architecture
- [x] Design MIDI daemon (**Python + Flask**, see `backend/main.py`)
- [x] WebSocket API spec (see `WEBSOCKET_API.md` — browser ↔ service via SocketIO)
- [x] Device driver interface (see `backend/device_adapter.py` — abstract base + adapters)
- [x] Error handling for USB hotplug (TODO: implement in M2)

### M2: Native Device Drivers
- [ ] Rhythm Wolf driver (libmidi)
- [ ] Elektron driver
- [ ] Roland driver
- [ ] OP-Z driver
- [ ] Volca driver
- [ ] Maschine driver
- [ ] Generic MIDI fallback

### M3: Containerization
- [ ] Dockerfile (Ubuntu base)
- [ ] Multi-platform builds (amd64, arm64)
- [ ] Docker Compose setup
- [ ] Volume mounts for USB
- [ ] Network config (localhost:3000 + :8081)

### M4: Testing & Validation
- [ ] Test on macOS (Intel + Apple Silicon)
- [ ] Test on Windows (10, 11)
- [ ] Test on Linux (Ubuntu, Debian)
- [ ] Heavy MIDI packet testing
- [ ] All 7 device types on real hardware

### M5: Distribution & Docs
- [ ] Docker Hub publication
- [ ] Installation guide (docker pull + run)
- [ ] Troubleshooting guide
- [ ] Update README with Phase 2 info

---

## Technical Decisions (DECIDED)

| Item | Decision | Reasoning |
|------|----------|-----------|
| Backend | **Python + Flask** | Robust async handling, good MIDI libs (pyserial, mido), easy debugging |
| MIDI Lib | **pyserial + pyaudio** | Python standard, no compile step needed in container |
| Container Base | **Ubuntu 22** | Full ALSA support, broader hardware compatibility than Alpine |
| Device Drivers | **Python bindings** | Phase 2 MVP: use python-midi libs; Phase 3: native C/Rust if needed |
| Deployment | **Docker Hub** | Public registry, easy one-line install for DJs |
| WebSocket | **Flask-SocketIO** | Real-time async events, browser-native JS support |

---

## Development Plan

**Timeline:** ~3-4 weeks
- **Week 1: Architecture + M1** ✅ (backend design DONE)
  - Flask app scaffold: `backend/main.py`
  - WebSocket API spec: `WEBSOCKET_API.md`
  - Device adapter interface: `backend/device_adapter.py`
  - Dockerfiles for multi-stage build
- **Week 2: M2** (device drivers, 2-3 devices)
  - Rhythm Wolf driver (libmidi binding)
  - Generic MIDI fallback
  - Test with real hardware
- **Week 3: M2 continued + M3** (containerization)
  - Roland TR-8S, Elektron drivers
  - Multi-platform Docker builds (amd64, arm64)
  - docker-compose for Mac/Windows/Linux
- **Week 4: M4 + M5** (testing + docs)
  - Heavy MIDI traffic testing (1000+ events/sec)
  - Update README, INSTALL.md, HARDWARE_SETUP.md
  - Docker Hub release

**Branch:** `feature/containerization` → `dev` → `main`

**Files Created This Session:**
- `backend/.python-version` (Python 3.11)
- `backend/main.py` (Flask health checks + API)
- `backend/requirements.txt` (Flask, SocketIO, pyserial)
- `backend/requirements-test.txt` (pytest, flake8)
- `backend/tests/test_api.py` (4 health/device tests)
- `backend/device_adapter.py` (DeviceAdapter base class + RhythmWolf, Generic)
- `backend/Dockerfile` (Python 3.11-slim)
- `frontend/Dockerfile` (Node 22 multi-stage)
- `Dockerfile` (Combined backend + frontend)
- `docker-compose.yml` (3 services: combined, backend solo, frontend solo)
- `WEBSOCKET_API.md` (Full WebSocket API spec + error codes)

---

## Impact on v2.0 (Web-Only)

✅ **No impact** — v2.0.0-web remains stable
- Current DJs can keep using web version
- Phase 2 is parallel track, not replacement
- Can coexist: web for testing, container for production

---

## Success Criteria

- [ ] Container runs on Mac/Windows/Linux
- [ ] All 7 devices auto-detected via native drivers
- [ ] Heavy MIDI traffic handled (1000+ events/sec)
- [ ] Zero memory leaks under load
- [ ] One-line installation: `docker run agentic-instrument`
- [ ] Real hardware tested (not just simulators)

---

## Open Questions

1. Backend language: Node.js or Python?
2. Which device to driver first (complexity priority)?
3. How to handle USB permissions in Docker?
4. Cloud deployment: Docker Hub or private registry?
5. Version numbering: 2.1.0 or 3.0.0?

---

## Next Steps

1. ✅ Tag v2.0.0-web (current stable)
2. Create `feature/containerization` branch
3. Decide: Node.js vs Python backend
4. Design MIDI daemon architecture
5. Start M1 (backend design)

**Ready to begin Phase 2!** 🚀

