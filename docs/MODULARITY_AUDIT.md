# Modularity Audit: Machine Abstraction Proposal

**Request:** Make project modular for Roland, Volca, and other machines with different MIDI architectures  
**Current State:** Hardcoded for Akai Rhythm Wolf  
**Goal:** Encapsulate per-machine, loadable at runtime

---

## 1. Current Architecture Assessment

### ✅ Already Modular
- **Tokenization** (device-agnostic) ✓
- **Pattern embeddings** (device-agnostic) ✓
- **FastAPI backend** (extensible) ✓
- **React UI** (props-based) ✓

### ❌ Hardcoded to Rhythm Wolf
- **Frontend:** Assumes 6 voices × 16 steps
- **Backend:** Hardcoded MIDI channel mapping
- **Pattern format:** Fixed to Rhythm Wolf layout
- **Device detection:** Only searches for "Akai Rhythm Wolf"

---

## 2. The Roland Problem (Channel 10)

### Standard MIDI Drums
```
Channel 10 (index 9) = Percussion
  BD (Kick)        → Note 36
  SD (Snare)       → Note 38
  CH (Closed Hat)  → Note 42
  OH (Open Hat)    → Note 46
  TOM (High)       → Note 50
  Perc (Crash)     → Note 49
```

### Akai Rhythm Wolf (Current)
```
Channel 0-5 = Different voices
  Ch 0 = Kick
  Ch 1 = Snare
  Ch 2 = Perc
  Ch 3 = Open Hat
  Ch 4 = Closed Hat
  Ch 5 = Bass
```

### The Gap
Roland uses **channel 10 + note numbers**  
Rhythm Wolf uses **separate channels**

**Current code assumes Rhythm Wolf model → breaks for Roland**

---

## 3. Feasibility Assessment: HIGH ✅

### Why It's Feasible

**Foundation already exists:**
- Generic pattern representation (tokens)
- Abstraction-ready backend
- Component-based UI
- No deep hardware coupling

**What needs abstraction:**
1. Voice mapping (channel vs note)
2. Step count (16 vs 32 vs other)
3. Tempo handling (some devices sync differently)
4. Parameter discovery (what does this device support?)

---

## 4. Proposed Architecture

### Layer 0: Machine Definition (New)

```typescript
// machines/machines.ts
interface MachineDefinition {
  id: string
  name: string
  
  // Hardware topology
  midiModel: "channelBased" | "noteBased" | "hybrid"
  stepCount: number
  voiceCount: number
  
  // Voice mapping
  voices: Voice[]
  
  // Capabilities
  capabilities: {
    tempo?: boolean
    recordFromDevice?: boolean
    parameterLearning?: boolean
  }
  
  // Communication
  detect: () => Promise<boolean>
  connect: (port: string) => Promise<MachineAdapter>
}

interface Voice {
  id: string
  name: string
  channel?: number      // For channel-based (Rhythm Wolf)
  note?: number         // For note-based (Roland)
  range: [min, max]
  type: "drum" | "pitched" | "modulation"
}

// machines/definitions/index.ts
export const MACHINES = {
  rhythmWolf: { id: "rhythm_wolf", name: "Akai Rhythm Wolf", ... },
  rolandTr808: { id: "roland_tr808", name: "Roland TR-808", midiModel: "noteBased", ... },
  rolandTr909: { id: "roland_tr909", name: "Roland TR-909", midiModel: "noteBased", ... },
  volcaDrum: { id: "volca_drum", name: "Korg Volca Drum", ... },
}
```

### Layer 1: Machine Adapter (Abstraction)

```typescript
// adapters/MachineAdapter.ts
interface MachineAdapter {
  machine: MachineDefinition
  
  // Send pattern to device
  send(pattern: AgenticPattern): Promise<SendResult>
  
  // Read pattern from device
  read(): Promise<AgenticPattern>
  
  // Convert generic pattern to device-specific MIDI
  patternToMidi(pattern: AgenticPattern): MidiEvent[]
  
  // Convert device MIDI to generic pattern
  midiToPattern(events: MidiEvent[]): AgenticPattern
}

// adapters/implementations/RhythmWolfAdapter.ts
export class RhythmWolfAdapter implements MachineAdapter {
  machine = MACHINES.rhythmWolf
  
  patternToMidi(pattern: AgenticPattern): MidiEvent[] {
    // Rhythm Wolf: 6 channels, one per voice
    return pattern.voices.flatMap(voice => 
      voice.steps.map((vel, step) => ({
        channel: voice.id as number,  // 0-5
        step,
        velocity: vel
      }))
    )
  }
}

// adapters/implementations/RolandAdapter.ts
export class RolandAdapter implements MachineAdapter {
  machine = MACHINES.rolandTr808
  
  patternToMidi(pattern: AgenticPattern): MidiEvent[] {
    // Roland: Channel 10, one note per voice
    return pattern.voices.flatMap(voice =>
      voice.steps.map((vel, step) => ({
        channel: 10,  // Always channel 10 (index 9)
        note: this.voiceToNote(voice.id),  // Kick=36, Snare=38, etc.
        step,
        velocity: vel
      }))
    )
  }
  
  private voiceToNote(voiceId: string): number {
    const noteMap: Record<string, number> = {
      kick: 36,
      snare: 38,
      closedHat: 42,
      openHat: 46,
    }
    return noteMap[voiceId] || 36
  }
}
```

### Layer 2: Frontend UI (Parameterized)

```typescript
// components/SequencerGrid.tsx (Current: hardcoded 6×16)
interface SequencerGridProps {
  machine: MachineDefinition  // ← NEW: machine-aware
  pattern: AgenticPattern
  onChange: (pattern: AgenticPattern) => void
}

export function SequencerGrid({ machine, pattern, onChange }: SequencerGridProps) {
  return (
    <div 
      style={{
        gridTemplateColumns: `repeat(${machine.stepCount}, 1fr)`,
        gridTemplateRows: `repeat(${machine.voiceCount}, 1fr)`
      }}
    >
      {/* Dynamic grid based on machine.stepCount × machine.voiceCount */}
      {pattern.voices.map((voice, v) => (
        voice.steps.map((vel, s) => (
          <StepPad
            key={`${v}-${s}`}
            velocity={vel}
            onChange={(newVel) => handleChange(v, s, newVel)}
          />
        ))
      ))}
    </div>
  )
}

// components/MachineSelector.tsx (New)
export function MachineSelector({ 
  selected, 
  onSelect 
}: { 
  selected: MachineDefinition, 
  onSelect: (m: MachineDefinition) => void 
}) {
  return (
    <select 
      value={selected.id} 
      onChange={(e) => onSelect(MACHINES[e.target.value])}
    >
      {Object.values(MACHINES).map(m => (
        <option key={m.id} value={m.id}>{m.name}</option>
      ))}
    </select>
  )
}
```

### Layer 3: State Management (Zustand Updates)

```typescript
// store.ts (Modified)
interface Store {
  // Current
  pattern: AgenticPattern
  
  // NEW: Machine selection
  selectedMachine: MachineDefinition
  setSelectedMachine: (machine: MachineDefinition) => void
  
  // NEW: Machine adapter
  adapter: MachineAdapter | null
  initializeAdapter: (machine: MachineDefinition) => Promise<void>
  
  // Send with machine awareness
  sendPattern: () => Promise<SendResult>  // Uses current adapter
}

export const useStore = create<Store>((set, get) => ({
  selectedMachine: MACHINES.rhythmWolf,
  setSelectedMachine: (m) => set({ selectedMachine: m }),
  
  adapter: null,
  
  initializeAdapter: async (machine) => {
    const adapter = await MachineAdapterFactory.create(machine)
    set({ adapter })
  },
  
  sendPattern: async () => {
    const { adapter, pattern } = get()
    if (!adapter) throw new Error("No adapter initialized")
    
    // Adapter handles machine-specific MIDI conversion
    return adapter.send(pattern)
  }
}))
```

---

## 5. Frontend Changes Needed

### Current Structure
```
GenerateView
  ├── SequencerGrid (6×16 hardcoded)
  ├── Style selector
  └── Send button
```

### New Structure
```
App
  ├── MachineSelector (NEW)  ← Pick Roland/Rhythm Wolf/etc.
  │
  ├── GenerateView
  │   ├── SequencerGrid (dynamic grid: M.stepCount × M.voiceCount)
  │   ├── Voice labels (dynamic: pulled from machine.voices)
  │   ├── Style selector
  │   └── Send button
  │
  ├── LibraryView
  │   └── Filter by machine (NEW)
  │
  └── ChatView
      └── Machine-aware prompts ("Create Roland 808 pattern")
```

### CSS Changes
```css
/* OLD: Fixed 6×16 */
.sequencer-grid {
  grid-template-columns: repeat(16, 1fr);
  grid-template-rows: repeat(6, 1fr);
}

/* NEW: Dynamic from machine */
.sequencer-grid {
  grid-template-columns: repeat(var(--step-count), 1fr);
  grid-template-rows: repeat(var(--voice-count), 1fr);
}
```

---

## 6. Implementation Roadmap

### Phase 1: Abstraction Layer (Week 1)
```
✓ Create MachineDefinition interface
✓ Create MachineAdapter abstract class
✓ Implement RhythmWolfAdapter
✓ Implement RolandAdapter (TR-808, TR-909)
✓ Create MachineAdapterFactory
```

### Phase 2: Frontend Refactor (Week 2)
```
✓ Parameterize SequencerGrid (remove hardcoded 6×16)
✓ Create MachineSelector component
✓ Update state management (Zustand)
✓ Update pattern storage (include machine ID)
```

### Phase 3: Testing & Polish (Week 3)
```
✓ Test Rhythm Wolf adapter (baseline)
✓ Test Roland adapter
✓ Pattern library filtering by machine
✓ Save/load patterns with machine info
✓ Migrate existing patterns to Rhythm Wolf
```

### Phase 4: Community Adapters (Week 4+)
```
✓ Publish adapter SDK
✓ Document adapter development
✓ Community: Volca, Elektron, Nord adapters
✓ Registry system
```

---

## 7. What Stays the Same

### No Changes Needed
- ✅ Tokenization (device-agnostic)
- ✅ Embeddings (device-agnostic)
- ✅ Claude AI integration
- ✅ Pattern library concept
- ✅ Chat interface
- ✅ Docker deployment
- ✅ Backend FastAPI

### Zero Breaking Changes
- Existing Rhythm Wolf patterns still work
- State management backward-compatible
- UI gracefully handles unknown machines

---

## 8. File Structure (New)

```
frontend/src/
├── machines/
│   ├── definitions.ts          (MACHINES registry)
│   ├── types.ts                (MachineDefinition, Voice, etc.)
│   └── factory.ts              (MachineAdapterFactory)
│
├── adapters/
│   ├── MachineAdapter.ts        (Abstract base)
│   ├── implementations/
│   │   ├── RhythmWolfAdapter.ts
│   │   ├── RolandAdapter.ts
│   │   ├── VelcaDrumAdapter.ts
│   │   └── ElektronAdapter.ts
│   │
│   └── utils.ts                (MIDI conversion helpers)
│
├── components/
│   ├── hw/
│   │   ├── SequencerGrid.tsx    (UPDATED: machine-aware)
│   │   └── VoiceLabel.tsx       (NEW)
│   │
│   ├── app/
│   │   └── MachineSelector.tsx  (NEW)
│   │
│   └── ...
│
└── ...
```

---

## 9. Effort Estimation

| Phase | Task | Effort | Risk |
|-------|------|--------|------|
| 1 | Abstraction layer | 1-2 days | LOW |
| 2 | Frontend refactor | 2-3 days | MEDIUM |
| 3 | Testing & migrate | 2 days | LOW |
| 4 | Community support | Ongoing | LOW |

**Total: 1-2 weeks for MVP (Rhythm Wolf + Roland)**

---

## 10. Feasibility Verdict: ✅ HIGHLY FEASIBLE

### Why
1. **Core logic already device-agnostic** (tokens, embeddings)
2. **Frontend is component-based** (easy to parameterize)
3. **Backend is extensible** (adapters slot in naturally)
4. **No breaking changes** (backward compatible)

### Risk Level: **LOW**
- Existing Rhythm Wolf use case unaffected
- Phased implementation reduces risk
- Each machine gets own adapter (isolated)

### Time to Market
- **MVP (Rhythm Wolf + Roland):** 1-2 weeks
- **3 machine support:** 2-3 weeks
- **Community ecosystem:** 4-6 weeks

---

## 11. Next Steps

### Immediate (This Sprint)
1. ✅ Approve abstraction design
2. 📝 Create `machines/` directory structure
3. 🔧 Implement RhythmWolfAdapter (refactor current code)
4. 🧪 Add adapter tests

### Short-term (Next Sprint)
5. 🎛️ Implement RolandAdapter (channel 10 handling)
6. 🎨 Refactor SequencerGrid to be machine-aware
7. 🔍 Update state management

### Medium-term (Following Sprints)
8. 📚 Publish adapter SDK + documentation
9. 🌐 Create community registry
10. 🤝 Accept community adapters

---

## Conclusion

**The proposal is not just feasible—it aligns with what we've already built.**

The tokenization, embeddings, and AI integration are **machine-agnostic by design**. We just need to:

1. **Abstract the machine-specific parts** (voice mapping, MIDI channels)
2. **Parameterize the UI** (dynamic grids based on machine definition)
3. **Plug in adapters** (one per hardware model)

**Result:** A platform, not a tool.

