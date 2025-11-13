import { FastifyInstance } from 'fastify';
import { installRoute } from './install';
import { callbackRoute } from './callback';
import { webhooksRoute } from './webhooks';

export const shopifyRoutes = async (app: FastifyInstance) => {
  await app.register(installRoute);
  await app.register(callbackRoute);
  await app.register(webhooksRoute);
};

