import { FastifyInstance } from 'fastify';
import { meRoute } from './me';

export const v1Routes = async (app: FastifyInstance) => {
  await app.register(meRoute);
};

