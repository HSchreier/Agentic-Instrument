# Phase 2 M3 — Containerization Testing Plan
## Docker Multi-Platform Build & Local Testing

**Status:** In Progress  
**Base:** v2.1.0 (8 device drivers, 61 tests)  
**Target:** Containerized backend + frontend, all 8 devices

---

## M3 Milestones

### ✅ M3.1: Docker Build (In Progress)
- [ ] Build root Dockerfile (Python + Node.js multi-stage)
- [ ] Build backend/Dockerfile (Flask + mido)
- [ ] Build frontend/Dockerfile (Node 22 + Vite)
- [ ] Image size < 1.5GB (Python 3.11-slim base)
- [ ] No secrets in image (gitleaks verified)

### 🔨 M3.2: Local Container Testing (Next)
- [ ] docker-compose up --build
- [ ] Backend health check: http://localhost:5000/api/health
- [ ] Frontend dev server: http://localhost:3000
- [ ] WebSocket connection test
- [ ] Pattern send test (all 8 devices via REST)

### 📋 M3.3: Device Port Mapping
- [ ] USB device passthrough (-v /dev/bus/usb)
- [ ] ALSA device mounting (-v /dev/snd)
- [ ] MIDI port forwarding test
- [ ] Real device detection (if hardware available)

### 📊 M3.4: Performance Under Load
- [ ] Send 100 patterns sequentially
- [ ] Monitor memory (should stay < 500MB)
- [ ] Monitor CPU (should stay < 50%)
- [ ] Check for memory leaks (compare start/end)
- [ ] Measure pattern send latency (<100ms)

### 🔍 M3.5: Integration Testing
- [ ] Browser → WebSocket → Backend → MIDI driver
- [ ] Device switching (simulate port changes)
- [ ] Error handling (invalid patterns, offline devices)
- [ ] Graceful shutdown (Ctrl+C, signal handling)

### ✅ M3.6: Documentation
- [ ] Update INSTALL.md with Docker commands
- [ ] Add docker-compose.yml usage guide
- [ ] Hardware setup: USB forwarding on each OS
- [ ] Troubleshooting: common Docker issues

---

## Testing Checklist

### Docker Build
```bash
docker build -t agentic-instrument:v2.1 .
```
- [ ] Build succeeds
- [ ] No Python errors during build
- [ ] No Node.js errors during build
- [ ] Image tagged correctly
- [ ] Image size reasonable (<1.5GB)

### Local Run (docker-compose)
```bash
docker-compose up --build
```
- [ ] Backend starts on port 5000
- [ ] Frontend builds and starts on port 3000
- [ ] No port conflicts
- [ ] Logs show successful startup
- [ ] Health check passes

### REST API Tests
```bash
curl http://localhost:5000/api/health
curl http://localhost:5000/api/devices
```
- [ ] /api/health returns 200 + version
- [ ] /api/devices returns empty list (no USB devices in container)
- [ ] Response format correct

### WebSocket Connection
```
ws://localhost:5000/socket.io/?transport=websocket
```
- [ ] Browser connects successfully
- [ ] `devices_detected` event fires
- [ ] `pattern_sent` event fires on send
- [ ] Error events on failure

### Pattern Send (All 8 Devices)
```
POST http://localhost:5000/api/send
{
  "deviceId": "rhythm-wolf",
  "pattern": [[60]*16]*8,
  "velocity": 100
}
```
- [ ] rhythm-wolf → 200 OK
- [ ] elektron-rytm-mkii → 200 OK
- [ ] elektron-digitakt-2 → 200 OK
- [ ] roland-tr8s → 200 OK
- [ ] op-z → 200 OK
- [ ] volca-keys → 200 OK
- [ ] maschine-mk3 → 200 OK
- [ ] generic-midi → 200 OK

### Memory Profiling
```
docker stats agentic-instrument
```
- [ ] Initial: ~300-400MB
- [ ] After 10 sends: <450MB (no growth)
- [ ] After 100 sends: <500MB (no leak)
- [ ] CPU: <50% single-threaded

### Error Scenarios
- [ ] Send with invalid pattern → 400 Bad Request
- [ ] Send to nonexistent device → 404 Not Found
- [ ] Malformed JSON → 400 Bad Request
- [ ] WebSocket disconnect/reconnect → clean recovery
- [ ] Container restart → clean state

---

## Expected Results

### ✅ Success Criteria
- [ ] Docker build succeeds in <5 mins
- [ ] Container runs without crashes
- [ ] All 8 device drivers initialize
- [ ] REST API responds correctly
- [ ] WebSocket connection stable
- [ ] Memory stays < 500MB under load
- [ ] CPU usage <50%
- [ ] All 61 unit tests would pass if run in container

### ❌ Failure Modes to Watch
- [ ] Python mido import fails (mido not installed)
- [ ] Node dependencies missing (npm ci fails)
- [ ] Port conflicts (3000, 5000 already in use)
- [ ] USB device passthrough not working
- [ ] WebSocket connection times out
- [ ] Memory leak under heavy load

---

## Quick Test Commands

### Build
```bash
docker build -t agentic-instrument:v2.1 .
```

### Run (all services)
```bash
docker-compose up --build
```

### Run (backend only)
```bash
docker-compose up backend
```

### Run (frontend only)
```bash
docker-compose up frontend
```

### Test health
```bash
curl http://localhost:5000/api/health
```

### Test devices
```bash
curl http://localhost:5000/api/devices
```

### Send test pattern
```bash
curl -X POST http://localhost:5000/api/send \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "rhythm-wolf",
    "pattern": [[60,0,60,0,60,0,60,0,60,0,60,0,60,0,60,0]]*8,
    "velocity": 100
  }'
```

### Monitor container
```bash
docker stats agentic-instrument
```

### View logs
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Shell into container
```bash
docker-compose exec backend bash
docker-compose exec frontend bash
```

### Clean up
```bash
docker-compose down
docker rmi agentic-instrument:v2.1
```

---

## Notes

- **Multi-stage build:** Reduces final image size by not including build tools
- **Volume mounts:** USB devices need explicit passthrough on host
- **Port forwarding:** 3000 (frontend), 5000 (backend), 8081 (WebSocket proxy if needed)
- **Environment:** FLASK_ENV=development, NODE_ENV=production
- **Healthcheck:** Built into docker-compose.yml
- **Graceful shutdown:** atexit handler closes MIDI ports on SIGTERM

---

## Success Path

```
docker build ✅
  ↓
docker-compose up ✅
  ↓
curl /api/health ✅
  ↓
curl /api/devices ✅
  ↓
curl /api/send ✅
  ↓
Memory stable ✅
  ↓
M3 COMPLETE ✅
```

---

**Next:** After M3 passes, proceed to M4 (Testing & Validation) with real hardware if available.
