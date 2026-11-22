import { describe, it, expect } from 'vitest'
import type { GenerateRequest, SendRequest, Pattern } from '@/lib/api'

describe('API Client Types', () => {
  it('should have correct GenerateRequest interface', () => {
    const req: GenerateRequest = {
      style: 'techno',
      tempo: 128,
      template: 'four_on_the_floor',
      include_bass: false,
    }
    expect(req.style).toBe('techno')
  })

  it('should have correct Pattern interface', () => {
    const pattern: Pattern = {
      metadata: { style: 'techno', tempo: 128, num_events: 24 },
      events: [],
    }
    expect(pattern.metadata.style).toBe('techno')
  })

  it('should have correct SendRequest interface', () => {
    const req: SendRequest = {
      device: 'Akai Rhythm Wolf',
      pattern: {
        metadata: { style: 'techno', tempo: 128, num_events: 24 },
        events: [],
      },
    }
    expect(req.device).toBe('Akai Rhythm Wolf')
  })
})

// Note: Integration tests for actual axios calls should be done
// with integration test suite, not unit tests
// See: tests/integration/api.test.ts (when created)
