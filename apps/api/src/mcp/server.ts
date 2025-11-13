import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authenticateMCP } from './middleware/auth';
import { readHandler } from './handlers/read';
import { writeHandler } from './handlers/write';
import { EventLog } from '../models/EventLog';

/**
 * MCP Server routes
 * Provides controlled, auditable database access
 */
export const mcpRoutes = async (app: FastifyInstance) => {
  // Audit log middleware
  const auditLog = async (request: FastifyRequest, reply: FastifyReply) => {
    const originalSend = reply.send.bind(reply);
    reply.send = function (payload: any) {
      // Log MCP access
      EventLog.create({
        type: 'mcp_access',
        payload: {
          method: request.method,
          url: request.url,
          query: request.query,
          body: request.method === 'POST' ? '[REDACTED]' : undefined,
        },
        actor: {
          id: request.user?.userId as any,
          role: request.user?.role || 'system',
        },
      }).catch((err) => {
        console.error('Failed to log MCP access:', err);
      });

      return originalSend(payload);
    };
  };

  // Read endpoint
  app.get(
    '/mcp/read',
    {
      preHandler: [authenticateMCP, auditLog],
      schema: {
        description: 'MCP read operation (read-only, PII masked)',
        tags: ['mcp'],
        security: [{ mcpApiKey: [] }],
        querystring: {
          type: 'object',
          properties: {
            collection: {
              type: 'string',
              enum: ['orders', 'merchants', 'users'],
            },
            id: { type: 'string' },
            merchantId: { type: 'string' },
            limit: { type: 'number', minimum: 1, maximum: 100 },
            skip: { type: 'number', minimum: 0 },
            fields: { type: 'string' },
          },
        },
      },
    },
    readHandler
  );

  // Write endpoint
  app.post(
    '/mcp/write',
    {
      preHandler: [authenticateMCP, auditLog],
      schema: {
        description: 'MCP write operation (whitelisted operations only)',
        tags: ['mcp'],
        security: [{ mcpApiKey: [] }],
        body: {
          type: 'object',
          required: ['collection', 'operation'],
          properties: {
            collection: {
              type: 'string',
              enum: ['orders', 'eventlog'],
            },
            operation: {
              type: 'string',
              enum: ['update', 'create'],
            },
            id: { type: 'string' },
            data: { type: 'object' },
          },
        },
      },
    },
    writeHandler
  );
};

