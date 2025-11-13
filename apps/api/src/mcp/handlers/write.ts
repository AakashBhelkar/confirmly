import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { Order } from '../../models/Order';
import { EventLog } from '../../models/EventLog';
import { AppError } from '../../middlewares/error-handler';

const writeSchema = z.object({
  collection: z.enum(['orders', 'eventlog']),
  operation: z.enum(['update', 'create']),
  id: z.string().optional(),
  data: z.record(z.any()),
});

/**
 * Whitelisted write operations for MCP
 * Only allows safe operations like order status updates
 */
export const writeHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const body = writeSchema.parse(request.body);

  let result: any;

  switch (body.collection) {
    case 'orders': {
      if (body.operation === 'update' && body.id) {
        // Only allow status updates
        const allowedFields = ['status', 'riskScore', 'confirmations', 'autoActions'];
        const updateData: any = {};

        for (const field of allowedFields) {
          if (field in body.data) {
            updateData[field] = body.data[field];
          }
        }

        if (Object.keys(updateData).length === 0) {
          throw new AppError(400, 'INVALID_UPDATE', 'No allowed fields to update');
        }

        const order = await Order.findByIdAndUpdate(body.id, updateData, { new: true });
        if (!order) {
          throw new AppError(404, 'ORDER_NOT_FOUND', 'Order not found');
        }

        result = {
          id: order._id.toString(),
          status: order.status,
          riskScore: order.riskScore,
        };
      } else {
        throw new AppError(400, 'INVALID_OPERATION', 'Only update operation is allowed for orders');
      }
      break;
    }

    case 'eventlog': {
      if (body.operation === 'create') {
        const eventLog = await EventLog.create({
          merchantId: body.data.merchantId,
          type: body.data.type,
          payload: body.data.payload,
          actor: body.data.actor,
        });

        result = {
          id: eventLog._id.toString(),
          type: eventLog.type,
          createdAt: eventLog.createdAt,
        };
      } else {
        throw new AppError(400, 'INVALID_OPERATION', 'Only create operation is allowed for eventlog');
      }
      break;
    }

    default:
      throw new AppError(400, 'INVALID_COLLECTION', `Invalid collection: ${body.collection}`);
  }

  return reply.send({
    success: true,
    data: result,
  });
};

