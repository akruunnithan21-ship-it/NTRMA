import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  pinHash: string | null;
  biometricEnabled: boolean;
  login: () => void;
  logout: () => void;
  setPin: (pin: string) => void;
  setBiometric: (enabled: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  pinHash: null,
  biometricEnabled: true,
  login: () => set({ isAuthenticated: true }),
  logout: () => set({ isAuthenticated: false }),
  setPin: (pin) => set({ pinHash: pin }), // In production, hash this
  setBiometric: (enabled) => set({ biometricEnabled: enabled }),
}));
