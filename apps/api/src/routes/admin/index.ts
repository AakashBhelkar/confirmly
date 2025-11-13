import { FastifyInstance } from 'fastify';
import { adminMerchantRoutes } from './merchants';
import { adminPlanRoutes } from './plans';

export const adminRoutes = async (app: FastifyInstance) => {
  await app.register(adminMerchantRoutes, { prefix: '/merchants' });
  await app.register(adminPlanRoutes, { prefix: '/plans' });
};

