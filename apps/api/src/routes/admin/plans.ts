import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authenticate } from '../../middlewares/auth';
import { requireRole } from '../../middlewares/rbac';
import { Plan } from '../../models/Plan';
import { AppError } from '../../middlewares/error-handler';
import { z } from 'zod';

const createPlanSchema = z.object({
  name: z.string().min(1),
  price: z.number().min(0),
  currency: z.string().default('INR'),
  limits: z.object({
    ordersPerMonth: z.number().min(0),
    messagesPerMonth: z.number().min(0),
  }),
  features: z.array(z.string()).default([]),
  public: z.boolean().default(true),
  sort: z.number().default(0),
});

const updatePlanSchema = z.object({
  name: z.string().min(1).optional(),
  price: z.number().min(0).optional(),
  currency: z.string().optional(),
  limits: z.object({
    ordersPerMonth: z.number().min(0),
    messagesPerMonth: z.number().min(0),
  }).optional(),
  features: z.array(z.string()).optional(),
  public: z.boolean().optional(),
  sort: z.number().optional(),
});

export const adminPlanRoutes = async (app: FastifyInstance) => {
  // Get all plans
  app.get(
    '/',
    {
      preHandler: [authenticate, requireRole('superadmin')],
      schema: {
        description: 'Get all plans (Super Admin only)',
        tags: ['admin'],
        security: [{ bearerAuth: [] }],
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const plans = await Plan.find().sort({ sort: 1 });

      return reply.send({
        success: true,
        data: plans.map((p) => ({
          id: p._id.toString(),
          name: p.name,
          price: p.price,
          currency: p.currency,
          limits: p.limits,
          features: p.features,
          public: p.public,
          sort: p.sort,
          createdAt: p.createdAt,
        })),
      });
    }
  );

  // Create plan
  app.post(
    '/',
    {
      preHandler: [authenticate, requireRole('superadmin')],
      schema: {
        description: 'Create plan (Super Admin only)',
        tags: ['admin'],
        security: [{ bearerAuth: [] }],
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const data = createPlanSchema.parse(request.body);
      const plan = await Plan.create(data);

      return reply.status(201).send({
        success: true,
        data: {
          id: plan._id.toString(),
          name: plan.name,
          price: plan.price,
          currency: plan.currency,
          limits: plan.limits,
          features: plan.features,
          public: plan.public,
          sort: plan.sort,
        },
      });
    }
  );

  // Update plan
  app.put(
    '/:id',
    {
      preHandler: [authenticate, requireRole('superadmin')],
      schema: {
        description: 'Update plan (Super Admin only)',
        tags: ['admin'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };
      const data = updatePlanSchema.parse(request.body);

      const plan = await Plan.findById(id);
      if (!plan) {
        throw new AppError(404, 'PLAN_NOT_FOUND', 'Plan not found');
      }

      Object.assign(plan, data);
      await plan.save();

      return reply.send({
        success: true,
        data: {
          id: plan._id.toString(),
          name: plan.name,
          price: plan.price,
          currency: plan.currency,
          limits: plan.limits,
          features: plan.features,
          public: plan.public,
          sort: plan.sort,
        },
      });
    }
  );

  // Delete plan
  app.delete(
    '/:id',
    {
      preHandler: [authenticate, requireRole('superadmin')],
      schema: {
        description: 'Delete plan (Super Admin only)',
        tags: ['admin'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };

      const plan = await Plan.findById(id);
      if (!plan) {
        throw new AppError(404, 'PLAN_NOT_FOUND', 'Plan not found');
      }

      await Plan.deleteOne({ _id: id });

      return reply.send({
        success: true,
        message: 'Plan deleted successfully',
      });
    }
  );
};

