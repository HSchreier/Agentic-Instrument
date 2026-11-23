# Design Handoff: Delta Analysis & Build Plan

**From:** v1.0 (Rhythm Wolf only, tagged `v1.0-core-complete`)  
**To:** v2.0 (Agentic Instruments - multi-device, universal patterns)  
**Source:** Claude Design handoff (`Agentic Instruments.dc.html` + `reference/protocol.ts`)

---

## 1. Current State Checkpoint (v1.0)

### What We Have ✅
- **Frontend:** React 18 + TypeScript, Tailwind CSS, Vite
- **Backend:** FastAPI + python-rtmidi
- **Features:** Generate, Library, Chat, Device rail (Rhythm Wolf only)
- **Sequencer:** 6 voices × 16 steps (hardcoded to Rhythm Wolf)
- **State:** Zustand with undo/redo (max 20)
- **Documentation:** Complete (tokenization, modularity audit, design briefing)
- **Tests:** 18/18 passing (tokenizer, primeFactorization, API types)
- **Git tag:** `v1.0-core-complete` created

### Design System ✅
- Colors, typography, spacing documented
- Modernist aesthetic (zero border-radius, 2px rules, red accent)
- All components built

---

## 2. Claude Design v2.0 Proposal

### New Concept: Agentic Instruments

**Core Ideas:**
1. **Universal Pattern Format** — 8 fixed drum parts (kick, snare, clap, tom, perc, chh, ohh, bass) × 16 steps
2. **Device Adapters** — Maps universal → device-specific MIDI (channels, notes, steps)
3. **Devices Screen** (NEW) — Browse/switch between connected instruments
4. **Universal vs Device View** — Toggle between semantic (universal) and hardware (device) representation
5. **Device-specific Faceplate** — Hardware-inspired UI per device

### Pre-built Adapters
1. **Akai Rhythm Wolf** (6 voices × 16 steps, channel-based)
2. **Elektron Analog Rytm** (12 voices × 32 steps, 2 pages)
3. **Roland TR-8S** (11 voices × 16 steps, channel 10)
4. **Teenage Engineering OP-Z** (8 tracks × 64 steps, 4 pages)
5. **Korg Volca Keys** (8 note lanes, pitched, polyphonic)
6. **Generic MIDI GM** (9 voices, any MIDI port)

### Key Files
- `Agentic Instruments.dc.html` — Interactive prototype
- `reference/protocol.ts` — Typed implementation (adapters, translation, generation)
- `_ds/styles.css` — Design tokens
- `screenshots/` — Raw UI captures
- `readme-assets/` — New README images

---

## 3. Delta: v1.0 → v2.0

### Architecture Changes

| Layer | v1.0 | v2.0 | Delta |
|-------|------|------|-------|
| **Pattern Format** | 6×16 (Rhythm Wolf only) | 8×16 universal + device translation | ✅ BREAKING |
| **Sequencer Grid** | Fixed dimensions | Dynamic per device (1–12 rows, 16–64 steps) | ✅ Parameterize |
| **Device Support** | 1 (Rhythm Wolf) | 6+ via adapters | ✅ ADD |
| **Device Switching** | Not applicable | Full workflow with toast + undo clear | ✅ ADD |
| **State Management** | 100 Zustand actions | Same + device/adapter/page/view state | ✅ EXTEND |
| **Faceplate UI** | Generic 6×16 layout | Device-specific faceplates | ✅ REDESIGN |
| **Knobs/Controls** | Generic (style, tempo, template, bass) | Per-device controls (tempo knob, 2 knobs/voice) | ✅ REDESIGN |

### Component Changes

| Component | v1.0 | v2.0 | Delta |
|-----------|------|------|-------|
| **Header** | Tabs (Generate, Library, Chat) | Tabs + **DEVICES** (new) + device status LED | ✅ ADD |
| **Sequencer Grid** | 6×16 hardcoded | M × N dynamic with alternating group colors | ✅ REWRITE |
| **Voice Labels** | 6 fixed (BD, SD, PC, OH, CH, BS) | Variable count + universal vs device labels | ✅ REWRITE |
| **Faceplate** | Generic layout | Device-specific strip (synth sections for pitched) | ✅ REWRITE |
| **Control Strip** | Style/Tempo/Template/Bass | Same + per-device controls (Knob1, Knob2, MUTE) | ✅ EXTEND |
| **Device Rail** | MIDI port selector, send button | INSTRUMENT block + LOADED PATTERN block | ✅ REDESIGN |
| **Devices Screen** | N/A | NEW: Grid of instrument cards, filters, detect | ✅ ADD |
| **Library** | 15 universal patterns | Same, with device-specific metadata | ✅ EXTEND |
| **Chat** | Claude replies with patterns | Same + device mapping info in replies | ✅ EXTEND |

### Data Model Changes

#### Current (v1.0)
```typescript
// Pattern
{ metadata: { style, tempo, num_events }, events: MidiEvent[] }

// State
{ pattern, style, bpm, seed, ... }
```

#### New (v2.0)
```typescript
// Universal pattern (always 8×16)
export type UniversalPattern = number[][]; // [8][16]

// Device pattern (variable dimensions)
export type DevicePattern = number[][];    // [voices.length][steps]

// Adapter definition
interface Adapter {
  id, name, short, maker, kind, pitched
  steps: 16 | 32 | 64
  channel: string
  voices: AdapterVoice[]  // name, code, parts[], note?
  knobs?, strips?, caps
}

// State additions
{
  deviceId, selectedDevice: Adapter
  view: 'universal' | 'device'
  page: number
  knobs: Record<`${dev}:${strip}:${knob}`, 0–100>
  muted: Record<`${dev}:${voice}`, bool>
  detected: Record<deviceId, bool>
  scanning: bool
}
```

### UI Layout Changes

#### v1.0 Layout
```
Header (Tabs)
├── Main (3-column desktop / flex tablet)
│   ├── Controls column (300px)
│   ├── Sequencer grid (flex)
│   └── Device rail (320px)
└── Responsive
```

#### v2.0 Layout (Enhanced)
```
Header (Tabs + DEVICES screen + status LED)
├── Devices (NEW screen with filters, cards, detect)
├── Main (unchanged, but content differs)
│   ├── Controls (style, tempo, template, + per-device knobs)
│   ├── Faceplate (device-specific strip + sequencer)
│   └── Device rail (INSTRUMENT block + LOADED PATTERN)
└── Responsive (same breakpoints)
```

---

## 4. Feasibility Assessment

### Green Lights ✅
1. **Architecture is sound** — Protocol.ts is typed and reference-ready
2. **React component structure** — Can be adapted incrementally
3. **Tailwind CSS** — Design system provided, no custom CSS needed
4. **Zustand** — State management can be extended (not rewritten)
5. **FastAPI backend** — Pattern generation logic stays the same (backend)
6. **Tests** — Can migrate to universal format incrementally
7. **Git history** — v1.0 tagged, v2.0 can build on top

### Challenges ⚠️
1. **Breaking change:** 6×16 patterns → 8×16 universal + device translation
   - **Mitigation:** Migration script for existing patterns
   - **Impact:** Library presets need conversion
   
2. **Multiple pages:** OP-Z (64 steps = 4 pages), Rytm (32 steps = 2 pages)
   - **Mitigation:** PAGE buttons, playhead follows
   - **Impact:** Sequencer UI needs pagination logic
   
3. **Pitched adapters:** Volca Keys uses note lanes, not drum voices
   - **Mitigation:** Completely different rendering path (`adapter.pitched`)
   - **Impact:** 2 rendering modes (Drum vs Pitched)
   
4. **Real MIDI maps:** Prototype uses placeholder knob labels
   - **Mitigation:** Fetch from device MIDI implementation charts
   - **Impact:** Research needed per device
   
5. **Web MIDI detection:** Prototype uses `startDevice`, `deviceState`
   - **Mitigation:** Implement `requestMIDIAccess()` with port matching
   - **Impact:** Web MIDI API learning curve

### Risk Assessment: **MEDIUM** ⚠️
- **High confidence in design** (Claude Design has prototyped every screen)
- **Medium risk in migration** (breaking change, but clear path)
- **Low risk in components** (React + Tailwind + Zustand are standard)

---

## 5. Build Plan: 3-Phase Approach

### Phase 1: Foundation (Week 1-2)
**Goal:** Set up data model, adapters, and translation logic

#### Tasks
- [ ] Copy `protocol.ts` reference → `frontend/src/lib/adapters/protocol.ts`
- [ ] Create adapter definitions (ADAPTERS constant with all 6 devices)
- [ ] Create translation functions (toUniversal, toDevice, translate)
- [ ] Create Zustand store extensions (deviceId, view, page, knobs, muted, detected)
- [ ] Create migration script: 6×16 Rhythm Wolf patterns → 8×16 universal
- [ ] Migrate library presets (15 patterns converted)
- [ ] Add tests for translation (toUniversal, toDevice round-trip)

**Files to create:**
```
frontend/src/
├── lib/
│   ├── adapters/
│   │   ├── types.ts (Adapter, AdapterVoice, UniversalPattern, DevicePattern)
│   │   ├── protocol.ts (ADAPTERS, isMapped, primaryVoice, toUniversal, toDevice, translate)
│   │   └── migration.ts (convertRhythmWolfTo8x8, etc.)
│   └── ...
├── state/
│   └── store.ts (extended with device state)
└── ...
```

**Deliverable:** Adapters + translation layer, tests passing, existing patterns migrated

---

### Phase 2: UI Refactor (Week 2-3)
**Goal:** Implement v2.0 screens and device-aware components

#### Tasks
- [ ] **Header:** Add "DEVICES" tab, status LED, device name + adapter indicator
- [ ] **Devices Screen:** Grid of instrument cards, filters (All/Drum/Pitched/Detected), status badges
- [ ] **Generate Screen:** Refactor controls for per-device knobs, faceplate with device-specific strip
- [ ] **Sequencer Grid:** Parameterize (dynamic grid `--steps` × `--voices`), alternating group colors, pagination (PAGE buttons)
- [ ] **Voice Labels:** Dynamic from `adapter.voices`, show universal sub-labels in UNIVERSAL view
- [ ] **Faceplate:** Render device-specific strips (drum vs pitched), knob labels from adapter
- [ ] **Device Rail:** Extend with device selector, capability display, port list
- [ ] **Library:** Add device filter, show universal 8×8 mini-grid, device mapping info
- [ ] **Chat:** Add device context in replies, device-aware prompts

**Component updates:**
```
frontend/src/components/
├── ui/ (new: DeviceCard, UniversalMap chip grid)
├── hw/ (update: SequencerGrid, Faceplate, MiniGrid)
├── app/
│   ├── DevicesScreen.tsx (NEW)
│   ├── GenerateView.tsx (refactor for multi-device)
│   └── ...
└── ...
```

**Deliverable:** All screens implemented, responsive layout (desktop + tablet), no functional logic yet

---

### Phase 3: Integration & Polish (Week 3-4)
**Goal:** Connect everything, add device switching, Web MIDI, error handling

#### Tasks
- [ ] **Device switching:** 
  - Implement `switchDevice()` action: convert universal pattern, clear undo, show toast
  - Disable VIEW toggle for pitched adapters
  - Reset page to 0
  
- [ ] **Web MIDI integration:**
  - Implement `requestMIDIAccess()` with error handling
  - Port matching by adapter.portName
  - Detect device on mount + 1.2s scan on refresh
  - Display detected devices in Devices screen + main LED
  
- [ ] **Device control:**
  - Tempo knob 270° sweep (−135° to +135°), arrow keys
  - Per-device knobs (store keys: `${deviceId}:${strip}:${knob}`)
  - MUTE per voice (store keys: `${deviceId}:${voice}`)
  - PAGE buttons for multi-page devices
  - Playhead animation through adapter.steps
  
- [ ] **Send logic:**
  - Convert universal pattern → device pattern on send
  - Respect page offset for multi-page devices
  - Calculate MIDI events per adapter.voices
  - Send on device's channel (adapter.channel) with knob CC values
  
- [ ] **Error handling:**
  - Device disconnected mid-send
  - Port mismatch (wrong USB port selected)
  - Invalid MIDI output
  - Toast notifications for all states
  
- [ ] **Undo/redo:**
  - Clear undo stack on device switch
  - Persist device context in undo entry
  
- [ ] **Tests:**
  - Adapter switching (round-trip fidelity)
  - Page offset calculations
  - Web MIDI port matching
  - Error scenarios

**Deliverable:** Fully functional v2.0, all devices working, Web MIDI connected, production-ready

---

## 6. Implementation Checklist

### Phase 1: Foundation
- [ ] Adapter definitions (all 6 devices)
- [ ] Translation logic (toUniversal, toDevice, translate)
- [ ] Pattern migration (6×16 → 8×16)
- [ ] Zustand extensions (deviceId, view, page, knobs, muted, detected, scanning)
- [ ] Tests (translation round-trip)
- [ ] Library presets converted

### Phase 2: UI
- [ ] Header: DEVICES tab + status LED + adapter name
- [ ] Devices screen: grid + filters + cards + status badges
- [ ] Generate screen: controls layout + faceplate refactor
- [ ] Sequencer Grid: dynamic sizing + pagination + group colors
- [ ] Voice labels: dynamic rendering
- [ ] Faceplate: device-specific strips (drum vs pitched)
- [ ] Device rail: port selector + capability display
- [ ] Library: device filter + universal mini-grid
- [ ] Chat: device context + prompts

### Phase 3: Integration
- [ ] Device switching (convert + toast + clear undo)
- [ ] Web MIDI (`requestMIDIAccess()` + port matching)
- [ ] Device detection (scan on refresh, display in UI)
- [ ] Tempo knob (270° sweep, keyboard)
- [ ] Per-device knobs (store + UI)
- [ ] MUTE buttons
- [ ] PAGE buttons (multi-page devices)
- [ ] Playhead animation
- [ ] Send logic (convert → device pattern → MIDI events)
- [ ] Error handling (toasts, disabled states)
- [ ] Undo/redo context
- [ ] Tests (all scenarios)

---

## 7. README Updates

### New Sections Needed
1. **Multi-Device Support** — Feature highlight
2. **Universal Pattern Format** — Explain 8-part standard
3. **Adapters** — List built-in devices + community mechanism
4. **Device Selection** — How to switch devices
5. **GitHub Issues** — Link to open items (Real MIDI maps, Pitched generation, Adapter install)

### New Assets (from Claude Design)
```
docs/
├── banner.png               (hero image: 2560×840)
├── generate.png             (feature tile: 1280×720)
├── library.png              (feature tile: 1280×720)
├── chat.png                 (feature tile: 1280×720)
├── devices.png              (feature tile: 1280×720)
├── flow.png                 (workflow diagram: 2560×440)
├── showcase-*.jpg           (device-specific screenshots, ~1600px)
└── social-preview.png       (OG image: 1280×640)
```

### README Structure
```markdown
# Agentic Instruments

[Banner image]

## Generate AI Drum Patterns · Send to Any Instrument

### Features
- 🧠 Natural language pattern generation with Claude
- 🎛️ Universal 8-part drum format
- 🔌 Multi-device adapters (Rhythm Wolf, Elektron, Roland, Teenage Engineering, Korg, GM)
- 🔄 Switch devices seamlessly
- 📚 Preset library
- 💬 Chat interface

### Supported Devices
[Table: device, adapter type, steps, voices, source]

### Getting Started
[Installation, quick start]

### Design System
[Modernist aesthetic, design tokens]

### Architecture
[Adapters, translation, universal patterns, tokenization]

### Roadmap
[v2.0 complete, v3.0 community registry, etc.]
```

---

## 8. Approval Checkpoint

### Before Phase 1 Starts, Please Confirm:

**✅ Confirm Scope**
- [ ] Proceed with Phase 1 (foundation: adapters + translation)?
- [ ] All 6 adapters in-scope, or prioritize a subset (e.g., Rhythm Wolf + Rytm first)?

**✅ Confirm Timeline**
- [ ] 3 weeks realistic for your team, or adjust?
- [ ] Any availability constraints or dependencies?

**✅ Confirm Tech Decisions**
- [ ] Use Claude Design's `protocol.ts` as-is, or modifications needed?
- [ ] Web MIDI API for device detection, or alternative?
- [ ] Keep Zustand, or migrate state management?

**✅ Confirm Dependencies**
- [ ] FastAPI backend ready for multi-device (sending on different channels)?
- [ ] Design assets in `readme-assets/` can be used as-is in README?
- [ ] Any blocking items from other teams?

---

## 9. Risk Mitigation

### Breaking Change (8×16 universal)
**Risk:** Existing Rhythm Wolf patterns become incompatible  
**Mitigation:** 
- Run migration script automatically on first load
- Keep v1.0 tag for rollback if needed
- Test migration round-trip thoroughly

### Multi-page Support (Rytm, OP-Z)
**Risk:** PAGE logic is new, pagination could have off-by-one errors  
**Mitigation:**
- Comprehensive tests for page offset calculations
- Prototype each multi-page device thoroughly
- Playhead should follow across pages

### Web MIDI Detection
**Risk:** Port matching might fail on different OS/drivers  
**Mitigation:**
- Fuzzy port name matching (substring search)
- Manual port selection fallback
- Test on Windows, macOS, Linux

### Pitched Adapters (Volca Keys)
**Risk:** Melody generation heuristic is too simplistic (pentatonic hard-coded)  
**Mitigation:**
- Keep heuristic for now (acceptable placeholder)
- Document as "Open item" for future music generation
- Disable for user editing (read-only or disabled state)

---

## 10. Next Steps

**If approved:**
1. ✅ Set v1.0 tag (done)
2. ✅ Create build plan (this document)
3. 👉 **Get approval** (waiting on you)
4. Create Phase 1 tasks (Jira/Linear tickets)
5. Start Phase 1: Foundation

**Timeline:**
- Week 1: Phase 1 (foundation)
- Week 2-3: Phase 2 (UI refactor)
- Week 3-4: Phase 3 (integration)
- Soft launch: Week 4 (or later if adjustments needed)

---

## Appendix: Design Files Reference

### From Claude Design Handoff
- `Agentic Instruments.dc.html` — Interactive prototype (view: `npx serve .`)
- `reference/protocol.ts` — Typed adapter + translation logic
- `screenshots/` — Raw UI captures (1440px desktop, 1024px tablet)
- `_ds/styles.css` — Design tokens (colors, type, spacing)
- `docs/AGENTIC_INSTRUMENTS_VISION.md` — Strategic context
- `docs/DESIGN_BRIEF_v1_rhythm_wolf.md` — Original v1 brief

### Our Documentation
- `docs/MODULARITY_AUDIT.md` — Technical modularity assessment
- `docs/DESIGN_BRIEFING_MODULAR_MACHINES.md` — UI specs for modular design
- `docs/AGENTIC_INSTRUMENTS_VISION.md` — Ecosystem strategy

---

**Ready for Phase 1? Please approve and we'll begin.** 🚀

