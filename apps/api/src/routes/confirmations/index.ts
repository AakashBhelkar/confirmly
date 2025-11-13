import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { authenticate } from '../../middlewares/auth';
import { confirmationService } from '../../services/confirmation.service';
import { AppError } from '../../middlewares/error-handler';
import { ProviderType } from '../../services/providers/factory';

const sendConfirmationSchema = z.object({
  orderId: z.string().min(1),
  channels: z.array(z.enum(['whatsapp', 'sms', 'email'])),
  templateId: z.string().optional(),
  variables: z.record(z.string()).optional(),
});

export const confirmationRoutes = async (app: FastifyInstance) => {
  // Send confirmation
  app.post(
    '/send',
    {
      preHandler: [authenticate],
      schema: {
        description: 'Send confirmation messages via multiple channels',
        tags: ['confirmations'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['orderId', 'channels'],
          properties: {
            orderId: { type: 'string' },
            channels: {
              type: 'array',
              items: { type: 'string', enum: ['whatsapp', 'sms', 'email'] },
            },
            templateId: { type: 'string' },
            variables: { type: 'object' },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
      }

      const merchantId = request.user.merchantId;
      if (!merchantId) {
        throw new AppError(403, 'FORBIDDEN', 'Merchant context required');
      }

      const data = sendConfirmationSchema.parse(request.body);
      const result = await confirmationService.sendConfirmation({
        orderId: data.orderId,
        merchantId,
        channels: data.channels as ProviderType[],
        templateId: data.templateId,
        variables: data.variables,
      });

      return reply.send({
        success: true,
        data: result,
      });
    }
  );

  // Retry confirmation
  app.post(
    '/retry',
    {
      preHandler: [authenticate],
      schema: {
        description: 'Retry failed confirmation',
        tags: ['confirmations'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['orderId', 'channel'],
          properties: {
            orderId: { type: 'string' },
            channel: { type: 'string', enum: ['whatsapp', 'sms', 'email'] },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
      }

      const merchantId = request.user.merchantId!;
      const { orderId, channel } = request.body as { orderId: string; channel: ProviderType };

      const result = await confirmationService.retryConfirmation(orderId, merchantId, channel);

      return reply.send({
        success: true,
        data: result,
      });
    }
  );
};

