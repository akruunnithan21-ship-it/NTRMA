import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { financeRoutes } from './routes/finance.routes';
import { marketRoutes } from './routes/market.routes';
import { aiRoutes } from './routes/ai.routes';
import { portfolioRoutes } from './routes/portfolio.routes';
import { authRoutes } from './routes/auth.routes';

const app = Fastify({
  logger: true,
});

async function start() {
  // Plugins
  await app.register(cors, {
    origin: true,
    credentials: true,
  });

  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  // Routes
  await app.register(authRoutes, { prefix: '/api/auth' });
  await app.register(financeRoutes, { prefix: '/api/finance' });
  await app.register(marketRoutes, { prefix: '/api/market' });
  await app.register(aiRoutes, { prefix: '/api/ai' });
  await app.register(portfolioRoutes, { prefix: '/api/portfolio' });

  // Health check
  app.get('/health', async () => {
    const dbUrl = process.env.DATABASE_URL || '';
    const isSupabase = dbUrl.includes('supabase');
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      hostname: require('os').hostname(),
      database: isSupabase ? 'supabase (cloud)' : 'local',
      redis: process.env.REDIS_URL || 'not configured',
      ai_engine: process.env.AI_ENGINE_URL || 'http://localhost:8000',
    };
  });

  // Start server
  const port = Number(process.env.PORT) || 3001;
  const host = process.env.HOST || '0.0.0.0';

  try {
    await app.listen({ port, host });
    const dbUrl = process.env.DATABASE_URL || 'NOT SET';
    const dbType = dbUrl.includes('supabase') ? 'Supabase Cloud' : 'Local PostgreSQL';
    console.log(`
╔═══════════════════════════════════════════════════╗
║   WealthMaster API Server                         ║
║   Running on http://${host}:${port}                  ║
║   Database: ${dbType.padEnd(20)}            ║
║   AI Engine: ${(process.env.AI_ENGINE_URL || 'http://localhost:8000').padEnd(19)}║
╚═══════════════════════════════════════════════════╝
    `);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
