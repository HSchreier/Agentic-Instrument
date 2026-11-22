import { describe, it, expect } from 'vitest'
import {
  TOKEN_PRIMES,
  voiceToPrimes,
  primesToComposite,
  getbitPattern,
  vectorToMidi,
  primeSimilarity,
  encodePatternToPrimes,
} from '@/lib/primeFactorization'
import type { Pattern } from '@/lib/pattern'

describe('Prime Factorization PoC', () => {
  const emptyPattern: Pattern = Array(6).fill(null).map(() => Array(16).fill(0))

  const kickPattern: Pattern = Array(6).fill(null).map(() => Array(16).fill(0))
  kickPattern[0][0] = 127
  kickPattern[0][4] = 127
  kickPattern[0][8] = 127
  kickPattern[0][12] = 127

  it('defines TOKEN_PRIMES constants', () => {
    expect(TOKEN_PRIMES['KICK_ON']).toBe(2)
    expect(TOKEN_PRIMES['SNARE_ON']).toBe(3)
  })

  it('converts voice to prime sequence', () => {
    const primes = voiceToPrimes(kickPattern, 0)
    expect(primes).toHaveLength(16)
    expect(primes[0]).toBeGreaterThan(1) // Has kick
    expect(primes[1]).toBe(1) // No kick
  })

  it('converts primes to composite number', () => {
    const primes = [2, 1, 3, 1, 5, 1, 1, 1]
    const composite = primesToComposite(primes)
    expect(composite).toBeGreaterThan(BigInt(0))
    expect(composite.toString()).toMatch(/^\d+$/)
  })

  it('extracts bit pattern from composite', () => {
    const primes = [2, 3, 5]
    const composite = primesToComposite(primes)
    const bits = getbitPattern(composite, 16)
    expect(bits).toHaveLength(16)
    expect(bits.some(b => b === 1)).toBe(true)
  })

  it('converts vector to MIDI velocities', () => {
    const vec = [0.5, 0.25, 0.75, 0.1, 0.9, 0.3, 0.6]
    const midi = vectorToMidi(vec, 8)
    expect(midi).toHaveLength(16)
    expect(midi.every(v => v >= 0 && v <= 127)).toBe(true)
  })

  it('calculates prime similarity', () => {
    const p1 = BigInt(6) // 2 × 3
    const p2 = BigInt(6) // 2 × 3 (identical)
    const p3 = BigInt(10) // 2 × 5 (shares one prime)

    const sim1 = primeSimilarity(p1, p2)
    const sim2 = primeSimilarity(p1, p3)

    expect(sim1).toBeCloseTo(1) // Identical
    expect(sim2).toBeLessThan(sim1) // Different
  })

  it('encodes pattern to primes', () => {
    const composites = encodePatternToPrimes(kickPattern)
    expect(composites).toHaveLength(6) // 6 voices
    expect(composites.every(c => c > BigInt(0))).toBe(true)
  })

  it('handles empty pattern', () => {
    const composites = encodePatternToPrimes(emptyPattern)
    expect(composites).toHaveLength(6)
  })
})
