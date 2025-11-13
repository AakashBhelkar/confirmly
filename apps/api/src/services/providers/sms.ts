import axios from 'axios';
import { BaseProvider, SendParams, SendResult, MessageStatus } from './base';

export interface MSG91Config {
  authKey: string;
  sender: string;
}

export interface TwilioConfig {
  sid: string;
  token: string;
  from: string;
}

export class MSG91Provider extends BaseProvider {
  private config: MSG91Config;
  private baseUrl = 'https://api.msg91.com/api/v5/flow/';

  constructor(config: MSG91Config) {
    super(config);
    this.config = config;
  }

  async send(params: SendParams): Promise<SendResult> {
    try {
      const { to, message } = params;

      const response = await axios.post(
        this.baseUrl,
        {
          template_id: params.templateId || '',
          sender: this.config.sender,
          short_url: '0',
          mobiles: to.replace(/[^0-9]/g, ''),
          message: message,
        },
        {
          headers: {
            authkey: this.config.authKey,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: true,
        messageId: response.data.request_id || response.data.type,
        provider: 'msg91',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        provider: 'msg91',
      };
    }
  }

  async getStatus(messageId: string): Promise<MessageStatus> {
    // MSG91 status check would require additional API call
    return {
      messageId,
      status: 'sent',
    };
  }

  validateConfig(config: any): boolean {
    return !!(config.authKey && config.sender);
  }
}

export class TwilioProvider extends BaseProvider {
  private config: TwilioConfig;
  private baseUrl = 'https://api.twilio.com/2010-04-01';

  constructor(config: TwilioConfig) {
    super(config);
    this.config = config;
  }

  async send(params: SendParams): Promise<SendResult> {
    try {
      const { to, message } = params;

      const response = await axios.post(
        `${this.baseUrl}/Accounts/${this.config.sid}/Messages.json`,
        new URLSearchParams({
          From: this.config.from,
          To: to.replace(/[^0-9+]/g, ''),
          Body: message,
        }),
        {
          auth: {
            username: this.config.sid,
            password: this.config.token,
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return {
        success: true,
        messageId: response.data.sid,
        provider: 'twilio',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        provider: 'twilio',
      };
    }
  }

  async getStatus(messageId: string): Promise<MessageStatus> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/Accounts/${this.config.sid}/Messages/${messageId}.json`,
        {
          auth: {
            username: this.config.sid,
            password: this.config.token,
          },
        }
      );

      const status = response.data.status;
      let mappedStatus: MessageStatus['status'] = 'sent';

      if (status === 'delivered') mappedStatus = 'delivered';
      else if (status === 'failed' || status === 'undelivered') mappedStatus = 'failed';
      else if (status === 'read') mappedStatus = 'read';

      return {
        messageId,
        status: mappedStatus,
        timestamp: new Date(response.data.date_updated),
      };
    } catch (error: any) {
      return {
        messageId,
        status: 'failed',
        error: error.message,
      };
    }
  }

  validateConfig(config: any): boolean {
    return !!(config.sid && config.token && config.from);
  }
}

