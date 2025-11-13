import { FastifyInstance } from 'fastify';
import { authenticate } from '../../middlewares/auth';
import { merchantController } from '../../controllers/merchant.controller';

export const merchantRoutes = async (app: FastifyInstance) => {
  // Get current merchant
  app.get(
    '/',
    {
      preHandler: [authenticate],
      schema: {
        description: 'Get current merchant',
        tags: ['merchants'],
        security: [{ bearerAuth: [] }],
      },
    },
    merchantController.getMerchant
  );

  // Update merchant
  app.put(
    '/',
    {
      preHandler: [authenticate],
      schema: {
        description: 'Update merchant',
        tags: ['merchants'],
        security: [{ bearerAuth: [] }],
      },
    },
    merchantController.updateMerchant
  );

  // Update merchant channels
  app.put(
    '/channels',
    {
      preHandler: [authenticate],
      schema: {
        description: 'Update merchant channels (WhatsApp, Email, SMS)',
        tags: ['merchants'],
        security: [{ bearerAuth: [] }],
      },
    },
    merchantController.updateChannels
  );

  // Get merchant team
  app.get(
    '/team',
    {
      preHandler: [authenticate],
      schema: {
        description: 'Get merchant team members',
        tags: ['merchants'],
        security: [{ bearerAuth: [] }],
      },
    },
    merchantController.getTeam
  );

  // Invite team member
  app.post(
    '/team/invite',
    {
      preHandler: [authenticate],
      schema: {
        description: 'Invite a team member',
        tags: ['merchants'],
        security: [{ bearerAuth: [] }],
      },
    },
    merchantController.inviteMember
  );
};

