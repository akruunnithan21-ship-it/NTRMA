import { FastifyInstance } from 'fastify';

export async function financeRoutes(app: FastifyInstance) {
  // Get all transactions
  app.get('/transactions', async (request, reply) => {
    // TODO: Fetch from DB via Prisma
    return { transactions: [], total: 0 };
  });

  // Add transaction
  app.post('/transactions', async (request, reply) => {
    const { type, amount, category, name, date, note } = request.body as any;
    // TODO: Validate with Zod, save to DB
    return { success: true, id: Date.now().toString() };
  });

  // Get budgets
  app.get('/budgets', async (request, reply) => {
    return { budgets: [] };
  });

  // Update budget
  app.put('/budgets/:category', async (request, reply) => {
    return { success: true };
  });

  // Get monthly summary
  app.get('/summary/:month', async (request, reply) => {
    const { month } = request.params as { month: string };
    return {
      month,
      income: 13000,
      expenses: 9200,
      saved: 3800,
      investable: 2600,
    };
  });

  // Calculate investable surplus
  app.get('/investable-surplus', async (request, reply) => {
    return {
      monthly_income: 13000,
      total_expenses: 9200,
      emergency_fund_contribution: 1300,
      investable: 2600,
      ai_recommendation: {
        sip_allocation: 1500,
        swing_trade_allocation: 1100,
      },
    };
  });
}
