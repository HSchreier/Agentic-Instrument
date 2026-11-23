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
- [ ] Design MIDI daemon (Node.js or Python?)
- [ ] WebSocket API spec (browser ↔ service)
- [ ] Device driver interface
- [ ] Error handling for USB hotplug

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

## Technical Decisions (TBD)

| Item | Option A | Option B |
|------|----------|----------|
| Backend | Node.js | Python |
| MIDI Lib | libmidi | PortAudio |
| Container Base | Ubuntu 22 | Alpine |
| Device Drivers | C/Rust | Go |
| Deployment | Docker Hub | Custom Registry |

---

## Development Plan

**Timeline:** ~3-4 weeks
- Week 1: Architecture + M1 (backend design)
- Week 2: M2 (device drivers, 2-3 devices)
- Week 3: M2 continued + M3 (containerization)
- Week 4: M4 (testing) + M5 (docs)

**Branch:** `feature/containerization` → `dev` → `main`

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

