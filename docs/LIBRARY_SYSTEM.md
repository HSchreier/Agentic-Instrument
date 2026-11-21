# Pattern Library System

Complete guide to managing, browsing, and sending MIDI patterns from your library.

## 🗂️ Library File Structure

```
patterns/
├── library/
│   ├── metadata.json              # Index of all patterns
│   ├── techno/
│   │   ├── abc12345.json         # Pattern file
│   │   ├── def67890.json
│   │   └── ...
│   ├── house/
│   │   ├── ghi11111.json
│   │   └── ...
│   ├── tech_house/
│   ├── minimal/
│   ├── favorites/                 # Symlinks or copies
│   └── backups/                    # Auto-backup versions
└── exports/                        # Exported standalone MIDIs
    ├── pattern_name.json
    └── ...
```

### File Format

Each pattern file contains:

```json
{
  "metadata": {
    "id": "abc12345",
    "name": "Deep House Groove",
    "style": "house",
    "tempo": 122,
    "template": "four_on_the_floor",
    "tags": ["house", "groove", "deep"],
    "description": "Soulful deep house pattern with open hats",
    "created_at": "2026-11-21T22:30:00",
    "updated_at": "2026-11-21T23:00:00",
    "favorite": true,
    "plays": 42
  },
  "pattern": {
    "metadata": {
      "style": "house",
      "tempo": 122,
      "num_events": 24
    },
    "events": [
      {"channel": 10, "note": 36, "velocity": 127},
      {"channel": 10, "note": 44, "velocity": 42},
      ...
    ]
  }
}
```

## 🎯 Core Features

### 1. Save Pattern to Library

```typescript
// Frontend
const response = await axios.post('/api/library/patterns', {
  name: "My Techno Beat",
  style: "techno",
  tags: ["techno", "hypnotic"],
  description: "4-on-the-floor kick pattern",
  metadata: { style: "techno", tempo: 128, num_events: 24 },
  events: [...]
})

const patternId = response.data.pattern_id
```

**Backend Python:**
```python
library = PatternLibrary()
pattern_id = library.save_pattern(
    pattern={...},
    name="My Techno Beat",
    style="techno",
    template="four_on_the_floor",
    tags=["techno", "hypnotic"],
    description="4-on-the-floor kick pattern",
)
```

### 2. Browse & Search

```typescript
// Frontend - React Hook
const { data: patterns } = useQuery({
  queryKey: ['library', style, search],
  queryFn: () => axios.get('/api/library/patterns', {
    params: {
      style,       // e.g., "techno"
      search,      // e.g., "groovy"
      tag,         // e.g., "minimal"
      favorites_only: true
    }
  })
})
```

**Features:**
- Filter by style (Techno, House, Tech House, Minimal)
- Full-text search in name & description
- Filter by tags
- Favorites only view
- Sort by play count or date

### 3. Quick Send to Device

**One-click send:**
```typescript
const sendPattern = async (patternId: string, device: string) => {
  await axios.post(`/api/library/patterns/${patternId}/send`, {
    device
  })
  // Pattern sent! Play count auto-incremented
}
```

**What happens:**
1. Pattern loaded from storage
2. MIDI events streamed to device in real-time
3. Device quantizes and records
4. Play count incremented
5. Last-updated timestamp recorded

### 4. Pattern Management

#### Duplicate
```typescript
await axios.post(`/api/library/patterns/{id}/duplicate`, {
  new_name: "My Techno Beat (Variation)"
})
```

#### Toggle Favorite
```typescript
const isFavorite = await axios.post(`/api/library/patterns/{id}/favorite`)
```

#### Delete
```typescript
await axios.delete(`/api/library/patterns/{id}`)
```

#### Export as MIDI
```python
library.export_pattern(
    pattern_id="abc12345",
    export_path="exports/my_pattern.json"
)
```

## 📊 Library Statistics

```typescript
const stats = await axios.get('/api/library/statistics')
// Returns:
{
  "total_patterns": 42,
  "by_style": {
    "techno": 20,
    "house": 15,
    "tech_house": 5,
    "minimal": 2
  },
  "by_tag": {
    "hypnotic": 12,
    "groovy": 8,
    "minimal": 3
  },
  "total_plays": 1234,
  "favorites": 8
}
```

## 🎨 Frontend UI Components

### Pattern Library Browser

Located: `frontend/src/components/PatternLibrary.tsx`

**Features:**
- 📊 Statistics dashboard (total patterns, favorites, plays, styles)
- 🔍 Search & filter bar
- 🏷️ Style selector with counts
- ⭐ Favorites toggle
- 📋 Pattern cards showing:
  - Name & description
  - Style & tempo badges
  - Tags
  - Play count & creation date
  - Favorite indicator

**Actions on Selected Pattern:**
- 📂 Load - Add to generator
- 📋 Duplicate - Create variation
- 🚀 Quick Send - One-click send to device
- 🗑️ Delete - Remove from library

### Integration with Main App

```typescript
// App.tsx
import { PatternLibrary } from './components/PatternLibrary'

export default function App() {
  return (
    <main>
      <div className="grid grid-cols-3 gap-8">
        <PatternGenerator />
        <PatternLibrary />    {/* New! */}
        <PatternSender />
      </div>
    </main>
  )
}
```

## 🔄 Workflow Examples

### Save Your First Pattern

```
1. Use Pattern Generator to create pattern
2. Click "Save to Library" button
3. Enter name, style, tags
4. Pattern saved with unique ID
5. Appears in library immediately
```

### Quick Send Saved Pattern

```
1. Browse library
2. Find pattern (use search/filters)
3. Click pattern card to select
4. Click "Quick Send" button
5. Pattern sent to device in real-time
6. Play count incremented
```

### Create Variations

```
1. Find base pattern in library
2. Click "Duplicate"
3. Modify if needed
4. Save new variation
5. Original remains intact
```

### Organize with Tags

```
# Examples
- By tempo: "120bpm", "128bpm"
- By vibe: "groovy", "hypnotic", "minimal"
- By use: "live", "production", "testing"
- By status: "work-in-progress", "finished"

# Search with tags
?tag=groovy → Find all groovy patterns
?search=deep+tag=house → Find deep house patterns
```

## 💾 Backup & Export

### Automatic Backups
- Previous versions stored in `patterns/library/backups/`
- Timestamped file names
- Keep last 10 versions

### Manual Export
```python
# Export individual pattern
library.export_pattern(
    pattern_id="abc12345",
    export_path="exports/my_pattern.json"
)

# Export all patterns
for pattern in library.list_patterns():
    library.export_pattern(
        pattern_id=pattern.id,
        export_path=f"exports/{pattern.name}.json"
    )
```

## 🚀 Advanced Usage

### Batch Operations (Future)

```typescript
// Import multiple patterns
await axios.post('/api/library/batch-import', {
  patterns: [file1, file2, file3]
})

// Auto-organize by style
await axios.post('/api/library/auto-organize')

// Merge two libraries
await axios.post('/api/library/merge', {
  source: "other_library.json"
})
```

### Sharing Patterns (Future)

```typescript
// Generate shareable link
const link = await axios.post(`/api/library/patterns/{id}/share`)
// link: https://rhythm-wolf.dev/patterns/abc12345

// Import from shared link
await axios.post('/api/library/import-shared', { url: link })
```

### Cloud Sync (Future)

```typescript
// Sync with cloud
await axios.post('/api/library/sync-cloud')

// View cloud backups
const backups = await axios.get('/api/library/cloud-backups')

// Restore from cloud
await axios.post('/api/library/restore-cloud', {
  backup_id: "backup_123"
})
```

## 📈 Best Practices

### Naming Patterns
✅ Good:
- "Deep House - 122 BPM"
- "Techno - Hypnotic Groove"
- "Minimal - Sparse Kick"

❌ Avoid:
- "pattern1", "test", "new"
- Generic names without context
- Very long descriptions

### Using Tags
- Keep tags 1-3 per pattern
- Use consistent tag names
- Filter by tag frequently
- "Favorite" for quick access

### Organizing Library
- Save patterns as you create them
- Use descriptions for context
- Duplicate before major modifications
- Export important patterns regularly

### Performance
- Library works offline (local storage)
- Fast search even with 1000+ patterns
- Play count tracked automatically
- Last-updated timestamp for sorting

## 🎯 UX Flow: From Creation to Send

```
User Creates Pattern
        ↓
"Save to Library" Button
        ↓
Save Dialog:
  - Name: "Deep House Groove"
  - Style: house
  - Tags: deep, groovy
  - Description: Optional
        ↓
Pattern Saved with ID
        ↓
Show in Library Browser
        ↓
User Browses Library:
  - Search: "deep"
  - Filter: style=house
  - Sort: favorites, recents
        ↓
Select Pattern Card
        ↓
Quick Actions:
  - Load → Edit
  - Duplicate → Create variant
  - Quick Send → ⚡ Instant to device
  - Delete → Remove
        ↓
ONE-CLICK SEND
  Device enters Record Performance
  MIDI streamed in real-time
  Pattern recorded & saved
  UI shows success ✅
```

---

## 📚 Architecture

### Backend (`rhythm_wolf/library.py`)

```python
class PatternLibrary:
    # Core methods
    save_pattern()           # Save to storage
    get_pattern()            # Load by ID
    list_patterns()          # Search & filter
    delete_pattern()         # Remove
    toggle_favorite()        # Star/unstar
    increment_plays()        # Track usage
    duplicate_pattern()      # Create variant
    export_pattern()         # Export MIDI
    get_statistics()         # Library stats
```

### API Endpoints (`backend/library_routes.py`)

```
POST   /api/library/patterns                 → Save
GET    /api/library/patterns                 → List/search
GET    /api/library/patterns/{id}            → Get one
DELETE /api/library/patterns/{id}            → Delete
POST   /api/library/patterns/{id}/favorite   → Toggle star
POST   /api/library/patterns/{id}/send       → Quick send!
POST   /api/library/patterns/{id}/duplicate  → Copy
GET    /api/library/statistics               → Stats
```

### Frontend (`frontend/src/components/PatternLibrary.tsx`)

React component with:
- Browse & search
- Statistics display
- Pattern cards
- Quick actions
- Favorite toggle
- Delete confirmation

---

**Next step:** Integrate PatternLibrary into the main App UI!
