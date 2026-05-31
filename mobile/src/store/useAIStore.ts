import { create } from 'zustand';

export type StrategyMode = 'aggressive' | 'balanced' | 'protect';

export interface AISignal {
  id: string;
  symbol: string;
  direction: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  entryPrice: number;
  targetPrice: number;
  stopLoss: number;
  riskReward: string;
  timeHorizon: string;
  explanation: string;
  factors: {
    technical: number;
    fundamental: number;
    sentiment: number;
    macro: number;
  };
  chargesImpact: number;
  netExpectedReturn: number;
  createdAt: string;
}

interface AIState {
  strategyMode: StrategyMode;
  todaySignal: AISignal | null;
  activeSignals: AISignal[];
  paperTradingStats: {
    totalSignals: number;
    winRate: number;
    totalReturn: number;
  };
  ollamaConnected: boolean;
  setStrategyMode: (mode: StrategyMode) => void;
  setTodaySignal: (signal: AISignal) => void;
  setOllamaStatus: (connected: boolean) => void;
}

export const useAIStore = create<AIState>((set) => ({
  strategyMode: 'aggressive',
  todaySignal: null,
  activeSignals: [],
  paperTradingStats: {
    totalSignals: 0,
    winRate: 0,
    totalReturn: 0,
  },
  ollamaConnected: false,
  setStrategyMode: (mode) => set({ strategyMode: mode }),
  setTodaySignal: (signal) => set({ todaySignal: signal }),
  setOllamaStatus: (connected) => set({ ollamaConnected: connected }),
}));
