import { Order, IOrder } from '../models/Order';
import { AppError } from '../middlewares/error-handler';
import { shopifyService } from './shopify.service';

export class OrderService {
  async getOrders(
    merchantId: string,
    filters: {
      status?: string;
      paymentMode?: string;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<{ orders: IOrder[]; total: number; page: number; limit: number }> {
    const query: any = { merchantId };

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.paymentMode) {
      query.paymentMode = filters.paymentMode;
    }

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(query),
    ]);

    return {
      orders: orders as IOrder[],
      total,
      page,
      limit,
    };
  }

  async getOrderById(orderId: string, merchantId?: string): Promise<IOrder> {
    const query: any = { _id: orderId };
    if (merchantId) {
      query.merchantId = merchantId;
    }

    const order = await Order.findOne(query);
    if (!order) {
      throw new AppError(404, 'ORDER_NOT_FOUND', 'Order not found');
    }

    return order;
  }

  async confirmOrder(orderId: string, merchantId: string): Promise<IOrder> {
    const order = await Order.findOne({ _id: orderId, merchantId });
    if (!order) {
      throw new AppError(404, 'ORDER_NOT_FOUND', 'Order not found');
    }

    order.status = 'confirmed';
    await order.save();

    return order;
  }

  async cancelOrder(orderId: string, merchantId: string): Promise<IOrder> {
    const order = await Order.findOne({ _id: orderId, merchantId });
    if (!order) {
      throw new AppError(404, 'ORDER_NOT_FOUND', 'Order not found');
    }

    order.status = 'canceled';
    await order.save();

    // Cancel order in Shopify if platform is shopify
    if (order.platform === 'shopify') {
      try {
        await shopifyService.cancelOrder(merchantId, order.platformOrderId);
      } catch (error) {
        console.error('Failed to cancel order in Shopify:', error);
      }
    }

    return order;
  }

  async holdOrder(orderId: string, merchantId: string): Promise<IOrder> {
    const order = await Order.findOne({ _id: orderId, merchantId });
    if (!order) {
      throw new AppError(404, 'ORDER_NOT_FOUND', 'Order not found');
    }

    if (order.status !== 'pending') {
      throw new AppError(400, 'INVALID_STATUS', 'Only pending orders can be held');
    }

    order.status = 'pending';
    // Add hold flag or create a separate status if needed
    await order.save();

    return order;
  }

  async exportOrders(
    merchantId: string,
    filters: {
      status?: string;
      paymentMode?: string;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<string> {
    const query: any = { merchantId };

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.paymentMode) {
      query.paymentMode = filters.paymentMode;
    }

    const orders = await Order.find(query).sort({ createdAt: -1 }).lean();

    // Generate CSV
    const headers = ['Order ID', 'Platform Order ID', 'Email', 'Phone', 'Amount', 'Currency', 'Payment Mode', 'Status', 'Risk Score', 'Created At'];
    const rows = orders.map((order: any) => [
      order._id.toString(),
      order.platformOrderId || '',
      order.email || '',
      order.phone || '',
      order.amount || 0,
      order.currency || '',
      order.paymentMode || '',
      order.status || '',
      order.riskScore || '',
      new Date(order.createdAt).toISOString(),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    return csv;
  }

  async bulkConfirm(orderIds: string[], merchantId: string): Promise<{ confirmed: string[]; failed: string[] }> {
    const confirmed: string[] = [];
    const failed: string[] = [];

    for (const orderId of orderIds) {
      try {
        await this.confirmOrder(orderId, merchantId);
        confirmed.push(orderId);
      } catch (error) {
        failed.push(orderId);
      }
    }

    return { confirmed, failed };
  }
}

export const orderService = new OrderService();

