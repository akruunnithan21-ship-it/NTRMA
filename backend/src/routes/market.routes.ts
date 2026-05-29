import { FastifyInstance } from 'fastify';
import axios from 'axios';

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

/**
 * Market Routes - Proxies to Python AI Engine for market data
 * All market data flows: Mobile App → Node Backend → Python AI Engine (yfinance + Redis cache)
 */
export async function marketRoutes(app: FastifyInstance) {

  // ===== STOCK PRICES =====

  // Get single stock price
  app.get('/price/:symbol', async (request, reply) => {
    const { symbol } = request.params as { symbol: string };
    const { exchange = 'NSE' } = request.query as { exchange?: string };

    try {
      const response = await axios.get(`${AI_ENGINE_URL}/market/price/${symbol}`, {
        params: { exchange },
        timeout: 10000,
      });
      return response.data;
    } catch (error: any) {
      return reply.code(502).send({
        error: 'Market data unavailable',
        message: error.message || 'AI Engine not reachable',
        symbol,
      });
    }
  });

  // Get batch prices for watchlist
  app.post('/prices/batch', async (request, reply) => {
    const { symbols } = request.body as { symbols: { symbol: string; exchange?: string }[] };

    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      return reply.code(400).send({ error: 'symbols array required' });
    }

    if (symbols.length > 30) {
      return reply.code(400).send({ error: 'Max 30 symbols per batch request' });
    }

    try {
      const response = await axios.post(`${AI_ENGINE_URL}/market/prices/batch`, {
        symbols: symbols.map((s) => ({
          symbol: s.symbol,
          exchange: s.exchange || 'NSE',
        })),
      }, { timeout: 30000 });
      return response.data;
    } catch (error: any) {
      return reply.code(502).send({
        error: 'Batch price fetch failed',
        message: error.message,
      });
    }
  });

  // ===== INDICES =====

  app.get('/indices', async (request, reply) => {
    try {
      const response = await axios.get(`${AI_ENGINE_URL}/market/indices`, {
        timeout: 15000,
      });
      return response.data;
    } catch (error: any) {
      // Return fallback stale data if AI engine is down
      return {
        indices: [],
        error: 'Market data temporarily unavailable',
        stale: true,
      };
    }
  });

  // ===== STOCK INFO (Fundamentals) =====

  app.get('/info/:symbol', async (request, reply) => {
    const { symbol } = request.params as { symbol: string };
    const { exchange = 'NSE' } = request.query as { exchange?: string };

    try {
      const response = await axios.get(`${AI_ENGINE_URL}/market/info/${symbol}`, {
        params: { exchange },
        timeout: 15000,
      });
      return response.data;
    } catch (error: any) {
      return reply.code(502).send({
        error: 'Stock info unavailable',
        symbol,
      });
    }
  });

  // ===== HISTORICAL DATA (Charts) =====

  app.get('/historical/:symbol', async (request, reply) => {
    const { symbol } = request.params as { symbol: string };
    const { exchange = 'NSE', period = '1mo' } = request.query as { exchange?: string; period?: string };

    // Validate period
    const validPeriods = ['1d', '5d', '1mo', '3mo', '6mo', '1y', '2y', '5y', 'max'];
    if (!validPeriods.includes(period)) {
      return reply.code(400).send({ error: `Invalid period. Valid: ${validPeriods.join(', ')}` });
    }

    try {
      const response = await axios.get(`${AI_ENGINE_URL}/market/historical/${symbol}`, {
        params: { exchange, period },
        timeout: 15000,
      });
      return response.data;
    } catch (error: any) {
      return reply.code(502).send({
        error: 'Historical data unavailable',
        symbol,
      });
    }
  });

  // ===== SEARCH =====

  app.get('/search', async (request, reply) => {
    const { q, limit = '10' } = request.query as { q?: string; limit?: string };

    if (!q || q.length < 1) {
      return reply.code(400).send({ error: 'Query parameter "q" required (min 1 char)' });
    }

    try {
      const response = await axios.get(`${AI_ENGINE_URL}/market/search`, {
        params: { q, limit: parseInt(limit) },
        timeout: 10000,
      });
      return response.data;
    } catch (error: any) {
      return { results: [] };
    }
  });

  // ===== SECTORS =====

  app.get('/sectors', async (request, reply) => {
    try {
      const response = await axios.get(`${AI_ENGINE_URL}/market/sectors`, {
        timeout: 15000,
      });
      return response.data;
    } catch (error: any) {
      return { sectors: [], error: 'Sector data unavailable' };
    }
  });

  // ===== MARKET STATUS =====

  app.get('/status', async (request, reply) => {
    try {
      const response = await axios.get(`${AI_ENGINE_URL}/market/status`, {
        timeout: 5000,
      });
      return {
        ...response.data,
        backend: 'connected',
        ai_engine: 'connected',
      };
    } catch (error: any) {
      return {
        nse_open: false,
        us_open: false,
        cache_connected: false,
        backend: 'connected',
        ai_engine: 'disconnected',
      };
    }
  });

  // ===== TRANSACTION CHARGES CALCULATOR =====

  app.post('/charges/calculate', async (request, reply) => {
    const { action, price, quantity, exchange = 'NSE', market = 'indian' } = request.body as {
      action: 'buy' | 'sell';
      price: number;
      quantity: number;
      exchange?: string;
      market?: string;
    };

    if (!action || !price || !quantity) {
      return reply.code(400).send({ error: 'action, price, and quantity are required' });
    }

    if (price <= 0 || quantity <= 0) {
      return reply.code(400).send({ error: 'price and quantity must be positive' });
    }

    // Use local charges calculator (no need to hit AI engine)
    const { calculateIndianStockBuy, calculateIndianStockSell } = await import('../utils/charges-calculator');

    if (market === 'indian') {
      const validExchange = exchange === 'BSE' ? 'BSE' : 'NSE';
      if (action === 'buy') {
        return calculateIndianStockBuy(price, quantity, validExchange);
      } else {
        return calculateIndianStockSell(price, quantity, validExchange);
      }
    }

    return reply.code(400).send({ error: 'Only Indian market charges supported currently' });
  });

  // ===== CACHE MANAGEMENT =====

  app.post('/cache/flush', async (request, reply) => {
    try {
      const response = await axios.post(`${AI_ENGINE_URL}/market/cache/flush`, {}, {
        timeout: 5000,
      });
      return response.data;
    } catch (error: any) {
      return { success: false, message: 'Could not flush cache' };
    }
  });
}
