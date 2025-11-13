import { Queue, Worker, QueueEvents } from 'bullmq';
import Redis from 'ioredis';
import dotenv from 'dotenv';
import { confirmationProcessor } from './processors/confirmation.processor';
import { retryProcessor } from './processors/retry.processor';
import { automationProcessor } from './processors/automation.processor';
import { scheduledProcessor, scheduleOrderSync, scheduleAutoCancelCheck, scheduleReConfirmCheck } from './jobs/scheduled-jobs';

dotenv.config();

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Create Redis connection
const connection = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
});

// Queue names
export const QUEUE_NAMES = {
  CONFIRMATION: 'confirmation',
  RETRY: 'retry',
  AUTOMATION: 'automation',
  SCHEDULED: 'scheduled',
} as const;

// Create queues
export const confirmationQueue = new Queue(QUEUE_NAMES.CONFIRMATION, { connection });
export const retryQueue = new Queue(QUEUE_NAMES.RETRY, { connection });
export const automationQueue = new Queue(QUEUE_NAMES.AUTOMATION, { connection });
export const scheduledQueue = new Queue(QUEUE_NAMES.SCHEDULED, { connection });

// Create workers
const confirmationWorker = new Worker(
  QUEUE_NAMES.CONFIRMATION,
  confirmationProcessor,
  {
    connection,
    concurrency: 5,
    removeOnComplete: {
      age: 3600, // Keep completed jobs for 1 hour
      count: 1000,
    },
    removeOnFail: {
      age: 24 * 3600, // Keep failed jobs for 24 hours
    },
  }
);

const retryWorker = new Worker(
  QUEUE_NAMES.RETRY,
  retryProcessor,
  {
    connection,
    concurrency: 3,
    removeOnComplete: {
      age: 3600,
      count: 1000,
    },
    removeOnFail: {
      age: 24 * 3600,
    },
  }
);

const automationWorker = new Worker(
  QUEUE_NAMES.AUTOMATION,
  automationProcessor,
  {
    connection,
    concurrency: 2,
    removeOnComplete: {
      age: 3600,
      count: 1000,
    },
    removeOnFail: {
      age: 24 * 3600,
    },
  }
);

const scheduledWorker = new Worker(
  QUEUE_NAMES.SCHEDULED,
  scheduledProcessor,
  {
    connection,
    concurrency: 1, // Process scheduled jobs one at a time
    removeOnComplete: {
      age: 3600,
      count: 1000,
    },
    removeOnFail: {
      age: 24 * 3600,
    },
  }
);

// Queue events for monitoring
const confirmationEvents = new QueueEvents(QUEUE_NAMES.CONFIRMATION, { connection });
const retryEvents = new QueueEvents(QUEUE_NAMES.RETRY, { connection });
const automationEvents = new QueueEvents(QUEUE_NAMES.AUTOMATION, { connection });
const scheduledEvents = new QueueEvents(QUEUE_NAMES.SCHEDULED, { connection });

// Event handlers
confirmationWorker.on('completed', (job) => {
  console.log(`✅ Confirmation job ${job.id} completed`);
});

confirmationWorker.on('failed', (job, err) => {
  console.error(`❌ Confirmation job ${job?.id} failed:`, err);
});

retryWorker.on('completed', (job) => {
  console.log(`✅ Retry job ${job.id} completed`);
});

retryWorker.on('failed', (job, err) => {
  console.error(`❌ Retry job ${job?.id} failed:`, err);
});

automationWorker.on('completed', (job) => {
  console.log(`✅ Automation job ${job.id} completed`);
});

automationWorker.on('failed', (job, err) => {
  console.error(`❌ Automation job ${job?.id} failed:`, err);
});

scheduledWorker.on('completed', (job) => {
  console.log(`✅ Scheduled job ${job.id} completed`);
});

scheduledWorker.on('failed', (job, err) => {
  console.error(`❌ Scheduled job ${job?.id} failed:`, err);
});

// Initialize scheduled jobs on startup
(async () => {
  try {
    await scheduleOrderSync();
    await scheduleAutoCancelCheck();
    await scheduleReConfirmCheck();
    console.log('✅ Scheduled jobs initialized');
  } catch (error) {
    console.error('Failed to initialize scheduled jobs:', error);
  }
})();

console.log('🚀 Worker started');
console.log('📋 Listening to queues:', Object.values(QUEUE_NAMES));

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 Shutting down workers...');
  await Promise.all([
    confirmationWorker.close(),
    retryWorker.close(),
    automationWorker.close(),
    scheduledWorker.close(),
    confirmationEvents.close(),
    retryEvents.close(),
    automationEvents.close(),
    scheduledEvents.close(),
    connection.quit(),
  ]);
  process.exit(0);
});

