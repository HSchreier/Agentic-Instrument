import { create } from 'zustand'
import type { Style, Template, Pattern, VoiceId } from '@/lib/pattern'
import { STYLES } from '@/lib/pattern'
import type { UniversalPattern } from '@/lib/adapters'
import { ADAPTERS } from '@/lib/adapters'

export interface Toast {
  id: string
  kind: 'success' | 'error' | 'info'
  title: string
  body: string
  action?: { label: string; onClick: () => void }
}

export interface Message {
  role: 'user' | 'assistant'
  text: string
  time: Date
  pattern?: UniversalPattern
}

export interface Port {
  id: string
  name: string
}

export type DeviceState = 'connected' | 'disconnected' | 'error' | 'scanning'

interface AppStore {
  // UI & Navigation
  tab: 'Generate' | 'Library' | 'Chat' | 'Devices'
  setTab: (tab: 'Generate' | 'Library' | 'Chat' | 'Devices') => void

  // Pattern Generation
  style: Style
  setStyle: (style: Style) => void
  template: Template
  setTemplate: (template: Template) => void
  bpm: number
  setBpm: (bpm: number) => void
  bass: boolean
  setBass: (bass: boolean) => void
  seed: number
  setSeed: (seed: number) => void
  patternName: string
  setPatternName: (name: string) => void

  // Multi-Device (v2.0)
  deviceId: string
  setDeviceId: (id: string) => void
  view: 'universal' | 'device'
  setView: (view: 'universal' | 'device') => void
  page: number
  setPage: (page: number) => void
  knobs: Record<string, number> // key: `${deviceId}:${strip}:${knob}`
  setKnob: (deviceId: string, strip: number, knob: number, value: number) => void
  deviceMuted: Record<string, boolean> // key: `${deviceId}:${voiceIndex}`
  toggleDeviceMute: (deviceId: string, voiceIndex: number) => void
  detected: Record<string, boolean> // deviceId → isDetected
  setDetected: (deviceId: string, detected: boolean) => void

  // Pattern Data (now UniversalPattern)
  pattern: UniversalPattern
  setPattern: (pattern: UniversalPattern) => void
  undo: UniversalPattern[]
  pushUndo: () => void
  undoLast: () => void
  clearPattern: () => void

  // Voice Controls (legacy, kept for compatibility)
  levels: Record<VoiceId, number>
  setLevel: (voice: VoiceId, level: number) => void
  decay: Record<VoiceId, number>
  setDecay: (voice: VoiceId, decay: number) => void
  muted: Record<VoiceId, boolean>
  toggleMute: (voice: VoiceId) => void

  // Play Preview
  playing: boolean
  setPlaying: (playing: boolean) => void
  step: number | null
  setStep: (step: number | null) => void

  // Device & Send
  deviceState: DeviceState
  setDeviceState: (state: DeviceState) => void
  ports: Port[]
  setPorts: (ports: Port[]) => void
  selectedPort: string | null
  setSelectedPort: (id: string | null) => void
  scanning: boolean
  setScanningDevices: (scanning: boolean) => void
  sendConfirmOpen: boolean
  setSendConfirmOpen: (open: boolean) => void
  sending: boolean
  setSending: (sending: boolean) => void
  sendProgress: number
  setSendProgress: (progress: number) => void

  // Library
  favorites: string[]
  toggleFavorite: (id: string) => void
  recent: string[]
  addRecent: (id: string) => void
  libraryQuery: string
  setLibraryQuery: (q: string) => void
  libraryFilter: string
  setLibraryFilter: (f: string) => void
  librarySort: 'name' | 'tempo' | 'style' | 'recent'
  setLibrarySort: (s: 'name' | 'tempo' | 'style' | 'recent') => void

  // Chat
  messages: Message[]
  addMessage: (role: 'user' | 'assistant', text: string, pattern?: Pattern) => void
  chatInput: string
  setChatInput: (text: string) => void
  thinking: boolean
  setThinking: (thinking: boolean) => void

  // Toasts
  toasts: Toast[]
  addToast: (kind: 'success' | 'error' | 'info', title: string, body: string, action?: Toast['action']) => void
  removeToast: (id: string) => void
}

const defaultLevels: Record<VoiceId, number> = {
  kick: 100,
  snare: 100,
  perc: 100,
  ohh: 100,
  chh: 100,
  bass: 100,
}

const defaultMuted: Record<VoiceId, boolean> = {
  kick: false,
  snare: false,
  perc: false,
  ohh: false,
  chh: false,
  bass: false,
}

// v2.0: Universal pattern format (8 parts × 16 steps)
const defaultPattern: UniversalPattern = Array(8)
  .fill(null)
  .map(() => Array(16).fill(0))

// Initialize detected devices (all offline by default)
const defaultDetected: Record<string, boolean> = Object.fromEntries(ADAPTERS.map((a) => [a.id, false]))

export const useStore = create<AppStore>((set, get) => ({
    // UI & Navigation
    tab: 'Generate',
    setTab: (tab) => set({ tab }),

    // Multi-Device (v2.0)
    deviceId: 'wolf', // Default to Rhythm Wolf
    setDeviceId: (deviceId) => {
      const newAdapter = ADAPTERS.find((a) => a.id === deviceId)
      if (newAdapter) {
        set({
          deviceId,
          page: 0, // Reset to first page
          view: newAdapter.pitched ? 'device' : 'universal', // Force device view for pitched
        })
      }
    },
    view: 'universal',
    setView: (view) => set({ view }),
    page: 0,
    setPage: (page) => set({ page }),
    knobs: {},
    setKnob: (deviceId, strip, knob, value) =>
      set((state) => ({
        knobs: {
          ...state.knobs,
          [`${deviceId}:${strip}:${knob}`]: Math.max(0, Math.min(100, value)),
        },
      })),
    deviceMuted: {},
    toggleDeviceMute: (deviceId, voiceIndex) =>
      set((state) => {
        const key = `${deviceId}:${voiceIndex}`
        return {
          deviceMuted: {
            ...state.deviceMuted,
            [key]: !state.deviceMuted[key],
          },
        }
      }),
    detected: defaultDetected,
    setDetected: (deviceId, detected) =>
      set((state) => ({
        detected: { ...state.detected, [deviceId]: detected },
      })),

    // Pattern Generation
    style: 'Techno',
    setStyle: (style) => set({ style, bpm: STYLES[style].bpm }),
    template: 'Four on the Floor',
    setTemplate: (template) => set({ template }),
    bpm: 130,
    setBpm: (bpm) => set({ bpm: Math.max(20, Math.min(300, bpm)) }),
    bass: false,
    setBass: (bass) => set({ bass }),
    seed: Math.floor(Math.random() * 1000000),
    setSeed: (seed) => set({ seed }),
    patternName: 'Untitled',
    setPatternName: (name) => set({ patternName: name }),

    // Pattern Data (now UniversalPattern)
    pattern: defaultPattern,
    setPattern: (pattern) => {
      const current = get().pattern
      set((state) => ({
        pattern,
        undo: [...state.undo.slice(-19), current], // max 20
      }))
    },
    undo: [],
    pushUndo: () => {
      const current = get().pattern
      set((state) => ({
        undo: [...state.undo.slice(-19), current],
      }))
    },
    undoLast: () => {
      const undo = get().undo
      if (undo.length > 0) {
        const previous = undo[undo.length - 1]
        set({
          pattern: previous,
          undo: undo.slice(0, -1),
        })
      }
    },
    clearPattern: () => {
      set((state) => ({
        pattern: defaultPattern,
        undo: [...state.undo.slice(-19), state.pattern],
      }))
    },

    // Voice Controls
    levels: defaultLevels,
    setLevel: (voice, level) =>
      set((state) => ({
        levels: { ...state.levels, [voice]: Math.max(0, Math.min(100, level)) },
      })),
    decay: defaultLevels,
    setDecay: (voice, decay) =>
      set((state) => ({
        decay: { ...state.decay, [voice]: Math.max(0, Math.min(100, decay)) },
      })),
    muted: defaultMuted,
    toggleMute: (voice) =>
      set((state) => ({
        muted: { ...state.muted, [voice]: !state.muted[voice] },
      })),

    // Play Preview
    playing: false,
    setPlaying: (playing) => set({ playing }),
    step: null,
    setStep: (step) => set({ step }),

    // Device & Send
    deviceState: 'disconnected',
    setDeviceState: (state) => set({ deviceState: state }),
    ports: [],
    setPorts: (ports) => set({ ports }),
    selectedPort: null,
    setSelectedPort: (id) => set({ selectedPort: id }),
    scanning: false,
    setScanningDevices: (scanning) => set({ scanning }),
    sendConfirmOpen: false,
    setSendConfirmOpen: (open) => set({ sendConfirmOpen: open }),
    sending: false,
    setSending: (sending) => set({ sending }),
    sendProgress: 0,
    setSendProgress: (progress) => set({ sendProgress: progress }),

    // Library
    favorites: [],
    toggleFavorite: (id) =>
      set((state) => ({
        favorites: state.favorites.includes(id)
          ? state.favorites.filter((fid) => fid !== id)
          : [...state.favorites, id],
      })),
    recent: [],
    addRecent: (id) =>
      set((state) => ({
        recent: [id, ...state.recent.filter((rid) => rid !== id)].slice(0, 5),
      })),
    libraryQuery: '',
    setLibraryQuery: (q) => set({ libraryQuery: q }),
    libraryFilter: 'All',
    setLibraryFilter: (f) => set({ libraryFilter: f }),
    librarySort: 'name',
    setLibrarySort: (s) => set({ librarySort: s }),

    // Chat
    messages: [],
    addMessage: (role, text, pattern) =>
      set((state) => ({
        messages: [
          ...state.messages,
          {
            role,
            text,
            time: new Date(),
            pattern,
          },
        ],
      })),
    chatInput: '',
    setChatInput: (text) => set({ chatInput: text }),
    thinking: false,
    setThinking: (thinking) => set({ thinking }),

    // Toasts
    toasts: [],
    addToast: (kind, title, body, action) =>
      set((state) => ({
        toasts: [
          ...state.toasts,
          {
            id: Math.random().toString(36).substr(2, 9),
            kind,
            title,
            body,
            action,
          },
        ],
      })),
    removeToast: (id) =>
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      })),
  }))
