# Rhythm Wolf Web UI

Modern React dashboard for generating and sending MIDI patterns to Akai Rhythm Wolf.

## 🚀 Stack

- **Runtime:** Bun (10x faster than Node)
- **Framework:** React 18 + TypeScript
- **Bundler:** Vite (lightning-fast)
- **Styling:** Tailwind CSS
- **Data Fetching:** TanStack Query (React Query)
- **State:** Zustand (optional for future)
- **API Client:** Axios

## 📋 Development

### Prerequisites

- **Bun** installed: https://bun.sh/
- **Backend running:** `docker compose up backend` or `python backend/main.py`

### Local Setup

```bash
cd frontend

# Install dependencies (Bun is fast!)
bun install

# Start dev server
bun run dev
```

The app opens at `http://localhost:5173` and auto-reloads on changes.

### Project Structure

```
frontend/
├── src/
│   ├── main.tsx              # Entry point
│   ├── App.tsx               # Root component
│   ├── index.css             # Global styles (Tailwind)
│   ├── components/
│   │   ├── PatternGenerator.tsx   # Generate controls
│   │   ├── DeviceSelector.tsx     # MIDI device picker
│   │   ├── PatternPreview.tsx     # Pattern visualization
│   │   └── PatternSender.tsx      # Send controls
│   └── lib/
│       ├── api.ts            # API client (Axios)
│       └── query.ts          # React Query config
├── index.html                # HTML entry
├── vite.config.ts            # Vite bundler config
├── tailwind.config.ts        # Tailwind theme
├── tsconfig.json             # TypeScript config
├── package.json              # Dependencies
└── Dockerfile                # Container image
```

## 🎨 Components

### PatternGenerator
- Style selector (Techno, House, Tech House, Minimal)
- Tempo slider (20–300 BPM)
- Template picker
- Include Bass option
- Generate button

### DeviceSelector
- Lists available MIDI devices
- Auto-detects Rhythm Wolf
- Polls every 2 seconds for new devices

### PatternPreview
- Displays pattern metadata
- Shows drums breakdown by sound
- Velocity visualization (soft/medium/accent)
- Event count

### PatternSender
- Guides user through Record Performance mode
- Two-step send: "Prepare" → "Send"
- Status updates (idle → ready → sending → success)
- Instructions for saving on device

## 🔌 API Integration

The frontend communicates with FastAPI backend at `http://localhost:8000/api/v1`:

```
POST   /patterns/generate    → Generate pattern
POST   /patterns/send        → Send to device
GET    /devices              → List MIDI devices
GET    /info/styles          → Styles metadata
GET    /info/templates       → Templates metadata
GET    /info/mappings        → MIDI note mappings
```

See [backend/main.py](../backend/main.py) for details.

## 📦 Build & Deploy

### Development

```bash
bun run dev
```

### Production Build

```bash
bun run build
```

Output: `dist/` (served by backend at `/`)

### Docker

```bash
# Build & run with backend
docker compose up

# Just frontend
docker compose up frontend
```

## 🧪 Testing

```bash
# Type checking
bun run type-check

# Linting (configure in .eslintrc)
bun run lint
```

## 🚀 Performance Tips

- Bun is **~10x faster** than Node.js for installs and builds
- Vite enables instant HMR (hot module reload)
- TanStack Query handles caching, deduplication, refetching
- Tailwind purges unused CSS in production

## 🔮 Future Features

- [ ] Pattern editor (drag-drop grid)
- [ ] Save/load pattern presets
- [ ] Live BPM tap detection
- [ ] Swing/humanization controls
- [ ] Pattern library browsing
- [ ] WebSocket for real-time status
- [ ] Keyboard shortcuts
- [ ] Dark mode toggle

## 📚 Resources

- [React Documentation](https://react.dev)
- [Vite Guide](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [TanStack Query](https://tanstack.com/query)
- [Bun Docs](https://bun.sh/docs)
- [TypeScript](https://www.typescriptlang.org)
