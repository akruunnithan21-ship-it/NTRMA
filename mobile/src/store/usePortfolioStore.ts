import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { calculateBuyCharges, calculateSellCharges } from '@/constants/charges';

export interface Holding {
  id: string;
  symbol: string;
  exchange: 'NSE' | 'BSE' | 'NYSE' | 'NASDAQ';
  quantity: number;
  avgBuyPrice: number;
  buyDate: string;
  currentPrice?: number;
  type: 'real' | 'paper';
}

export interface Trade {
  id: string;
  symbol: string;
  exchange: string;
  action: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  charges: number;
  netAmount: number;
  type: 'real' | 'paper';
  date: string;
  pnl?: number;
}

interface PortfolioState {
  holdings: Holding[];
  paperHoldings: Holding[];
  tradeHistory: Trade[];
  paperBalance: number;
  mode: 'real' | 'paper';
  setMode: (mode: 'real' | 'paper') => void;
  executeBuy: (params: { symbol: string; exchange: string; quantity: number; price: number; type: 'real' | 'paper' }) => Trade;
  executeSell: (holdingId: string) => Trade | null;
  updatePrices: (prices: Record<string, number>) => void;
  getTotalInvested: (type?: 'real' | 'paper') => number;
  getTotalCurrentValue: (type?: 'real' | 'paper') => number;
  getTotalPnL: (type?: 'real' | 'paper') => { amount: number; percent: number };
  getWinRate: () => { wins: number; losses: number; rate: number };
}

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set, get) => ({
      holdings: [],
      paperHoldings: [],
      tradeHistory: [],
      paperBalance: 100000, // ₹1L virtual paper-trading capital
      mode: 'paper',
      setMode: (mode) => set({ mode }),
      executeBuy: ({ symbol, exchange, quantity, price, type }) => {
        const exch = (exchange === 'BSE' ? 'BSE' : 'NSE') as 'NSE' | 'BSE';
        const charges = calculateBuyCharges({ price, quantity, exchange: exch });
        const trade: Trade = { id: `t_${Date.now()}`, symbol, exchange, action: 'BUY', quantity, price, charges: charges.totalCharges, netAmount: charges.youPay, type, date: new Date().toISOString() };
        const holding: Holding = { id: `h_${Date.now()}`, symbol, exchange: exchange as Holding['exchange'], quantity, avgBuyPrice: price, buyDate: new Date().toISOString(), currentPrice: price, type };
        if (type === 'paper') {
          set((s) => ({ paperHoldings: [...s.paperHoldings, holding], paperBalance: s.paperBalance - charges.youPay, tradeHistory: [trade, ...s.tradeHistory] }));
        } else {
          set((s) => ({ holdings: [...s.holdings, holding], tradeHistory: [trade, ...s.tradeHistory] }));
        }
        return trade;
      },
      executeSell: (holdingId) => {
        const state = get();
        const holding = [...state.holdings, ...state.paperHoldings].find((h) => h.id === holdingId);
        if (!holding || !holding.currentPrice) return null;
        const exch = (holding.exchange === 'BSE' ? 'BSE' : 'NSE') as 'NSE' | 'BSE';
        const charges = calculateSellCharges({ price: holding.currentPrice, quantity: holding.quantity, exchange: exch });
        const pnl = charges.youReceive - (holding.avgBuyPrice * holding.quantity);
        const trade: Trade = { id: `t_${Date.now()}`, symbol: holding.symbol, exchange: holding.exchange, action: 'SELL', quantity: holding.quantity, price: holding.currentPrice, charges: charges.totalCharges, netAmount: charges.youReceive, type: holding.type, date: new Date().toISOString(), pnl: Math.round(pnl * 100) / 100 };
        if (holding.type === 'paper') {
          set((s) => ({ paperHoldings: s.paperHoldings.filter((h) => h.id !== holdingId), paperBalance: s.paperBalance + charges.youReceive, tradeHistory: [trade, ...s.tradeHistory] }));
        } else {
          set((s) => ({ holdings: s.holdings.filter((h) => h.id !== holdingId), tradeHistory: [trade, ...s.tradeHistory] }));
        }
        return trade;
      },
      updatePrices: (prices) => set((s) => ({
        holdings: s.holdings.map((h) => ({ ...h, currentPrice: prices[h.symbol] || h.currentPrice })),
        paperHoldings: s.paperHoldings.map((h) => ({ ...h, currentPrice: prices[h.symbol] || h.currentPrice })),
      })),
      getTotalInvested: (type) => {
        const h = type === 'paper' ? get().paperHoldings : type === 'real' ? get().holdings : [...get().holdings, ...get().paperHoldings];
        return h.reduce((sum, x) => sum + x.avgBuyPrice * x.quantity, 0);
      },
      getTotalCurrentValue: (type) => {
        const h = type === 'paper' ? get().paperHoldings : type === 'real' ? get().holdings : [...get().holdings, ...get().paperHoldings];
        return h.reduce((sum, x) => sum + (x.currentPrice || x.avgBuyPrice) * x.quantity, 0);
      },
      getTotalPnL: (type) => {
        const invested = get().getTotalInvested(type);
        const current = get().getTotalCurrentValue(type);
        const amount = current - invested;
        return { amount: Math.round(amount * 100) / 100, percent: invested > 0 ? Math.round((amount / invested) * 10000) / 100 : 0 };
      },
      getWinRate: () => {
        const trades = get().tradeHistory.filter((t) => t.action === 'SELL' && t.pnl !== undefined);
        const wins = trades.filter((t) => (t.pnl || 0) > 0).length;
        const losses = trades.length - wins;
        return { wins, losses, rate: trades.length > 0 ? Math.round((wins / trades.length) * 100) : 0 };
      },
    }),
    {
      name: 'wm-portfolio',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ holdings: s.holdings, paperHoldings: s.paperHoldings, tradeHistory: s.tradeHistory, paperBalance: s.paperBalance, mode: s.mode }),
    }
  )
);
