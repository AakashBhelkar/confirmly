import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authenticate } from '../../middlewares/auth';
import { User } from '../../models/User';
import { Merchant } from '../../models/Merchant';
import { AppError } from '../../middlewares/error-handler';

export const meRoute = async (app: FastifyInstance) => {
  app.get(
    '/me',
    {
      preHandler: [authenticate],
      schema: {
        description: 'Get current user and merchant context',
        tags: ['auth'],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  user: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      email: { type: 'string' },
                      name: { type: 'string' },
                      role: { type: 'string' },
                    },
                  },
                  merchant: {
                    type: 'object',
                  },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
      }

      const user = await User.findById(request.user.userId);
      if (!user) {
        throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
      }

      let merchant = null;
      if (user.merchantId) {
        merchant = await Merchant.findById(user.merchantId);
      }

      const userData = {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        merchantId: user.merchantId?.toString(),
      };

      const merchantData = merchant
        ? {
            id: merchant._id.toString(),
            name: merchant.name,
            slug: merchant.slug,
            plan: merchant.plan,
            settings: merchant.settings,
          }
        : null;

      return reply.send({
        success: true,
        data: {
          user: userData,
          merchant: merchantData,
        },
      });
    }
  );
};

