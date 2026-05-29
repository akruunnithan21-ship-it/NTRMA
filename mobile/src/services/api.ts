/**
 * WealthMaster API Service Layer
 * 
 * CONNECTION MODES:
 * 1. LOCAL (same WiFi): Uses your PC's local IP (e.g., 192.168.1.105:3001)
 * 2. TUNNEL (anywhere): Uses Cloudflare tunnel URL (e.g., https://wealthmaster-api.cfargotunnel.com)
 * 
 * HOW TO CONFIGURE:
 * Change the API_CONFIG below based on your setup.
 */

import axios from 'axios';

// ═══════════════════════════════════════════════════════════════
// 🔧 CONFIGURATION — CHANGE THESE VALUES FOR YOUR SETUP
// ═══════════════════════════════════════════════════════════════

const API_CONFIG = {
  // Your PC's local IP address (find with 'ipconfig' in Command Prompt)
  // Look for "IPv4 Address" under your WiFi adapter
  LOCAL_IP: '192.168.1.100',

  // Cloudflare tunnel URL (set this after running setup-tunnel.bat)
  // Leave empty string if you haven't set up tunnel yet
  TUNNEL_URL: '',

  // Which mode to use:
  // 'local'  = connect via WiFi (phone + PC must be on same network)
  // 'tunnel' = connect via internet (works from anywhere)
  // 'auto'   = use tunnel if available, fallback to local
  MODE: 'auto' as 'local' | 'tunnel' | 'auto',
};

// ═══════════════════════════════════════════════════════════════
// DO NOT EDIT BELOW THIS LINE (unless you know what you're doing)
// ═══════════════════════════════════════════════════════════════

function getBaseURL(): string {
  const { MODE, LOCAL_IP, TUNNEL_URL } = API_CONFIG;

  if (MODE === 'tunnel' && TUNNEL_URL) {
    return `${TUNNEL_URL}/api`;
  }

  if (MODE === 'auto' && TUNNEL_URL) {
    return `${TUNNEL_URL}/api`;
  }

  // Local mode or fallback
  return `http://${LOCAL_IP}:3001/api`;
}

const BASE_URL = getBaseURL();

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  // TODO: Get token from secure store
  return config;
});

// Handle errors globally with retry logic
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If tunnel fails, try local as fallback
    if (API_CONFIG.MODE === 'auto' && API_CONFIG.TUNNEL_URL && error.code === 'ECONNREFUSED') {
      const localURL = `http://${API_CONFIG.LOCAL_IP}:3001/api`;
      const originalRequest = error.config;
      originalRequest.baseURL = localURL;
      return axios(originalRequest);
    }

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

// ===== UTILITY =====
export const getConnectionInfo = () => ({
  mode: API_CONFIG.MODE,
  baseURL: BASE_URL,
  localIP: API_CONFIG.LOCAL_IP,
  tunnelURL: API_CONFIG.TUNNEL_URL || 'not configured',
});

export default api;
