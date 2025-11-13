import crypto from 'crypto';
import axios from 'axios';
import { Merchant } from '../models/Merchant';
import { AppError } from '../middlewares/error-handler';

const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY!;
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET!;
const SHOPIFY_SCOPES = 'read_orders,write_orders';

export class ShopifyOAuthService {
  /**
   * Generate OAuth install URL
   */
  getInstallUrl(shop: string, redirectUri: string): string {
    const state = crypto.randomBytes(16).toString('hex');
    const redirectUrl = new URL('/v1/integrations/shopify/callback', redirectUri).toString();

    const params = new URLSearchParams({
      client_id: SHOPIFY_API_KEY,
      scope: SHOPIFY_SCOPES,
      redirect_uri: redirectUrl,
      state,
    });

    return `https://${shop}/admin/oauth/authorize?${params.toString()}`;
  }

  /**
   * Verify OAuth callback and exchange code for access token
   */
  async handleCallback(
    shop: string,
    code: string,
    merchantId: string
  ): Promise<{ accessToken: string; shopDomain: string }> {
    try {
      // Exchange code for access token
      const response = await axios.post(`https://${shop}/admin/oauth/access_token`, {
        client_id: SHOPIFY_API_KEY,
        client_secret: SHOPIFY_API_SECRET,
        code,
      });

      const { access_token } = response.data;

      // Update merchant with Shopify credentials
      const merchant = await Merchant.findById(merchantId);
      if (!merchant) {
        throw new AppError(404, 'MERCHANT_NOT_FOUND', 'Merchant not found');
      }

      merchant.shopify = {
        shopDomain: shop,
        accessToken: access_token,
        installedAt: new Date(),
      };

      await merchant.save();

      return {
        accessToken: access_token,
        shopDomain: shop,
      };
    } catch (error: any) {
      throw new AppError(400, 'SHOPIFY_OAUTH_ERROR', error.message || 'Failed to complete OAuth');
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhook(data: string, hmac: string): boolean {
    const hash = crypto
      .createHmac('sha256', SHOPIFY_API_SECRET)
      .update(data, 'utf8')
      .digest('base64');

    return hash === hmac;
  }
}

export const shopifyOAuthService = new ShopifyOAuthService();

