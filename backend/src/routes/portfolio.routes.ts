import { FastifyInstance } from 'fastify';

export async function portfolioRoutes(app: FastifyInstance) {
  // Get portfolio holdings
  app.get('/holdings', async (request, reply) => {
    return { holdings: [], totalValue: 0, totalInvested: 0, totalPnL: 0 };
  });

  // Add holding (manual entry or from signal execution)
  app.post('/holdings', async (request, reply) => {
    const { symbol, exchange, quantity, buyPrice, buyDate } = request.body as any;
    return { success: true, id: Date.now().toString() };
  });

  // Get paper trading portfolio
  app.get('/paper', async (request, reply) => {
    return {
      holdings: [],
      virtualBalance: 100000, // ₹1L paper trading capital
      totalValue: 0,
      pnl: 0,
      pnlPercent: 0,
    };
  });

  // Execute paper trade
  app.post('/paper/trade', async (request, reply) => {
    const { symbol, action, quantity, price } = request.body as any;
    return { success: true, tradeId: Date.now().toString() };
  });

  // Get net worth breakdown
  app.get('/networth', async (request, reply) => {
    return {
      total: 14832,
      breakdown: {
        stocks: 8500,
        mutualFunds: 4200,
        savings: 2132,
      },
      history: [], // Time-series for chart
    };
  });

  // SIP tracker
  app.get('/sips', async (request, reply) => {
    return { sips: [], totalMonthly: 0 };
  });

  app.post('/sips', async (request, reply) => {
    const { fundName, amount, frequency, startDate } = request.body as any;
    return { success: true };
  });
}
