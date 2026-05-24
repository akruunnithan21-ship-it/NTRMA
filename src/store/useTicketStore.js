import { create } from 'zustand'
import * as db from '../lib/database'

const useTicketStore = create((set, get) => ({
  tickets: [],
  loading: false,
  error: null,

  fetchTickets: async () => {
    set({ loading: true, error: null })
    try {
      const tickets = await db.getTickets()
      set({ tickets, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  saveTicket: async (ticket) => {
    try {
      const saved = await db.saveTicket(ticket)
      const tickets = get().tickets
      const existing = tickets.findIndex(t => t.id === saved.id)
      if (existing >= 0) {
        const updated = [...tickets]
        updated[existing] = saved
        set({ tickets: updated })
      } else {
        set({ tickets: [saved, ...tickets] })
      }
      return saved
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },

  deleteTicket: async (id) => {
    try {
      await db.deleteTicket(id)
      set({ tickets: get().tickets.filter(t => t.id !== id) })
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },
}))

export default useTicketStore
