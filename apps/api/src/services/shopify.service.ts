import axios, { AxiosInstance } from 'axios';
import { Merchant } from '../models/Merchant';
import { AppError } from '../middlewares/error-handler';

export interface ShopifyOrder {
  id: number;
  email: string;
  phone: string;
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

export class ShopifyService {
  private getClient(merchantId: string): AxiosInstance {
    return axios.create({
      baseURL: `https://${this.getShopDomain(merchantId)}/admin/api/2024-01`,
      headers: {
        'X-Shopify-Access-Token': this.getAccessToken(merchantId),
      },
    });
  }

  private async getShopDomain(merchantId: string): Promise<string> {
    const merchant = await Merchant.findById(merchantId);
    if (!merchant?.shopify?.shopDomain) {
      throw new AppError(400, 'SHOPIFY_NOT_CONNECTED', 'Shopify not connected');
    }
    return merchant.shopify.shopDomain;
  }

  private async getAccessToken(merchantId: string): Promise<string> {
    const merchant = await Merchant.findById(merchantId);
    if (!merchant?.shopify?.accessToken) {
      throw new AppError(400, 'SHOPIFY_NOT_CONNECTED', 'Shopify not connected');
    }
    return merchant.shopify.accessToken;
  }

  /**
   * Fetch order from Shopify
   */
  async getOrder(merchantId: string, orderId: string): Promise<ShopifyOrder> {
    const client = await this.getClient(merchantId);
    const shopDomain = await this.getShopDomain(merchantId);

    try {
      const response = await client.get(`/orders/${orderId}.json`);
      return response.data.order;
    } catch (error: any) {
      throw new AppError(404, 'ORDER_NOT_FOUND', 'Order not found in Shopify');
    }
  }

  /**
   * Fetch recent orders from Shopify
   */
  async getRecentOrders(merchantId: string, limit: number = 50): Promise<ShopifyOrder[]> {
    const client = await this.getClient(merchantId);

    try {
      const response = await client.get('/orders.json', {
        params: {
          limit,
          status: 'any',
        },
      });
      return response.data.orders;
    } catch (error: any) {
      throw new AppError(500, 'SHOPIFY_ERROR', 'Failed to fetch orders from Shopify');
    }
  }

  /**
   * Cancel order in Shopify
   */
  async cancelOrder(merchantId: string, orderId: string): Promise<void> {
    const client = await this.getClient(merchantId);

    try {
      await client.post(`/orders/${orderId}/cancel.json`, {
        reason: 'other',
      });
    } catch (error: any) {
      throw new AppError(500, 'SHOPIFY_ERROR', 'Failed to cancel order in Shopify');
    }
  }
}

export const shopifyService = new ShopifyService();

