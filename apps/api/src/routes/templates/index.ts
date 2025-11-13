import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { authenticate } from '../../middlewares/auth';
import { Template } from '../../models/Template';
import { AppError } from '../../middlewares/error-handler';

const createTemplateSchema = z.object({
  channel: z.enum(['whatsapp', 'sms', 'email']),
  name: z.string().min(1),
  variant: z.enum(['A', 'B']).default('A'),
  content: z.string().min(1),
  variables: z.array(z.string()).default([]),
  status: z.enum(['draft', 'active']).default('draft'),
});

const updateTemplateSchema = z.object({
  name: z.string().min(1).optional(),
  variant: z.enum(['A', 'B']).optional(),
  content: z.string().min(1).optional(),
  variables: z.array(z.string()).optional(),
  status: z.enum(['draft', 'active']).optional(),
});

export const templateRoutes = async (app: FastifyInstance) => {
  // Get all templates
  app.get(
    '/',
    {
      preHandler: [authenticate],
      schema: {
        description: 'Get all templates',
        tags: ['templates'],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            channel: { type: 'string', enum: ['whatsapp', 'sms', 'email'] },
            status: { type: 'string', enum: ['draft', 'active'] },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
      }

      const merchantId = request.user.merchantId!;
      const { channel, status } = request.query as { channel?: string; status?: string };

      const query: any = { merchantId };
      if (channel) query.channel = channel;
      if (status) query.status = status;

      const templates = await Template.find(query).sort({ createdAt: -1 });

      return reply.send({
        success: true,
        data: templates.map((t) => ({
          id: t._id.toString(),
          channel: t.channel,
          name: t.name,
          variant: t.variant,
          content: t.content,
          variables: t.variables,
          status: t.status,
          createdAt: t.createdAt,
        })),
      });
    }
  );

  // Create template
  app.post(
    '/',
    {
      preHandler: [authenticate],
      schema: {
        description: 'Create template',
        tags: ['templates'],
        security: [{ bearerAuth: [] }],
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
      }

      const merchantId = request.user.merchantId!;
      const data = createTemplateSchema.parse(request.body);

      const template = await Template.create({
        merchantId,
        ...data,
      });

      return reply.status(201).send({
        success: true,
        data: {
          id: template._id.toString(),
          channel: template.channel,
          name: template.name,
          variant: template.variant,
          content: template.content,
          variables: template.variables,
          status: template.status,
        },
      });
    }
  );

  // Get template by ID
  app.get(
    '/:id',
    {
      preHandler: [authenticate],
      schema: {
        description: 'Get template by ID',
        tags: ['templates'],
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
      if (!request.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
      }

      const { id } = request.params as { id: string };
      const merchantId = request.user.merchantId!;

      const template = await Template.findOne({ _id: id, merchantId });
      if (!template) {
        throw new AppError(404, 'TEMPLATE_NOT_FOUND', 'Template not found');
      }

      return reply.send({
        success: true,
        data: {
          id: template._id.toString(),
          channel: template.channel,
          name: template.name,
          variant: template.variant,
          content: template.content,
          variables: template.variables,
          status: template.status,
          createdAt: template.createdAt,
        },
      });
    }
  );

  // Update template
  app.put(
    '/:id',
    {
      preHandler: [authenticate],
      schema: {
        description: 'Update template',
        tags: ['templates'],
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
      if (!request.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
      }

      const { id } = request.params as { id: string };
      const merchantId = request.user.merchantId!;
      const data = updateTemplateSchema.parse(request.body);

      const template = await Template.findOne({ _id: id, merchantId });
      if (!template) {
        throw new AppError(404, 'TEMPLATE_NOT_FOUND', 'Template not found');
      }

      if (data.name) template.name = data.name;
      if (data.variant) template.variant = data.variant;
      if (data.content) template.content = data.content;
      if (data.variables) template.variables = data.variables;
      if (data.status) template.status = data.status;

      await template.save();

      return reply.send({
        success: true,
        data: {
          id: template._id.toString(),
          channel: template.channel,
          name: template.name,
          variant: template.variant,
          content: template.content,
          variables: template.variables,
          status: template.status,
        },
      });
    }
  );

  // Delete template
  app.delete(
    '/:id',
    {
      preHandler: [authenticate],
      schema: {
        description: 'Delete template',
        tags: ['templates'],
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
      if (!request.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
      }

      const { id } = request.params as { id: string };
      const merchantId = request.user.merchantId!;

      const template = await Template.findOne({ _id: id, merchantId });
      if (!template) {
        throw new AppError(404, 'TEMPLATE_NOT_FOUND', 'Template not found');
      }

      await Template.deleteOne({ _id: id });

      return reply.send({
        success: true,
        message: 'Template deleted successfully',
      });
    }
  );
};

