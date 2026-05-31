/**
 * WealthMaster API Service Layer
 * ---------------------------------------------------------------------------
 * The base URL is no longer hard-coded. It is resolved at request time from
 * `useConnectionStore`, which the user configures in the Settings screen and
 * which is persisted with expo-secure-store. Change the backend address from
 * inside the app — no code edits, no rebuild.
 * ---------------------------------------------------------------------------
 */

import axios from 'axios';
import { useConnectionStore } from '@/store/useConnectionStore';

const api = axios.create({
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

// Resolve the base URL freshly on every request from the connection store.
api.interceptors.request.use((config) => {
  config.baseURL = useConnectionStore.getState().getApiURL();
  return config;
});

// Reflect connectivity into the connection store so the UI can show status.
api.interceptors.response.use(
  (response) => {
    const { status, setStatus } = useConnectionStore.getState();
    if (status !== 'online') setStatus('online');
    return response;
  },
  (error) => {
    if (error?.code === 'ERR_NETWORK' || error?.message === 'Network Error' || !error?.response) {
      useConnectionStore.getState().setStatus('offline');
    }
    return Promise.reject(error);
  }
);

// ===== AUTH =====
export const authAPI = {
  verifyPin: (pin: string) => api.post('/auth/verify-pin', { pin }),
  setupPin: (pin: string) => api.post('/auth/setup-pin', { pin }),
};

// ===== FINANCE =====
export const financeAPI = {
  getTransactions: () => api.get('/finance/transactions'),
  addTransaction: (data: any) => api.post('/finance/transactions', data),
  getBudgets: () => api.get('/finance/budgets'),
  getMonthlySummary: (month: string) => api.get(`/finance/summary/${month}`),
  getInvestableSurplus: () => api.get('/finance/investable-surplus'),
};

// ===== MARKET =====
export const marketAPI = {
  getStock: (symbol: string) => api.get(`/market/price/${symbol}`),
  getStockWithExchange: (symbol: string, exchange: string) =>
    api.get(`/market/price/${symbol}`, { params: { exchange } }),
  getBatchPrices: (symbols: { symbol: string; exchange: string }[]) =>
    api.post('/market/prices/batch', { symbols }),
  getIndices: () => api.get('/market/indices'),
  getStockInfo: (symbol: string, exchange: string) =>
    api.get(`/market/info/${symbol}`, { params: { exchange } }),
  getHistorical: (symbol: string, exchange: string, period: string) =>
    api.get(`/market/historical/${symbol}`, { params: { exchange, period } }),
  getSectors: () => api.get('/market/sectors'),
  getMarketStatus: () => api.get('/market/status'),
  calculateCharges: (data: any) => api.post('/market/charges/calculate', data),
  search: (q: string) => api.get('/market/search', { params: { q } }),
  flushCache: () => api.post('/market/cache/flush'),
};

// ===== AI =====
// AI calls can be slow on a cold cache (yfinance + technical/fundamental +
// LLM explanation), so they get longer per-request timeouts than the default.
export const aiAPI = {
  getTodaySignal: (strategy?: string) =>
    api.get('/ai/signal/today', { params: { strategy }, timeout: 90000 }),
  getActiveSignals: () => api.get('/ai/signals/active', { timeout: 90000 }),
  getSignalHistory: () => api.get('/ai/signals/history', { timeout: 90000 }),
  scanWatchlist: (symbols: { symbol: string; exchange: string }[], strategy: string) =>
    api.post('/ai/signals/scan', { symbols, strategy }, { timeout: 120000 }),
  askAI: (question: string, context?: Record<string, unknown>) =>
    api.post('/ai/ask', { question, context }, { timeout: 120000 }),
  setStrategy: (mode: string) => api.post('/ai/strategy', { mode }),
  getStatus: () => api.get('/ai/status', { timeout: 10000 }),
  analyzeStock: (symbol: string, exchange = 'NSE') =>
    api.get(`/ai/analyze/${symbol}`, { params: { exchange }, timeout: 70000 }),
  getMarketMood: () => api.get('/ai/market-mood', { timeout: 35000 }),
  getStockNews: (symbol: string) => api.get(`/ai/news/${symbol}`, { timeout: 35000 }),
};

// ===== PORTFOLIO =====
export const portfolioAPI = {
  getHoldings: () => api.get('/portfolio/holdings'),
  addHolding: (data: any) => api.post('/portfolio/holdings', data),
  getPaperPortfolio: () => api.get('/portfolio/paper'),
  executePaperTrade: (data: any) => api.post('/portfolio/paper/trade', data),
  getNetWorth: () => api.get('/portfolio/networth'),
  getSIPs: () => api.get('/portfolio/sips'),
};

// ===== UTILITY =====
export const getConnectionInfo = () => {
  const s = useConnectionStore.getState();
  return { mode: s.mode, baseURL: s.getApiURL(), localIP: s.localIP, tunnelURL: s.tunnelURL || 'not configured' };
};

export default api;
