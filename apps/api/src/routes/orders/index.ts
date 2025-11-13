import { FastifyInstance } from 'fastify';
import { authenticate } from '../../middlewares/auth';
import { orderController } from '../../controllers/order.controller';

export const orderRoutes = async (app: FastifyInstance) => {
  // Get all orders
  app.get(
    '/',
    {
      preHandler: [authenticate],
      schema: {
        description: 'Get all orders',
        tags: ['orders'],
        security: [{ bearerAuth: [] }],
      },
    },
    orderController.getOrders
  );

  // Get order by ID
  app.get(
    '/:id',
    {
      preHandler: [authenticate],
      schema: {
        description: 'Get order by ID',
        tags: ['orders'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
        },
      },
    },
    orderController.getOrder
  );

  // Confirm order
  app.post(
    '/:id/confirm',
    {
      preHandler: [authenticate],
      schema: {
        description: 'Confirm order',
        tags: ['orders'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
        },
      },
    },
    orderController.confirmOrder
  );

  // Cancel order
  app.post(
    '/:id/cancel',
    {
      preHandler: [authenticate],
      schema: {
        description: 'Cancel order',
        tags: ['orders'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
        },
      },
    },
    orderController.cancelOrder
  );

  // Hold order
  app.post(
    '/:id/hold',
    {
      preHandler: [authenticate],
      schema: {
        description: 'Hold order',
        tags: ['orders'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
        },
      },
    },
    orderController.holdOrder
  );

  // Export orders
  app.get(
    '/export',
    {
      preHandler: [authenticate],
      schema: {
        description: 'Export orders as CSV',
        tags: ['orders'],
        security: [{ bearerAuth: [] }],
      },
    },
    orderController.exportOrders
  );

  // Bulk confirm orders
  app.post(
    '/bulk-confirm',
    {
      preHandler: [authenticate],
      schema: {
        description: 'Bulk confirm orders',
        tags: ['orders'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['orderIds'],
          properties: {
            orderIds: {
              type: 'array',
              items: { type: 'string' },
            },
          },
        },
      },
    },
    orderController.bulkConfirm
  );
};

