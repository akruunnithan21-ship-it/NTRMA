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
  updatePrices: (prices: { symbol: string; price: number; change?: number; change_percent?: number }[]) => void;
}

// NOTE: `watchlist` ships with a few large-cap NSE symbols as a sensible starter
// list for a brand-new user. Prices are refreshed live from the backend; the
// seed numbers are only "last known" placeholders shown until the first fetch.
// `indices` starts EMPTY — index values are always shown from live data (with a
// skeleton while loading) so no stale numbers are ever presented as real.
export const useMarketStore = create<MarketState>((set) => ({
  watchlist: [
    { symbol: 'TATAMOTORS', name: 'Tata Motors', exchange: 'NSE', price: 0, change: 0, changePercent: 0 },
    { symbol: 'RELIANCE', name: 'Reliance Industries', exchange: 'NSE', price: 0, change: 0, changePercent: 0 },
    { symbol: 'HDFCBANK', name: 'HDFC Bank', exchange: 'NSE', price: 0, change: 0, changePercent: 0 },
    { symbol: 'INFY', name: 'Infosys', exchange: 'NSE', price: 0, change: 0, changePercent: 0 },
    { symbol: 'TCS', name: 'TCS', exchange: 'NSE', price: 0, change: 0, changePercent: 0 },
    { symbol: 'AAPL', name: 'Apple Inc', exchange: 'NASDAQ', price: 0, change: 0, changePercent: 0 },
  ],
  signals: [],
  indices: [],
  isLoading: false,
  lastUpdated: null,
  addToWatchlist: (stock) =>
    set((s) =>
      s.watchlist.some((w) => w.symbol === stock.symbol && w.exchange === stock.exchange)
        ? s
        : { watchlist: [...s.watchlist, stock] }
    ),
  removeFromWatchlist: (symbol) => set((s) => ({ watchlist: s.watchlist.filter((w) => w.symbol !== symbol) })),
  setSignals: (signals) => set({ signals }),
  setIndices: (indices) => set({ indices, lastUpdated: new Date().toISOString() }),
  updatePrices: (prices) =>
    set((s) => ({
      lastUpdated: new Date().toISOString(),
      watchlist: s.watchlist.map((w) => {
        const p = prices.find((x) => x.symbol === w.symbol);
        return p && p.price > 0
          ? { ...w, price: p.price, change: p.change ?? w.change, changePercent: p.change_percent ?? w.changePercent }
          : w;
      }),
    })),
}));
