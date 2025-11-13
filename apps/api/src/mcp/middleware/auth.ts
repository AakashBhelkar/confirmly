import { FastifyRequest, FastifyReply } from 'fastify';
import { AppError } from '../../middlewares/error-handler';

/**
 * MCP authentication middleware
 * Validates MCP API key from header
 */
export const authenticateMCP = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  const apiKey = request.headers['x-mcp-api-key'] || request.headers['authorization']?.replace('Bearer ', '');

  if (!apiKey) {
    throw new AppError(401, 'MCP_UNAUTHORIZED', 'MCP API key is required');
  }

  const validApiKey = process.env.MCP_API_KEY;
  if (!validApiKey || apiKey !== validApiKey) {
    throw new AppError(401, 'MCP_UNAUTHORIZED', 'Invalid MCP API key');
  }
};

