import axios from 'axios';
import { BaseProvider, SendParams, SendResult, MessageStatus } from './base';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

export interface SendGridConfig {
  apiKey: string;
  from: string;
}

export interface SESConfig {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  from: string;
}

export class SendGridProvider extends BaseProvider {
  private config: SendGridConfig;
  private baseUrl = 'https://api.sendgrid.com/v3';

  constructor(config: SendGridConfig) {
    super(config);
    this.config = config;
  }

  async send(params: SendParams): Promise<SendResult> {
    try {
      const { to, message, templateId, variables } = params;

      const emailData: any = {
        personalizations: [
          {
            to: [{ email: to }],
            dynamic_template_data: variables || {},
          },
        ],
        from: { email: this.config.from },
        subject: params.metadata?.subject || 'Message from Confirmly',
      };

      if (templateId) {
        emailData.template_id = templateId;
      } else {
        emailData.content = [
          {
            type: 'text/html',
            value: message,
          },
        ];
      }

      const response = await axios.post(
        `${this.baseUrl}/mail/send`,
        emailData,
        {
          headers: {
            Authorization: `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // SendGrid doesn't return message ID in response
      return {
        success: true,
        messageId: response.headers['x-message-id'] || Date.now().toString(),
        provider: 'sendgrid',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.errors?.[0]?.message || error.message,
        provider: 'sendgrid',
      };
    }
  }

  async getStatus(messageId: string): Promise<MessageStatus> {
    // SendGrid status requires webhook events
    return {
      messageId,
      status: 'sent',
    };
  }

  validateConfig(config: any): boolean {
    return !!(config.apiKey && config.from);
  }
}

export class SESProvider extends BaseProvider {
  private config: SESConfig;
  private client: SESClient;

  constructor(config: SESConfig) {
    super(config);
    this.config = config;
    this.client = new SESClient({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  async send(params: SendParams): Promise<SendResult> {
    try {
      const { to, message, templateId, variables } = params;

      const command = new SendEmailCommand({
        Source: this.config.from,
        Destination: {
          ToAddresses: [to],
        },
        Message: {
          Subject: {
            Data: params.metadata?.subject || 'Message from Confirmly',
            Charset: 'UTF-8',
          },
          Body: {
            Html: {
              Data: message,
              Charset: 'UTF-8',
            },
          },
        },
      });

      const response = await this.client.send(command);

      return {
        success: true,
        messageId: response.MessageId,
        provider: 'ses',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to send email via SES',
        provider: 'ses',
      };
    }
  }

  async getStatus(messageId: string): Promise<MessageStatus> {
    // SES status requires SNS notifications
    return {
      messageId,
      status: 'sent',
    };
  }

  validateConfig(config: any): boolean {
    return !!(
      config.accessKeyId &&
      config.secretAccessKey &&
      config.region &&
      config.from
    );
  }
}

