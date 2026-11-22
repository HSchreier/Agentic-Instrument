# Rhythm Wolf MIDI - Design Brief for UI/UX Overhaul

## Project Overview
Rhythm Wolf MIDI is a web application that enables musicians and producers to generate, preview, and send MIDI drum patterns to Akai Rhythm Wolf hardware. The app combines natural language AI-powered pattern generation with an extensive preset library and real-time hardware control.

**Tech Stack:** React 18 + TypeScript, Tailwind CSS, Vite, FastAPI backend

---

## Current Features & Functionality

### 1. **Pattern Generator Tab**
- Style selector (Techno, House, Tech House, Minimal, D&B)
- Tempo slider (20-300 BPM, with tempo ranges per style)
- Pattern template selection (Four on the Floor, Half Time, Minimal)
- Include Bass Synth toggle
- Real-time pattern generation
- Visual pattern preview with drum sound breakdown

### 2. **Pattern Library Tab**
- Browse 15 industry-standard preset patterns
- Search by name or description
- Filter by music style
- Quick Load (📂) and Send (🚀) buttons per preset
- Pattern preview cards showing: name, description, style, tempo, event count
- Summary showing "X of Y patterns" displayed

### 3. **Chat Interface Tab**
- Natural language pattern generation powered by Claude API
- Describe patterns in natural language (e.g., "Create a hypnotic techno groove at 130 BPM")
- Real-time chat conversation
- Pattern generation and preview

### 4. **Hardware Control**
- Device selector to list available MIDI outputs
- Status display for device connection
- Send button to transmit patterns to Rhythm Wolf
- Feedback on successful transmission (events sent, duration)

### 5. **Pattern Preview Component**
- Displays pattern metadata (style, tempo, event count)
- Visual drum sounds breakdown with color-coded events
- Shows kick patterns, snares, hi-hats with velocity indicators

---

## Design Challenges & Improvement Opportunities

### Visual Hierarchy & Layout
- **Current:** Tab-based navigation with 3 separate views
- **Improvement:** Consider split-pane layouts or modular arrangement for better workflow
- **Goal:** Allow users to generate, preview, and send in a single cohesive workspace

### Pattern Visualization
- **Current:** Text-based drum sounds breakdown
- **Improvement:** Add visual 16-step sequencer grid showing:
  - Each drum sound as a row
  - 16 steps (beats) as columns
  - Visual indicators for kick, snare, hi-hat placement
  - Velocity/intensity visualization (bar height or opacity)
  - Interactive editing capability (optional for future)

### Device Selection & Status
- **Current:** Simple dropdown with "No MIDI devices found" message
- **Improvement:**
  - Device status badges with visual feedback
  - Connection state indicators (connected/disconnected/error)
  - Auto-detect and suggest device
  - Device refresh button with loading state

### Preset Library Enhancement
- **Current:** Card grid layout with basic metadata
- **Improvement:**
  - Add visual previews of drum patterns (mini sequencer view)
  - Favorite/bookmark button for quick access
  - Recently used presets section
  - Pattern difficulty/complexity indicator
  - BPM comparison visualization (similar tempos grouped)
  - Drag-and-drop to favoriting/playlist

### Chat Interface Polish
- **Current:** Basic chat bubble layout
- **Improvement:**
  - Pattern suggestions based on user input
  - Quick template buttons ("Fast Techno", "Minimal House", etc.)
  - Chat history with pattern bookmarking
  - Export/save conversation history

### Real-time Feedback
- **Current:** Basic status messages
- **Improvement:**
  - Toast notifications for all actions
  - Loading states with progress indicators
  - Confirmation dialogs for sends
  - Success/error animations
  - Undo/redo capability

### Mobile Responsiveness
- **Current:** Desktop-first layout
- **Improvement:**
  - Full mobile/tablet support
  - Touch-friendly button sizes
  - Collapsible panels for smaller screens
  - Mobile-optimized preview and sequencer views

---

## Key Design Components to Create/Enhance

### 1. Main Navigation
- Consistent tab bar across all views
- Active state indicator
- Icon + label for each tab
- Potential breadcrumb for current view

### 2. Pattern Generator Card
- Clean form layout with organized sections
- Grouped controls: Rhythm Style, Tempo Control, Template, Advanced Options
- Visual feedback on parameter changes
- Preset quick-select button

### 3. Device Selector
- Status badge with connection indicator
- Device icon + name
- Refresh button
- Help text for troubleshooting

### 4. Pattern Preview Panel
- Large, scannable format
- Visual sequencer grid (16-step)
- Drum sounds with icons and colors:
  - 🥁 Kick (red)
  - 🎯 Snare (orange)
  - 🔔 Hi-hat (green)
  - 🎵 Tom (blue)
  - 🔊 Other percussion (purple)
- Tempo and timing display
- Play button for preview (future feature)

### 5. Send Button & Feedback
- Prominent call-to-action when pattern + device are ready
- Loading spinner during send
- Success toast with pattern details
- Error handling with recovery suggestions

### 6. Library Grid Enhancements
- Thumbnail preview of each pattern (mini sequencer)
- Hover states with quick info popup
- Favorite star button
- Right-click context menu (optional)
- Sort options: Name, Tempo, Style, Recently Used

### 7. Chat Interface
- Message bubbles with timestamps
- Code/pattern blocks for generated patterns
- Copy button for quick sending
- Quick-action buttons (Use This, Save, Try Similar)

---

## Color & Visual System

### Current Palette (Tailwind CSS)
- Primary: Blue-600 (actions, active states)
- Success: Green-600 (send, confirmed actions)
- Attention: Purple-600 (UI accents)
- Neutral: Gray scale (text, backgrounds)

### Enhancements Needed
- **Status Colors:**
  - Connected device: Green
  - Disconnected: Gray
  - Error: Red
  - Loading: Blue with animation
  
- **Drum Sound Colors:** (consistent across app)
  - Kick: Red/Crimson
  - Snare: Orange/Gold
  - Hi-hat: Green/Cyan
  - Tom: Blue/Purple
  - Percussion: Yellow/Lime

- **BPM Zones:** Visual tempo grouping
  - Slow (90-110): Cool colors
  - Mid (120-130): Neutral
  - Fast (140-174): Warm colors
  - Very Fast (170+): Vibrant colors

---

## Interaction Patterns & Micro-interactions

### Loading States
- Skeleton loaders for preset grid while fetching
- Spinning icon for device scanning
- Progress bar for pattern generation with API
- Pulse animation for processing

### Feedback States
- Toast notifications (top-right):
  - Success: Green with checkmark, 3-second auto-dismiss
  - Error: Red with icon, 5-second duration, action button
  - Info: Blue, 2-second duration

### Hover & Focus States
- Buttons: Slight lift/shadow, color shift
- Cards: Subtle glow or shadow enhancement
- Inputs: Focus ring (blue), border highlight
- Preset cards: Border highlight, background change, button reveal

### Transitions
- Tab switches: Smooth fade (200ms)
- Modal/dropdown: Scale-in animation (150ms)
- Toast notifications: Slide-in from top (200ms)

---

## Accessibility Requirements

### WCAG 2.1 AA Compliance
- Semantic HTML (buttons, inputs, labels)
- Proper heading hierarchy
- Color contrast ratios ≥ 4.5:1 for text
- Keyboard navigation support (Tab, Enter, Escape)
- Screen reader support for all interactive elements
- Form labels associated with inputs
- Error messages linked to form fields

### Keyboard Navigation
- Tab through all controls in logical order
- Enter/Space to activate buttons
- Arrow keys for sliders and selects
- Escape to close modals/menus

### Screen Reader Support
- ARIA labels for icon-only buttons
- Announce loading/status changes
- Describe pattern complexity/characteristics
- Voice pattern details when selected

---

## Content & Microcopy

### Key Messages
- **Empty State:** "No presets loaded yet. Try the Generator or Chat tab!"
- **Device Error:** "Couldn't find Rhythm Wolf. Make sure it's connected via USB."
- **Generation Success:** "Pattern created! Send it to your device or modify it here."
- **Send Confirmation:** "Sending 20 events to Rhythm Wolf... (estimated 2.5 seconds)"

### Tooltips
- Hover on tempo icon: "Beats Per Minute - standard tempo for electronic music"
- Hover on template icon: "Drum pattern structure - choose the beat feel"
- Hover on style: "Musical genre affects drum sound characteristics"

---

## Information Architecture

### Primary Views
1. **Generator** (left-heavy layout)
   - Controls panel (left): Style, Tempo, Template, Bass
   - Preview panel (center): Pattern visualization
   - Device panel (right): Selection and send

2. **Library** (full-width grid)
   - Search/filter bar (top)
   - Preset grid (main)
   - Detail panel on selection (overlay or sidebar)

3. **Chat** (conversation layout)
   - Chat history (main)
   - Pattern preview (sidebar or detail view)
   - Input area (bottom)

### Secondary Features
- Settings/preferences (gear icon in header)
- Help/documentation (? icon)
- Recent patterns sidebar (collapsible)
- Favorites/bookmarks panel

---

## Future Enhancement Opportunities

### Phase 2
- Pattern editing sequencer (click-to-add drum hits)
- Undo/redo functionality
- Pattern comparison (side-by-side views)
- Export patterns as MIDI files
- Pattern tagging and playlisting

### Phase 3
- Audio preview with drum samples
- Swing/shuffle controls
- Swing amount visualization
- Velocity editing per drum sound
- Save personal preset library to account

### Phase 4
- Collaborative pattern creation (share URLs)
- Community preset library voting
- Pattern recommendations engine
- Performance analytics (most-used patterns, temps)
- Hardware presets sync/backup

---

## Design Deliverables Requested

1. **High-fidelity mockups** for all three main tabs
2. **Component library** with:
   - Button variants (primary, secondary, danger, loading states)
   - Card variants (preset card, preview card, status card)
   - Form controls (slider, select, toggle, input with validation)
   - Status indicators (device connection, pattern state)
   - Notifications (toast, modal alerts)

3. **16-step sequencer component** design and interaction patterns
4. **Responsive breakpoints:** Desktop (1280px), Tablet (768px), Mobile (375px)
5. **Dark mode variant** (optional but recommended)
6. **Prototype/interactive demo** of key flows:
   - Generate → Preview → Send pattern
   - Browse Library → Select Preset → Send to device
   - Chat → Generate → Send

---

## Success Metrics

- Usability: First-time users can send a pattern within 30 seconds
- Performance: Preset library loads in <1 second
- Accessibility: 100% WCAG AA compliance
- Design consistency: All components follow the system
- Mobile readiness: Works seamlessly on devices 375px+ width
