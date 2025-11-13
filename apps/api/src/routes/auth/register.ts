import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { User } from '../../models/User';
import { Merchant } from '../../models/Merchant';
import { Plan } from '../../models/Plan';
import { hashPassword, validatePasswordStrength } from '../../utils/password';
import { generateAccessToken, generateRefreshToken } from '../../utils/jwt';
import { AppError } from '../../middlewares/error-handler';

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required'),
  merchantName: z.string().min(1, 'Merchant name is required'),
});

export const registerRoute = async (app: FastifyInstance) => {
  app.post(
    '/register',
    {
      schema: {
        description: 'User registration',
        tags: ['auth'],
        body: {
          type: 'object',
          required: ['email', 'password', 'name', 'merchantName'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 8 },
            name: { type: 'string' },
            merchantName: { type: 'string' },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { email, password, name, merchantName } = registerSchema.parse(request.body);

      // Validate password strength
      if (!validatePasswordStrength(password)) {
        throw new AppError(
          400,
          'WEAK_PASSWORD',
          'Password must be at least 8 characters with uppercase, lowercase, and number'
        );
      }

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new AppError(409, 'USER_EXISTS', 'User with this email already exists');
      }

      // Get default plan (Starter or first public plan)
      const defaultPlan = await Plan.findOne({ public: true }).sort({ sort: 1 });
      if (!defaultPlan) {
        throw new AppError(500, 'NO_PLAN', 'No default plan found');
      }

      // Create merchant
      const slug = merchantName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      // Check if slug exists
      const existingMerchant = await Merchant.findOne({ slug });
      if (existingMerchant) {
        throw new AppError(409, 'MERCHANT_EXISTS', 'Merchant with this name already exists');
      }

      const merchant = await Merchant.create({
        name: merchantName,
        slug,
        ownerUserId: null as any, // Will be updated after user creation
        domains: [],
        channels: {},
        plan: {
          planId: defaultPlan._id.toString(),
          name: defaultPlan.name,
          price: defaultPlan.price,
          currency: defaultPlan.currency,
          limits: defaultPlan.limits,
          status: 'trial',
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
        },
        settings: {
          confirmCODOnly: true,
          confirmPrepaid: false,
          confirmWindowHours: 24,
          autoCancelUnconfirmed: false,
          locale: 'en-IN',
        },
      });

      // Hash password
      const passwordHash = await hashPassword(password);

      // Create user
      const user = await User.create({
        merchantId: merchant._id,
        email,
        name,
        role: 'owner',
        passwordHash,
      });

      // Update merchant with owner
      merchant.ownerUserId = user._id;
      await merchant.save();

      // Generate tokens
      const payload = {
        userId: user._id.toString(),
        merchantId: merchant._id.toString(),
        role: user.role,
        email: user.email,
      };

      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);

      // Return user data
      const userData = {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        merchantId: merchant._id.toString(),
      };

      return reply.status(201).send({
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

