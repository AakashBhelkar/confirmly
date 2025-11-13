import { Merchant } from '../../models/Merchant';
import { WhatsAppProvider } from './whatsapp';
import { MSG91Provider, TwilioProvider } from './sms';
import { SendGridProvider, SESProvider } from './email';
import { BaseProvider } from './base';

export type ProviderType = 'whatsapp' | 'sms' | 'email';
export type SMSProviderType = 'msg91' | 'twilio';
export type EmailProviderType = 'sendgrid' | 'ses';

export class ProviderFactory {
  /**
   * Create provider instance from merchant configuration
   */
  static createProvider(merchant: Merchant, type: ProviderType): BaseProvider | null {
    switch (type) {
      case 'whatsapp':
        if (merchant.channels.whatsapp) {
          return new WhatsAppProvider({
            businessId: merchant.channels.whatsapp.businessId,
            phoneNumberId: merchant.channels.whatsapp.phoneNumberId,
            token: merchant.channels.whatsapp.token,
          });
        }
        break;

      case 'sms':
        if (merchant.channels.sms) {
          const primary = merchant.channels.sms.primary;
          if (primary === 'msg91' && merchant.channels.sms.msg91) {
            return new MSG91Provider({
              authKey: merchant.channels.sms.msg91.authKey,
              sender: merchant.channels.sms.msg91.sender,
            });
          } else if (primary === 'twilio' && merchant.channels.sms.twilio) {
            return new TwilioProvider({
              sid: merchant.channels.sms.twilio.sid,
              token: merchant.channels.sms.twilio.token,
              from: merchant.channels.sms.twilio.from,
            });
          }
        }
        break;

      case 'email':
        if (merchant.channels.email) {
          const provider = merchant.channels.email.provider;
          if (provider === 'sendgrid') {
            return new SendGridProvider({
              apiKey: merchant.channels.email.apiKey,
              from: merchant.channels.email.from,
            });
          } else if (provider === 'ses') {
            return new SESProvider({
              accessKeyId: process.env.SES_ACCESS_KEY_ID || '',
              secretAccessKey: process.env.SES_SECRET_ACCESS_KEY || '',
              region: process.env.SES_REGION || 'us-east-1',
              from: merchant.channels.email.from,
            });
          }
        }
        break;
    }

    return null;
  }

  /**
   * Get all available providers for a merchant
   */
  static getAvailableProviders(merchant: Merchant): ProviderType[] {
    const providers: ProviderType[] = [];

    if (merchant.channels.whatsapp) {
      providers.push('whatsapp');
    }

    if (merchant.channels.sms) {
      providers.push('sms');
    }

    if (merchant.channels.email) {
      providers.push('email');
    }

    return providers;
  }
}

