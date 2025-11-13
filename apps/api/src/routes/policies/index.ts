import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { authenticate } from '../../middlewares/auth';
import { policyService } from '../../services/policy.service';
import { AppError } from '../../middlewares/error-handler';

const policyRuleSchema = z.object({
  key: z.string().min(1),
  operator: z.enum(['equals', 'not_equals', 'greater_than', 'less_than', 'contains', 'in']),
  value: z.union([z.string(), z.number(), z.array(z.string())]),
  effect: z.enum(['confirm', 'skip', 'cancel']),
});

const savePolicySchema = z.object({
  rules: z.array(policyRuleSchema),
});

export const policyRoutes = async (app: FastifyInstance) => {
  // Get policy
  app.get(
    '/',
    {
      preHandler: [authenticate],
      schema: {
        description: 'Get merchant policy',
        tags: ['policies'],
        security: [{ bearerAuth: [] }],
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
      }

      const merchantId = request.user.merchantId!;
      const policy = await policyService.getPolicy(merchantId);

      return reply.send({
        success: true,
        data: policy || { rules: [] },
      });
    }
  );

  // Save policy
  app.post(
    '/',
    {
      preHandler: [authenticate],
      schema: {
        description: 'Save merchant policy',
        tags: ['policies'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['rules'],
          properties: {
            rules: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  key: { type: 'string' },
                  operator: {
                    type: 'string',
                    enum: ['equals', 'not_equals', 'greater_than', 'less_than', 'contains', 'in'],
                  },
                  value: { type: ['string', 'number', 'array'] },
                  effect: { type: 'string', enum: ['confirm', 'skip', 'cancel'] },
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

      const merchantId = request.user.merchantId!;
      const data = savePolicySchema.parse(request.body);
      const policy = await policyService.savePolicy(merchantId, data.rules);

      return reply.send({
        success: true,
        data: policy,
      });
    }
  );

  // Test policy
  app.post(
    '/test',
    {
      preHandler: [authenticate],
      schema: {
        description: 'Test policy with sample order data',
        tags: ['policies'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['orderData'],
          properties: {
            orderData: {
              type: 'object',
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
      }

      const merchantId = request.user.merchantId!;
      const { orderData } = request.body as { orderData: any };

      const result = await policyService.testPolicy(merchantId, orderData);

      return reply.send({
        success: true,
        data: result,
      });
    }
  );

  // Delete policy
  app.delete(
    '/',
    {
      preHandler: [authenticate],
      schema: {
        description: 'Delete merchant policy',
        tags: ['policies'],
        security: [{ bearerAuth: [] }],
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
      }

      const merchantId = request.user.merchantId!;
      await policyService.deletePolicy(merchantId);

      return reply.send({
        success: true,
        message: 'Policy deleted successfully',
      });
    }
  );
};

