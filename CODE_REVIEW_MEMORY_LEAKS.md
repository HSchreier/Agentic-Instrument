# 🐛 Memory Leak Audit — Heavy MIDI Packet Handling

## Critical Issues Found

### 1️⃣ **useMIDIDevices.ts — Uncleared Event Listener** 🔴 CRITICAL

**File:** `frontend/src/hooks/useMIDIDevices.ts:23`

**Problem:**
```typescript
midiManager.onDevicesChanged((newDevices) => {
  // This listener is NEVER removed
  // If hook reruns, multiple listeners accumulate
})
```

**Risk:**
- Each component mount = new listener added
- Heavy MIDI traffic = listener fires thousands of times/sec
- Multiple listeners = exponential memory growth
- **Result:** App crashes with heavy incoming packets

**Fix Needed:**
```typescript
useEffect(() => {
  // ... init code ...
  
  const unsubscribe = midiManager.onDevicesChanged((newDevices) => {
    // ... listener code ...
  })
  
  return () => {
    unsubscribe?.() // ← MISSING!
  }
}, [deps])
```

---

### 2️⃣ **SendButton.tsx — Uncleared setInterval** 🔴 CRITICAL

**File:** `frontend/src/components/app/SendButton.tsx:50-65`

**Problem:**
```typescript
const interval = setInterval(() => {
  currentProgress = Math.min(currentProgress + Math.random() * 25, 95)
  setSendProgress(currentProgress)
}, 50)

setTimeout(() => {
  clearInterval(interval)  // ← Only clears on success
  // ...
}, 500)
```

**Risk:**
- If user unmounts component during send → interval keeps running
- If network slow → 500ms timeout might not fire
- Multiple sends = multiple orphaned intervals
- **Result:** CPU spikes, memory leak per send attempt

**Fix Needed:**
```typescript
// Use cleanup function
useEffect(() => {
  if (!sending) return
  
  let interval: NodeJS.Timeout | null = null
  
  // ... send logic ...
  interval = setInterval(...)
  
  return () => {
    if (interval) clearInterval(interval)
  }
}, [sending, deps])
```

---

### 3️⃣ **MIDI.ts — Output Stream Not Closed** 🟡 MEDIUM

**File:** `frontend/src/lib/midi.ts:30-49`

**Problem:**
```typescript
for (const output of outputs) {
  // Output ports are stored but never explicitly closed
  this.devices.set(output.id, {
    output,  // ← Can hold reference to disconnected ports
    // ...
  })
}
```

**Risk:**
- Disconnected devices still referenced in memory
- Port count grows if user plugs/unplugs hardware repeatedly
- Heavy USB traffic = orphaned ports consume resources

**Fix Needed:**
```typescript
// When device disconnects
private removeDevice(id: string) {
  const device = this.devices.get(id)
  if (device?.output) {
    // Close port if possible (depends on browser MIDI API)
    device.output.close?.()
  }
  this.devices.delete(id)
}
```

---

### 4️⃣ **Store — Unbounded Undo History** 🟡 MEDIUM

**File:** `frontend/src/state/store.ts:65`

**Problem:**
```typescript
undo: UniversalPattern[]
pushUndo: () => void  // ← Keeps appending, never prunes
```

**Risk:**
- Each pattern edit = new 8×16 array stored in undo
- With heavy MIDI editing → undo array grows without bound
- **Result:** Memory leak if user does 1000+ edits

**Fix Needed:**
```typescript
const MAX_UNDO_SIZE = 20

pushUndo: () => {
  set((state) => ({
    undo: [...state.undo, state.pattern].slice(-MAX_UNDO_SIZE)
  }))
}
```

---

## Summary

| Issue | Severity | Impact | Fix |
|-------|----------|--------|-----|
| Event listener leak | 🔴 Critical | Crashes with heavy MIDI | Add unsubscribe function |
| setInterval leak | 🔴 Critical | CPU spike on send | Use cleanup in useEffect |
| Port references | 🟡 Medium | Memory creep on USB | Close ports on disconnect |
| Undo history | 🟡 Medium | Memory leak on edits | Cap undo size at 20 |

---

## Recommended Action

**Before shipping to DJs with heavy MIDI traffic:**

1. ✅ Fix listener cleanup (useMIDIDevices.ts)
2. ✅ Fix interval cleanup (SendButton.tsx)
3. ✅ Cap undo history
4. ✅ Test with 10,000+ MIDI events/sec
5. ✅ Monitor memory usage in DevTools

**Without these fixes:** App will crash/freeze when DJs send patterns repeatedly or receive heavy incoming MIDI.

