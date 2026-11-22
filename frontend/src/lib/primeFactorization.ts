import type { Pattern } from './pattern'

// Prime Factorization Compression PoC
// See: docs/PRIME_FACTORIZATION_POC.md

// Token → Prime mapping (Gödel-style numbering)
export const TOKEN_PRIMES = {
  'KICK_ON': 2,
  'SNARE_ON': 3,
  'PERC_ON': 5,
  'OPHAT_ON': 7,
  'CLHAT_ON': 11,
  'BASS_ON': 13,
  'STEP_NEXT': 17,
  'PATTERN_END': 19,
} as const

// Convert pattern voice to prime sequence
export function voiceToPrimes(pattern: Pattern, voice: number): number[] {
  return pattern[voice].map(vel => vel > 0 ? TOKEN_PRIMES['KICK_ON'] + voice : 1)
}

// Compute composite number from prime sequence
export function primesToComposite(primes: number[]): bigint {
  return primes.reduce((product, p) => product * BigInt(p), BigInt(1))
}

// Extract bit pattern from composite number
export function getbitPattern(composite: bigint, bitDepth: number = 16): number[] {
  const bits: number[] = []
  let n = composite
  for (let i = 0; i < bitDepth; i++) {
    bits.push(Number(n & BigInt(1)))
    n = n >> BigInt(1)
  }
  return bits
}

// Placeholder: FFT implementation (requires fft.js or dsp.js)
export function fftPrimes(_primes: number[]): number[] {
  // TODO: Implement FFT
  // For now, return placeholder
  return Array(9).fill(0)
}

// Placeholder: Gaussian vectorization
export function gaussianVectorize(_spectrum: number[]): number[] {
  // TODO: Implement Gaussian smoothing + feature extraction
  // Returns 7-dimensional vector
  return Array(7).fill(0)
}

// Convert vector to MIDI velocities (0-127)
export function vectorToMidi(vec: number[], bitDepth: number = 8): number[] {
  const denom = Math.pow(2, bitDepth)

  return Array(16).fill(0).map((_, step) => {
    const normalized = vec[step % vec.length] / denom
    return Math.round(Math.max(0, Math.min(normalized * 127, 127)))
  })
}

// Full encode: Pattern → Primes → FFT → Gaussian → MIDI
export function encodePatternToPrimes(pattern: Pattern): bigint[] {
  const composites: bigint[] = []

  for (let v = 0; v < 6; v++) {
    const primes = voiceToPrimes(pattern, v)
    const composite = primesToComposite(primes)
    composites.push(composite)
  }

  return composites
}

// Decode: Composites → Pattern
export function decodePattern(composites: bigint[]): Pattern {
  const pattern: Pattern = Array(6).fill(null).map(() => Array(16).fill(0))

  // TODO: Implement proper factorization + reconstruction
  // For now, return empty pattern
  return pattern
}

// Semantic similarity via shared primes
export function primeSimilarity(p1: bigint, p2: bigint): number {
  const gcd = (a: bigint, b: bigint): bigint => (b === BigInt(0) ? a : gcd(b, a % b))
  const common = gcd(p1, p2)
  const lcm = (p1 * p2) / common

  return Number(common * BigInt(2)) / Number(lcm)
}

// Status: PoC Foundation Complete
// Next: Implement actual FFT and Gaussian vectorization
// See: docs/PRIME_FACTORIZATION_POC.md
