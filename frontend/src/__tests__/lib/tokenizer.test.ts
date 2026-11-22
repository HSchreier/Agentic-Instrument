import { describe, it, expect } from 'vitest'
import {
  patternToTokens,
  tokensToPattern,
  patternToDescription,
  patternToASCII,
  getPatternEmbedding,
  getPatternSimilarity,
} from '@/lib/tokenizer'
import type { Pattern } from '@/lib/pattern'

describe('Beat Tokenizer', () => {
  const emptyPattern: Pattern = Array(6).fill(null).map(() => Array(16).fill(0))

  const simpleKickPattern: Pattern = Array(6).fill(null).map(() => Array(16).fill(0))
  simpleKickPattern[0][0] = 127 // Kick on step 0
  simpleKickPattern[0][4] = 127 // Kick on step 4
  simpleKickPattern[0][8] = 127 // Kick on step 8
  simpleKickPattern[0][12] = 127 // Kick on step 12

  it('converts empty pattern to tokens', () => {
    const tokens = patternToTokens(emptyPattern)
    expect(tokens).toContain('PATTERN_END')
    expect(tokens.filter(t => t === 'STEP_NEXT')).toHaveLength(15)
  })

  it('converts pattern with kicks to tokens', () => {
    const tokens = patternToTokens(simpleKickPattern)
    expect(tokens).toContain('KICK_ON')
    expect(tokens.filter(t => t === 'KICK_ON')).toHaveLength(4)
  })

  it('converts tokens back to pattern', () => {
    const tokens = patternToTokens(simpleKickPattern)
    const reconstructed = tokensToPattern(tokens)
    expect(reconstructed[0].filter(v => v > 0)).toHaveLength(4)
  })

  it('generates human-readable description', () => {
    const description = patternToDescription(simpleKickPattern)
    expect(description).toContain('Kick')
    expect(description).toContain('4 hits')
  })

  it('generates ASCII visualization', () => {
    const ascii = patternToASCII(simpleKickPattern)
    expect(ascii).toContain('BD') // Kick row
    expect(ascii.split('\n')).toHaveLength(7) // 6 voices + empty line
  })

  it('calculates pattern embeddings', () => {
    const embedding = getPatternEmbedding(simpleKickPattern)
    expect(embedding).toHaveLength(7) // 6 densities + variance
    expect(embedding[0]).toBeCloseTo(0.25) // 4 kicks out of 16 steps
  })

  it('calculates pattern similarity', () => {
    const similarity = getPatternSimilarity(simpleKickPattern, simpleKickPattern)
    expect(similarity).toBeCloseTo(1) // Identical patterns should be 100% similar

    const similarity2 = getPatternSimilarity(simpleKickPattern, emptyPattern)
    expect(similarity2).toBeLessThan(1) // Different patterns should be less similar
  })
})
