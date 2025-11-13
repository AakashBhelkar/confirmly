import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { User } from '../../models/User';
import { generateAccessToken } from '../../utils/jwt';
import { requireRole } from '../../middlewares/rbac';
import { authenticate } from '../../middlewares/auth';
import { AppError } from '../../middlewares/error-handler';

const impersonateSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
});

export const impersonateRoute = async (app: FastifyInstance) => {
  app.post(
    '/impersonate',
    {
      preHandler: [authenticate, requireRole('superadmin')],
      schema: {
        description: 'Impersonate a user (Super Admin only)',
        tags: ['auth'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['userId'],
          properties: {
            userId: { type: 'string' },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { userId } = impersonateSchema.parse(request.body);

      const user = await User.findById(userId);
      if (!user) {
        throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
      }

      // Generate token for impersonated user
      const payload = {
        userId: user._id.toString(),
        merchantId: user.merchantId?.toString(),
        role: user.role,
        email: user.email,
      };

      const accessToken = generateAccessToken(payload);

      return reply.send({
        success: true,
        data: {
          accessToken,
          user: {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            merchantId: user.merchantId?.toString(),
          },
        },
      });
    }
  );
};

