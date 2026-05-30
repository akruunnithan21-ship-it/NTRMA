import { FastifyInstance } from 'fastify';

export async function authRoutes(app: FastifyInstance) {
  // Verify PIN
  app.post('/verify-pin', async (request, reply) => {
    const { pin } = request.body as { pin: string };
    // In production: compare against hashed PIN in DB
    const isValid = pin === '1234'; // Placeholder
    return { success: isValid, token: isValid ? 'jwt-token-here' : null };
  });

  // Set up new PIN
  app.post('/setup-pin', async (request, reply) => {
    const { pin } = request.body as { pin: string };
    // In production: hash and store
    return { success: true };
  });

  // Health
  app.get('/status', async () => ({ authenticated: true }));
}
