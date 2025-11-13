import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { QUEUE_NAMES } from '../../worker/src/index';
import { ProviderType } from './providers/factory';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const connection = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
});

// Create queue instances
const confirmationQueue = new Queue(QUEUE_NAMES.CONFIRMATION, { connection });
const retryQueue = new Queue(QUEUE_NAMES.RETRY, { connection });
const automationQueue = new Queue(QUEUE_NAMES.AUTOMATION, { connection });

export class QueueService {
  /**
   * Add confirmation job to queue
   */
  async addConfirmationJob(data: {
    orderId: string;
    merchantId: string;
    channels: ProviderType[];
    templateId?: string;
    variables?: Record<string, string>;
  }) {
    return confirmationQueue.add('confirmation', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
  }

  /**
   * Add retry job to queue
   */
  async addRetryJob(data: {
    orderId: string;
    merchantId: string;
    channel: ProviderType;
    attempt: number;
    maxAttempts: number;
  }) {
    return retryQueue.add('retry', data, {
      attempts: data.maxAttempts - data.attempt,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
    });
  }

  /**
   * Add automation job to queue
   */
  async addAutomationJob(data: {
    orderId: string;
    merchantId: string;
    type: 'auto_confirm' | 'auto_cancel' | 're_confirm';
    delay?: number; // Delay in milliseconds
  }) {
    const options: any = {
      attempts: 1,
    };

    if (data.delay) {
      options.delay = data.delay;
    }

    return automationQueue.add(data.type, data, options);
  }

  /**
   * Schedule auto-cancel job for order
   */
  async scheduleAutoCancel(orderId: string, merchantId: string, delayHours: number) {
    const delay = delayHours * 60 * 60 * 1000; // Convert hours to milliseconds

    return this.addAutomationJob({
      orderId,
      merchantId,
      type: 'auto_cancel',
      delay,
    });
  }

  /**
   * Schedule re-confirmation job for order
   */
  async scheduleReConfirm(orderId: string, merchantId: string, delayHours: number) {
    const delay = delayHours * 60 * 60 * 1000;

    return this.addAutomationJob({
      orderId,
      merchantId,
      type: 're_confirm',
      delay,
    });
  }
}

export const queueService = new QueueService();

