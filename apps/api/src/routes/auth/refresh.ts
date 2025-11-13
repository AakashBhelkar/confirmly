import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { verifyRefreshToken, generateAccessToken, JWTPayload } from '../../utils/jwt';
import { User } from '../../models/User';
import { AppError } from '../../middlewares/error-handler';

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const refreshRoute = async (app: FastifyInstance) => {
  app.post(
    '/refresh',
    {
      schema: {
        description: 'Refresh access token',
        tags: ['auth'],
        body: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: { type: 'string' },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { refreshToken } = refreshSchema.parse(request.body);

      // Verify refresh token
      let payload: JWTPayload;
      try {
        payload = verifyRefreshToken(refreshToken);
      } catch (error) {
        throw new AppError(401, 'INVALID_TOKEN', 'Invalid or expired refresh token');
      }

      // Verify user still exists
      const user = await User.findById(payload.userId);
      if (!user) {
        throw new AppError(401, 'USER_NOT_FOUND', 'User not found');
      }

      // Generate new access token
      const newPayload = {
        userId: user._id.toString(),
        merchantId: user.merchantId?.toString(),
        role: user.role,
        email: user.email,
      };

      const accessToken = generateAccessToken(newPayload);

      return reply.send({
        success: true,
        data: {
          accessToken,
        },
      });
    }
  );
};

