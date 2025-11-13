import { FastifyInstance } from 'fastify';
import { webhooksRoute } from './webhooks';

export const whatsappRoutes = async (app: FastifyInstance) => {
  await app.register(webhooksRoute);
};

