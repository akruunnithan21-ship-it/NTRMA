import { create } from 'zustand'
import * as db from '../lib/database'

const DEFAULTS = {
  vendors: ['ASUS', 'Nvidia', 'Gigabyte', 'Deepcool', 'Corsair', 'GSkill', 'Adata', 'AMD', 'Intel', 'MSI', 'Cooler Master'],
  submitTo: ['ACRO', 'Gigabyte', 'F1', 'Kizen'],
  componentTypes: ['RAM', 'CPU', 'Motherboard', 'PSU', 'Cooler', 'Monitor', 'GPU', 'SSD', 'HDD', 'Cabinet', 'Keyboard', 'Mouse', 'Headset'],
  statuses: ['Pending', 'Open', 'Closed', 'Ready for pick up', 'Picked up', 'Pending install/delivery', 'Nil'],
  rackLocations: ['Rack A', 'Rack B', 'Rack C', 'Service Bench', 'Damaged Bin'],
}

const useSettingsStore = create((set, get) => ({
  settings: {},
  loading: false,
  defaults: DEFAULTS,

  fetchSettings: async () => {
    set({ loading: true })
    try {
      const settings = await db.getSettings()
      // Merge with defaults
      const merged = { ...DEFAULTS }
      for (const key of Object.keys(settings)) {
        merged[key] = settings[key]
      }
      set({ settings: merged, loading: false })
    } catch (error) {
      // Fallback to defaults
      set({ settings: { ...DEFAULTS }, loading: false })
    }
  },

  getSetting: (key) => {
    return get().settings[key] || DEFAULTS[key] || []
  },

  addItem: async (key, item) => {
    const current = get().getSetting(key)
    if (current.includes(item)) return current
    const next = [...current, item]
    await db.setSetting(key, next)
    set({ settings: { ...get().settings, [key]: next } })
    return next
  },

  removeItem: async (key, item) => {
    const current = get().getSetting(key)
    const next = current.filter(x => x !== item)
    await db.setSetting(key, next)
    set({ settings: { ...get().settings, [key]: next } })
    return next
  },
}))

export default useSettingsStore
