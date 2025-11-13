import { Order } from '../models/Order';
import { Template } from '../models/Template';
import { Merchant } from '../models/Merchant';
import { ProviderFactory, ProviderType } from './providers/factory';
import { BaseProvider, SendParams } from './providers/base';
import { AppError } from '../middlewares/error-handler';
import { EventLog } from '../models/EventLog';

export interface ConfirmationRequest {
  orderId: string;
  merchantId: string;
  channels: ProviderType[];
  templateId?: string;
  variables?: Record<string, string>;
}

export interface ConfirmationResult {
  orderId: string;
  confirmations: Array<{
    channel: ProviderType;
    success: boolean;
    messageId?: string;
    error?: string;
  }>;
}

export class ConfirmationService {
  /**
   * Send confirmation messages via multiple channels
   */
  async sendConfirmation(request: ConfirmationRequest): Promise<ConfirmationResult> {
    const { orderId, merchantId, channels, templateId, variables } = request;

    // Get order
    const order = await Order.findOne({ _id: orderId, merchantId });
    if (!order) {
      throw new AppError(404, 'ORDER_NOT_FOUND', 'Order not found');
    }

    // Get merchant
    const merchant = await Merchant.findById(merchantId);
    if (!merchant) {
      throw new AppError(404, 'MERCHANT_NOT_FOUND', 'Merchant not found');
    }

    // Get template if provided
    let template: Template | null = null;
    if (templateId) {
      template = await Template.findOne({ _id: templateId, merchantId, status: 'active' });
    }

    const confirmations: ConfirmationResult['confirmations'] = [];

    // Send via each channel
    for (const channel of channels) {
      try {
        const provider = ProviderFactory.createProvider(merchant, channel);
        if (!provider) {
          confirmations.push({
            channel,
            success: false,
            error: `Provider not configured for ${channel}`,
          });
          continue;
        }

        // Prepare message
        const message = this.prepareMessage(order, template, variables);
        const to = this.getRecipient(order, channel);

        // Send message
        const result = await provider.send({
          to,
          message: message.content,
          templateId: template?.channel === channel ? template._id.toString() : undefined,
          variables: variables || {},
          metadata: {
            orderId: order._id.toString(),
            channel,
          },
        });

        // Update order confirmation status
        order.confirmations.push({
          channel,
          status: result.success ? 'sent' : 'failed',
          timestamps: {
            sent: result.success ? new Date() : undefined,
          },
          messageId: result.messageId,
        });

        confirmations.push({
          channel,
          success: result.success,
          messageId: result.messageId,
          error: result.error,
        });

        // Log event
        await EventLog.create({
          merchantId,
          type: 'confirmation_sent',
          payload: {
            orderId: order._id.toString(),
            channel,
            success: result.success,
            messageId: result.messageId,
          },
        });
      } catch (error: any) {
        confirmations.push({
          channel,
          success: false,
          error: error.message || 'Failed to send confirmation',
        });
      }
    }

    // Save order updates
    await order.save();

    return {
      orderId,
      confirmations,
    };
  }

  /**
   * Retry failed confirmation
   */
  async retryConfirmation(
    orderId: string,
    merchantId: string,
    channel: ProviderType
  ): Promise<ConfirmationResult> {
    return this.sendConfirmation({
      orderId,
      merchantId,
      channels: [channel],
    });
  }

  /**
   * Prepare message content
   */
  private prepareMessage(
    order: Order,
    template: Template | null,
    variables?: Record<string, string>
  ): { content: string; variables: Record<string, string> } {
    if (template) {
      let content = template.content;
      const templateVars = variables || {};

      // Replace template variables
      template.variables.forEach((varName) => {
        const value = templateVars[varName] || this.getDefaultVariable(order, varName);
        content = content.replace(new RegExp(`{{${varName}}}`, 'g'), value);
      });

      return { content, variables: templateVars };
    }

    // Default message
    const defaultMessage = `Hi ${order.customer.name}, your order #${order.platformOrderId} for ₹${order.amount} is confirmed. Please confirm delivery.`;
    return { content: defaultMessage, variables: {} };
  }

  /**
   * Get default variable value from order
   */
  private getDefaultVariable(order: Order, varName: string): string {
    const defaults: Record<string, string> = {
      orderId: order.platformOrderId,
      amount: order.amount.toString(),
      currency: order.currency,
      customerName: order.customer.name,
      customerAddress: order.customer.address,
      customerPincode: order.customer.pincode,
    };

    return defaults[varName] || '';
  }

  /**
   * Get recipient address for channel
   */
  private getRecipient(order: Order, channel: ProviderType): string {
    switch (channel) {
      case 'whatsapp':
      case 'sms':
        return order.phone;
      case 'email':
        return order.email;
      default:
        return order.email;
    }
  }
}

export const confirmationService = new ConfirmationService();

