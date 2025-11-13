import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Order } from '../../../models/Order';
import { Merchant } from '../../../models/Merchant';
import { AppError } from '../../../middlewares/error-handler';
import crypto from 'crypto';

const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || '';

interface WhatsAppWebhookPayload {
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: string;
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        contacts?: Array<{
          profile: {
            name: string;
          };
          wa_id: string;
        }>;
        messages?: Array<{
          from: string;
          id: string;
          timestamp: string;
          type: string;
          text?: {
            body: string;
          };
        }>;
        statuses?: Array<{
          id: string;
          status: string;
          timestamp: string;
          recipient_id: string;
        }>;
      };
      field: string;
    }>;
  }>;
}

export const webhooksRoute = async (app: FastifyInstance) => {
  // Webhook verification
  app.get(
    '/webhook',
    {
      schema: {
        description: 'WhatsApp webhook verification',
        tags: ['integrations'],
        querystring: {
          type: 'object',
          properties: {
            'hub.mode': { type: 'string' },
            'hub.verify_token': { type: 'string' },
            'hub.challenge': { type: 'string' },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { 'hub.mode': mode, 'hub.verify_token': token, 'hub.challenge': challenge } = request.query as any;

      if (mode === 'subscribe' && token === WHATSAPP_VERIFY_TOKEN) {
        return reply.send(challenge);
      }

      return reply.status(403).send('Forbidden');
    }
  );

  // Webhook handler
  app.post(
    '/webhook',
    {
      schema: {
        description: 'WhatsApp webhook handler',
        tags: ['integrations'],
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const payload = request.body as WhatsAppWebhookPayload;

      try {
        for (const entry of payload.entry || []) {
          for (const change of entry.changes || []) {
            const value = change.value;

            // Handle message status updates
            if (value.statuses) {
              for (const status of value.statuses) {
                // Find order by message ID
                const order = await Order.findOne({
                  'confirmations.messageId': status.id,
                });

                if (order) {
                  const confirmation = order.confirmations.find((c) => c.messageId === status.id);
                  if (confirmation) {
                    confirmation.status = status.status as any;
                    if (status.status === 'delivered') {
                      confirmation.timestamps.delivered = new Date(parseInt(status.timestamp) * 1000);
                    } else if (status.status === 'read') {
                      confirmation.timestamps.read = new Date(parseInt(status.timestamp) * 1000);
                    }
                    await order.save();
                  }
                }
              }
            }

            // Handle incoming messages (replies)
            if (value.messages) {
              for (const message of value.messages) {
                // Find merchant by phone number ID
                const merchant = await Merchant.findOne({
                  'channels.whatsapp.phoneNumberId': value.metadata.phone_number_id,
                });

                if (merchant) {
                  // Find order by phone number
                  const order = await Order.findOne({
                    merchantId: merchant._id,
                    phone: message.from,
                    status: { $in: ['pending', 'confirmed'] },
                  }).sort({ createdAt: -1 });

                  if (order) {
                    const confirmation = order.confirmations.find(
                      (c) => c.channel === 'whatsapp' && c.status === 'sent'
                    );

                    if (confirmation) {
                      confirmation.status = 'replied';
                      confirmation.reply = this.parseReply(message.text?.body || '');
                      confirmation.timestamps.replied = new Date(parseInt(message.timestamp) * 1000);

                      // Update order status based on reply
                      if (confirmation.reply === 'yes') {
                        order.status = 'confirmed';
                      } else if (confirmation.reply === 'no') {
                        order.status = 'unconfirmed';
                      }

                      await order.save();
                    }
                  }
                }
              }
            }
          }
        }

        return reply.send({ success: true });
      } catch (error: any) {
        console.error('WhatsApp webhook error:', error);
        return reply.status(500).send({ success: false, error: error.message });
      }
    }
  );

  /**
   * Parse reply text to determine yes/no/unknown
   */
  function parseReply(text: string): 'yes' | 'no' | 'unknown' {
    const lowerText = text.toLowerCase().trim();
    const yesPatterns = ['yes', 'y', 'confirm', 'ok', 'okay', 'sure', 'correct'];
    const noPatterns = ['no', 'n', 'cancel', 'wrong', 'incorrect', 'not'];

    if (yesPatterns.some((pattern) => lowerText.includes(pattern))) {
      return 'yes';
    }
    if (noPatterns.some((pattern) => lowerText.includes(pattern))) {
      return 'no';
    }

    return 'unknown';
  }
};

