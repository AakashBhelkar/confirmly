import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { userService } from '../services/user.service';
import { paginationSchema } from '../utils/validation';
import { AppError } from '../middlewares/error-handler';

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(['owner', 'admin', 'member', 'support']),
  password: z.string().optional(),
});

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.enum(['owner', 'admin', 'member', 'support']).optional(),
  password: z.string().optional(),
});

export const userController = {
  async createUser(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
    }

    const merchantId = request.user.merchantId;
    if (!merchantId) {
      throw new AppError(403, 'FORBIDDEN', 'Merchant context required');
    }

    const data = createUserSchema.parse(request.body);
    const user = await userService.createUser({
      ...data,
      merchantId,
    });

    return reply.status(201).send({
      success: true,
      data: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  },

  async getUsers(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
    }

    const merchantId = request.user.merchantId;
    if (!merchantId) {
      throw new AppError(403, 'FORBIDDEN', 'Merchant context required');
    }

    const { page, limit } = paginationSchema.parse(request.query);
    const users = await userService.getUsersByMerchant(merchantId);

    return reply.send({
      success: true,
      data: users.map((user) => ({
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      })),
      meta: {
        page,
        limit,
        total: users.length,
      },
    });
  },

  async getUser(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
    }

    const { id } = request.params as { id: string };
    const merchantId = request.user.merchantId;

    const user = await userService.getUserById(id, merchantId);

    return reply.send({
      success: true,
      data: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  },

  async updateUser(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
    }

    const { id } = request.params as { id: string };
    const merchantId = request.user.merchantId;
    const data = updateUserSchema.parse(request.body);

    const user = await userService.updateUser(id, data, merchantId);

    return reply.send({
      success: true,
      data: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  },

  async deleteUser(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
    }

    const { id } = request.params as { id: string };
    const merchantId = request.user.merchantId;

    await userService.deleteUser(id, merchantId);

    return reply.send({
      success: true,
      message: 'User deleted successfully',
    });
  },
};

