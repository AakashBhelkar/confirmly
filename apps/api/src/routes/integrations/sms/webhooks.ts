import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Order } from '../../../models/Order';
import { Merchant } from '../../../models/Merchant';
import { AppError } from '../../../middlewares/error-handler';

/**
 * MSG91 webhook handler
 */
export const msg91WebhookRoute = async (app: FastifyInstance) => {
  app.post(
    '/webhooks/msg91',
    {
      schema: {
        description: 'MSG91 webhook handler for delivery status and replies',
        tags: ['integrations'],
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const payload = request.body as any;

      try {
        // MSG91 webhook format
        if (payload.type === 'delivery') {
          // Handle delivery status
          const order = await Order.findOne({
            'confirmations.messageId': payload.messageId,
          });

          if (order) {
            const confirmation = order.confirmations.find((c) => c.messageId === payload.messageId);
            if (confirmation) {
              confirmation.status = payload.status === 'delivered' ? 'delivered' : 'failed';
              confirmation.timestamps.delivered = new Date();
              await order.save();
            }
          }
        } else if (payload.type === 'reply') {
          // Handle SMS reply
          const merchant = await Merchant.findOne({
            'channels.sms.provider': 'msg91',
          });

          if (merchant) {
            const order = await Order.findOne({
              merchantId: merchant._id,
              phone: payload.from,
              status: { $in: ['pending', 'confirmed'] },
            }).sort({ createdAt: -1 });

            if (order) {
              const confirmation = order.confirmations.find(
                (c) => c.channel === 'sms' && c.status === 'sent'
              );

              if (confirmation) {
                confirmation.status = 'replied';
                confirmation.reply = parseSMSReply(payload.text);
                confirmation.timestamps.replied = new Date();

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

        return reply.send({ success: true });
      } catch (error: any) {
        console.error('MSG91 webhook error:', error);
        return reply.status(500).send({ success: false, error: error.message });
      }
    }
  );
};

/**
 * Twilio webhook handler
 */
export const twilioWebhookRoute = async (app: FastifyInstance) => {
  app.post(
    '/webhooks/twilio',
    {
      schema: {
        description: 'Twilio webhook handler for delivery status and replies',
        tags: ['integrations'],
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const payload = request.body as any;

      try {
        // Twilio webhook format
        if (payload.MessageStatus) {
          // Handle delivery status
          const order = await Order.findOne({
            'confirmations.messageId': payload.MessageSid,
          });

          if (order) {
            const confirmation = order.confirmations.find((c) => c.messageId === payload.MessageSid);
            if (confirmation) {
              const statusMap: Record<string, string> = {
                delivered: 'delivered',
                failed: 'failed',
                undelivered: 'failed',
              };
              confirmation.status = (statusMap[payload.MessageStatus] || 'sent') as any;
              if (payload.MessageStatus === 'delivered') {
                confirmation.timestamps.delivered = new Date();
              }
              await order.save();
            }
          }
        } else if (payload.Body) {
          // Handle SMS reply
          const merchant = await Merchant.findOne({
            'channels.sms.provider': 'twilio',
          });

          if (merchant) {
            const order = await Order.findOne({
              merchantId: merchant._id,
              phone: payload.From,
              status: { $in: ['pending', 'confirmed'] },
            }).sort({ createdAt: -1 });

            if (order) {
              const confirmation = order.confirmations.find(
                (c) => c.channel === 'sms' && c.status === 'sent'
              );

              if (confirmation) {
                confirmation.status = 'replied';
                confirmation.reply = parseSMSReply(payload.Body);
                confirmation.timestamps.replied = new Date();

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

        return reply.send({ success: true });
      } catch (error: any) {
        console.error('Twilio webhook error:', error);
        return reply.status(500).send({ success: false, error: error.message });
      }
    }
  );
};

function parseSMSReply(text: string): 'yes' | 'no' | 'unknown' {
  const lowerText = text.toLowerCase().trim();
  const yesPatterns = ['yes', 'y', 'confirm', 'ok', 'okay', 'sure', 'correct', '1'];
  const noPatterns = ['no', 'n', 'cancel', 'wrong', 'incorrect', 'not', '0'];

  if (yesPatterns.some((pattern) => lowerText.includes(pattern))) {
    return 'yes';
  }
  if (noPatterns.some((pattern) => lowerText.includes(pattern))) {
    return 'no';
  }

  return 'unknown';
}

