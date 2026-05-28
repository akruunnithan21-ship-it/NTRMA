import { FastifyInstance } from 'fastify';

export async function financeRoutes(app: FastifyInstance) {
  // ===== TRANSACTIONS =====

  // Get all transactions (with filters)
  app.get('/transactions', async (request, reply) => {
    const { month, category, type, limit = 50, offset = 0 } = request.query as any;
    // TODO: Prisma query with filters
    return { transactions: [], total: 0, limit, offset };
  });

  // Add transaction
  app.post('/transactions', async (request, reply) => {
    const {
      type, amount, category, name, date,
      paymentMethod, necessityLevel, isRecurring,
      recurrenceType, note, tags,
    } = request.body as any;

    // TODO: Zod validation + Prisma create
    const id = Date.now().toString();
    return {
      success: true,
      id,
      transaction: { id, type, amount, category, name, date, paymentMethod, necessityLevel, isRecurring, recurrenceType, note, tags },
    };
  });

  // Update transaction
  app.put('/transactions/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const updates = request.body as any;
    // TODO: Prisma update
    return { success: true, id };
  });

  // Delete transaction
  app.delete('/transactions/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    // TODO: Prisma delete
    return { success: true, id };
  });

  // Bulk delete
  app.post('/transactions/bulk-delete', async (request, reply) => {
    const { ids } = request.body as { ids: string[] };
    return { success: true, deleted: ids.length };
  });

  // ===== BUDGETS =====

  // Get budgets for current month
  app.get('/budgets', async (request, reply) => {
    const { month } = request.query as { month?: string };
    return {
      budgets: [
        { category: 'rent', limit: 5000, color: '#FF6B35' },
        { category: 'groceries', limit: 3000, color: '#FFB800' },
        { category: 'dining', limit: 800, color: '#FF006E' },
        { category: 'transport', limit: 1000, color: '#00F0FF' },
        { category: 'subscriptions', limit: 700, color: '#6366F1' },
        { category: 'mobile_internet', limit: 300, color: '#A855F7' },
        { category: 'shopping', limit: 500, color: '#EC4899' },
        { category: 'health', limit: 500, color: '#10B981' },
        { category: 'personal_care', limit: 300, color: '#8B5CF6' },
        { category: 'entertainment', limit: 400, color: '#F43F5E' },
        { category: 'bills', limit: 600, color: '#F59E0B' },
      ],
    };
  });

  // Update budget
  app.put('/budgets/:category', async (request, reply) => {
    const { category } = request.params as { category: string };
    const { limit } = request.body as { limit: number };
    return { success: true, category, limit };
  });

  // Bulk set budgets
  app.post('/budgets/bulk', async (request, reply) => {
    const { budgets } = request.body as { budgets: { category: string; limit: number }[] };
    return { success: true, updated: budgets.length };
  });

  // ===== MONTHLY SUMMARY =====

  app.get('/summary/:month', async (request, reply) => {
    const { month } = request.params as { month: string }; // "2026-05"
    // TODO: Aggregate from DB
    return {
      month,
      totalIncome: 13000,
      totalExpenses: 9200,
      saved: 3800,
      investableSurplus: 2600,
      transactionCount: 24,
      dailyAverage: 307,
      categoryBreakdown: [],
      necessityBreakdown: [],
    };
  });

  // ===== INVESTABLE SURPLUS =====

  app.get('/investable-surplus', async (request, reply) => {
    return {
      monthlyIncome: 13000,
      totalExpenses: 9200,
      emergencyBuffer: 1300,
      investableSurplus: 2500,
      aiRecommendation: {
        sipAllocation: 1500,
        swingTradeAllocation: 1000,
        reasoning: 'Based on aggressive strategy with ₹2,500 surplus, 60% to SIPs for compounding, 40% for active trades.',
      },
    };
  });

  // ===== RECURRING TEMPLATES =====

  app.get('/recurring', async (request, reply) => {
    return { templates: [] };
  });

  app.post('/recurring', async (request, reply) => {
    const { type, category, name, amount, frequency, nextDueDate, paymentMethod } = request.body as any;
    return { success: true, id: Date.now().toString() };
  });

  app.delete('/recurring/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    return { success: true, id };
  });

  // ===== SPENDING RULES (Auto-categorization) =====

  app.get('/rules', async (request, reply) => {
    return { rules: [] };
  });

  app.post('/rules', async (request, reply) => {
    const { keyword, category } = request.body as { keyword: string; category: string };
    return { success: true };
  });

  // ===== INSIGHTS =====

  app.get('/insights', async (request, reply) => {
    return { insights: [] };
  });

  app.put('/insights/:id/status', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { status } = request.body as { status: string };
    return { success: true, id, status };
  });
}
