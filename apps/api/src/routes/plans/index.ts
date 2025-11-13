import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Plan } from '../../models/Plan';

export const planRoutes = async (app: FastifyInstance) => {
  // Get public plans
  app.get(
    '/',
    {
      schema: {
        description: 'Get public plans',
        tags: ['plans'],
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const plans = await Plan.find({ public: true }).sort({ sort: 1 });

      return reply.send({
        success: true,
        data: plans.map((p) => ({
          id: p._id.toString(),
          name: p.name,
          price: p.price,
          currency: p.currency,
          limits: p.limits,
          features: p.features,
        })),
      });
    }
  );
};

