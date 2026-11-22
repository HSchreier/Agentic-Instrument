# Rhythm Wolf MIDI Toolkit — Roadmap

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

## v2.0 (Mid-term - Q2 2025)

### Advanced AI
- 🤖 Real Claude API integration (replace simulation)
- 🤖 Multi-turn pattern refinement
- 🤖 Style transfer (convert patterns between genres)
- 🤖 Beat description → MIDI understanding via tokenizer

### ML & Analysis
- 📊 Pattern clustering using embeddings
- 📊 Recommendation engine ("you might like...")
- 📊 ML model fine-tuning on user patterns
- 📊 Fingerprint-based deduplication

### Hardware
- 🔌 Multi-device support (Volca, Elektron, etc.)
- 🔌 Parameter learning from hardware
- 🔌 Bi-directional sync (read patterns from device)

---

## v3.0 (Long-term - Q3+ 2025)

### Community
- 👥 Pattern sharing & discovery
- 👥 Remix chains (modify then share)
- 👥 Collaborative sessions
- 👥 Public pattern leaderboard

### Generative
- 🎵 Procedural variations (mutate existing patterns)
- 🎵 Cross-genre synthesis
- 🎵 Live looping with pattern sequencing
- 🎵 Audio-reactive pattern generation

### Production
- 🎚️ Full track composition (drums + synth patterns)
- 🎚️ Arrangement automation
- 🎚️ Export to DAW (Ableton, Logic, etc.)
- 🎚️ VST plugin version

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
