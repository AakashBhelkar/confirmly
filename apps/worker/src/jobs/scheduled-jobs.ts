import { Queue, Job } from 'bullmq';
import Redis from 'ioredis';
import mongoose from 'mongoose';
import { Merchant } from '../../api/src/models/Merchant';
import { Order } from '../../api/src/models/Order';
import { automationQueue } from '../index';
import { orderSyncProcessor } from '../processors/order-sync.processor';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB if not already connected
if (mongoose.connection.readyState === 0) {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/confirmly';
  mongoose.connect(MONGO_URI).catch(console.error);
}

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const connection = new Redis(REDIS_URL, { maxRetriesPerRequest: null });

// Create a queue for scheduled jobs
const scheduledQueue = new Queue('scheduled', { connection });

/**
 * Schedule periodic order sync for all merchants with Shopify connected
 * Runs every 15 minutes
 */
export async function scheduleOrderSync() {
  const merchants = await Merchant.find({
    'integrations.shopify': { $exists: true, $ne: null },
  });

  for (const merchant of merchants) {
    await scheduledQueue.add(
      'order-sync',
      { merchantId: merchant._id.toString() },
      {
        repeat: {
          pattern: '*/15 * * * *', // Every 15 minutes
        },
        jobId: `order-sync-${merchant._id}`,
      }
    );
  }

  console.log(`Scheduled order sync for ${merchants.length} merchants`);
}

/**
 * Schedule auto-cancel check for unconfirmed orders
 * Runs every hour
 */
export async function scheduleAutoCancelCheck() {
  await scheduledQueue.add(
    'auto-cancel-check',
    {},
    {
      repeat: {
        pattern: '0 * * * *', // Every hour
      },
      jobId: 'auto-cancel-check',
    }
  );

  console.log('Scheduled auto-cancel check');
}

/**
 * Schedule re-confirmation triggers
 * Runs every 6 hours
 */
export async function scheduleReConfirmCheck() {
  await scheduledQueue.add(
    're-confirm-check',
    {},
    {
      repeat: {
        pattern: '0 */6 * * *', // Every 6 hours
      },
      jobId: 're-confirm-check',
    }
  );

  console.log('Scheduled re-confirmation check');
}

/**
 * Process auto-cancel check job
 */
export async function processAutoCancelCheck() {
  const merchants = await Merchant.find({
    'settings.autoCancelUnconfirmed': true,
  });

  for (const merchant of merchants) {
    const confirmWindowHours = merchant.settings.confirmWindowHours || 24;
    const cutoffTime = new Date(Date.now() - confirmWindowHours * 60 * 60 * 1000);

    const unconfirmedOrders = await Order.find({
      merchantId: merchant._id,
      status: 'pending',
      createdAt: { $lt: cutoffTime },
    });

    for (const order of unconfirmedOrders) {
      await automationQueue.add('auto-cancel', {
        orderId: order._id.toString(),
        merchantId: merchant._id.toString(),
        type: 'auto_cancel',
      });
    }
  }

  return { checked: merchants.length };
}

/**
 * Process re-confirmation check job
 */
export async function processReConfirmCheck() {
  const merchants = await Merchant.find({
    'settings.reConfirmEnabled': true,
  });

  for (const merchant of merchants) {
    const reConfirmHours = merchant.settings.reConfirmHours || 12;
    const cutoffTime = new Date(Date.now() - reConfirmHours * 60 * 60 * 1000);

    const pendingOrders = await Order.find({
      merchantId: merchant._id,
      status: 'pending',
      createdAt: { $lt: cutoffTime },
      // Only re-confirm if no confirmation was sent in the last reConfirmHours
      'confirmations.timestamps.sent': {
        $not: { $gte: cutoffTime },
      },
    });

    for (const order of pendingOrders) {
      await automationQueue.add('re-confirm', {
        orderId: order._id.toString(),
        merchantId: merchant._id.toString(),
        type: 're_confirm',
      });
    }
  }

  return { checked: merchants.length };
}

// Export processor for the scheduled queue
export const scheduledProcessor = async (job: Job) => {
  const jobName = job.name;

  switch (jobName) {
    case 'order-sync':
      return orderSyncProcessor(job as Job<{ merchantId: string; limit?: number }>);
    case 'auto-cancel-check':
      return processAutoCancelCheck();
    case 're-confirm-check':
      return processReConfirmCheck();
    default:
      throw new Error(`Unknown scheduled job: ${jobName}`);
  }
};

