import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Order } from '../../../models/Order';
import { Merchant } from '../../../models/Merchant';
import { AppError } from '../../../middlewares/error-handler';

/**
 * SendGrid webhook handler
 */
export const sendgridWebhookRoute = async (app: FastifyInstance) => {
  app.post(
    '/webhooks/sendgrid',
    {
      schema: {
        description: 'SendGrid webhook handler for email events',
        tags: ['integrations'],
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const events = request.body as any[];

      try {
        for (const event of events) {
          const messageId = event.sg_message_id;
          const eventType = event.event;

          // Find order by message ID
          const order = await Order.findOne({
            'confirmations.messageId': messageId,
          });

          if (order) {
            const confirmation = order.confirmations.find((c) => c.messageId === messageId);
            if (confirmation) {
              switch (eventType) {
                case 'delivered':
                  confirmation.status = 'delivered';
                  confirmation.timestamps.delivered = new Date(parseInt(event.timestamp) * 1000);
                  break;
                case 'opened':
                  confirmation.timestamps.read = new Date(parseInt(event.timestamp) * 1000);
                  break;
                case 'click':
                  // Track link clicks
                  break;
                case 'bounce':
                case 'dropped':
                  confirmation.status = 'failed';
                  break;
              }
              await order.save();
            }
          }
        }

        return reply.send({ success: true });
      } catch (error: any) {
        console.error('SendGrid webhook error:', error);
        return reply.status(500).send({ success: false, error: error.message });
      }
    }
  );
};

/**
 * AWS SES webhook handler (via SNS)
 */
export const sesWebhookRoute = async (app: FastifyInstance) => {
  app.post(
    '/webhooks/ses',
    {
      schema: {
        description: 'AWS SES webhook handler (via SNS) for email events',
        tags: ['integrations'],
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const payload = request.body as any;

      try {
        // Handle SNS subscription confirmation
        if (payload.Type === 'SubscriptionConfirmation') {
          // Confirm subscription by visiting SubscribeURL
          return reply.send({ success: true, message: 'Subscription confirmation required' });
        }

        // Handle SNS notification
        if (payload.Type === 'Notification') {
          const message = JSON.parse(payload.Message);
          const messageId = message.mail?.messageId;
          const eventType = message.eventType;

          // Find order by message ID
          const order = await Order.findOne({
            'confirmations.messageId': messageId,
          });

          if (order) {
            const confirmation = order.confirmations.find((c) => c.messageId === messageId);
            if (confirmation) {
              switch (eventType) {
                case 'Delivery':
                  confirmation.status = 'delivered';
                  confirmation.timestamps.delivered = new Date(message.mail.timestamp);
                  break;
                case 'Open':
                  confirmation.timestamps.read = new Date(message.mail.timestamp);
                  break;
                case 'Click':
                  // Track link clicks
                  break;
                case 'Bounce':
                case 'Reject':
                  confirmation.status = 'failed';
                  break;
              }
              await order.save();
            }
          }
        }

        return reply.send({ success: true });
      } catch (error: any) {
        console.error('SES webhook error:', error);
        return reply.status(500).send({ success: false, error: error.message });
      }
    }
  );
};

