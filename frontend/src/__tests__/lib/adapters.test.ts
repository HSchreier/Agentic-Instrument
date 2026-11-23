import { describe, it, expect } from 'vitest'
import {
  ADAPTERS,
  PARTS,
  toDevice,
  toUniversal,
  translate,
  eventCount,
  cycleVelocity,
  primaryVoice,
  isMapped,
  mappedCount,
  migrateRhythmWolfToUniversal,
  getPatternVersion,
  normalizePattern,
  UniversalPattern,
} from '@/lib/adapters'

describe('Agentic Instruments v2: Adapters', () => {
  // Create a simple test pattern (kick on beat 1)
  const createEmptyUniversal = (): UniversalPattern =>
    PARTS.map(() => Array(16).fill(0))

  const createSimpleKickPattern = (): UniversalPattern => {
    const p = createEmptyUniversal()
    p[0][0] = 127 // Kick on step 0
    p[0][4] = 127
    p[0][8] = 127
    p[0][12] = 127
    return p
  }

  describe('Adapter Registry', () => {
    it('should have all 7 adapters', () => {
      expect(ADAPTERS).toHaveLength(7)
      expect(ADAPTERS.map((a) => a.id)).toEqual([
        'wolf',
        'rytm',
        'tr8s',
        'opz',
        'volca',
        'maschine',
        'generic',
      ])
    })

    it('should have correct page counts', () => {
      expect(ADAPTERS.find((a) => a.id === 'wolf')?.pages).toBe(1)
      expect(ADAPTERS.find((a) => a.id === 'rytm')?.pages).toBe(2)
      expect(ADAPTERS.find((a) => a.id === 'opz')?.pages).toBe(4)
    })

    it('should identify pitched adapters correctly', () => {
      const volca = ADAPTERS.find((a) => a.id === 'volca')!
      expect(volca.pitched).toBe(true)

      const wolf = ADAPTERS.find((a) => a.id === 'wolf')!
      expect(wolf.pitched).toBeUndefined()
    })
  })

  describe('Mapping Helpers', () => {
    const wolf = ADAPTERS.find((a) => a.id === 'wolf')!
    const volca = ADAPTERS.find((a) => a.id === 'volca')!

    it('should identify mapped parts', () => {
      expect(isMapped(wolf, 'kick')).toBe(true)
      expect(isMapped(wolf, 'snare')).toBe(true)
      expect(isMapped(wolf, 'tom')).toBe(true) // PERC maps to perc+tom
    })

    it('should count mapped parts', () => {
      expect(mappedCount(wolf)).toBe(8) // All 8 parts mapped
      expect(mappedCount(volca)).toBe(1) // Only bass → bass line
    })

    it('should find primary voice', () => {
      expect(primaryVoice(wolf, 'kick')).toBe(0) // First voice
      expect(primaryVoice(wolf, 'snare')).toBe(1)
      expect(primaryVoice(wolf, 'tom')).toBe(2) // PERC voice index 2
    })
  })

  describe('Universal ↔ Device Translation', () => {
    it('should convert universal to Rhythm Wolf device', () => {
      const wolf = ADAPTERS.find((a) => a.id === 'wolf')!
      const pattern = createSimpleKickPattern()
      const device = toDevice(pattern, wolf)

      expect(device).toHaveLength(6) // 6 voices
      expect(device[0]).toHaveLength(16) // 16 steps
      expect(device[0][0]).toBe(127) // Kick preserved
      expect(device[0][4]).toBe(127)
    })

    it('should convert universal to Rytm device (multi-page)', () => {
      const rytm = ADAPTERS.find((a) => a.id === 'rytm')!
      const pattern = createSimpleKickPattern()
      const device = toDevice(pattern, rytm)

      expect(device[0]).toHaveLength(32) // 32 steps (2 pages)
      expect(device[0][0]).toBe(127) // Kick on page 1, step 0
      expect(device[0][16]).toBe(127) // Repeated on page 2, step 0 (16 % 16 = 0)
    })

    it('should convert device back to universal', () => {
      const wolf = ADAPTERS.find((a) => a.id === 'wolf')!
      const original = createSimpleKickPattern()
      const device = toDevice(original, wolf)
      const reconstructed = toUniversal(device, wolf, 0)

      // Kick part should be preserved
      expect(reconstructed[0][0]).toBe(127)
      expect(reconstructed[0][4]).toBe(127)
    })

    it('should handle round-trip conversion for Rhythm Wolf', () => {
      const wolf = ADAPTERS.find((a) => a.id === 'wolf')!
      const pattern = createSimpleKickPattern()

      const device = toDevice(pattern, wolf)
      const roundtrip = toUniversal(device, wolf, 0)

      expect(roundtrip[0]).toEqual(pattern[0]) // Kick preserved
      expect(roundtrip[1]).toEqual(pattern[1]) // Snare empty → empty
    })

    it('should handle device switching', () => {
      const wolf = ADAPTERS.find((a) => a.id === 'wolf')!
      const rytm = ADAPTERS.find((a) => a.id === 'rytm')!

      const pattern = createSimpleKickPattern()
      const wolfDevice = toDevice(pattern, wolf)
      const rytmDevice = translate(wolfDevice, wolf, rytm, 0)

      // Should produce valid Rytm pattern
      expect(rytmDevice[0]).toHaveLength(32) // Rytm is 32 steps
      expect(rytmDevice[0][0]).toBeGreaterThan(0) // Kick preserved
    })

    it('should handle pitched adapters (Volca Keys)', () => {
      const volca = ADAPTERS.find((a) => a.id === 'volca')!
      const pattern = createSimpleKickPattern()
      const device = toDevice(pattern, volca)

      expect(device).toHaveLength(8) // 8 note lanes
      expect(device[0]).toHaveLength(16) // 16 steps
      // Kick should map to lowest note lane
      expect(device[7][0]).toBeGreaterThan(0)
    })
  })

  describe('Pattern Analysis', () => {
    it('should count events', () => {
      const pattern = createSimpleKickPattern()
      expect(eventCount(pattern)).toBe(4) // 4 kicks
    })

    it('should cycle velocity', () => {
      expect(cycleVelocity(0)).toBe(120) // Off → accent
      expect(cycleVelocity(120)).toBe(70) // Accent → soft
      expect(cycleVelocity(70)).toBe(0) // Soft → off
    })

    it('should categorize density', () => {
      // Sparse: < 18 events
      const sparse = createEmptyUniversal()
      expect(eventCount(sparse)).toBe(0)

      // Medium: 18-27 events
      const medium = createSimpleKickPattern() // 4 events
      expect(eventCount(medium)).toBeLessThan(18)

      // Dense: >= 28 events
      const dense = createEmptyUniversal()
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 16; j++) {
          dense[i][j] = 100
        }
      }
      expect(eventCount(dense)).toBe(128)
    })
  })

  describe('Migration: v1.0 → v2.0', () => {
    it('should detect pattern version', () => {
      const v1Pattern = Array(6)
        .fill(null)
        .map(() => Array(16).fill(0))
      const v2Pattern = createSimpleKickPattern()

      expect(getPatternVersion(v1Pattern)).toBe('1.0')
      expect(getPatternVersion(v2Pattern)).toBe('2.0')
    })

    it('should migrate Rhythm Wolf pattern to universal', () => {
      // v1.0 Rhythm Wolf: 6 voices
      const v1Pattern: any[] = Array(6)
        .fill(null)
        .map(() => Array(16).fill(0))
      v1Pattern[0][0] = 127 // Kick

      const universal = migrateRhythmWolfToUniversal(v1Pattern)

      expect(universal).toHaveLength(8) // 8 universal parts
      expect(universal[0][0]).toBe(127) // Kick preserved
    })

    it('should normalize patterns', () => {
      const v1Pattern = Array(6)
        .fill(null)
        .map(() => Array(16).fill(0))
      const v2Pattern = createSimpleKickPattern()

      const normalizedV1 = normalizePattern(v1Pattern)
      const normalizedV2 = normalizePattern(v2Pattern)

      expect(normalizedV1).toHaveLength(8) // Converted
      expect(normalizedV2).toHaveLength(8) // Already 8×16
    })
  })

  describe('Multi-page device fills', () => {
    it('should add snare fill on last 4 steps for Rytm', () => {
      const rytm = ADAPTERS.find((a) => a.id === 'rytm')!
      const pattern = createSimpleKickPattern()
      const device = toDevice(pattern, rytm)

      // Last 4 steps should have snare fill
      const snareIdx = 1
      expect(device[snareIdx][28]).toBeGreaterThan(0) // Last 4: 28, 29, 30, 31
    })

    it('should add open hat lift on second page boundary', () => {
      const rytm = ADAPTERS.find((a) => a.id === 'rytm')!
      const pattern = createSimpleKickPattern()
      const device = toDevice(pattern, rytm)

      // Open hat should lift at page boundaries
      const hatIdx = 9 // OP HAT is voice index 9 on Rytm
      expect(device[hatIdx][31]).toBeGreaterThan(0) // End of second page
    })
  })
})
