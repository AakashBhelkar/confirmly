import crypto from 'crypto';
import { FastifyRequest } from 'fastify';

const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET!;

/**
 * Verify Shopify webhook signature
 */
export const verifyShopifyWebhook = (request: FastifyRequest): boolean => {
  const hmac = request.headers['x-shopify-hmac-sha256'] as string;
  if (!hmac) {
    return false;
  }

  const body = JSON.stringify(request.body);
  const hash = crypto
    .createHmac('sha256', SHOPIFY_API_SECRET)
    .update(body, 'utf8')
    .digest('base64');

  return hash === hmac;
};

