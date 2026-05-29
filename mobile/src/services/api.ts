/**
 * API Service Layer
 * Communicates with the WealthMaster backend
 */

import axios from 'axios';

// Default to localhost for development
// Change this to your PC's IP when testing on physical device
const BASE_URL = __DEV__
  ? 'http://192.168.1.100:3001/api'  // Replace with your PC's local IP
  : 'https://api.wealthmaster.app/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  // TODO: Get token from secure store
  // const token = await SecureStore.getItemAsync('auth_token');
  // if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // TODO: Navigate to login
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
  getStock: (symbol: string) => api.get(`/market/stock/${symbol}`),
  getBatchPrices: (symbols: string[]) => api.post('/market/prices/batch', { symbols }),
  getIndices: () => api.get('/market/indices'),
  getSectors: () => api.get('/market/sectors'),
  calculateCharges: (data: any) => api.post('/market/charges/calculate', data),
  search: (q: string) => api.get('/market/search', { params: { q } }),
};

// ===== AI =====
export const aiAPI = {
  getTodaySignal: () => api.get('/ai/signal/today'),
  getActiveSignals: () => api.get('/ai/signals/active'),
  getSignalHistory: () => api.get('/ai/signals/history'),
  askAI: (question: string) => api.post('/ai/ask', { question }),
  setStrategy: (mode: string) => api.post('/ai/strategy', { mode }),
  getStatus: () => api.get('/ai/status'),
  analyzeStock: (symbol: string) => api.post(`/ai/analyze/${symbol}`),
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

export default api;
