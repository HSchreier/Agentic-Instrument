import type { Pattern } from './pattern'

// Beat tokenization for Claude understanding
export type BeatToken =
  | 'KICK_ON' | 'KICK_OFF' | 'SNARE_ON' | 'SNARE_OFF'
  | 'PERC_ON' | 'PERC_OFF' | 'OPHAT_ON' | 'OPHAT_OFF'
  | 'CLHAT_ON' | 'CLHAT_OFF' | 'BASS_ON' | 'BASS_OFF'
  | 'STEP_NEXT' | 'PATTERN_END'

export const VOICE_TOKENS = {
  kick: { on: 'KICK_ON', off: 'KICK_OFF' },
  snare: { on: 'SNARE_ON', off: 'SNARE_OFF' },
  perc: { on: 'PERC_ON', off: 'PERC_OFF' },
  ohh: { on: 'OPHAT_ON', off: 'OPHAT_OFF' },
  chh: { on: 'CLHAT_ON', off: 'CLHAT_OFF' },
  bass: { on: 'BASS_ON', off: 'BASS_OFF' },
} as const

const TOKEN_TO_VOICE: Record<string, [number, string]> = {
  'KICK_ON': [0, 'on'], 'KICK_OFF': [0, 'off'],
  'SNARE_ON': [1, 'on'], 'SNARE_OFF': [1, 'off'],
  'PERC_ON': [2, 'on'], 'PERC_OFF': [2, 'off'],
  'OPHAT_ON': [3, 'on'], 'OPHAT_OFF': [3, 'off'],
  'CLHAT_ON': [4, 'on'], 'CLHAT_OFF': [4, 'off'],
  'BASS_ON': [5, 'on'], 'BASS_OFF': [5, 'off'],
}

// Convert pattern to token sequence
export function patternToTokens(pattern: Pattern): BeatToken[] {
  const tokens: BeatToken[] = []

  for (let step = 0; step < 16; step++) {
    for (let voice = 0; voice < 6; voice++) {
      const velocity = pattern[voice][step]

      if (velocity > 0) {
        // Map voice index to token
        const voiceTokens = Object.values(VOICE_TOKENS)[voice]
        tokens.push(voiceTokens.on as BeatToken)
      }
    }

    if (step < 15) {
      tokens.push('STEP_NEXT')
    }
  }

  tokens.push('PATTERN_END')
  return tokens
}

// Convert token sequence back to pattern
export function tokensToPattern(tokens: BeatToken[]): Pattern {
  const pattern: Pattern = Array(6).fill(null).map(() => Array(16).fill(0))
  let currentStep = 0

  for (const token of tokens) {
    if (token === 'STEP_NEXT') {
      currentStep++
      continue
    }

    if (token === 'PATTERN_END') {
      break
    }

    const mapping = TOKEN_TO_VOICE[token]
    if (mapping) {
      const [voiceIdx, state] = mapping
      if (state === 'on' && currentStep < 16) {
        pattern[voiceIdx][currentStep] = 100 + Math.floor(Math.random() * 27) // 100-127 velocity
      }
    }
  }

  return pattern
}

// Create human-readable beat description
export function patternToDescription(pattern: Pattern): string {
  const voices = ['Kick', 'Snare', 'Perc', 'Open Hat', 'Closed Hat', 'Bass']
  const description: string[] = []

  for (let v = 0; v < 6; v++) {
    const hits = pattern[v].filter(vel => vel > 0).length
    if (hits > 0) {
      description.push(`${voices[v]}: ${hits} hits`)
    }
  }

  return description.join(' | ')
}

// Create compact ASCII visualization
export function patternToASCII(pattern: Pattern): string {
  const voices = ['BD', 'SD', 'PC', 'OH', 'CH', 'BS']
  let ascii = ''

  for (let v = 0; v < 6; v++) {
    ascii += `${voices[v]} `
    for (let s = 0; s < 16; s++) {
      const vel = pattern[v][s]
      if (vel === 0) ascii += '·'
      else if (vel < 80) ascii += '○'
      else if (vel < 110) ascii += '◐'
      else ascii += '●'
    }
    ascii += '\n'
  }

  return ascii
}

// Create pattern embedding for similarity
export function getPatternEmbedding(pattern: Pattern): number[] {
  const embedding: number[] = []

  // Density per voice
  for (let v = 0; v < 6; v++) {
    const hits = pattern[v].filter(vel => vel > 0).length
    embedding.push(hits / 16)
  }

  // Pattern complexity (variance in densities)
  const densities = Array(6).fill(0).map((_, v) =>
    pattern[v].filter(vel => vel > 0).length / 16
  )
  const mean = densities.reduce((a, b) => a + b) / 6
  const variance = densities.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) / 6
  embedding.push(Math.sqrt(variance))

  return embedding
}

// Calculate pattern similarity (0-1)
export function getPatternSimilarity(p1: Pattern, p2: Pattern): number {
  const e1 = getPatternEmbedding(p1)
  const e2 = getPatternEmbedding(p2)

  const dotProduct = e1.reduce((sum, v, i) => sum + v * e2[i], 0)
  const mag1 = Math.sqrt(e1.reduce((sum, v) => sum + v * v, 0))
  const mag2 = Math.sqrt(e2.reduce((sum, v) => sum + v * v, 0))

  return mag1 && mag2 ? dotProduct / (mag1 * mag2) : 0
}
