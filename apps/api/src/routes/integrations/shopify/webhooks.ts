import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { verifyShopifyWebhook } from '../../../utils/shopify-webhook-verify';
import { orderIngestionService } from '../../../services/order-ingestion.service';
import { AppError } from '../../../middlewares/error-handler';

interface ShopifyWebhookPayload {
  id: number;
  email: string;
  phone?: string;
  total_price: string;
  currency: string;
  financial_status: string;
  fulfillment_status: string;
  created_at: string;
  customer: {
    first_name: string;
    last_name: string;
    default_address?: {
      address1: string;
      city: string;
      province: string;
      zip: string;
      country: string;
    };
  };
  line_items: Array<{
    title: string;
    quantity: number;
    price: string;
  }>;
}

export const webhooksRoute = async (app: FastifyInstance) => {
  // Handle orders/create webhook
  app.post(
    '/webhooks/orders/create',
    {
      schema: {
        description: 'Shopify orders/create webhook',
        tags: ['integrations'],
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      // Verify webhook signature
      if (!verifyShopifyWebhook(request)) {
        throw new AppError(401, 'INVALID_SIGNATURE', 'Invalid webhook signature');
      }

      const payload = request.body as ShopifyWebhookPayload;
      const shop = request.headers['x-shopify-shop-domain'] as string;

      if (!shop) {
        throw new AppError(400, 'MISSING_SHOP', 'Shop domain is required');
      }

      // Find merchant by shop domain
      const { Merchant } = await import('../../../models/Merchant');
      const merchant = await Merchant.findOne({ 'shopify.shopDomain': shop });

      if (!merchant) {
        throw new AppError(404, 'MERCHANT_NOT_FOUND', 'Merchant not found');
      }

      // Ingest order
      await orderIngestionService.ingestShopifyOrder(merchant._id.toString(), payload);

      return reply.send({ success: true });
    }
  );

  // Handle orders/updated webhook
  app.post(
    '/webhooks/orders/updated',
    {
      schema: {
        description: 'Shopify orders/updated webhook',
        tags: ['integrations'],
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      // Verify webhook signature
      if (!verifyShopifyWebhook(request)) {
        throw new AppError(401, 'INVALID_SIGNATURE', 'Invalid webhook signature');
      }

      const payload = request.body as ShopifyWebhookPayload;
      const shop = request.headers['x-shopify-shop-domain'] as string;

      if (!shop) {
        throw new AppError(400, 'MISSING_SHOP', 'Shop domain is required');
      }

      // Find merchant by shop domain
      const { Merchant } = await import('../../../models/Merchant');
      const merchant = await Merchant.findOne({ 'shopify.shopDomain': shop });

      if (!merchant) {
        throw new AppError(404, 'MERCHANT_NOT_FOUND', 'Merchant not found');
      }

      // Update order
      await orderIngestionService.updateShopifyOrder(merchant._id.toString(), payload);

      return reply.send({ success: true });
    }
  );
};

