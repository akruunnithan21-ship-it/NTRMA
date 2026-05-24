import { create } from 'zustand'

const useThemeStore = create((set) => ({
  dark: localStorage.getItem('nt-dark-mode') === 'true',

  toggleDark: () => set(state => {
    const next = !state.dark
    localStorage.setItem('nt-dark-mode', String(next))
    if (next) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    return { dark: next }
  }),

  initTheme: () => set(state => {
    if (state.dark) {
      document.documentElement.classList.add('dark')
    }
    return state
  }),
}))

export default useThemeStore
