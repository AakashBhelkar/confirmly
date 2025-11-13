import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { shopifyOAuthService } from '../../../services/shopify-oauth.service';
import { AppError } from '../../../middlewares/error-handler';

const callbackSchema = z.object({
  shop: z.string(),
  code: z.string(),
  state: z.string().optional(),
  merchantId: z.string(),
});

export const callbackRoute = async (app: FastifyInstance) => {
  app.get(
    '/callback',
    {
      schema: {
        description: 'Shopify OAuth callback',
        tags: ['integrations'],
        querystring: {
          type: 'object',
          required: ['shop', 'code', 'merchantId'],
          properties: {
            shop: { type: 'string' },
            code: { type: 'string' },
            state: { type: 'string' },
            merchantId: { type: 'string' },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { shop, code, merchantId } = callbackSchema.parse(request.query);

      try {
        const result = await shopifyOAuthService.handleCallback(shop, code, merchantId);

        // Redirect to frontend success page
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        return reply.redirect(`${frontendUrl}/dashboard/integrations?shopify=connected`);
      } catch (error: any) {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        return reply.redirect(`${frontendUrl}/dashboard/integrations?error=${encodeURIComponent(error.message)}`);
      }
    }
  );
};

