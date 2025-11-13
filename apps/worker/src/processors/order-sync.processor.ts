import { Job } from 'bullmq';
import mongoose from 'mongoose';
import { Merchant } from '../../api/src/models/Merchant';
import { orderIngestionService } from '../../api/src/services/order-ingestion.service';
import { queueService } from '../../api/src/services/queue.service';
import { ProviderType } from '../../api/src/services/providers/factory';

// Connect to MongoDB if not already connected
if (mongoose.connection.readyState === 0) {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/confirmly';
  mongoose.connect(MONGO_URI).catch(console.error);
}

interface OrderSyncJobData {
  merchantId: string;
  limit?: number;
}

/**
 * Processor for syncing orders from Shopify
 * This job runs periodically to fetch new orders from Shopify
 */
export const orderSyncProcessor = async (job: Job<OrderSyncJobData>) => {
  const { merchantId, limit = 50 } = job.data;

  console.log(`Syncing orders for merchant ${merchantId}`);

  try {
    const merchant = await Merchant.findById(merchantId);
    if (!merchant) {
      throw new Error('Merchant not found');
    }

    // Only sync if Shopify is connected
    if (!merchant.integrations?.shopify) {
      console.log(`Shopify not connected for merchant ${merchantId}`);
      return { success: true, synced: 0, skipped: true };
    }

    // Sync orders from Shopify
    const syncedOrders = await orderIngestionService.syncOrdersFromShopify(merchantId, limit);

    // For each new order, trigger confirmation if needed
    for (const order of syncedOrders) {
      // Check if order needs confirmation based on merchant settings
      if (order.status === 'pending' && merchant.settings.autoConfirm) {
        // Get merchant's preferred channels
        const channels: ProviderType[] = [];
        if (merchant.channels.whatsapp) channels.push('whatsapp');
        if (merchant.channels.sms) channels.push('sms');
        if (merchant.channels.email) channels.push('email');

        if (channels.length > 0) {
          // Queue confirmation job
          await queueService.addConfirmationJob({
            orderId: order._id.toString(),
            merchantId: merchantId,
            channels,
          });

          // Schedule auto-cancel if enabled
          if (merchant.settings.autoCancelUnconfirmed) {
            const confirmWindowHours = merchant.settings.confirmWindowHours || 24;
            await queueService.scheduleAutoCancel(
              order._id.toString(),
              merchantId,
              confirmWindowHours
            );
          }

          // Schedule re-confirmation reminder
          const reConfirmHours = merchant.settings.reConfirmHours || 12;
          await queueService.scheduleReConfirm(
            order._id.toString(),
            merchantId,
            reConfirmHours
          );
        }
      }
    }

    return {
      success: true,
      synced: syncedOrders.length,
      orders: syncedOrders.map((o) => o._id.toString()),
    };
  } catch (error: any) {
    console.error(`Failed to sync orders for merchant ${merchantId}:`, error);
    throw error;
  }
};

