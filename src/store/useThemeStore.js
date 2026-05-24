import { create } from 'zustand'

const useThemeStore = create((set) => ({
  dark: localStorage.getItem('nt-dark-mode') === 'true',

  toggleDark: () => set(state => {
    const next = !state.dark
    localStorage.setItem('nt-dark-mode', String(next))
    document.documentElement.classList.toggle('dark', next)
    return { dark: next }
  }),

  initTheme: () => set(state => {
    document.documentElement.classList.toggle('dark', state.dark)
    return state
  }),
}))

export default useThemeStore
