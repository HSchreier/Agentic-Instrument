# Design Briefing: Machine-Modular UI

## Overview

The UI needs to support multiple drum machines with different sequencer sizes, voice layouts, and naming conventions. Currently hardcoded for Akai Rhythm Wolf (6 voices × 16 steps); needs to be dynamic.

---

## 1. Machine Selector Component

### Location
**Top of sidebar** (above pattern name, persistent across all views)

### Specification

```
┌─────────────────────────────────┐
│ 🎛️  MACHINE SELECTOR            │
├─────────────────────────────────┤
│ Current: [Akai Rhythm Wolf  ▼]  │  ← Dropdown
├─────────────────────────────────┤
│ ⚫ Connected                     │  ← Status indicator
│ Port: MIDI Output 1             │  ← Current port
│ BPM: 120 | Sync: Off            │  ← Device info
└─────────────────────────────────┘
```

### Component: `MachineSelector`

**Props:**
```typescript
{
  selectedMachine: MachineDefinition
  onSelectMachine: (machine: MachineDefinition) => void
  status: "connected" | "disconnected" | "scanning" | "error"
  currentPort?: string
  currentBpm?: number
}
```

**Dropdown Options:**
```
─────────────────────────────
  🥁 DRUM MACHINES
─────────────────────────────
  Akai Rhythm Wolf (6×16)
  Roland TR-808 (1×16)
  Roland TR-909 (1×16)
  Korg Volca Drum (6×16)
─────────────────────────────
  🎹 MELODIC
─────────────────────────────
  Roland TR-707 Synth (8×32)
  Korg Volca Keys (4×16)
─────────────────────────────
```

**Styling:**
- Monospace font (Courier New, Monaco)
- Full width of sidebar
- 2px divider below
- Accent red on hover
- Icon changes per machine (🥁 for drum, 🎹 for synth)

---

## 2. Sequencer Grid — Size Variation

### Current (Hardcoded)
```
6 voices × 16 steps = 96 total pads
```

### New Configurations

#### Rhythm Wolf (6×16)
```
┌────────────────────────────────────────────────┐
│BD ●···●···●···●···                            │
│SD ···●···●···●···●                            │
│PC ·····●·····●···                            │
│OH ····●·····●····                            │
│CH ··●·●·●·●·●·●·●                            │
│BS ······●······●·                             │
└────────────────────────────────────────────────┘
     16 steps
```

#### Roland TR-808 (1×16) — Compact!
```
┌──────────────────────────────────┐
│BD ●···●···●···●···               │
└──────────────────────────────────┘
     16 steps (channel 10 only)
     
Note: Pads larger since fewer voices
```

#### Korg Volca Drum (6×16) — Same as Wolf
```
Similar grid but different voice labels
```

#### Roland TR-707 Synth (8×32) — Larger!
```
┌─────────────────────────────────────────────────────────────┐
│TR ····●····●····●····●····●····●····●····●····●····●····│
│CY ···●···●···●···●···●···●···●···●···●···●···●···●···●····│
│SN ·●···●···●···●···●···●···●···●···●···●···●···●···●····  │
│... (5 more rows)
└─────────────────────────────────────────────────────────────┘
              32 steps (double)
```

### CSS Layout (Dynamic)

```css
/* Current: Hardcoded */
.sequencer-grid {
  display: grid;
  grid-template-columns: repeat(16, 1fr);
  grid-template-rows: repeat(6, 1fr);
  gap: 2px;
}

/* NEW: Dynamic via CSS variables */
.sequencer-grid {
  --steps: 16;
  --voices: 6;
  display: grid;
  grid-template-columns: repeat(var(--steps), 1fr);
  grid-template-rows: repeat(var(--voices), 1fr);
  gap: 2px;
  /* React sets these via inline style */
}

/* Pad sizing adapts */
.step-pad {
  width: calc(100% / var(--steps));
  height: calc(100% / var(--voices));
}
```

### React Implementation

```typescript
<div
  className="sequencer-grid"
  style={{
    '--steps': machine.stepCount,
    '--voices': machine.voiceCount,
  } as React.CSSProperties}
>
  {/* Grid fills dynamically */}
</div>
```

---

## 3. Voice Labels (Left Sidebar)

### Current (Hardcoded)
```
BD (Kick)
SD (Snare)
PC (Percussion)
OH (Open Hat)
CH (Closed Hat)
BS (Bass)
```

### New (Machine-aware)

#### Rhythm Wolf
```
BD (Kick)
SD (Snare)
PC (Percussion)
OH (Open Hat)
CH (Closed Hat)
BS (Bass)
```

#### Roland TR-808
```
BD (Kick)
← Single voice on channel 10
  (Other voices triggered by note)
```

#### Roland TR-707 Synth
```
TR (Triangle)
CY (Cymbal)
SN (Snare)
...
```

### Component: `VoiceLabel`

```typescript
interface VoiceLabelProps {
  voice: Voice
  voiceIndex: number
}

export function VoiceLabel({ voice }: VoiceLabelProps) {
  return (
    <div className="voice-label">
      <span className="voice-shorthand">{voice.id.toUpperCase()}</span>
      <span className="voice-name" title={voice.name}>
        {voice.name}
      </span>
    </div>
  )
}
```

**Styling:**
- Font: Monospace, 10px
- Width: Dynamic based on machine definition
- Rotate text 90° if needed for compact devices
- Color: Group similar voices (kick, snare, hats in different shades)

---

## 4. Layout Variations by Machine

### Type A: Standard Drums (Rhythm Wolf, Volca)
```
┌──────────────────────────────────────────────────┐
│ [Machine Selector]                               │
├──────────────────────────────────────────────────┤
│ Pattern Name: [______________]                   │
│ Style: [Techno    ▼] BPM: [120] Tempo: [·▌····]│
├──────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────┐   │
│ │BD ●···●···●···●···                         │   │
│ │SD ···●···●···●···●                         │   │
│ │   ... (more rows)                          │   │
│ └────────────────────────────────────────────┘   │
│ [Undo] [Clear] [Re-roll]      [Send 0 Events →] │
└──────────────────────────────────────────────────┘
```

### Type B: Single-Channel Drums (Roland TR-808)
```
┌──────────────────────────────────────────────────┐
│ [Roland TR-808              ▼]                    │
├──────────────────────────────────────────────────┤
│ Pattern Name: [______________]                   │
│ Style: [House     ▼] BPM: [125]                 │
├──────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────┐   │
│ │BD ●···●···●···●···                         │   │  ← Larger pads
│ └────────────────────────────────────────────┘   │  (only 1 row)
│                                                   │
│ [Undo] [Clear] [Re-roll]      [Send 0 Events →] │
└──────────────────────────────────────────────────┘
```

### Type C: Extended Sequencer (Roland TR-707 Synth)
```
┌────────────────────────────────────────────────────────────────┐
│ [Roland TR-707 Synth            ▼]                             │
├────────────────────────────────────────────────────────────────┤
│ Pattern Name: [______________] Style: [Synth ▼] BPM: [130]   │
├────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────────────────┐   │
│ │TR ····●····●····●····●····●····●····●····●····●····●  │   │
│ │CY ···●···●···●···●···●···●···●···●···●···●───●···●····  │   │
│ │   ... (more rows, may scroll)                           │   │
│ └──────────────────────────────────────────────────────────┘   │
│ [Undo] [Clear] [Re-roll]            [Send 0 Events →]         │
└────────────────────────────────────────────────────────────────┘
```

---

## 5. Responsive Behavior

### Desktop (≥1200px)
- Full 3-column layout (controls | sequencer | device rail)
- Side-by-side SequencerGrid and controls
- Full machine selector visible

### Tablet (768-1199px)
- 2-column layout
- Sequencer may need horizontal scroll if many steps
- Machine selector: compact dropdown

### Mobile (<768px)
- **Not supported** (keep existing constraint)
- Or: Stacked vertical, sequencer scrollable

---

## 6. Voice Highlighting & Grouping

### Color Coding by Voice Type

```
Kick:        🔴 Dark red
Snare:       🟡 Orange
Hats (CH/OH):🟢 Green
Percussion:  🔵 Blue
Bass:        🟣 Purple
```

**Implementation:**
```typescript
const voiceColors: Record<VoiceType, string> = {
  kick: '#8B0000',      // Dark red
  snare: '#FF8C00',     // Orange
  hat: '#228B22',       // Forest green
  perc: '#0000CD',      // Blue
  bass: '#8B008B',      // Dark magenta
}

// Apply to voice label background
<div
  className="voice-label"
  style={{ backgroundColor: voiceColors[voice.type] }}
>
```

---

## 7. Step Pad Behavior (Unchanged)

```
Step Pad (unchanged):
  • Red (#ec3013) when hit
  • Dark when empty
  • Hover: brightens
  • Velocity bar: 0-127 (height)
  • 4-color group alternation (visual rhythm)
```

**Works for all machines** (just scaled differently)

---

## 8. Device-Specific Indicators

### Add Status Badges

```
┌─────────────────────────────┐
│ [Machine Selector]          │
│                             │
│ Akai Rhythm Wolf            │
│ ⚙️ 6 voices × 16 steps      │  ← Info
│ 🎛️ Channel-based MIDI       │
│ ⚫ Connected / ⚪ Disconnected│
└─────────────────────────────┘
```

**Component: `MachineInfo`**
```typescript
<div className="machine-info">
  <div>{machine.voiceCount} voices × {machine.stepCount} steps</div>
  <div>🎛️ {machine.midiModel} MIDI</div>
  <div>{status === 'connected' ? '⚫' : '⚪'} {status}</div>
</div>
```

---

## 9. Library View Changes

### Filter by Machine

```
Search: [Search patterns...]

Filter by Machine:
  ☑️ All Machines
  ☐ Akai Rhythm Wolf (8 patterns)
  ☐ Roland TR-808 (3 patterns)
  ☐ Roland TR-909 (2 patterns)
  ☐ Korg Volca Drum (1 pattern)

[Pattern 1] [Pattern 2] [Pattern 3]
```

**Component: `MachineFilter`**
```typescript
<fieldset className="machine-filter">
  {Object.values(MACHINES).map(machine => (
    <label key={machine.id}>
      <input
        type="checkbox"
        checked={selectedMachines.includes(machine.id)}
        onChange={() => toggleMachine(machine.id)}
      />
      {machine.name} ({patternCount(machine.id)})
    </label>
  ))}
</fieldset>
```

---

## 10. Chat View Changes

### Machine-Aware Prompts

**Before:**
```
"Create an acid house pattern"
```

**After:**
```
"Create an acid house pattern for Roland TR-808"
↑ Automatically includes selected machine
```

**Quick Prompts Updated:**
```
🎹 Progressive house for Rhythm Wolf
🥁 Minimal techno for Roland TR-808
🎶 Deep house for Volca Drum
⚡ Acid for TR-909
```

---

## 11. Mobile/Compact Considerations

### If Supporting Smaller Screens

**Sequencer scrolls horizontally:**
```css
.sequencer-grid {
  overflow-x: auto;
  min-width: 100%;
  width: fit-content;
}
```

**Voice labels scroll vertically:**
```css
.voice-labels {
  overflow-y: auto;
  max-height: 60vh;
}
```

---

## 12. Mockup Specifications

### For Designer: What We Need

#### Screen 1: **Rhythm Wolf (Current)**
- 6 voices × 16 steps
- Machine selector showing "Akai Rhythm Wolf"
- Standard layout

#### Screen 2: **Roland TR-808 (Compact)**
- 1 voice × 16 steps
- Larger pads (since fewer)
- Machine selector showing "Roland TR-808"
- Same controls, different grid

#### Screen 3: **Roland TR-707 (Extended)**
- 8 voices × 32 steps
- Smaller pads (more of them)
- Horizontal scroll visible
- Machine selector showing "Roland TR-707 Synth"

#### Screen 4: **Machine Selector Dropdown**
- Shows all available machines
- Grouped by type (drums vs melodic)
- Icon per machine
- Current selection highlighted

#### Screen 5: **Library with Machine Filter**
- Filter options for each machine
- Patterns labeled by machine
- Icon badge on each pattern card

#### Screen 6: **Chat with Machine Context**
- Selected machine visible in chat
- Quick prompts include machine name
- Pattern preview shows machine info

---

## 13. Interaction Flow

### User Changes Machine

```
User clicks dropdown → Selects "Roland TR-808"
                ↓
State updates (selectedMachine = rolandTr808)
                ↓
Grid recalculates: 1 × 16 (instead of 6 × 16)
                ↓
Voice labels update: only "BD (Kick)"
                ↓
Pads resize and reflow
                ↓
Pattern structure adapts (or migrates with warning)
```

### State Flow (Zustand)

```typescript
const store = {
  selectedMachine: MACHINES.rhythmWolf,
  setSelectedMachine: (m) => {
    // 1. Validate current pattern compatibility
    // 2. Update machine
    // 3. Recompute adapter
    // 4. Trigger grid re-render
  }
}
```

---

## 14. Data Model: Pattern with Machine

### Current
```typescript
{
  metadata: { style, tempo, num_events },
  events: [...]
}
```

### New
```typescript
{
  machine: "rhythm_wolf",           // ← NEW
  metadata: { style, tempo, num_events },
  events: [...]
}
```

**Migration:** Existing patterns default to `rhythm_wolf`

---

## 15. Design System: No Changes

### Keep Existing
- ✅ Colors (#ec3013 red, #201e1d ink, #f3f2f2 bg)
- ✅ Fonts (Archivo)
- ✅ Spacing (4, 8, 12, 16, 24, 32px)
- ✅ No border-radius
- ✅ 2px dividers
- ✅ Zero-padded monospace text

### Extend
- 🆕 Voice color badges (optional, for clarity)
- 🆕 Machine info indicators
- 🆕 Dynamic grid sizing

---

## Summary for Designer

**Mockup Checklist:**

- [ ] Rhythm Wolf: 6×16 grid (reference current design)
- [ ] Roland TR-808: 1×16 grid (compact, larger pads)
- [ ] Roland TR-707: 8×32 grid (extended, with scroll)
- [ ] Machine selector dropdown menu
- [ ] Library with machine filter badges
- [ ] Chat view with machine context label
- [ ] Voice labels rendering for each machine
- [ ] Status indicators (connected/disconnected)
- [ ] Responsive breakpoints (1200px, 768px)

**Files to Update:**
- GenerateView.tsx
- LibraryView.tsx
- ChatView.tsx
- SequencerGrid.tsx (new: machine-aware)
- MachineSelector.tsx (new component)
- MachineFilter.tsx (new component)

---

## Next Steps

1. **Review this briefing** ← You are here
2. **Create mockups** in Figma/Adobe based on specs above
3. **Share mockups** for feedback
4. **Implement** using mockup dimensions + colors
5. **Test** with all machine types

---

**Ready for mockups?** 🎨

