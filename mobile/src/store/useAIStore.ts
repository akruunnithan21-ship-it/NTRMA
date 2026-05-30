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
  todaySignal: {
    id: '1',
    symbol: 'TATAMOTORS',
    direction: 'BUY',
    confidence: 78,
    entryPrice: 952.40,
    targetPrice: 1105.60,
    stopLoss: 895.00,
    riskReward: '1:2.7',
    timeHorizon: '2-4 weeks',
    explanation: 'Strong momentum breakout above ₹940 resistance with 2.3x average volume. RSI at 62 (bullish, not overbought). Sector rotation favoring auto. FII net buyers in auto for 5 consecutive sessions.',
    factors: {
      technical: 82,
      fundamental: 71,
      sentiment: 76,
      macro: 68,
    },
    chargesImpact: 11.34,
    netExpectedReturn: 142,
    createdAt: new Date().toISOString(),
  },
  activeSignals: [],
  paperTradingStats: {
    totalSignals: 23,
    winRate: 74,
    totalReturn: 18.4,
  },
  ollamaConnected: false,
  setStrategyMode: (mode) => set({ strategyMode: mode }),
  setTodaySignal: (signal) => set({ todaySignal: signal }),
  setOllamaStatus: (connected) => set({ ollamaConnected: connected }),
}));
