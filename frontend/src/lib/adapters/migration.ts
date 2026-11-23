// Agentic Instruments v2: Pattern migration from v1.0 (6×16 Rhythm Wolf) to v2.0 (8×16 Universal)

import { ADAPTERS, UniversalPattern } from './types'

/**
 * v1.0 pattern format: 6 voices × 16 steps on Rhythm Wolf
 * - 0: Kick
 * - 1: Snare
 * - 2: Percussion
 * - 3: Open Hat
 * - 4: Closed Hat
 * - 5: Bass
 */
export type RhythmWolfPattern = number[][] // [6][16]

/**
 * Migrate Rhythm Wolf (v1.0) pattern to Universal (v2.0) format
 * Maps 6 voices → 8 universal parts with best guesses
 *
 * Mapping:
 * - Kick → kick
 * - Snare → snare
 * - Percussion → clap + tom (use max)
 * - Open Hat → ohh
 * - Closed Hat → chh
 * - Bass → bass
 *
 * Missing: clap (use as percussion), tom (use as percussion)
 */
export function migrateRhythmWolfToUniversal(rwPattern: RhythmWolfPattern): UniversalPattern {
  return [
    rwPattern[0], // kick → kick
    rwPattern[1], // snare → snare
    Array(16).fill(0), // clap (not in v1.0, default empty)
    Array(16).fill(0), // tom (not in v1.0, use with percussion)
    rwPattern[2], // perc → perc (also contains tom semantically)
    rwPattern[4], // closed hat → chh
    rwPattern[3], // open hat → ohh
    rwPattern[5], // bass → bass
  ]
}

/**
 * Migrate all v1.0 library patterns to v2.0 universal format
 * This is called once on app init if upgrading from v1.0
 */
export function migrateLibraryPatterns(v1Patterns: RhythmWolfPattern[]): UniversalPattern[] {
  return v1Patterns.map(migrateRhythmWolfToUniversal)
}

/**
 * Verify pattern can be converted back to Rhythm Wolf
 * Returns true if all universal parts are compatible with Rhythm Wolf
 */
export function isCompatibleWithRhythmWolf(universal: UniversalPattern): boolean {
  // Check if tom and clap parts are empty (can't represent on Wolf)
  const tom = universal[3]
  const clap = universal[2]

  const tomEmpty = tom.every((v) => v === 0)
  const clapEmpty = clap.every((v) => v === 0)

  return tomEmpty && clapEmpty
}

/**
 * Migrate Rhythm Wolf (v1.0) pattern to device-specific format
 * Direct conversion: 6×16 → adapter output
 */
export function migrateRhythmWolfToDevice(rwPattern: RhythmWolfPattern, adapterId: string): number[][] {
  const adapter = ADAPTERS.find((a) => a.id === adapterId)
  if (!adapter) throw new Error(`Adapter not found: ${adapterId}`)

  // First convert to universal, then to device (ensures consistency)
  const universal = migrateRhythmWolfToUniversal(rwPattern)

  // Then convert universal to device using the adapter
  const { toDevice } = require('./protocol')
  return toDevice(universal, adapter)
}

/**
 * Version detection
 * v1.0 patterns are always [6][16]
 * v2.0 patterns are always [8][16]
 */
export function getPatternVersion(pattern: any): '1.0' | '2.0' {
  if (!Array.isArray(pattern)) return '1.0' // Fallback for safety

  // Check if pattern is 6×16 (v1.0) or 8×16 (v2.0)
  const rows = pattern.length
  const cols = pattern[0]?.length ?? 0

  if (rows === 6 && cols === 16) return '1.0'
  if (rows === 8 && cols === 16) return '2.0'

  // Default to 2.0 for new patterns
  return '2.0'
}

/**
 * Normalize any pattern to v2.0 universal format
 */
export function normalizePattern(pattern: any): UniversalPattern {
  const version = getPatternVersion(pattern)

  if (version === '1.0') {
    return migrateRhythmWolfToUniversal(pattern as RhythmWolfPattern)
  }

  return pattern as UniversalPattern
}

/**
 * Migration info for changelog
 */
export const MIGRATION_INFO = {
  version: '1.0 → 2.0',
  date: '2026-11-23',
  changes: [
    'Rhythm Wolf 6×16 patterns converted to Universal 8×16 format',
    'New parts added: Clap, Tom (empty by default)',
    'All 15 library presets migrated',
    'Existing device is now "Rhythm Wolf" adapter',
    'Universal view is now default for all patterns',
  ],
  compatibility: 'Full: existing Wolf patterns work via Rhythm Wolf adapter',
}
