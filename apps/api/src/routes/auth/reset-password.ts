import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { User } from '../../models/User';
import { hashPassword, validatePasswordStrength } from '../../utils/password';
import { AppError } from '../../middlewares/error-handler';
import crypto from 'crypto';

// In-memory store for reset tokens (in production, use Redis)
const resetTokens = new Map<string, { userId: string; expiresAt: Date }>();

const requestResetSchema = z.object({
  email: z.string().email('Invalid email format'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const resetPasswordRoute = async (app: FastifyInstance) => {
  // Request password reset
  app.post(
    '/reset-password/request',
    {
      schema: {
        description: 'Request password reset',
        tags: ['auth'],
        body: {
          type: 'object',
          required: ['email'],
          properties: {
            email: { type: 'string', format: 'email' },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { email } = requestResetSchema.parse(request.body);

      const user = await User.findOne({ email });
      if (!user) {
        // Don't reveal if user exists
        return reply.send({
          success: true,
          message: 'If the email exists, a password reset link has been sent',
        });
      }

      // Generate reset token
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      resetTokens.set(token, {
        userId: user._id.toString(),
        expiresAt,
      });

      // Send email with reset link
      const { emailService } = await import('../../services/email.service');
      try {
        await emailService.sendPasswordResetEmail(user.email, token);
      } catch (error) {
        console.error('Failed to send password reset email:', error);
        // Continue even if email fails (for security, don't reveal if email was sent)
      }

      return reply.send({
        success: true,
        message: 'If the email exists, a password reset link has been sent',
        // In development, return token for testing
        ...(process.env.NODE_ENV === 'development' && { token }),
      });
    }
  );

  // Reset password
  app.post(
    '/reset-password',
    {
      schema: {
        description: 'Reset password with token',
        tags: ['auth'],
        body: {
          type: 'object',
          required: ['token', 'password'],
          properties: {
            token: { type: 'string' },
            password: { type: 'string', minLength: 8 },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { token, password } = resetPasswordSchema.parse(request.body);

      // Validate password strength
      if (!validatePasswordStrength(password)) {
        throw new AppError(
          400,
          'WEAK_PASSWORD',
          'Password must be at least 8 characters with uppercase, lowercase, and number'
        );
      }

      // Verify token
      const tokenData = resetTokens.get(token);
      if (!tokenData) {
        throw new AppError(400, 'INVALID_TOKEN', 'Invalid or expired reset token');
      }

      if (new Date() > tokenData.expiresAt) {
        resetTokens.delete(token);
        throw new AppError(400, 'EXPIRED_TOKEN', 'Reset token has expired');
      }

      // Find user
      const user = await User.findById(tokenData.userId);
      if (!user) {
        resetTokens.delete(token);
        throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
      }

      // Update password
      user.passwordHash = await hashPassword(password);
      await user.save();

      // Remove token
      resetTokens.delete(token);

      return reply.send({
        success: true,
        message: 'Password reset successfully',
      });
    }
  );
};

