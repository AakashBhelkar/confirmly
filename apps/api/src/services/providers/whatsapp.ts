import axios from 'axios';
import { BaseProvider, SendParams, SendResult, MessageStatus } from './base';

export interface WhatsAppConfig {
  businessId: string;
  phoneNumberId: string;
  token: string;
  apiVersion?: string;
}

export class WhatsAppProvider extends BaseProvider {
  private config: WhatsAppConfig;
  private apiVersion: string;
  private baseUrl: string;

  constructor(config: WhatsAppConfig) {
    super(config);
    this.config = config;
    this.apiVersion = config.apiVersion || 'v18.0';
    this.baseUrl = `https://graph.facebook.com/${this.apiVersion}`;
  }

  async send(params: SendParams): Promise<SendResult> {
    try {
      const { to, message, templateId, variables } = params;

      if (templateId) {
        // Send template message
        return this.sendTemplate(to, templateId, variables || {});
      } else {
        // Send text message
        return this.sendText(to, message);
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to send WhatsApp message',
        provider: 'whatsapp',
      };
    }
  }

  private async sendText(to: string, message: string): Promise<SendResult> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/${this.config.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: to.replace(/[^0-9]/g, ''), // Remove non-numeric characters
          type: 'text',
          text: {
            body: message,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.config.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: true,
        messageId: response.data.messages[0]?.id,
        provider: 'whatsapp',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
        provider: 'whatsapp',
      };
    }
  }

  private async sendTemplate(
    to: string,
    templateId: string,
    variables: Record<string, string>
  ): Promise<SendResult> {
    try {
      const components = [];
      if (Object.keys(variables).length > 0) {
        components.push({
          type: 'body',
          parameters: Object.entries(variables).map(([key, value]) => ({
            type: 'text',
            text: value,
          })),
        });
      }

      const response = await axios.post(
        `${this.baseUrl}/${this.config.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: to.replace(/[^0-9]/g, ''),
          type: 'template',
          template: {
            name: templateId,
            language: {
              code: 'en',
            },
            components,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.config.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: true,
        messageId: response.data.messages[0]?.id,
        provider: 'whatsapp',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
        provider: 'whatsapp',
      };
    }
  }

  async getStatus(messageId: string): Promise<MessageStatus> {
    try {
      // WhatsApp doesn't provide a direct status API
      // Status updates come via webhooks
      return {
        messageId,
        status: 'sent',
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
    return !!(
      config.businessId &&
      config.phoneNumberId &&
      config.token
    );
  }

  /**
   * Get WhatsApp templates
   */
  async getTemplates(): Promise<any[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/${this.config.businessId}/message_templates`,
        {
          headers: {
            Authorization: `Bearer ${this.config.token}`,
          },
        }
      );

      return response.data.data || [];
    } catch (error: any) {
      throw new Error(`Failed to get templates: ${error.message}`);
    }
  }
}

