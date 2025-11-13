import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authenticate } from '../../middlewares/auth';
import { analyticsService } from '../../services/analytics.service';
import { AppError } from '../../middlewares/error-handler';
import { z } from 'zod';

const analyticsFiltersSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  interval: z.enum(['day', 'week', 'month']).default('day').optional(),
});

export const analyticsRoutes = async (app: FastifyInstance) => {
  // Export analytics
  app.get(
    '/export',
    {
      preHandler: [authenticate],
      schema: {
        description: 'Export analytics data',
        tags: ['analytics'],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            startDate: { type: 'string', format: 'date' },
            endDate: { type: 'string', format: 'date' },
            format: { type: 'string', enum: ['csv', 'pdf'] },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
      }

      const merchantId = request.user.merchantId!;
      const { startDate, endDate, format = 'csv' } = request.query as { startDate?: string; endDate?: string; format?: string };

      const filters = analyticsFiltersSchema.parse({ startDate, endDate });

      if (format === 'csv') {
        const csv = await analyticsService.exportCSV({
          merchantId,
          ...filters,
        });

        reply.header('Content-Type', 'text/csv');
        reply.header('Content-Disposition', 'attachment; filename=analytics.csv');
        return reply.send(csv);
      } else {
        // PDF export would require a PDF library
        throw new AppError(400, 'UNSUPPORTED_FORMAT', 'PDF export not yet implemented');
      }
    }
  );

  // Get metrics
  app.get(
    '/metrics',
    {
      preHandler: [authenticate],
      schema: {
        description: 'Get analytics metrics',
        tags: ['analytics'],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            startDate: { type: 'string', format: 'date' },
            endDate: { type: 'string', format: 'date' },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
      }

      const merchantId = request.user.merchantId!;
      const filters = analyticsFiltersSchema.parse(request.query);

      const metrics = await analyticsService.getMetrics({
        merchantId,
        ...filters,
      });

      return reply.send({
        success: true,
        data: metrics,
      });
    }
  );

  // Get time series
  app.get(
    '/timeseries',
    {
      preHandler: [authenticate],
      schema: {
        description: 'Get time series analytics',
        tags: ['analytics'],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            startDate: { type: 'string', format: 'date' },
            endDate: { type: 'string', format: 'date' },
            interval: { type: 'string', enum: ['day', 'week', 'month'] },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
      }

      const merchantId = request.user.merchantId!;
      const filters = analyticsFiltersSchema.parse(request.query);

      const timeSeries = await analyticsService.getTimeSeries(
        {
          merchantId,
          ...filters,
        },
        filters.interval || 'day'
      );

      return reply.send({
        success: true,
        data: timeSeries,
      });
    }
  );

  // Get channel performance
  app.get(
    '/channels',
    {
      preHandler: [authenticate],
      schema: {
        description: 'Get channel performance analytics',
        tags: ['analytics'],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            startDate: { type: 'string', format: 'date' },
            endDate: { type: 'string', format: 'date' },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
      }

      const merchantId = request.user.merchantId!;
      const filters = analyticsFiltersSchema.parse(request.query);

      const channels = await analyticsService.getChannelPerformance({
        merchantId,
        ...filters,
      });

      return reply.send({
        success: true,
        data: channels,
      });
    }
  );

  // Get risk distribution
  app.get(
    '/risk',
    {
      preHandler: [authenticate],
      schema: {
        description: 'Get risk distribution analytics',
        tags: ['analytics'],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            startDate: { type: 'string', format: 'date' },
            endDate: { type: 'string', format: 'date' },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
      }

      const merchantId = request.user.merchantId!;
      const filters = analyticsFiltersSchema.parse(request.query);

      const risk = await analyticsService.getRiskDistribution({
        merchantId,
        ...filters,
      });

      return reply.send({
        success: true,
        data: risk,
      });
    }
  );
};

