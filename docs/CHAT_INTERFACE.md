# Chat Interface for Rhythm Wolf

Natural language interface powered by Claude API for intuitive pattern generation, management, and device control.

## 🎯 Vision

Transform the Rhythm Wolf UI from a tool-centric interface to an **AI assistant** that understands natural language requests and executes them seamlessly across pattern generation, library management, and device control.

```
User: "Give me a hypnotic techno groove at 130 BPM"
     ↓
Claude API parses intent
     ↓
System calls generator + saves to library
     ↓
Pattern appears in chat with preview
```

## 📋 Features by Phase

### Phase 1: MVP - Pattern Generation via Chat (Priority: NOW)

**Core Capability:** Natural language → Generated patterns

```typescript
// User experience
"Create a 4-on-the-floor kick pattern with open hats at 128 BPM"
         ↓
Claude API → Extracts: style=techno, tempo=128, template=four_on_the_floor
         ↓
Generator creates pattern
         ↓
Chat shows: pattern preview + waveform + "Save to Library?" button
```

**Chat Messages:**
- `{"role": "user", "content": "hypnotic minimal kick at 120 BPM"}`
- `{"role": "assistant", "content": "Generated pattern: ...", "pattern": {...}}`

**Backend Endpoint:**
```
POST /api/chat/message
Body: { message: string }
Response: { 
  reply: string,
  pattern?: Pattern,
  action?: "generate" | "save" | "send" | "search"
}
```

**Frontend Chat Component:**
```typescript
// frontend/src/components/Chat.tsx
<ChatInterface 
  onMessage={(msg) => sendToBackend(msg)}
  onPattern={(pattern) => setPattern(pattern)}
/>
```

**Implementation Steps:**
1. Add chat message input + history display
2. Create `/api/chat/message` endpoint
3. Integrate Claude API with system prompt
4. Parse intent from Claude response
5. Call appropriate generator/library endpoints
6. Display results with pattern preview

---

### Phase 2: Library Integration (Priority: HIGH)

**Extend Chat Commands:**

```
Save & Organize:
  "Save that as 'Berlin Energy'"
  "Tag it with 'live' and 'groovy'"
  "Add to my favorites"

Search & Browse:
  "Show my favorite techno patterns"
  "Find patterns under 120 BPM"
  "What deep house beats do I have?"

Manage:
  "Create a variation of my Berlin Energy pattern"
  "Delete the last one I saved"
  "Export my entire library"
```

**Chat-to-Action Mapping:**

| Intent | Action | Endpoint |
|--------|--------|----------|
| "Save that as X" | Save pattern | `POST /api/library/patterns` |
| "Show my [style] patterns" | List filtered | `GET /api/library/patterns?style=X` |
| "Delete that one" | Remove | `DELETE /api/library/patterns/{id}` |
| "Add to favorites" | Toggle star | `POST /api/library/patterns/{id}/favorite` |
| "Create a variation" | Duplicate | `POST /api/library/patterns/{id}/duplicate` |

---

### Phase 3: Advanced Features (Priority: LATER)

**Conversation Context:**
```
User: "Make me a techno beat"
Claude: [generates pattern]

User: "Now slower, 100 BPM"
Claude: Understands you mean techno, adjusts tempo, regenerates
```

**Pattern Suggestions:**
```
User: "I like this pattern"
Claude: "Here are 3 variations you might enjoy..."
```

**Sharing:**
```
User: "Share this pattern"
Claude: Generates link, shows "Send to collaborators"
```

**Batch Operations:**
```
User: "Generate 5 different house grooves at 124 BPM"
Claude: Creates collection, allows selecting/saving individually
```

---

## 🏗️ Architecture

### Frontend

```
App.tsx
├── PatternGenerator (existing)
├── PatternLibrary (existing)
├── ChatInterface (NEW)
│   ├── ChatMessages
│   ├── ChatInput
│   ├── PatternPreview
│   └── ActionButtons
└── PatternSender (existing)
```

**Chat Component Structure:**
```typescript
interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  pattern?: Pattern
  timestamp: Date
}

interface ChatInterfaceProps {
  onPattern: (pattern: Pattern) => void
  onSave: (pattern: Pattern, metadata: SaveMetadata) => void
  onSend: (pattern: Pattern, device: string) => void
}
```

### Backend

**New Routes:**
```
POST /api/chat/message
  - Receives user message
  - Calls Claude API with system prompt
  - Parses intent and parameters
  - Executes corresponding action
  - Returns structured response

POST /api/chat/intent
  - Explicit intent parsing (optional)
  - Useful for debugging
```

**Claude System Prompt:**
```
You are an AI assistant for the Rhythm Wolf MIDI pattern generator.
Users describe drum patterns, and you help them create, save, and 
manage MIDI patterns for their hardware synthesizer.

When a user asks to generate a pattern:
1. Extract: style (techno/house/minimal/tech_house)
2. Extract: tempo (BPM, default 128)
3. Extract: template (four_on_the_floor, breakbeat, etc)
4. Extract: options (include_bass: true/false)
5. Respond with: description + JSON action

When a user asks to manage patterns:
1. Identify intent: save, delete, search, favorite, duplicate
2. Extract parameters
3. Provide natural response + action JSON

Always respond in JSON format with:
{
  "message": "friendly response",
  "intent": "generate|save|delete|search|favorite|duplicate",
  "parameters": {...},
  "action": "execute|preview|confirm"
}
```

**Integration Flow:**
```
User Message
     ↓
POST /api/chat/message
     ↓
Backend calls Claude API (with context)
     ↓
Claude returns structured response
     ↓
Backend parses intent & parameters
     ↓
Execute action (generate/save/delete/etc)
     ↓
Return result to frontend
     ↓
Chat displays response + pattern/confirmation
```

---

## 💡 Example Conversations

### Conversation 1: Generate & Save

```
User: "Create a deep house beat at 122 BPM"
Assistant: Generated! 🎵 Deep house groove with soulful hi-hats.
           [Pattern preview] [Save to Library?]

User: "Save it as 'Ibiza Nights'"
Assistant: ✅ Saved "Ibiza Nights" to your Deep House collection.
           You now have 12 deep house patterns.

User: "Send it to the device"
Assistant: 🚀 Sent to Rhythm Wolf! Pattern recorded and ready to play.
           Play count: 1
```

### Conversation 2: Search & Manage

```
User: "Show me my favorite patterns"
Assistant: You have 8 favorites:
           1. Berlin Energy (techno, 130 BPM) - 24 plays
           2. Ibiza Nights (house, 122 BPM) - 18 plays
           3. Minimal Kick (minimal, 120 BPM) - 5 plays
           ...

User: "Create a variation of Berlin Energy"
Assistant: ✅ Created "Berlin Energy (Variation)" with tempo reduced to 120 BPM.
           Compare: [Original preview] vs [Variation preview]

User: "Which one is more hypnotic?"
Assistant: The original at 130 BPM has more drive. The 120 BPM version
           is more meditative. Try both on the device!
```

### Conversation 3: Suggestions

```
User: "I love this pattern"
Assistant: Great! Here are 3 similar patterns you might enjoy:
           1. Hypnotic Techno (similar tempo, more hypnotic)
           2. Dark Techno (darker vibe, same energy)
           3. Industrial Techno (harder hitting)
           
           [Generate similar?] [Browse library?]
```

---

## 🔌 API Design

### POST /api/chat/message

**Request:**
```json
{
  "message": "Create a hypnotic techno groove at 128 BPM",
  "conversationId": "abc123",
  "context": {
    "lastPattern": null,
    "libraryStats": {
      "total": 42,
      "byStyle": {"techno": 20, "house": 15}
    }
  }
}
```

**Response:**
```json
{
  "id": "msg_xyz789",
  "role": "assistant",
  "content": "Generated a hypnotic techno groove at 128 BPM with repeating hi-hat patterns.",
  "intent": "generate",
  "parameters": {
    "style": "techno",
    "tempo": 128,
    "template": "four_on_the_floor",
    "include_bass": false
  },
  "pattern": {
    "metadata": {"style": "techno", "tempo": 128, "num_events": 24},
    "events": [...]
  },
  "suggestedActions": [
    {"label": "Save to Library", "action": "save"},
    {"label": "Send to Device", "action": "send"},
    {"label": "Create Variation", "action": "duplicate"}
  ]
}
```

---

## 🛠️ Implementation Checklist

### Phase 1 (MVP)

- [ ] Create `frontend/src/components/ChatInterface.tsx`
  - [ ] Message history display
  - [ ] Input field with send button
  - [ ] Pattern preview display
  - [ ] Loading states
  
- [ ] Create `backend/chat_routes.py`
  - [ ] POST /api/chat/message endpoint
  - [ ] Claude API integration
  - [ ] Intent parsing logic
  - [ ] Pattern generation call
  
- [ ] Update `backend/main.py`
  - [ ] Include chat router
  - [ ] Add Claude API client setup
  
- [ ] Update `frontend/src/App.tsx`
  - [ ] Add ChatInterface component
  - [ ] Wire up message sending
  - [ ] Handle pattern results
  
- [ ] Add to `docs/CHAT_INTERFACE.md` (this file!)
- [ ] Add to `docs/API.md` with `/api/chat` endpoints
- [ ] Update `.github/workflows/test.yml` to test chat routes

### Phase 2 (Library Integration)

- [ ] Extend intent parser for library operations
- [ ] Connect chat to library endpoints
- [ ] Add context enrichment (recent patterns, stats)
- [ ] Implement smart suggestions

### Phase 3 (Advanced)

- [ ] Conversation history persistence
- [ ] Pattern variation suggestions
- [ ] Batch generation
- [ ] Sharing via chat

---

## 🎨 UI Mockup

```
┌─────────────────────────────────────────┐
│  🎹 Rhythm Wolf MIDI                    │
├─────────────────────────────────────────┤
│                                         │
│  Chat                                   │
│  ┌─────────────────────────────────┐   │
│  │ Assistant: Hi! What kind of      │   │
│  │ pattern would you like today?    │   │
│  │                                 │   │
│  │ You: Create a deep house beat   │   │
│  │                                 │   │
│  │ Assistant: Generated! 🎵        │   │
│  │ [Pattern preview]               │   │
│  │ [Save] [Send] [Duplicate]       │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Type your message...            │   │
│  │ [Send ↵]                        │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🚀 Why This Approach?

✅ **Low friction** - Chat is familiar, natural interface  
✅ **Flexible** - Handles complex requests ("slow it down and add more hats")  
✅ **Stateful** - Remembers context ("save that")  
✅ **Discoverable** - Users learn features through conversation  
✅ **Extensible** - Easy to add new intents (batch, variations, sharing)  
✅ **Fun** - Makes pattern creation feel like collaboration  

---

## 📊 Success Metrics

- Users spend more time in chat than separate UI controls
- Higher pattern save rate (chat makes it easier)
- More device interactions (1-click quick send from chat)
- Lower support load (chat explains features naturally)

---

**Next Step:** Build Phase 1 MVP with pattern generation via chat!
