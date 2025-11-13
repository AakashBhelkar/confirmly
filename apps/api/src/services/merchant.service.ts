import { Merchant, IMerchant } from '../models/Merchant';
import { User } from '../models/User';
import { Plan } from '../models/Plan';
import { AppError } from '../middlewares/error-handler';
import mongoose from 'mongoose';

export interface UpdateMerchantData {
  name?: string;
  settings?: {
    confirmCODOnly?: boolean;
    confirmPrepaid?: boolean;
    confirmWindowHours?: number;
    autoCancelUnconfirmed?: boolean;
    locale?: string;
  };
}

export interface UpdateMerchantChannels {
  whatsapp?: {
    businessId: string;
    phoneNumberId: string;
    token: string;
  };
  email?: {
    provider: 'sendgrid' | 'ses';
    apiKey: string;
    from: string;
    dkimVerified?: boolean;
  };
  sms?: {
    primary: 'msg91' | 'twilio';
    msg91?: {
      authKey: string;
      sender: string;
    };
    twilio?: {
      sid: string;
      token: string;
      from: string;
    };
  };
}

export class MerchantService {
  async getMerchantById(merchantId: string): Promise<IMerchant> {
    const merchant = await Merchant.findById(merchantId);
    if (!merchant) {
      throw new AppError(404, 'MERCHANT_NOT_FOUND', 'Merchant not found');
    }
    return merchant;
  }

  async updateMerchant(merchantId: string, data: UpdateMerchantData): Promise<IMerchant> {
    const merchant = await Merchant.findById(merchantId);
    if (!merchant) {
      throw new AppError(404, 'MERCHANT_NOT_FOUND', 'Merchant not found');
    }

    if (data.name) {
      merchant.name = data.name;
    }

    if (data.settings) {
      if (data.settings.confirmCODOnly !== undefined) {
        merchant.settings.confirmCODOnly = data.settings.confirmCODOnly;
      }
      if (data.settings.confirmPrepaid !== undefined) {
        merchant.settings.confirmPrepaid = data.settings.confirmPrepaid;
      }
      if (data.settings.confirmWindowHours !== undefined) {
        merchant.settings.confirmWindowHours = data.settings.confirmWindowHours;
      }
      if (data.settings.autoCancelUnconfirmed !== undefined) {
        merchant.settings.autoCancelUnconfirmed = data.settings.autoCancelUnconfirmed;
      }
      if (data.settings.locale) {
        merchant.settings.locale = data.settings.locale;
      }
    }

    await merchant.save();
    return merchant;
  }

  async updateMerchantChannels(merchantId: string, channels: UpdateMerchantChannels): Promise<IMerchant> {
    const merchant = await Merchant.findById(merchantId);
    if (!merchant) {
      throw new AppError(404, 'MERCHANT_NOT_FOUND', 'Merchant not found');
    }

    if (channels.whatsapp) {
      merchant.channels.whatsapp = {
        ...merchant.channels.whatsapp,
        ...channels.whatsapp,
        templates: merchant.channels.whatsapp?.templates || [],
      };
    }

    if (channels.email) {
      merchant.channels.email = {
        ...merchant.channels.email,
        ...channels.email,
        dkimVerified: channels.email.dkimVerified ?? false,
      };
    }

    if (channels.sms) {
      merchant.channels.sms = {
        ...merchant.channels.sms,
        ...channels.sms,
      };
    }

    await merchant.save();
    return merchant;
  }

  async updateMerchantPlan(merchantId: string, planId: string): Promise<IMerchant> {
    const merchant = await Merchant.findById(merchantId);
    if (!merchant) {
      throw new AppError(404, 'MERCHANT_NOT_FOUND', 'Merchant not found');
    }

    const plan = await Plan.findById(planId);
    if (!plan) {
      throw new AppError(404, 'PLAN_NOT_FOUND', 'Plan not found');
    }

    merchant.plan = {
      planId: plan._id.toString(),
      name: plan.name,
      price: plan.price,
      currency: plan.currency,
      limits: plan.limits,
      status: merchant.plan.status,
      trialEndsAt: merchant.plan.trialEndsAt,
    };

    await merchant.save();
    return merchant;
  }

  async getMerchantTeam(merchantId: string) {
    const users = await User.find({ merchantId });
    return users;
  }

  async inviteTeamMember(merchantId: string, email: string, name: string, role: 'admin' | 'member') {
    // Check if user already exists
    const existingUser = await User.findOne({ email, merchantId });
    if (existingUser) {
      throw new AppError(409, 'USER_EXISTS', 'User with this email already exists in this merchant');
    }

    // Send invitation email with token
    const { emailService } = await import('./email.service');
    try {
      await emailService.sendInvitationEmail(merchantId, email, token, 'Admin');
    } catch (error) {
      console.error('Failed to send invitation email:', error);
      // Continue even if email fails
    }
    const user = await User.create({
      merchantId,
      email,
      name,
      role,
    });

    return user;
  }
}

export const merchantService = new MerchantService();

