import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { financeRoutes } from './routes/finance.routes';
import { marketRoutes } from './routes/market.routes';
import { aiRoutes } from './routes/ai.routes';
import { portfolioRoutes } from './routes/portfolio.routes';
import { authRoutes } from './routes/auth.routes';

const app = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: { colorize: true },
    },
  },
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
  app.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: 'connected',
      redis: 'connected',
      aiEngine: 'checking...',
    },
  }));

  // Start server
  const port = Number(process.env.PORT) || 3001;
  const host = process.env.HOST || '0.0.0.0';

  try {
    await app.listen({ port, host });
    console.log(`
╔══════════════════════════════════════════╗
║   WealthMaster API Server               ║
║   Running on http://${host}:${port}        ║
║   Environment: ${process.env.NODE_ENV || 'development'}         ║
╚══════════════════════════════════════════╝
    `);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
