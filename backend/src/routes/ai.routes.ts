import { FastifyInstance } from 'fastify';
import axios from 'axios';

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

// Signal generation runs yfinance + technical/fundamental/sentiment + an LLM
// explanation per stock, so it can take a while. Give it a long timeout and
// cache the daily scan in memory so the phone gets instant responses after the
// first (cold) request of the session.
const ai = axios.create({ baseURL: AI_ENGINE_URL, timeout: 180000 });

// Curated, smaller watchlist for the on-demand "today" scan (keeps it snappy
// vs. the Python engine's default 15). Large, liquid NSE names.
const QUICK_WATCHLIST = [
  { symbol: 'TATAMOTORS', exchange: 'NSE' },
  { symbol: 'RELIANCE', exchange: 'NSE' },
  { symbol: 'HDFCBANK', exchange: 'NSE' },
  { symbol: 'INFY', exchange: 'NSE' },
  { symbol: 'ICICIBANK', exchange: 'NSE' },
  { symbol: 'SBIN', exchange: 'NSE' },
  { symbol: 'BHARTIARTL', exchange: 'NSE' },
  { symbol: 'MARUTI', exchange: 'NSE' },
];

interface NormalizedSignal {
  symbol: string;
  exchange?: string;
  direction: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  entryPrice: number;
  targetPrice: number;
  targetPercent?: number;
  stopLoss: number;
  stopLossPercent?: number;
  riskReward: string;
  timeHorizon: string;
  explanation: string;
  factors?: Record<string, number>;
  patterns?: string[];
  trend?: string;
}

function normalizeSignal(py: any): NormalizedSignal {
  return {
    symbol: py.symbol,
    exchange: py.exchange,
    direction: py.direction,
    confidence: py.confidence,
    entryPrice: py.entry_price,
    targetPrice: py.target_price,
    targetPercent: py.target_percent,
    stopLoss: py.stop_loss,
    stopLossPercent: py.stop_loss_percent,
    riskReward: py.risk_reward,
    timeHorizon: py.time_horizon,
    explanation: py.explanation ?? '',
    factors: py.factors,
    patterns: py.patterns ?? [],
    trend: py.trend,
  };
}

// ---- in-memory daily-signal cache (per strategy) ----
const CACHE_TTL_MS = 20 * 60 * 1000;
const dailyCache = new Map<string, { data: any; ts: number }>();
let currentStrategy = 'aggressive';

async function ensureDailySignals(strategy: string) {
  const cached = dailyCache.get(strategy);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return cached.data;
  }
  const { data } = await ai.post('/signals/scan', { symbols: QUICK_WATCHLIST, strategy });
  dailyCache.set(strategy, { data, ts: Date.now() });
  return data;
}

export async function aiRoutes(app: FastifyInstance) {
  // Today's top signal (cached daily scan -> top pick)
  app.get('/signal/today', async (request, reply) => {
    const { strategy = currentStrategy } = request.query as { strategy?: string };
    try {
      const daily = await ensureDailySignals(strategy);
      const top = daily?.top_pick ?? null;
      return { signal: top ? normalizeSignal(top) : null, generatedAt: daily?.generated_at ?? null };
    } catch (error: any) {
      return reply.code(502).send({ signal: null, error: 'AI engine unreachable', message: error.message });
    }
  });

  // Active signals = all BUY + SELL picks from the daily scan
  app.get('/signals/active', async (request, reply) => {
    const strategy = (request.query as any)?.strategy || currentStrategy;
    try {
      const daily = await ensureDailySignals(strategy);
      const buys = (daily?.buy_signals ?? []).map(normalizeSignal);
      const sells = (daily?.sell_signals ?? []).map(normalizeSignal);
      return { signals: [...buys, ...sells] };
    } catch (error: any) {
      return reply.code(502).send({ signals: [], error: 'AI engine unreachable' });
    }
  });

  // Full signal history + paper-trade stats (history not persisted yet)
  app.get('/signals/history', async (request, reply) => {
    const strategy = (request.query as any)?.strategy || currentStrategy;
    try {
      const daily = await ensureDailySignals(strategy);
      const all = [
        ...(daily?.buy_signals ?? []),
        ...(daily?.sell_signals ?? []),
        ...(daily?.hold_signals ?? []),
      ].map(normalizeSignal);
      return { signals: all, stats: { analyzed: daily?.total_analyzed ?? 0, generated: daily?.signals_generated ?? 0 } };
    } catch {
      return { signals: [], stats: { analyzed: 0, generated: 0 } };
    }
  });

  // Scan a custom watchlist (force fresh)
  app.post('/signals/scan', async (request, reply) => {
    const { symbols, strategy = currentStrategy } = request.body as {
      symbols: { symbol: string; exchange: string }[];
      strategy?: string;
    };
    try {
      const { data } = await ai.post('/signals/scan', { symbols, strategy });
      dailyCache.delete(strategy); // invalidate cache after a manual scan
      return {
        topPick: data?.top_pick ? normalizeSignal(data.top_pick) : null,
        signals: [
          ...(data?.buy_signals ?? []),
          ...(data?.sell_signals ?? []),
          ...(data?.hold_signals ?? []),
        ].map(normalizeSignal),
        generatedAt: data?.generated_at ?? null,
      };
    } catch (error: any) {
      return reply.code(502).send({ topPick: null, signals: [], error: 'AI engine unreachable' });
    }
  });

  // Ask the AI a free-form question (Ollama via /chat/ask)
  app.post('/ask', async (request, reply) => {
    const { question, context = {} } = request.body as { question: string; context?: Record<string, unknown> };
    if (!question || !question.trim()) {
      return reply.code(400).send({ error: 'question is required' });
    }
    try {
      const { data } = await ai.post('/chat/ask', { question, context }, { timeout: 120000 });
      return { answer: data?.answer ?? '', sources: data?.sources ?? [], confidence: data?.confidence ?? 0 };
    } catch (error: any) {
      return reply.code(502).send({
        answer: 'AI engine is offline. Start the Python engine + Ollama, then try again.',
        sources: [],
        confidence: 0,
        error: true,
      });
    }
  });

  // Change strategy mode (kept in memory; also clears cache so next scan uses it)
  app.post('/strategy', async (request, reply) => {
    const { mode } = request.body as { mode: 'aggressive' | 'balanced' | 'protect' };
    if (mode) {
      currentStrategy = mode;
      dailyCache.clear();
    }
    return { success: true, mode: currentStrategy };
  });

  // AI engine + Ollama status
  app.get('/status', async (request, reply) => {
    try {
      const { data } = await ai.get('/chat/status', { timeout: 6000 });
      return {
        ollamaConnected: !!data?.connected,
        model: data?.active_model ?? null,
        models: data?.models ?? [],
        recommendation: data?.recommendation ?? null,
        strategy: currentStrategy,
        lastAnalysis: null,
      };
    } catch (error: any) {
      return { ollamaConnected: false, model: null, models: [], strategy: currentStrategy, lastAnalysis: null };
    }
  });

  // Full technical + fundamental analysis for one stock
  app.get('/analyze/:symbol', async (request, reply) => {
    const { symbol } = request.params as { symbol: string };
    const { exchange = 'NSE' } = request.query as { exchange?: string };
    try {
      const [analysis, signal] = await Promise.allSettled([
        ai.get(`/analysis/${symbol}`, { params: { exchange }, timeout: 60000 }),
        ai.get(`/signals/quick/${symbol}`, { params: { exchange }, timeout: 60000 }),
      ]);
      return {
        symbol,
        exchange,
        analysis: analysis.status === 'fulfilled' ? analysis.value.data : null,
        signal: signal.status === 'fulfilled' ? signal.value.data : null,
      };
    } catch (error: any) {
      return reply.code(502).send({ symbol, error: 'AI engine unreachable' });
    }
  });

  // News sentiment for a stock
  app.get('/news/:symbol', async (request, reply) => {
    const { symbol } = request.params as { symbol: string };
    try {
      const { data } = await ai.get(`/sentiment/news/${symbol}`, { timeout: 30000 });
      return data;
    } catch {
      return { symbol, news: [] };
    }
  });

  // Overall market mood
  app.get('/market-mood', async (request, reply) => {
    try {
      const { data } = await ai.get('/sentiment/market-mood', { timeout: 30000 });
      return data;
    } catch {
      return { mood: 'neutral', score: 50, error: 'sentiment engine offline' };
    }
  });
}
