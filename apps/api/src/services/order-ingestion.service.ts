import { Order, IOrder } from '../models/Order';
import { ShopifyOrder } from './shopify.service';
import { transformShopifyOrder } from '../utils/order-transformer';
import { AppError } from '../middlewares/error-handler';
import { mlService } from './ml.service';

export class OrderIngestionService {
  /**
   * Ingest Shopify order
   */
  async ingestShopifyOrder(merchantId: string, shopifyOrder: ShopifyOrder): Promise<IOrder> {
    // Check if order already exists
    const existingOrder = await Order.findOne({
      merchantId,
      platform: 'shopify',
      platformOrderId: shopifyOrder.id.toString(),
    });

    if (existingOrder) {
      // Update existing order
      return this.updateShopifyOrder(merchantId, shopifyOrder);
    }

    // Transform Shopify order to Confirmly format
    const orderData = transformShopifyOrder(shopifyOrder, merchantId);

    // Get risk score from ML service
    try {
      const riskScore = await mlService.scoreOrder(orderData as any);
      orderData.riskScore = riskScore;
    } catch (error) {
      // If ML service fails, continue without risk score
      console.error('Failed to get risk score:', error);
    }

    // Schedule automation jobs
    const { queueService } = await import('./queue.service');
    const merchant = await Merchant.findById(merchantId);
    if (merchant) {
      // Schedule auto-cancel if enabled
      if (merchant.settings.autoCancelUnconfirmed) {
        await queueService.scheduleAutoCancel(
          order._id.toString(),
          merchantId,
          merchant.settings.confirmWindowHours || 24
        );
      }

      // Schedule re-confirmation after 12 hours if still pending
      await queueService.scheduleReConfirm(order._id.toString(), merchantId, 12);
    }

    // Create order
    const order = await Order.create(orderData);

    return order;
  }

  /**
   * Update Shopify order
   */
  async updateShopifyOrder(merchantId: string, shopifyOrder: ShopifyOrder): Promise<IOrder> {
    const order = await Order.findOne({
      merchantId,
      platform: 'shopify',
      platformOrderId: shopifyOrder.id.toString(),
    });

    if (!order) {
      // If order doesn't exist, create it
      return this.ingestShopifyOrder(merchantId, shopifyOrder);
    }

    // Update order fields
    const orderData = transformShopifyOrder(shopifyOrder, merchantId);
    Object.assign(order, orderData);

    await order.save();

    return order;
  }

  /**
   * Sync orders from Shopify
   */
  async syncOrdersFromShopify(merchantId: string, limit: number = 50): Promise<IOrder[]> {
    const { shopifyService } = await import('./shopify.service');
    const orders = await shopifyService.getRecentOrders(merchantId, limit);

    const ingestedOrders: IOrder[] = [];

    for (const shopifyOrder of orders) {
      try {
        const order = await this.ingestShopifyOrder(merchantId, shopifyOrder);
        ingestedOrders.push(order);
      } catch (error) {
        console.error(`Failed to ingest order ${shopifyOrder.id}:`, error);
      }
    }

    return ingestedOrders;
  }
}

export const orderIngestionService = new OrderIngestionService();

