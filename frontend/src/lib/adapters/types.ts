// Agentic Instruments v2: Universal pattern + adapter types

// ========== UNIVERSAL FORMAT ==========
// All patterns standardized to 8 drum parts × 16 steps
export type PartId = 'kick' | 'snare' | 'clap' | 'tom' | 'perc' | 'chh' | 'ohh' | 'bass'

export const PARTS: { id: PartId; name: string; code: string }[] = [
  { id: 'kick', name: 'KICK', code: 'BD' },
  { id: 'snare', name: 'SNARE', code: 'SD' },
  { id: 'clap', name: 'CLAP', code: 'CP' },
  { id: 'tom', name: 'TOM', code: 'TM' },
  { id: 'perc', name: 'PERC', code: 'PC' },
  { id: 'chh', name: 'CLOSED HAT', code: 'CH' },
  { id: 'ohh', name: 'OPEN HAT', code: 'OH' },
  { id: 'bass', name: 'BASS', code: 'BS' },
]

export type UniversalPattern = number[][] // [8 parts][16 steps], velocities 0–127
export type DevicePattern = number[][] // [voices.length][steps], velocities 0–127

// ========== ADAPTER DEFINITION ==========
export interface AdapterVoice {
  name: string // Label on faceplate/grid row
  code: string // Short code or MIDI note number
  parts: PartId[] // Universal parts this voice plays; [] = device-only voice
  note?: number // MIDI note (drums use channel; pitched use note)
}

export interface Adapter {
  id: string
  name: string // Full name
  short: string // Short name (e.g., "Rhythm Wolf")
  maker: string // Manufacturer
  kind: 'Drum' | 'Drum + bass' | 'Drum + synth' | 'Pitched'
  pitched?: boolean // True for melodic adapters (Volca Keys)

  // Hardware
  steps: 16 | 32 | 64 // 16 = 1 page, 32 = 2 pages, 64 = 4 pages
  pages: number // Calculated: steps / 16
  channel: string // Display string, e.g., '10', '1–8', '1'
  portName: string | null // Match against Web MIDI output name; null = any port

  // UI
  faceplate: string // Subtitle under device name
  knobs?: [string, string] // Per-voice knob labels (drum adapters)
  strips?: [string, string, string][] // Pitched: [section, knobA, knobB]

  // Data
  voices: AdapterVoice[]
  caps: string[] // Capabilities: "Tempo", "Read from device", "2 pages", etc.
}

// ========== ADAPTER FACTORY ==========
const v = (name: string, code: string, parts = ''): AdapterVoice => ({
  name,
  code,
  parts: parts ? (parts.split(' ') as PartId[]) : [],
})

export const ADAPTERS: Adapter[] = [
  {
    id: 'wolf',
    name: 'Akai Rhythm Wolf',
    short: 'Rhythm Wolf',
    maker: 'AKAI',
    kind: 'Drum + bass',
    steps: 16,
    pages: 1,
    channel: '10',
    portName: 'Rhythm Wolf',
    faceplate: 'ANALOG DRUM MACHINE & BASS SYNTH',
    knobs: ['LEVEL', 'DECAY'],
    voices: [
      v('KICK', 'BD', 'kick'),
      v('SNARE', 'SD', 'snare clap'),
      v('PERC', 'PC', 'perc tom'),
      v('OPEN HAT', 'OH', 'ohh'),
      v('CLOSED HAT', 'CH', 'chh'),
      v('BASS', 'BS', 'bass'),
    ],
    caps: ['Tempo', 'Bass synth'],
  },
  {
    id: 'rytm',
    name: 'Elektron Analog Rytm MKII',
    short: 'Analog Rytm',
    maker: 'ELEKTRON',
    kind: 'Drum',
    steps: 32,
    pages: 2,
    channel: '10',
    portName: 'Analog Rytm',
    faceplate: '8-VOICE ANALOG DRUM COMPUTER',
    knobs: ['LEVEL', 'TUNE'],
    voices: [
      v('KICK', 'BD', 'kick'),
      v('SNARE', 'SD', 'snare'),
      v('RIM', 'RS', 'perc'),
      v('CLAP', 'CP', 'clap'),
      v('BASS TOM', 'BT', 'bass'),
      v('LOW TOM', 'LT', 'tom'),
      v('MID TOM', 'MT', ''),
      v('HI TOM', 'HT', ''),
      v('CL HAT', 'CH', 'chh'),
      v('OP HAT', 'OH', 'ohh'),
      v('CYMBAL', 'CY', ''),
      v('COWBELL', 'CB', ''),
    ],
    caps: ['Tempo', 'Read from device', '2 pages'],
  },
  {
    id: 'tr8s',
    name: 'Roland TR-8S',
    short: 'TR-8S',
    maker: 'ROLAND',
    kind: 'Drum',
    steps: 16,
    pages: 1,
    channel: '10',
    portName: 'TR-8S',
    faceplate: 'RHYTHM PERFORMER',
    knobs: ['TUNE', 'DECAY'],
    voices: [
      v('KICK', 'BD', 'kick'),
      v('SNARE', 'SD', 'snare'),
      v('LOW TOM', 'LT', 'tom'),
      v('MID TOM', 'MT', ''),
      v('HI TOM', 'HT', ''),
      v('RIM', 'RS', 'perc'),
      v('CLAP', 'HC', 'clap'),
      v('CL HAT', 'CH', 'chh'),
      v('OP HAT', 'OH', 'ohh'),
      v('CRASH', 'CC', ''),
      v('RIDE', 'RC', ''),
    ],
    caps: ['Tempo', 'Read from device'],
  },
  {
    id: 'opz',
    name: 'Teenage Engineering OP-Z',
    short: 'OP-Z',
    maker: 'TEENAGE ENGINEERING',
    kind: 'Drum + synth',
    steps: 64,
    pages: 4,
    channel: '1–8',
    portName: 'OP-Z',
    faceplate: 'SYNTHESIZER & SEQUENCER',
    knobs: ['P1', 'P2'],
    voices: [
      v('KICK', 'T1', 'kick'),
      v('SNARE', 'T2', 'snare clap'),
      v('PERC', 'T3', 'perc tom'),
      v('SAMPLE', 'T4', 'chh ohh'),
      v('BASS', 'T5', 'bass'),
      v('LEAD', 'T6', ''),
      v('ARP', 'T7', ''),
      v('CHORD', 'T8', ''),
    ],
    caps: ['Tempo', '8 tracks', '4 pages'],
  },
  {
    id: 'volca',
    name: 'Korg Volca Keys',
    short: 'Volca Keys',
    maker: 'KORG',
    kind: 'Pitched',
    pitched: true,
    steps: 16,
    pages: 1,
    channel: '1',
    portName: 'volca keys',
    faceplate: 'POLYPHONIC ANALOGUE LOOP SYNTH',
    strips: [
      ['VCO', 'OCTAVE', 'DETUNE'],
      ['VCF', 'CUTOFF', 'PEAK'],
      ['LFO', 'RATE', 'INT'],
      ['EG', 'ATTACK', 'RELEASE'],
      ['DELAY', 'TIME', 'FEEDBACK'],
    ],
    voices: (
      [
        ['D4', 62],
        ['C4', 60],
        ['A3', 57],
        ['G3', 55],
        ['E3', 52],
        ['D3', 50],
        ['C3', 48],
        ['A2', 45],
      ] as [string, number][]
    ).map(([n, c]) => ({ ...v(n, String(c)), note: c })),
    caps: ['Tempo', '3-voice poly'],
  },
  {
    id: 'generic',
    name: 'Generic MIDI drum map',
    short: 'GM Drums',
    maker: 'GENERAL MIDI',
    kind: 'Drum',
    steps: 16,
    pages: 1,
    channel: '10',
    portName: null, // Any port
    faceplate: 'ANY MIDI PORT · CHANNEL 10',
    knobs: ['VELOCITY', 'LENGTH'],
    voices: [
      v('KICK', '36', 'kick'),
      v('RIM', '37', 'perc'),
      v('SNARE', '38', 'snare'),
      v('CLAP', '39', 'clap'),
      v('LOW TOM', '45', 'tom'),
      v('HI TOM', '50', ''),
      v('CL HAT', '42', 'chh'),
      v('OP HAT', '46', 'ohh'),
      v('CRASH', '49', ''),
    ].map((x) => ({ ...x, note: +x.code })),
    caps: ['Any MIDI port'],
  },
]

// Add pages to all adapters
ADAPTERS.forEach((a) => {
  ;(a as any).pages = a.steps / 16
})

// ========== ADAPTER REGISTRY ==========
export const ADAPTER_BY_ID = Object.fromEntries(ADAPTERS.map((a) => [a.id, a]))

export const getAdapter = (id: string): Adapter | undefined => ADAPTER_BY_ID[id]

export const getAdapterByPort = (portName: string): Adapter | undefined =>
  ADAPTERS.find((a) => a.portName === null || a.portName === portName)

// ========== MAPPING HELPERS ==========
export const isMapped = (adapter: Adapter, partId: PartId): boolean => {
  if (adapter.pitched) return partId === 'bass'
  return adapter.voices.some((v) => v.parts.includes(partId))
}

export const mappedCount = (adapter: Adapter): number =>
  PARTS.filter((p) => isMapped(adapter, p.id)).length

export const primaryVoice = (adapter: Adapter, partId: PartId): number =>
  adapter.voices.findIndex((v) => v.parts.includes(partId))
