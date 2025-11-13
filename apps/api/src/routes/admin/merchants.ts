import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authenticate } from '../../middlewares/auth';
import { requireRole } from '../../middlewares/rbac';
import { Merchant } from '../../models/Merchant';
import { User } from '../../models/User';
import { AppError } from '../../middlewares/error-handler';
import { z } from 'zod';

export const adminMerchantRoutes = async (app: FastifyInstance) => {
  // Get all merchants (superadmin only)
  app.get(
    '/',
    {
      preHandler: [authenticate, requireRole('superadmin')],
      schema: {
        description: 'Get all merchants (Super Admin only)',
        tags: ['admin'],
        security: [{ bearerAuth: [] }],
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const merchants = await Merchant.find().populate('ownerUserId', 'email name');

      return reply.send({
        success: true,
        data: merchants.map((m) => ({
          id: m._id.toString(),
          name: m.name,
          slug: m.slug,
          owner: m.ownerUserId ? {
            id: (m.ownerUserId as any)._id.toString(),
            email: (m.ownerUserId as any).email,
            name: (m.ownerUserId as any).name,
          } : null,
          plan: m.plan,
          settings: m.settings,
          createdAt: m.createdAt,
        })),
      });
    }
  );

  // Get merchant by ID
  app.get(
    '/:id',
    {
      preHandler: [authenticate, requireRole('superadmin')],
      schema: {
        description: 'Get merchant by ID (Super Admin only)',
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
      const merchant = await Merchant.findById(id).populate('ownerUserId', 'email name');

      if (!merchant) {
        throw new AppError(404, 'MERCHANT_NOT_FOUND', 'Merchant not found');
      }

      return reply.send({
        success: true,
        data: {
          id: merchant._id.toString(),
          name: merchant.name,
          slug: merchant.slug,
          owner: merchant.ownerUserId ? {
            id: (merchant.ownerUserId as any)._id.toString(),
            email: (merchant.ownerUserId as any).email,
            name: (merchant.ownerUserId as any).name,
          } : null,
          plan: merchant.plan,
          settings: merchant.settings,
          channels: merchant.channels,
          createdAt: merchant.createdAt,
        },
      });
    }
  );
};

