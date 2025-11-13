import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { orderService } from '../services/order.service';
import { paginationSchema } from '../utils/validation';
import { AppError } from '../middlewares/error-handler';

const orderFiltersSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'unconfirmed', 'canceled', 'fulfilled']).optional(),
  paymentMode: z.enum(['cod', 'prepaid']).optional(),
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(10).optional(),
});

export const orderController = {
  async getOrders(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
    }

    const merchantId = request.user.merchantId;
    if (!merchantId) {
      throw new AppError(403, 'FORBIDDEN', 'Merchant context required');
    }

    const filters = orderFiltersSchema.parse(request.query);
    const result = await orderService.getOrders(merchantId, filters);

    return reply.send({
      success: true,
      data: result.orders.map((order) => ({
        id: order._id.toString(),
        platformOrderId: order.platformOrderId,
        email: order.email,
        phone: order.phone,
        amount: order.amount,
        currency: order.currency,
        paymentMode: order.paymentMode,
        status: order.status,
        riskScore: order.riskScore,
        createdAt: order.createdAt,
      })),
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
      },
    });
  },

  async getOrder(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
    }

    const { id } = request.params as { id: string };
    const merchantId = request.user.merchantId;

    const order = await orderService.getOrderById(id, merchantId);

    return reply.send({
      success: true,
      data: {
        id: order._id.toString(),
        platformOrderId: order.platformOrderId,
        platform: order.platform,
        email: order.email,
        phone: order.phone,
        customer: order.customer,
        amount: order.amount,
        currency: order.currency,
        paymentMode: order.paymentMode,
        status: order.status,
        riskScore: order.riskScore,
        confirmations: order.confirmations,
        autoActions: order.autoActions,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      },
    });
  },

  async confirmOrder(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
    }

    const { id } = request.params as { id: string };
    const merchantId = request.user.merchantId!;

    const order = await orderService.confirmOrder(id, merchantId);

    return reply.send({
      success: true,
      data: {
        id: order._id.toString(),
        status: order.status,
      },
    });
  },

  async cancelOrder(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
    }

    const { id } = request.params as { id: string };
    const merchantId = request.user.merchantId!;

    const order = await orderService.cancelOrder(id, merchantId);

    return reply.send({
      success: true,
      data: {
        id: order._id.toString(),
        status: order.status,
      },
    });
  },

  async holdOrder(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
    }

    const { id } = request.params as { id: string };
    const merchantId = request.user.merchantId!;

    const order = await orderService.holdOrder(id, merchantId);

    return reply.send({
      success: true,
      data: {
        id: order._id.toString(),
        status: order.status,
      },
    });
  },

  async exportOrders(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
    }

    const merchantId = request.user.merchantId!;
    const filters = orderFiltersSchema.parse(request.query);
    const csv = await orderService.exportOrders(merchantId, filters);

    reply.header('Content-Type', 'text/csv');
    reply.header('Content-Disposition', 'attachment; filename=orders.csv');
    return reply.send(csv);
  },

  async bulkConfirm(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
    }

    const { orderIds } = request.body as { orderIds: string[] };
    const merchantId = request.user.merchantId!;

    const result = await orderService.bulkConfirm(orderIds, merchantId);

    return reply.send({
      success: true,
      data: {
        confirmed: result.confirmed,
        failed: result.failed,
      },
    });
  },
};

