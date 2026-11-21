import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

export interface MIDIEvent {
  channel: number
  note: number
  velocity: number
}

export interface Pattern {
  metadata: {
    style: string
    tempo: number
    num_events: number
  }
  events: MIDIEvent[]
}

export interface GenerateRequest {
  style: string
  tempo?: number
  template?: string
  include_bass?: boolean
}

export interface SendRequest {
  device: string
  pattern: Pattern
}

// Devices
export const listDevices = async (): Promise<string[]> => {
  const { data } = await api.get('/devices')
  return data.devices
}

// Patterns
export const generatePattern = async (request: GenerateRequest): Promise<Pattern> => {
  const { data } = await api.post('/patterns/generate', request)
  return data
}

export const sendPattern = async (request: SendRequest): Promise<{ status: string; events_sent: number }> => {
  const { data } = await api.post('/patterns/send', request)
  return data
}

// Info
export const getStyles = async () => {
  const { data } = await api.get('/info/styles')
  return data.styles
}

export const getTemplates = async () => {
  const { data } = await api.get('/info/templates')
  return data.templates
}

export default api
