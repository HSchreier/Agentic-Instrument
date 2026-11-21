# Web UI Architecture

Complete architecture for the React + FastAPI stack.

## 🏗️ Full Stack Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER BROWSER                                 │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  React App (Bun + Vite)                              │   │
│  │  ┌──────────────┐  ┌──────────────┐                 │   │
│  │  │  Generator   │  │   Preview    │                 │   │
│  │  └──────────────┘  └──────────────┘                 │   │
│  │  ┌──────────────┐  ┌──────────────┐                 │   │
│  │  │   Devices    │  │    Sender    │                 │   │
│  │  └──────────────┘  └──────────────┘                 │   │
│  └────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                            ↕
              HTTP + JSON (Axios client)
                            ↕
┌─────────────────────────────────────────────────────────────────┐
│              FastAPI Backend (Python)                           │
│                                                                 │
│  ┌──────────────────────────────────────────────────────┐     │
│  │ Routes:                                              │     │
│  │  POST   /api/v1/patterns/generate                   │     │
│  │  POST   /api/v1/patterns/send                       │     │
│  │  GET    /api/v1/devices                             │     │
│  │  GET    /api/v1/info/*                              │     │
│  └──────────────────────────────────────────────────────┘     │
│                            ↓                                   │
│  ┌──────────────────────────────────────────────────────┐     │
│  │  Python Logic                                        │     │
│  │  ├── rhythm_wolf/generator.py    (pattern creation) │     │
│  │  ├── rhythm_wolf/sender.py       (MIDI output)      │     │
│  │  └── rhythm_wolf/mappings.py     (constants)        │     │
│  └──────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
                            ↓
                        mido + python-rtmidi
                            ↓
                    macOS/Linux MIDI subsystem
                            ↓
                      USB MIDI Cable
                            ↓
                    Akai Rhythm Wolf Device
```

## 📁 File Structure

```
midi-playground/
├── frontend/                  # React + Vite + Bun
│   ├── package.json          # Bun dependencies
│   ├── vite.config.ts        # Bundler config
│   ├── tsconfig.json         # TypeScript
│   ├── tailwind.config.ts    # Tailwind theme
│   ├── Dockerfile            # Bun + Node
│   ├── README.md
│   └── src/
│       ├── main.tsx          # React entry
│       ├── App.tsx           # Root component
│       ├── index.css         # Tailwind styles
│       ├── components/
│       │   ├── PatternGenerator.tsx
│       │   ├── DeviceSelector.tsx
│       │   ├── PatternPreview.tsx
│       │   └── PatternSender.tsx
│       └── lib/
│           ├── api.ts        # Axios client
│           └── query.ts      # React Query
│
├── backend/                   # FastAPI
│   ├── main.py              # API server
│   ├── requirements.txt      # Python deps
│   ├── Dockerfile           # Python 3.10
│   └── README.md
│
├── rhythm_wolf/              # Core logic (Python)
│   ├── generator.py
│   ├── sender.py
│   └── mappings.py
│
├── docs/                      # Documentation
│   ├── TECHNICAL.md
│   ├── API.yml
│   ├── DEVELOPMENT.md
│   └── SCHEMA.md
│
├── cli.py                     # CLI entry (original)
├── Dockerfile                # CLI container
├── docker-compose.yml         # Orchestration
├── README.md                  # User docs
└── Makefile                   # Shortcuts
```

## 🚀 Deployment Scenarios

### Scenario 1: Local Development (Recommended for now)

```bash
# Terminal 1: Frontend (HMR hot reload)
cd frontend
bun install
bun run dev        # → http://localhost:5173

# Terminal 2: Backend (Python dev server)
cd backend
pip install -r requirements.txt
python main.py     # → http://localhost:8000
```

### Scenario 2: Docker Compose (Containerized)

```bash
docker compose up

# Services:
#   frontend:  http://localhost:5173  (Bun dev server)
#   backend:   http://localhost:8000  (FastAPI)
```

Access: `http://localhost:5173`

### Scenario 3: Production Build

```bash
# Build frontend
cd frontend
bun run build      # → dist/

# Start backend (serves frontend at /)
python backend/main.py
```

Access: `http://localhost:8000`

### Scenario 4: Kubernetes Deployment (Future)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: rhythm-wolf
spec:
  replicas: 2
  template:
    spec:
      containers:
        - name: backend
          image: rhythm-wolf:backend
          ports:
            - containerPort: 8000
        - name: frontend-build
          image: rhythm-wolf:frontend
          command: ["bun", "run", "build"]
```

## 📊 Data Flow: User Interaction

```
User clicks "Generate Pattern"
    ↓
React state updates (style, tempo, template)
    ↓
PatternGenerator calls: generatePattern(style, tempo, ...)
    ↓
Axios POST /api/v1/patterns/generate
    ↓
FastAPI endpoint receives request
    ↓
Calls rhythm_wolf/generator.py
    ↓
Returns Pattern JSON with MIDI events
    ↓
React receives response, updates state
    ↓
PatternPreview renders visualization
    ↓
User clicks "Prepare to Send" on PatternSender
    ↓
On device: User enters Record Performance mode
    ↓
User clicks "Send Now" in browser
    ↓
Axios POST /api/v1/patterns/send
    ↓
FastAPI connects to MIDI device via mido
    ↓
Sends MIDI events in real-time
    ↓
Device quantizes and records pattern
    ↓
UI shows success message
    ↓
User saves on device: SHIFT + Step 16
```

## 🔄 Component Communication

```
App (Root)
├── state: pattern, selectedDevice, isSending
│
├── PatternGenerator
│   └── onGenerate(pattern) → App updates state
│
├── DeviceSelector
│   └── onSelect(device) → App updates state
│
├── PatternPreview
│   ├── receives: pattern
│   └── displays: metadata, drum breakdown
│
└── PatternSender
    ├── receives: pattern, device, isLoading, onStatusChange
    └── onStatusChange(loading) → App updates state
```

## 🎯 Technology Choices

### Frontend

| Choice | Why | Trade-off |
|--------|-----|-----------|
| **Bun** | 10x faster than Node, TypeScript native | Newer ecosystem |
| **React** | Component-based, large ecosystem | Virtual DOM overhead |
| **TypeScript** | Type safety, better IDE | Build step required |
| **Vite** | Fast HMR, ES6 modules | Less mature than Webpack |
| **Tailwind** | Utility-first, small bundle | Not semantic HTML |
| **TanStack Query** | Caching, deduplication, refetching | More dependencies |

### Backend

| Choice | Why | Trade-off |
|--------|-----|-----------|
| **FastAPI** | Auto OpenAPI docs, async, fast | Heavyweight vs Flask |
| **CORS middleware** | Allows frontend requests | Security consideration |
| **Static files** | Serves compiled React | Need to rebuild for changes |

## 🔐 Security

- ✅ No secrets in frontend (API calls only)
- ✅ MIDI device list is local discovery
- ✅ No authentication (single-user device)
- ⚠️ Future: Add auth if multi-user remote access

## 📈 Performance Metrics

| Metric | Frontend | Backend |
|--------|----------|---------|
| **Startup** | ~500ms | ~1s |
| **Dev build** | ~50ms (Vite HMR) | N/A |
| **Prod build** | ~2s | N/A |
| **API latency** | 10–50ms | 10–50ms |
| **MIDI send time** | - | 2.5s (128 BPM, 24 events) |

## 🚦 State Management

**Current:** React hooks + TanStack Query  
**Future options:** Zustand, Jotai, Redux (if needed)

For now, App.tsx manages:
- `pattern` — current generated pattern
- `selectedDevice` — chosen MIDI device
- `isSending` — API request in-flight

## 🧪 Testing Strategy

**Frontend:**
- Vitest + React Testing Library
- Component tests (mocking API calls)
- E2E tests (Playwright/Cypress)

**Backend:**
- pytest + FastAPI TestClient
- API endpoint tests
- Integration tests with mocked MIDI

## 📚 Documentation

- `/frontend/README.md` — Frontend dev guide
- `/backend/main.py` — FastAPI routes + docstrings
- `/docs/TECHNICAL.md` — Architecture overview
- `/docs/API.yml` — OpenAPI specification

## 🔮 Future Enhancements

- [ ] Real-time WebSocket updates
- [ ] Pattern editor grid UI
- [ ] Save/load preset library
- [ ] Live playback visualization
- [ ] Keyboard shortcuts
- [ ] Dark mode toggle
- [ ] Responsive mobile UI
- [ ] Export patterns as MIDI files
- [ ] Import MIDI patterns
- [ ] Undo/redo stack

---

**Current Status:** ✅ MVP complete (generate, preview, send)  
**Next:** Test with actual Rhythm Wolf hardware
