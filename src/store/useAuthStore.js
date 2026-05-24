import { create } from 'zustand'
import { supabase } from '../lib/supabase'

const useAuthStore = create((set, get) => ({
  user: null,
  role: null,
  displayName: null,
  loading: true,

  init: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      await get().loadRole(session.user)
    }
    set({ loading: false })

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await get().loadRole(session.user)
      } else {
        set({ user: null, role: null, displayName: null })
      }
    })
  },

  loadRole: async (user) => {
    const { data } = await supabase
      .from('user_roles')
      .select('role, display_name')
      .eq('user_id', user.id)
      .single()
    
    set({
      user,
      role: data?.role || 'viewer',
      displayName: data?.display_name || user.email,
    })
  },

  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    await get().loadRole(data.user)
    return data.user
  },

  logout: async () => {
    await supabase.auth.signOut()
    set({ user: null, role: null, displayName: null })
  },

  isRmaLead: () => get().role === 'rma_lead',
  isViewer: () => get().role === 'viewer',
  isAuthenticated: () => !!get().user,
}))

export default useAuthStore
