# Rhythm Wolf MIDI Toolkit — Roadmap

> **Strategic Vision**: From single-device tool → open protocol for agentic musical instruments  
> See: [AGENTIC_INSTRUMENTS_VISION.md](docs/AGENTIC_INSTRUMENTS_VISION.md)

## v1.0 (Current - Released) ✅

### Phases Completed
- ✅ Phase 1-4: Foundation & Pattern Generation
- ✅ Phase 5: Device Rail & MIDI Send
- ✅ Phase 6: Library View with 15 presets
- ✅ Phase 7: Chat View with Claude AI integration
- ✅ Phase 8: Polish & Animations
- ✅ Phase 9: GitHub documentation & visuals
- ✅ Beat Tokenization System (bonus)

### Features
- ✅ 16-step sequencer with 6 drum voices
- ✅ Deterministic pattern generation (seeded LCG RNG)
- ✅ 5 music styles × 3 templates
- ✅ Real-time MIDI hardware sending
- ✅ Library with search/filter/sort
- ✅ Claude AI chat generation
- ✅ Tokenized pattern representation
- ✅ Pattern embeddings & similarity matching

---

## v1.1 (Near-term - Q1 2025)

### Experimental Features
- 🧪 **Prime Factorization + FFT/Gaussian Vectorization** — Hybrid semantic + signal processing
  - Prime factorization for semantic grounding (shared factors = musical relationship)
  - FFT for O(n log n) frequency-domain analysis (captures timing naturally)
  - Gaussian vectorization for fixed-size embeddings (avoid large numbers)
  - Use for pattern discovery, similarity matching, ML pre-training

### Improvements
- 🎯 Real-time backend connection (replace simulation)
- 🎯 Pattern history & recovery
- 🎯 Keyboard shortcuts reference
- 🎯 Mobile responsive fixes
- 🎯 Accessibility audit (WCAG 2.1)

---

## v2.0 (Mid-term - Q2 2025) — **Generalize for Any Instrument**

### 🎯 Core: Open Protocol

- 📋 **InstrumentAdapter Interface** — Standardized device abstraction
  - Abstract pattern format (device-agnostic)
  - Connect/disconnect/send/read operations
  - Device capability discovery
  
- 🧠 **AgenticInstrument Framework** — Unified AI + hardware
  - Semantic describe/fromDescription
  - Pattern mutation & interpolation
  - Claude integration (pluggable backends)
  
- 🛠️ **Developer SDK** (npm package)
  - `@agentic-instruments/adapter-kit` for hardware developers
  - `@agentic-instruments/ai-kit` for AI backend makers
  - Comprehensive documentation + examples

### 📱 Reference Implementations

- ✅ **Rhythm Wolf Adapter** (v1 ported to new interface)
- 🆕 **Volca Keys Adapter** (pitched synth proof of concept)
- 🆕 **Example Local LLM Backend** (Ollama integration)

### 🌐 Community Infrastructure

- 📦 **GitHub Organization**: `agentic-instruments`
- 📚 **Documentation**: Adapter dev guide (60min), API reference
- 🏪 **Registry Website**: Discover adapters & AI backends
- 💬 **Developer Community**: Discord/forum launch

---

## v3.0 (Long-term - Q3+ 2025) — **Ecosystem Maturity**

### 🌍 Network Effects

- 👥 **Community Adapters** (10+ for Volca, Elektron, Nord, OP-Z, etc.)
- 🤖 **Alternative AI Backends** (Claude, local LLM, Music LM, fine-tuned models)
- 📚 **Pattern Sharing** (global library, remix chains, collaborations)
- 🏆 **Leaderboard** (most-used adapters, trending patterns, top contributors)

### 🎓 Adoption & Partnerships

- 🏫 **Education**: University partnerships, music tech curricula
- 🏢 **Enterprise**: Studio fleet management, licensing
- 🎹 **Hardware OEMs**: "Agentic Instruments Ready" badge program
- 🔬 **Research**: ML training on semantic music patterns

### 🎵 Advanced Features

- 🎚️ **Full Track Composition** (drums + synth + bass patterns coordinated)
- 🎵 **Cross-device Sync** (patterns orchestrated across multiple instruments)
- 🎞️ **Arrangement Automation** (AI suggests song structure)
- 🎙️ **Audio-Reactive Generation** (patterns respond to audio input)
- 📤 **DAW Export** (Ableton, Logic, Reaper via OSC/MIDI)

---

## Experimental Backlog 🧪

### Research-stage Ideas
- **Quantum-inspired randomness** — Use QAOA for pattern generation
- **Neurosymbolic patterns** — Neural nets + symbolic music theory
- **Temporal autoencoders** — Learn latent pattern spaces
- **Audio synthesis** — Generate drum sounds from patterns
- **Haptic feedback** — Controller vibration on beat hits
- **AR visualization** — See patterns in 3D space

---

## Technical Debt & Maintenance

### Current
- [ ] Integration tests for MIDI sending
- [ ] E2E tests for full workflows
- [ ] Performance profiling (pattern generation speed)
- [ ] Error boundary UI improvements
- [ ] Stale pattern library sync

### Post-v1.0
- [ ] Migrate from Zustand to context (if scaling)
- [ ] Add observability/analytics
- [ ] Implement pattern caching layer
- [ ] Database migration strategy
- [ ] API rate-limiting & throttling

---

## 📌 Notes

- **Prime Factorization Compression** marked as experimental — requires proof-of-concept before production
- **Real Claude API** requires production API key management & rate-limit handling
- **Hardware support** depends on rtmidi bindings for each device family
- **Community features** require backend auth & data persistence

Last updated: 2026-11-22
