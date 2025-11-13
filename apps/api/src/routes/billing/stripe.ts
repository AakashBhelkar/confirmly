import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authenticate } from '../../middlewares/auth';
import { stripeService } from '../../services/stripe.service';
import { AppError } from '../../middlewares/error-handler';
import { z } from 'zod';

const createCheckoutSchema = z.object({
  planId: z.string().min(1),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

export const stripeRoutes = async (app: FastifyInstance) => {
  // Create checkout session
  app.post(
    '/checkout',
    {
      preHandler: [authenticate],
      schema: {
        description: 'Create Stripe checkout session',
        tags: ['billing'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['planId', 'successUrl', 'cancelUrl'],
          properties: {
            planId: { type: 'string' },
            successUrl: { type: 'string', format: 'uri' },
            cancelUrl: { type: 'string', format: 'uri' },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
      }

      const merchantId = request.user.merchantId!;
      const data = createCheckoutSchema.parse(request.body);

      const session = await stripeService.createCheckoutSession(
        merchantId,
        data.planId,
        data.successUrl,
        data.cancelUrl
      );

      return reply.send({
        success: true,
        data: {
          sessionId: session.id,
          url: session.url,
        },
      });
    }
  );

  // Create portal session
  app.post(
    '/portal',
    {
      preHandler: [authenticate],
      schema: {
        description: 'Create Stripe customer portal session',
        tags: ['billing'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['returnUrl'],
          properties: {
            returnUrl: { type: 'string', format: 'uri' },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
      }

      const merchantId = request.user.merchantId!;
      const { returnUrl } = request.body as { returnUrl: string };

      const session = await stripeService.createPortalSession(merchantId, returnUrl);

      return reply.send({
        success: true,
        data: {
          url: session.url,
        },
      });
    }
  );

  // Webhook handler
  app.post(
    '/webhook',
    {
      schema: {
        description: 'Stripe webhook handler',
        tags: ['billing'],
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const signature = request.headers['stripe-signature'] as string;
      if (!signature) {
        return reply.status(400).send({ error: 'Missing signature' });
      }

      try {
        const payload = JSON.stringify(request.body);
        const event = stripeService.verifyWebhookSignature(payload, signature);
        await stripeService.handleWebhook(event);

        return reply.send({ received: true });
      } catch (error: any) {
        console.error('Stripe webhook error:', error);
        return reply.status(400).send({ error: error.message });
      }
    }
  );
};

