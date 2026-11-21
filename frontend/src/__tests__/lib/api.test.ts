import { describe, it, expect, beforeEach, vi } from 'vitest'
import axios from 'axios'
import { generatePattern, sendPattern, listDevices } from '@/lib/api'

vi.mock('axios')

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('generatePattern', () => {
    it('should send POST request with correct parameters', async () => {
      const mockResponse = {
        data: {
          metadata: { style: 'techno', tempo: 128, num_events: 24 },
          events: [],
        },
      }
      vi.mocked(axios.post).mockResolvedValue(mockResponse)

      const result = await generatePattern({
        style: 'techno',
        tempo: 128,
        template: 'four_on_the_floor',
      })

      expect(result).toEqual(mockResponse.data)
    })

    it('should handle errors gracefully', async () => {
      const error = new Error('API Error')
      vi.mocked(axios.post).mockRejectedValue(error)

      await expect(
        generatePattern({ style: 'techno' })
      ).rejects.toThrow('API Error')
    })
  })

  describe('listDevices', () => {
    it('should return list of devices', async () => {
      const mockDevices = ['Akai Rhythm Wolf', 'IAC Driver Bus 1']
      vi.mocked(axios.get).mockResolvedValue({
        data: { devices: mockDevices },
      })

      const result = await listDevices()

      expect(result).toEqual(mockDevices)
    })
  })

  describe('sendPattern', () => {
    it('should send pattern to device', async () => {
      const mockResponse = {
        data: {
          status: 'success',
          events_sent: 24,
        },
      }
      vi.mocked(axios.post).mockResolvedValue(mockResponse)

      const result = await sendPattern({
        device: 'Akai Rhythm Wolf',
        pattern: {
          metadata: { style: 'techno', tempo: 128, num_events: 24 },
          events: [],
        },
      })

      expect(result.status).toBe('success')
      expect(result.events_sent).toBe(24)
    })
  })
})
