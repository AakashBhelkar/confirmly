import { FastifyRequest, FastifyReply } from 'fastify';
import { AppError } from './error-handler';

export type UserRole = 'owner' | 'admin' | 'member' | 'support' | 'superadmin';

export const requireRole = (...allowedRoles: UserRole[]) => {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    if (!request.user) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
    }

    if (!allowedRoles.includes(request.user.role as UserRole)) {
      throw new AppError(403, 'FORBIDDEN', 'Insufficient permissions');
    }
  };
};

export const requireMerchant = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  if (!request.user) {
    throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
  }

  if (request.user.role === 'superadmin') {
    return; // Superadmin can access any merchant
  }

  if (!request.user.merchantId) {
    throw new AppError(403, 'FORBIDDEN', 'Merchant context required');
  }
};

