import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { Order } from '../../models/Order';
import { Merchant } from '../../models/Merchant';
import { User } from '../../models/User';
import { maskPII } from '../utils/mask-pii';
import { AppError } from '../../middlewares/error-handler';

const readQuerySchema = z.object({
  collection: z.enum(['orders', 'merchants', 'users']),
  id: z.string().optional(),
  merchantId: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(10).optional(),
  skip: z.coerce.number().int().min(0).default(0).optional(),
  fields: z.string().optional(), // Comma-separated field names
});

/**
 * Whitelisted read operations for MCP
 */
export const readHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const query = readQuerySchema.parse(request.query);

  let result: any;

  switch (query.collection) {
    case 'orders': {
      const filter: any = {};
      if (query.merchantId) {
        filter.merchantId = query.merchantId;
      }
      if (query.id) {
        filter._id = query.id;
      }

      const projection: any = {};
      if (query.fields) {
        const fields = query.fields.split(',');
        fields.forEach((field) => {
          projection[field.trim()] = 1;
        });
      } else {
        // Default projection - exclude PII
        projection.email = 0;
        projection.phone = 0;
        projection['customer.name'] = 0;
        projection['customer.address'] = 0;
      }

      const orders = await Order.find(filter, projection)
        .limit(query.limit || 10)
        .skip(query.skip || 0)
        .sort({ createdAt: -1 })
        .lean();

      result = orders.map((order) => maskPII(order, ['email', 'phone', 'customer.name', 'customer.address']));
      break;
    }

    case 'merchants': {
      const filter: any = {};
      if (query.id) {
        filter._id = query.id;
      }

      const merchants = await Merchant.find(filter)
        .limit(query.limit || 10)
        .skip(query.skip || 0)
        .select('-channels.whatsapp.token -channels.email.apiKey -channels.sms.msg91.authKey -channels.sms.twilio.token')
        .lean();

      result = merchants;
      break;
    }

    case 'users': {
      const filter: any = {};
      if (query.merchantId) {
        filter.merchantId = query.merchantId;
      }
      if (query.id) {
        filter._id = query.id;
      }

      const users = await User.find(filter)
        .limit(query.limit || 10)
        .skip(query.skip || 0)
        .select('-passwordHash -oauth')
        .lean();

      result = users.map((user) => maskPII(user, ['email', 'name']));
      break;
    }

    default:
      throw new AppError(400, 'INVALID_COLLECTION', `Invalid collection: ${query.collection}`);
  }

  return reply.send({
    success: true,
    data: result,
    meta: {
      collection: query.collection,
      count: Array.isArray(result) ? result.length : 1,
      limit: query.limit,
      skip: query.skip,
    },
  });
};

