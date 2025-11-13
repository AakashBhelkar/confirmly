import { FastifyInstance } from 'fastify';
import rateLimit from '@fastify/rate-limit';

export const registerRateLimit = async (app: FastifyInstance) => {
  await app.register(rateLimit, {
    max: Number(process.env.RATE_LIMIT_MAX) || 100,
    timeWindow: process.env.RATE_LIMIT_WINDOW || '1 minute',
    errorResponseBuilder: (request, context) => {
      return {
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: `Rate limit exceeded. Try again in ${context.ttl} seconds.`,
        },
      };
    },
  });
};

