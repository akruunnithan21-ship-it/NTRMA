import { create } from 'zustand';

export interface StockData {
  symbol: string;
  name: string;
  exchange: 'NSE' | 'BSE' | 'NYSE' | 'NASDAQ';
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
}

export interface Signal {
  id: string;
  symbol: string;
  direction: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  entryPrice: number;
  targetPrice: number;
  stopLoss: number;
  timeHorizon: string;
  explanation: string;
  status: 'active' | 'hit_target' | 'hit_stoploss' | 'expired';
  createdAt: string;
}

interface MarketState {
  watchlist: StockData[];
  signals: Signal[];
  indices: StockData[];
  isLoading: boolean;
  lastUpdated: string | null;
  addToWatchlist: (stock: StockData) => void;
  removeFromWatchlist: (symbol: string) => void;
  setSignals: (signals: Signal[]) => void;
  setIndices: (indices: StockData[]) => void;
}

export const useMarketStore = create<MarketState>((set) => ({
  watchlist: [
    { symbol: 'TATAMOTORS', name: 'Tata Motors', exchange: 'NSE', price: 952.40, change: 12.5, changePercent: 1.33 },
    { symbol: 'RELIANCE', name: 'Reliance Industries', exchange: 'NSE', price: 2834.75, change: -28.4, changePercent: -0.99 },
    { symbol: 'HDFCBANK', name: 'HDFC Bank', exchange: 'NSE', price: 1678.90, change: 15.2, changePercent: 0.91 },
    { symbol: 'INFY', name: 'Infosys', exchange: 'NSE', price: 1456.30, change: -8.6, changePercent: -0.59 },
    { symbol: 'TCS', name: 'TCS', exchange: 'NSE', price: 3890.15, change: 45.8, changePercent: 1.19 },
    { symbol: 'AAPL', name: 'Apple Inc', exchange: 'NASDAQ', price: 189.45, change: 2.3, changePercent: 1.23 },
  ],
  signals: [],
  indices: [
    { symbol: 'NIFTY50', name: 'NIFTY 50', exchange: 'NSE', price: 22430.85, change: 178.5, changePercent: 0.8 },
    { symbol: 'SENSEX', name: 'SENSEX', exchange: 'BSE', price: 73891.20, change: 442.3, changePercent: 0.6 },
    { symbol: 'BANKNIFTY', name: 'BANK NIFTY', exchange: 'NSE', price: 48234.60, change: -156.2, changePercent: -0.32 },
    { symbol: 'SPX', name: 'S&P 500', exchange: 'NYSE', price: 5892.40, change: -11.8, changePercent: -0.2 },
  ],
  isLoading: false,
  lastUpdated: null,
  addToWatchlist: (stock) => set((s) => ({ watchlist: [...s.watchlist, stock] })),
  removeFromWatchlist: (symbol) => set((s) => ({ watchlist: s.watchlist.filter((w) => w.symbol !== symbol) })),
  setSignals: (signals) => set({ signals }),
  setIndices: (indices) => set({ indices }),
}));
