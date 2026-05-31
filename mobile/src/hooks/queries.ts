/**
 * React Query hooks — the single place screens fetch live backend data.
 * Every hook degrades gracefully: while offline the screen keeps showing the
 * last cached value (or the store's seed data), never a hard error wall.
 */

import { useMutation, useQuery } from '@tanstack/react-query';
import { aiAPI, marketAPI } from '@/services/api';

export interface NormalizedSignal {
  symbol: string;
  exchange?: string;
  direction: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  entryPrice: number;
  targetPrice: number;
  stopLoss: number;
  riskReward: string;
  timeHorizon: string;
  explanation: string;
  factors?: { technical: number; fundamental: number; sentiment: number; macro: number };
  patterns?: string[];
  trend?: string;
}

export interface MarketIndex {
  symbol: string;
  name: string;
  exchange: string;
  price: number;
  change: number;
  changePercent: number;
}

// ----- AI -----
export function useTodaySignal(strategy = 'aggressive') {
  return useQuery<{ signal: NormalizedSignal | null; generatedAt: string | null }>({
    queryKey: ['ai', 'today-signal', strategy],
    queryFn: async (): Promise<{ signal: NormalizedSignal | null; generatedAt: string | null }> => {
      const { data } = await aiAPI.getTodaySignal(strategy);
      return { signal: data?.signal ?? null, generatedAt: data?.generatedAt ?? null };
    },
    staleTime: 5 * 60_000,
  });
}

export function useActiveSignals() {
  return useQuery<NormalizedSignal[]>({
    queryKey: ['ai', 'active-signals'],
    queryFn: async (): Promise<NormalizedSignal[]> => {
      const { data } = await aiAPI.getActiveSignals();
      return data?.signals ?? [];
    },
    staleTime: 5 * 60_000,
  });
}

export function useAIStatus() {
  return useQuery({
    queryKey: ['ai', 'status'],
    queryFn: async () => {
      const { data } = await aiAPI.getStatus();
      return data as { ollamaConnected: boolean; model: string; lastAnalysis: string | null };
    },
    refetchInterval: 60_000,
    retry: 0,
  });
}

export function useAskAI() {
  return useMutation({
    mutationFn: async (vars: { question: string; context?: Record<string, unknown> }) => {
      const { data } = await aiAPI.askAI(vars.question, vars.context);
      return data as { answer: string; sources?: string[]; confidence?: number };
    },
  });
}

export function useStockAnalysis(symbol: string, exchange = 'NSE', enabled = true) {
  return useQuery({
    queryKey: ['ai', 'analyze', symbol, exchange],
    queryFn: async () => {
      const { data } = await aiAPI.analyzeStock(symbol, exchange);
      return data;
    },
    enabled: enabled && !!symbol,
    staleTime: 5 * 60_000,
  });
}

export function useMarketMood() {
  return useQuery({
    queryKey: ['ai', 'market-mood'],
    queryFn: async () => {
      const { data } = await aiAPI.getMarketMood();
      return data as { mood?: string; score?: number; summary?: string };
    },
    staleTime: 10 * 60_000,
    retry: 0,
  });
}

// ----- Market -----
export function useIndices() {
  return useQuery<MarketIndex[]>({
    queryKey: ['market', 'indices'],
    queryFn: async (): Promise<MarketIndex[]> => {
      const { data } = await marketAPI.getIndices();
      return (data?.indices ?? []).map((idx: any) => ({
        symbol: idx.symbol,
        name: idx.name,
        exchange: idx.exchange,
        price: idx.price,
        change: idx.change,
        changePercent: idx.change_percent ?? idx.changePercent ?? 0,
      }));
    },
    staleTime: 60_000,
  });
}

export function useMarketStatus() {
  return useQuery({
    queryKey: ['market', 'status'],
    queryFn: async () => {
      const { data } = await marketAPI.getMarketStatus();
      return data as { nse_open: boolean; us_open: boolean; cache_connected: boolean; ai_engine: string };
    },
    refetchInterval: 2 * 60_000,
    retry: 0,
  });
}
