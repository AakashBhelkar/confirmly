import { FastifyInstance } from 'fastify';
import { authenticate } from '../../middlewares/auth';
import { requireRole } from '../../middlewares/rbac';
import { userController } from '../../controllers/user.controller';

export const userRoutes = async (app: FastifyInstance) => {
  // Get all users (requires admin or owner)
  app.get(
    '/',
    {
      preHandler: [authenticate, requireRole('owner', 'admin')],
      schema: {
        description: 'Get all users in merchant',
        tags: ['users'],
        security: [{ bearerAuth: [] }],
      },
    },
    userController.getUsers
  );

  // Create user (requires admin or owner)
  app.post(
    '/',
    {
      preHandler: [authenticate, requireRole('owner', 'admin')],
      schema: {
        description: 'Create a new user',
        tags: ['users'],
        security: [{ bearerAuth: [] }],
      },
    },
    userController.createUser
  );

  // Get user by ID
  app.get(
    '/:id',
    {
      preHandler: [authenticate],
      schema: {
        description: 'Get user by ID',
        tags: ['users'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
        },
      },
    },
    userController.getUser
  );

  // Update user (requires admin or owner, or self)
  app.put(
    '/:id',
    {
      preHandler: [authenticate],
      schema: {
        description: 'Update user',
        tags: ['users'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
        },
      },
    },
    userController.updateUser
  );

  // Delete user (requires admin or owner)
  app.delete(
    '/:id',
    {
      preHandler: [authenticate, requireRole('owner', 'admin')],
      schema: {
        description: 'Delete user',
        tags: ['users'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
        },
      },
    },
    userController.deleteUser
  );
};

