import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { authenticate } from '../../../middlewares/auth';
import { shopifyOAuthService } from '../../../services/shopify-oauth.service';
import { AppError } from '../../../middlewares/error-handler';

const installSchema = z.object({
  shop: z.string().min(1, 'Shop domain is required'),
});

export const installRoute = async (app: FastifyInstance) => {
  app.get(
    '/install',
    {
      preHandler: [authenticate],
      schema: {
        description: 'Initiate Shopify OAuth installation',
        tags: ['integrations'],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          required: ['shop'],
          properties: {
            shop: { type: 'string' },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
      }

      const { shop } = installSchema.parse(request.query);
      const merchantId = request.user.merchantId;
      if (!merchantId) {
        throw new AppError(403, 'FORBIDDEN', 'Merchant context required');
      }

      const redirectUri = process.env.FRONTEND_URL || 'http://localhost:3000';
      const installUrl = shopifyOAuthService.getInstallUrl(shop, redirectUri);

      return reply.send({
        success: true,
        data: {
          installUrl,
        },
      });
    }
  );
};

