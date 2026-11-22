// Pattern generation, helpers and types
export type VoiceId = 'kick' | 'snare' | 'perc' | 'ohh' | 'chh' | 'bass'
export type Style = 'Techno' | 'House' | 'Tech House' | 'Minimal' | 'D&B'
export type Template = 'Four on the Floor' | 'Half Time' | 'Minimal'
export type Pattern = number[][] // [6][16]

export const VOICES: { id: VoiceId; name: string; code: string }[] = [
  { id: 'kick', name: 'KICK', code: 'BD' },
  { id: 'snare', name: 'SNARE', code: 'SD' },
  { id: 'perc', name: 'PERC', code: 'PC' },
  { id: 'ohh', name: 'OPEN HAT', code: 'OH' },
  { id: 'chh', name: 'CLOSED HAT', code: 'CH' },
  { id: 'bass', name: 'BASS', code: 'BS' },
]

export const STYLES: Record<Style, { bpm: number; min: number; max: number }> = {
  Techno: { bpm: 130, min: 125, max: 140 },
  House: { bpm: 124, min: 118, max: 128 },
  'Tech House': { bpm: 126, min: 122, max: 130 },
  Minimal: { bpm: 122, min: 118, max: 128 },
  'D&B': { bpm: 174, min: 165, max: 180 },
}

export const TEMPLATES: Template[] = ['Four on the Floor', 'Half Time', 'Minimal']

function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function generate(style: Style, template: Template, bass: boolean, seed: number): Pattern {
  const r = rng(seed)
  const z = () => Array(16).fill(0) as number[]
  const v = (b: number) => Math.round(b * (0.78 + 0.22 * r()))
  const k = z(), s = z(), p = z(), o = z(), c = z(), b = z()
  const dnb = style === 'D&B'
  const sparse = template === 'Minimal' || style === 'Minimal'

  if (dnb) {
    k[0] = 127; k[10] = 120; if (r() > 0.5) k[7] = 90
    s[4] = 120; s[12] = 120; if (r() > 0.4) s[15] = 60
    for (let i = 0; i < 16; i += 2) c[i] = v(i % 4 === 2 ? 110 : 80)
    if (r() > 0.5) o[14] = 90
  } else if (template === 'Half Time') {
    k[0] = 127; if (r() > 0.5) k[6] = 100; k[10] = 110
    s[8] = 120
    for (let i = 2; i < 16; i += 4) c[i] = v(100)
    o[14] = 90
  } else {
    [0, 4, 8, 12].forEach((i) => (k[i] = 127))
    if (!(template === 'Minimal' && style === 'Minimal')) {
      s[4] = style === 'Minimal' ? 80 : 110;
      s[12] = s[4];
    }
    for (let i = 0; i < 16; i++) {
      if (i % 4 === 2) c[i] = v(115)
      else if (!sparse && (style === 'Techno' || style === 'Tech House')) c[i] = r() > 0.35 ? v(65) : 0
    }
    if (style !== 'Minimal') {
      [2, 6, 10, 14].forEach((i) => {
        if (style !== 'Techno' || r() > 0.4) o[i] = v(95);
      })
    }
  }
  const hits = sparse ? 2 : 3 + Math.floor(r() * 3)
  for (let n = 0; n < hits; n++) {
    const i = Math.floor(r() * 16);
    if (!k[i]) p[i] = v(90);
  }
  if (sparse) {
    for (let i = 0; i < 16; i++) {
      if (c[i] && i % 4 !== 2 && r() > 0.5) c[i] = 0
    }
  }
  if (bass) {
    (dnb ? [0, 3, 10, 11] : [2, 6, 10, 14]).forEach((i) => (b[i] = v(110)))
    for (let i = 1; i < 16; i += 4) if (r() > 0.6) b[i] = v(70)
  }
  return [k, s, p, o, c, b]
}

export const eventCount = (p: Pattern) => p.reduce((a, row) => a + row.filter(Boolean).length, 0)

// Step click cycle: off → 120 (accent) → 70 (soft) → off
export const cycleVelocity = (v: number) => (v === 0 ? 120 : v >= 100 ? 70 : 0)

// Density label used on library cards
export const density = (events: number) => (events < 18 ? 'Sparse' : events < 28 ? 'Medium' : 'Dense')

// Send estimate shown in confirm dialog (ms)
export const estimateSendMs = (events: number) => Math.max(1200, events * 100)

// Chat prompt → parameters (prototype heuristic; real app uses Claude API)
export function parsePrompt(text: string) {
  const t = text.toLowerCase()
  let style: Style = 'Techno'
  if (/d&b|dnb|drum.?(and|&|n).?bass|jungle/.test(t)) style = 'D&B'
  else if (/tech.?house/.test(t)) style = 'Tech House'
  else if (/minimal|micro/.test(t)) style = 'Minimal'
  else if (/house|garage|disco/.test(t)) style = 'House'
  const m = t.match(/(\d{2,3})\s*(bpm)?/)
  const bpm = m ? Math.min(300, Math.max(20, +m[1])) : STYLES[style].bpm
  const template: Template = /half/.test(t) ? 'Half Time' : /sparse|stripped|minimal/.test(t) ? 'Minimal' : 'Four on the Floor'
  const bass = !/no bass|without bass/.test(t)
  return { style, bpm, template, bass }
}
