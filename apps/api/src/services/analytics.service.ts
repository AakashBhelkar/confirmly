import { EventLog } from '../models/EventLog';
import { Order } from '../models/Order';
import { Merchant } from '../models/Merchant';
import { AppError } from '../middlewares/error-handler';

export interface AnalyticsFilters {
  merchantId?: string;
  startDate?: Date;
  endDate?: Date;
  type?: string;
}

export interface AnalyticsMetrics {
  totalOrders: number;
  confirmedOrders: number;
  unconfirmedOrders: number;
  canceledOrders: number;
  totalRevenue: number;
  rtoReduction: number;
  confirmationRate: number;
  averageOrderValue: number;
  messagesSent: number;
  messagesDelivered: number;
  messagesReplied: number;
}

export class AnalyticsService {
  /**
   * Get analytics metrics
   */
  async getMetrics(filters: AnalyticsFilters): Promise<AnalyticsMetrics> {
    const { merchantId, startDate, endDate } = filters;

    const query: any = {};
    if (merchantId) query.merchantId = merchantId;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = startDate;
      if (endDate) query.createdAt.$lte = endDate;
    }

    // Get order metrics
    const orders = await Order.find(query);
    const totalOrders = orders.length;
    const confirmedOrders = orders.filter((o) => o.status === 'confirmed').length;
    const unconfirmedOrders = orders.filter((o) => o.status === 'unconfirmed').length;
    const canceledOrders = orders.filter((o) => o.status === 'canceled').length;

    const totalRevenue = orders
      .filter((o) => o.status === 'confirmed')
      .reduce((sum, o) => sum + o.amount, 0);

    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculate RTO reduction (simplified - would need historical data)
    const rtoReduction = unconfirmedOrders > 0 ? (confirmedOrders / totalOrders) * 100 : 0;

    const confirmationRate = totalOrders > 0 ? (confirmedOrders / totalOrders) * 100 : 0;

    // Get message metrics
    const messageEvents = await EventLog.find({
      ...query,
      type: { $in: ['confirmation_sent', 'message_delivered', 'message_replied'] },
    });

    const messagesSent = messageEvents.filter((e) => e.type === 'confirmation_sent').length;
    const messagesDelivered = messageEvents.filter((e) => e.type === 'message_delivered').length;
    const messagesReplied = messageEvents.filter((e) => e.type === 'message_replied').length;

    return {
      totalOrders,
      confirmedOrders,
      unconfirmedOrders,
      canceledOrders,
      totalRevenue,
      rtoReduction,
      confirmationRate,
      averageOrderValue,
      messagesSent,
      messagesDelivered,
      messagesReplied,
    };
  }

  /**
   * Get time series data
   */
  async getTimeSeries(filters: AnalyticsFilters, interval: 'day' | 'week' | 'month' = 'day') {
    const { merchantId, startDate, endDate } = filters;

    const query: any = {};
    if (merchantId) query.merchantId = merchantId;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = startDate;
      if (endDate) query.createdAt.$lte = endDate;
    }

    const orders = await Order.find(query).sort({ createdAt: 1 });

    // Group by interval
    const grouped: Record<string, { orders: number; revenue: number; confirmed: number }> = {};

    orders.forEach((order) => {
      let key: string;
      const date = new Date(order.createdAt);

      switch (interval) {
        case 'day':
          key = date.toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        default:
          key = date.toISOString().split('T')[0];
      }

      if (!grouped[key]) {
        grouped[key] = { orders: 0, revenue: 0, confirmed: 0 };
      }

      grouped[key].orders++;
      if (order.status === 'confirmed') {
        grouped[key].revenue += order.amount;
        grouped[key].confirmed++;
      }
    });

    return Object.entries(grouped).map(([date, data]) => ({
      date,
      ...data,
    }));
  }

  /**
   * Get channel performance
   */
  async getChannelPerformance(filters: AnalyticsFilters) {
    const { merchantId, startDate, endDate } = filters;

    const query: any = {};
    if (merchantId) query.merchantId = merchantId;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = startDate;
      if (endDate) query.createdAt.$lte = endDate;
    }

    const events = await EventLog.find({
      ...query,
      type: 'confirmation_sent',
    });

    const channels: Record<string, { sent: number; delivered: number; confirmed: number }> = {};

    events.forEach((event) => {
      const channel = event.payload?.channel || 'unknown';
      if (!channels[channel]) {
        channels[channel] = { sent: 0, delivered: 0, confirmed: 0 };
      }
      channels[channel].sent++;
    });

    // Get delivery and confirmation stats
    const deliveryEvents = await EventLog.find({
      ...query,
      type: 'message_delivered',
    });

    deliveryEvents.forEach((event) => {
      const channel = event.payload?.channel || 'unknown';
      if (channels[channel]) {
        channels[channel].delivered++;
      }
    });

    const confirmationEvents = await EventLog.find({
      ...query,
      type: 'order_confirmed',
    });

    confirmationEvents.forEach((event) => {
      const channel = event.payload?.channel || 'unknown';
      if (channels[channel]) {
        channels[channel].confirmed++;
      }
    });

    return Object.entries(channels).map(([channel, stats]) => ({
      channel: channel as 'whatsapp' | 'sms' | 'email',
      sent: stats.sent,
      delivered: stats.delivered,
      confirmed: stats.confirmed,
      rate: stats.sent > 0 ? (stats.confirmed / stats.sent) * 100 : 0,
    }));
  }

  /**
   * Get risk distribution
   */
  async getRiskDistribution(filters: AnalyticsFilters) {
    const { merchantId, startDate, endDate } = filters;

    const query: any = {};
    if (merchantId) query.merchantId = merchantId;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = startDate;
      if (endDate) query.createdAt.$lte = endDate;
    }

    const orders = await Order.find(query);

    const distribution: Record<string, number> = {
      low: 0,
      medium: 0,
      high: 0,
    };

    orders.forEach((order) => {
      const score = order.riskScore || 0;
      if (score < 40) {
        distribution.low++;
      } else if (score < 70) {
        distribution.medium++;
      } else {
        distribution.high++;
      }
    });

    const total = orders.length;

    return [
      {
        riskBand: 'Low (0-39)',
        count: distribution.low,
        percentage: total > 0 ? (distribution.low / total) * 100 : 0,
      },
      {
        riskBand: 'Medium (40-69)',
        count: distribution.medium,
        percentage: total > 0 ? (distribution.medium / total) * 100 : 0,
      },
      {
        riskBand: 'High (70-100)',
        count: distribution.high,
        percentage: total > 0 ? (distribution.high / total) * 100 : 0,
      },
    ];
  }

  /**
   * Export analytics as CSV
   */
  async exportCSV(filters: AnalyticsFilters): Promise<string> {
    const metrics = await this.getMetrics(filters);
    const timeSeries = await this.getTimeSeries(filters, 'day');
    const channels = await this.getChannelPerformance(filters);
    const risk = await this.getRiskDistribution(filters);

    const lines: string[] = [];

    // Metrics section
    lines.push('METRICS');
    lines.push('Metric,Value');
    lines.push(`Total Orders,${metrics.totalOrders}`);
    lines.push(`Confirmed Orders,${metrics.confirmedOrders}`);
    lines.push(`Unconfirmed Orders,${metrics.unconfirmedOrders}`);
    lines.push(`Canceled Orders,${metrics.canceledOrders}`);
    lines.push(`Total Revenue,${metrics.totalRevenue}`);
    lines.push(`RTO Reduction,${metrics.rtoReduction.toFixed(2)}%`);
    lines.push(`Confirmation Rate,${metrics.confirmationRate.toFixed(2)}%`);
    lines.push(`Messages Sent,${metrics.messagesSent}`);
    lines.push('');

    // Time series section
    lines.push('TIME SERIES');
    lines.push('Date,Orders,Revenue,Confirmed');
    timeSeries.forEach((item: any) => {
      lines.push(`${item.date},${item.orders},${item.revenue},${item.confirmed}`);
    });
    lines.push('');

    // Channel performance section
    lines.push('CHANNEL PERFORMANCE');
    lines.push('Channel,Sent,Delivered,Confirmed,Rate');
    channels.forEach((channel) => {
      lines.push(`${channel.channel},${channel.sent},${channel.delivered},${channel.confirmed},${channel.rate.toFixed(2)}%`);
    });
    lines.push('');

    // Risk distribution section
    lines.push('RISK DISTRIBUTION');
    lines.push('Risk Band,Count,Percentage');
    risk.forEach((item) => {
      lines.push(`${item.riskBand},${item.count},${item.percentage.toFixed(2)}%`);
    });

    return lines.join('\n');
  }

  /**
   * Track event
   */
  async trackEvent(
    merchantId: string,
    type: string,
    payload: Record<string, any>,
    actor?: { id: string; role: string }
  ): Promise<void> {
    await EventLog.create({
      merchantId,
      type,
      payload,
      actor,
    });
  }
}

export const analyticsService = new AnalyticsService();

