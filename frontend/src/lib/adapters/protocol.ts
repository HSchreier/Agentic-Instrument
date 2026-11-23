// Agentic Instruments v2: Universal ↔ Device pattern translation

import { Adapter, DevicePattern, PartId, PARTS, UniversalPattern, primaryVoice } from './types'

// ========== UNIVERSAL → DEVICE ==========
/**
 * Convert universal 8×16 pattern to device-specific layout
 * Repeats 16-step bar across pages; adds fills for multi-page devices
 */
export function toDevice(universal: UniversalPattern, adapter: Adapter): DevicePattern {
  const n = adapter.steps
  const rows = adapter.voices.map(() => Array(n).fill(0) as number[])
  const partIndex = (id: PartId) => PARTS.findIndex((p) => p.id === id)

  if (adapter.pitched) {
    // Pitched adapters (Volca Keys): bass line → melody, kick → bass note
    // Heuristic: pentatonic lanes based on bass/kick content
    const mel = [3, 1, 2, 0, 4, 1, 2, 3]
    for (let i = 0; i < n; i++) {
      const bassVel = universal[partIndex('bass')][i % 16]
      const kickVel = universal[partIndex('kick')][i % 16]
      if (bassVel) {
        rows[mel[(i >> 1) % 8]][i] = bassVel
      } else if (kickVel) {
        rows[7][i] = Math.round(kickVel * 0.85)
      }
      // Light hat accents
      if (universal[partIndex('chh')][i % 16] && i % 4 === 2 && !bassVel) {
        rows[5][i] = 70
      }
    }
    return rows
  }

  // Drum adapters: map universal parts to device voices
  adapter.voices.forEach((voice, voiceIdx) => {
    const partIndices = voice.parts.map(partIndex)
    for (let i = 0; i < n; i++) {
      rows[voiceIdx][i] = partIndices.reduce((max, pi) => Math.max(max, universal[pi][i % 16]), 0)
    }
  })

  // Multi-page devices: add fills
  if (n > 16) {
    // Snare fill on last 4 steps
    const snareVoice = primaryVoice(adapter, 'snare')
    if (snareVoice >= 0) {
      [60, 80, 100, 120].forEach((vel, j) => {
        rows[snareVoice][n - 4 + j] ||= vel
      })
    }

    // Open hat lift at end of every second page
    const hatVoice = primaryVoice(adapter, 'ohh')
    if (hatVoice >= 0) {
      for (let page = 1; page < n / 16; page += 2) {
        rows[hatVoice][page * 16 + 15] ||= 90
      }
    }
  }

  return rows
}

// ========== DEVICE → UNIVERSAL ==========
/**
 * Convert device pattern (one 16-step page) to universal format
 * Page offset extracted from device pattern starting at step 0
 */
export function toUniversal(device: DevicePattern, adapter: Adapter, page = 0): UniversalPattern {
  const offset = page * 16

  if (adapter.pitched) {
    // Pitched: all device rows collapse to universal bass part
    const universal = PARTS.map(() => Array(16).fill(0) as number[])
    for (let i = 0; i < 16; i++) {
      universal[7][i] = Math.max(0, ...device.map((r) => r[offset + i] || 0))
    }
    return universal
  }

  // Drum: each part takes from its primary voice
  return PARTS.map((part) => {
    const voiceIdx = primaryVoice(adapter, part.id)
    return Array.from({ length: 16 }, (_, i) => (voiceIdx < 0 ? 0 : device[voiceIdx][offset + i] || 0))
  })
}

// ========== DEVICE SWITCHING ==========
/**
 * Carry groove across device switch
 * Converts device pattern → universal → new device pattern
 */
export const translate = (device: DevicePattern, from: Adapter, to: Adapter, page = 0) =>
  toDevice(toUniversal(device, from, page), to)

// ========== PATTERN ANALYSIS ==========
export const eventCount = (pattern: number[][]): number =>
  pattern.reduce((sum, row) => sum + row.filter((v) => v > 0).length, 0)

export const cycleVelocity = (v: number): number => {
  if (v === 0) return 120 // off → accent
  if (v >= 100) return 70 // accent → soft
  return 0 // soft → off
}

export const density = (events: number): string => {
  if (events < 18) return 'Sparse'
  if (events < 28) return 'Medium'
  return 'Dense'
}

export const estimateSendMs = (events: number): number => Math.max(1200, events * 100)

// ========== GENERATION (placeholder; production uses backend/Claude) ==========
export type Style = 'Techno' | 'House' | 'Tech House' | 'Minimal' | 'D&B'
export type Template = 'Four on the Floor' | 'Half Time' | 'Minimal'

export const STYLES: Record<Style, { bpm: number; min: number; max: number }> = {
  Techno: { bpm: 130, min: 125, max: 140 },
  House: { bpm: 124, min: 118, max: 128 },
  'Tech House': { bpm: 126, min: 122, max: 130 },
  Minimal: { bpm: 122, min: 118, max: 128 },
  'D&B': { bpm: 174, min: 165, max: 180 },
}

function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function generateUniversal(style: Style, template: Template, bass: boolean, seed: number): UniversalPattern {
  const r = rng(seed)
  const z = () => Array(16).fill(0) as number[]
  const vel = (b: number) => Math.round(b * (0.78 + 0.22 * r()))

  const k = z()
  const s = z()
  const p = z()
  const o = z()
  const c = z()
  const b = z()

  const dnb = style === 'D&B'
  const sparse = template === 'Minimal' || style === 'Minimal'

  if (dnb) {
    k[0] = 127
    k[10] = 120
    if (r() > 0.5) k[7] = 90
    s[4] = 120
    s[12] = 120
    if (r() > 0.4) s[15] = 60
    for (let i = 0; i < 16; i += 2) c[i] = vel(i % 4 === 2 ? 110 : 80)
    if (r() > 0.5) o[14] = 90
  } else if (template === 'Half Time') {
    k[0] = 127
    if (r() > 0.5) k[6] = 100
    k[10] = 110
    s[8] = 120
    for (let i = 2; i < 16; i += 4) c[i] = vel(100)
    o[14] = 90
  } else {
    ;[0, 4, 8, 12].forEach((i) => (k[i] = 127))
    if (!(template === 'Minimal' && style === 'Minimal')) {
      s[4] = style === 'Minimal' ? 80 : 110
      s[12] = s[4]
    }
    for (let i = 0; i < 16; i++) {
      if (i % 4 === 2) c[i] = vel(115)
      else if (!sparse && (style === 'Techno' || style === 'Tech House')) c[i] = r() > 0.35 ? vel(65) : 0
    }
    if (style !== 'Minimal') {
      ;[2, 6, 10, 14].forEach((i) => {
        if (style !== 'Techno' || r() > 0.4) o[i] = vel(95)
      })
    }
  }

  const hits = sparse ? 2 : 3 + Math.floor(r() * 3)
  for (let n = 0; n < hits; n++) {
    const i = Math.floor(r() * 16)
    if (!k[i]) p[i] = vel(90)
  }
  if (sparse) {
    for (let i = 0; i < 16; i++) if (c[i] && i % 4 !== 2 && r() > 0.5) c[i] = 0
  }

  if (bass) {
    ;(dnb ? [0, 3, 10, 11] : [2, 6, 10, 14]).forEach((i) => (b[i] = vel(110)))
    for (let i = 1; i < 16; i += 4) if (r() > 0.6) b[i] = vel(70)
  }

  const r2 = rng(seed + 99)
  const cl = z()
  const t = z()
  if ((style === 'House' || style === 'Tech House') && template !== 'Half Time') {
    ;[4, 12].forEach((i) => {
      cl[i] = 110
      if (s[i]) s[i] = 70
    })
  }
  if (r2() > 0.4) {
    t[13] = 85
    t[14] = 100
  }
  if (dnb && r2() > 0.5) t[7] = 80

  return [k, s, cl, t, p, c, o, b]
}
