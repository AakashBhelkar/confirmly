import { Job } from 'bullmq';
import { confirmationService } from '../../api/src/services/confirmation.service';
import { ProviderType } from '../../api/src/services/providers/factory';

interface RetryJobData {
  orderId: string;
  merchantId: string;
  channel: ProviderType;
  attempt: number;
  maxAttempts: number;
}

export const retryProcessor = async (job: Job<RetryJobData>) => {
  const { orderId, merchantId, channel, attempt, maxAttempts } = job.data;

  console.log(`Retrying confirmation for order ${orderId} via ${channel} (attempt ${attempt}/${maxAttempts})`);

  try {
    const result = await confirmationService.retryConfirmation(orderId, merchantId, channel);

    return result;
  } catch (error: any) {
    console.error(`Failed to retry confirmation for order ${orderId}:`, error);

    // If max attempts not reached, throw error to trigger retry
    if (attempt < maxAttempts) {
      throw error;
    }

    // Max attempts reached, mark as failed
    return {
      success: false,
      error: `Max retry attempts (${maxAttempts}) reached`,
    };
  }
};

