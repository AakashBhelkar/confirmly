import { Job } from 'bullmq';
import mongoose from 'mongoose';
import { Order } from '../../api/src/models/Order';
import { Merchant } from '../../api/src/models/Merchant';
import { Policy } from '../../api/src/models/Policy';
import { policyService } from '../../api/src/services/policy.service';
import { confirmationQueue } from '../index';
import { ProviderType } from '../../api/src/services/providers/factory';

// Connect to MongoDB if not already connected
if (mongoose.connection.readyState === 0) {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/confirmly';
  mongoose.connect(MONGO_URI).catch(console.error);
}

interface AutomationJobData {
  orderId: string;
  merchantId: string;
  type: 'auto_confirm' | 'auto_cancel' | 're_confirm';
}

export const automationProcessor = async (job: Job<AutomationJobData>) => {
  const { orderId, merchantId, type } = job.data;

  console.log(`Processing automation ${type} for order ${orderId}`);

  try {
    const order = await Order.findOne({ _id: orderId, merchantId });
    if (!order) {
      throw new Error('Order not found');
    }

    const merchant = await Merchant.findById(merchantId);
    if (!merchant) {
      throw new Error('Merchant not found');
    }

    switch (type) {
      case 'auto_confirm':
        await handleAutoConfirm(order, merchant);
        break;

      case 'auto_cancel':
        await handleAutoCancel(order, merchant);
        break;

      case 're_confirm':
        await handleReConfirm(order, merchant);
        break;
    }

    return { success: true, type };
  } catch (error: any) {
    console.error(`Failed to process automation ${type} for order ${orderId}:`, error);
    throw error;
  }
};

async function handleAutoConfirm(order: Order, merchant: Merchant) {
  // Check if order should be auto-confirmed based on policy
  const policy = await Policy.findOne({ merchantId: merchant._id });
  if (policy) {
    const shouldConfirm = policyService.evaluatePolicy(order, policy);
    if (shouldConfirm) {
      order.status = 'confirmed';
      await order.save();
    }
  }
}

async function handleAutoCancel(order: Order, merchant: Merchant) {
  // Check if order should be auto-canceled
  const confirmWindowHours = merchant.settings.confirmWindowHours || 24;
  const now = new Date();
  const orderAge = (now.getTime() - order.createdAt.getTime()) / (1000 * 60 * 60);

  if (orderAge > confirmWindowHours && order.status === 'pending') {
    // Check if merchant has auto-cancel enabled
    if (merchant.settings.autoCancelUnconfirmed) {
      order.status = 'canceled';
      order.autoActions.push({
        type: 'cancel',
        at: now,
      });
      await order.save();
    }
  }
}

async function handleReConfirm(order: Order, merchant: Merchant) {
  // Re-send confirmation if order is still pending
  if (order.status === 'pending') {
    // Get merchant's preferred channels
    const channels: ProviderType[] = [];
    if (merchant.channels.whatsapp) channels.push('whatsapp');
    if (merchant.channels.sms) channels.push('sms');
    if (merchant.channels.email) channels.push('email');

    if (channels.length > 0) {
      await confirmationQueue.add('re-confirm', {
        orderId: order._id.toString(),
        merchantId: merchant._id.toString(),
        channels,
      });
    }
  }
}

