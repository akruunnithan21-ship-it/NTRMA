import { FastifyInstance } from 'fastify';

export async function aiRoutes(app: FastifyInstance) {
  // Get today's AI signal
  app.get('/signal/today', async (request, reply) => {
    // TODO: Fetch from AI engine
    return {
      signal: {
        symbol: 'TATAMOTORS',
        direction: 'BUY',
        confidence: 78,
        entryPrice: 952.4,
        targetPrice: 1105.6,
        stopLoss: 895.0,
        riskReward: '1:2.7',
        timeHorizon: '2-4 weeks',
        explanation: 'Strong momentum breakout...',
        factors: {
          technical: 82,
          fundamental: 71,
          sentiment: 76,
          macro: 68,
        },
      },
      generatedAt: new Date().toISOString(),
    };
  });

  // Get all active signals
  app.get('/signals/active', async (request, reply) => {
    return { signals: [] };
  });

  // Get signal history
  app.get('/signals/history', async (request, reply) => {
    return { signals: [], stats: { winRate: 74, totalReturn: 18.4 } };
  });

  // Ask AI (free-form query)
  app.post('/ask', async (request, reply) => {
    const { question } = request.body as { question: string };
    // TODO: Forward to Ollama via AI engine
    return {
      answer: 'AI analysis pending - connect Ollama to enable',
      sources: [],
    };
  });

  // Change strategy mode
  app.post('/strategy', async (request, reply) => {
    const { mode } = request.body as { mode: 'aggressive' | 'balanced' | 'protect' };
    return { success: true, mode };
  });

  // Get AI engine status
  app.get('/status', async (request, reply) => {
    // TODO: Check Ollama connection
    return {
      ollamaConnected: false,
      model: 'qwen2.5:7b',
      lastAnalysis: null,
      nextScheduledRun: null,
    };
  });

  // Trigger manual analysis
  app.post('/analyze/:symbol', async (request, reply) => {
    const { symbol } = request.params as { symbol: string };
    // TODO: Trigger full analysis in AI engine
    return { status: 'queued', symbol };
  });
}
