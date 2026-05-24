import { create } from 'zustand'
import * as db from '../lib/database'

const useRackStore = create((set, get) => ({
  items: [],
  loading: false,
  error: null,

  fetchItems: async () => {
    set({ loading: true, error: null })
    try {
      const items = await db.getRackItems()
      set({ items, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  saveItem: async (item) => {
    try {
      const saved = await db.saveRackItem(item)
      const items = get().items
      const existing = items.findIndex(i => i.id === saved.id)
      if (existing >= 0) {
        const updated = [...items]
        updated[existing] = saved
        set({ items: updated })
      } else {
        set({ items: [saved, ...items] })
      }
      return saved
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },

  deleteItem: async (id) => {
    try {
      await db.deleteRackItem(id)
      set({ items: get().items.filter(i => i.id !== id) })
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },
}))

export default useRackStore
