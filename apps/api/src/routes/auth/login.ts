import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { User } from '../../models/User';
import { comparePassword } from '../../utils/password';
import { generateAccessToken, generateRefreshToken } from '../../utils/jwt';
import { AppError } from '../../middlewares/error-handler';

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const loginRoute = async (app: FastifyInstance) => {
  app.post(
    '/login',
    {
      schema: {
        description: 'User login',
        tags: ['auth'],
        body: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  accessToken: { type: 'string' },
                  refreshToken: { type: 'string' },
                  user: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      email: { type: 'string' },
                      name: { type: 'string' },
                      role: { type: 'string' },
                      merchantId: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { email, password } = loginSchema.parse(request.body);

      // Find user
      const user = await User.findOne({ email }).select('+passwordHash');
      if (!user || !user.passwordHash) {
        throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
      }

      // Verify password
      const isPasswordValid = await comparePassword(password, user.passwordHash);
      if (!isPasswordValid) {
        throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
      }

      // Generate tokens
      const payload = {
        userId: user._id.toString(),
        merchantId: user.merchantId?.toString(),
        role: user.role,
        email: user.email,
      };

      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);

      // Return user data (without password)
      const userData = {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        merchantId: user.merchantId?.toString(),
      };

      return reply.send({
        success: true,
        data: {
          accessToken,
          refreshToken,
          user: userData,
        },
      });
    }
  );
};

