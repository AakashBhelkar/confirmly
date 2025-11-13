import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { merchantService } from '../services/merchant.service';
import { AppError } from '../middlewares/error-handler';

const updateMerchantSchema = z.object({
  name: z.string().min(1).optional(),
  settings: z
    .object({
      confirmCODOnly: z.boolean().optional(),
      confirmPrepaid: z.boolean().optional(),
      confirmWindowHours: z.number().int().min(1).max(168).optional(),
      autoCancelUnconfirmed: z.boolean().optional(),
      locale: z.string().optional(),
    })
    .optional(),
});

const updateChannelsSchema = z.object({
  whatsapp: z
    .object({
      businessId: z.string(),
      phoneNumberId: z.string(),
      token: z.string(),
    })
    .optional(),
  email: z
    .object({
      provider: z.enum(['sendgrid', 'ses']),
      apiKey: z.string(),
      from: z.string().email(),
      dkimVerified: z.boolean().optional(),
    })
    .optional(),
  sms: z
    .object({
      primary: z.enum(['msg91', 'twilio']),
      msg91: z
        .object({
          authKey: z.string(),
          sender: z.string(),
        })
        .optional(),
      twilio: z
        .object({
          sid: z.string(),
          token: z.string(),
          from: z.string(),
        })
        .optional(),
    })
    .optional(),
});

export const merchantController = {
  async getMerchant(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
    }

    const merchantId = request.user.merchantId;
    if (!merchantId) {
      throw new AppError(403, 'FORBIDDEN', 'Merchant context required');
    }

    const merchant = await merchantService.getMerchantById(merchantId);

    return reply.send({
      success: true,
      data: {
        id: merchant._id.toString(),
        name: merchant.name,
        slug: merchant.slug,
        plan: merchant.plan,
        settings: merchant.settings,
        channels: {
          whatsapp: merchant.channels.whatsapp ? { configured: true } : { configured: false },
          email: merchant.channels.email ? { configured: true, provider: merchant.channels.email.provider } : { configured: false },
          sms: merchant.channels.sms ? { configured: true, primary: merchant.channels.sms.primary } : { configured: false },
        },
      },
    });
  },

  async updateMerchant(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
    }

    const merchantId = request.user.merchantId;
    if (!merchantId) {
      throw new AppError(403, 'FORBIDDEN', 'Merchant context required');
    }

    const data = updateMerchantSchema.parse(request.body);
    const merchant = await merchantService.updateMerchant(merchantId, data);

    return reply.send({
      success: true,
      data: {
        id: merchant._id.toString(),
        name: merchant.name,
        settings: merchant.settings,
      },
    });
  },

  async updateChannels(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
    }

    const merchantId = request.user.merchantId;
    if (!merchantId) {
      throw new AppError(403, 'FORBIDDEN', 'Merchant context required');
    }

    const channels = updateChannelsSchema.parse(request.body);
    const merchant = await merchantService.updateMerchantChannels(merchantId, channels);

    return reply.send({
      success: true,
      data: {
        id: merchant._id.toString(),
        channels: {
          whatsapp: merchant.channels.whatsapp ? { configured: true } : { configured: false },
          email: merchant.channels.email ? { configured: true, provider: merchant.channels.email.provider } : { configured: false },
          sms: merchant.channels.sms ? { configured: true, primary: merchant.channels.sms.primary } : { configured: false },
        },
      },
    });
  },

  async getTeam(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
    }

    const merchantId = request.user.merchantId;
    if (!merchantId) {
      throw new AppError(403, 'FORBIDDEN', 'Merchant context required');
    }

    const team = await merchantService.getMerchantTeam(merchantId);

    return reply.send({
      success: true,
      data: team.map((user) => ({
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      })),
    });
  },

  async inviteMember(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
    }

    const merchantId = request.user.merchantId;
    if (!merchantId) {
      throw new AppError(403, 'FORBIDDEN', 'Merchant context required');
    }

    const { email, name, role } = z
      .object({
        email: z.string().email(),
        name: z.string().min(1),
        role: z.enum(['admin', 'member']),
      })
      .parse(request.body);

    const user = await merchantService.inviteTeamMember(merchantId, email, name, role);

    return reply.status(201).send({
      success: true,
      data: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      },
      message: 'Invitation sent successfully',
    });
  },
};

