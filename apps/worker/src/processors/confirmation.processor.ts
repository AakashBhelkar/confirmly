import { Job } from 'bullmq';
import { confirmationService } from '../../api/src/services/confirmation.service';
import { ProviderType } from '../../api/src/services/providers/factory';

interface ConfirmationJobData {
  orderId: string;
  merchantId: string;
  channels: ProviderType[];
  templateId?: string;
  variables?: Record<string, string>;
}

export const confirmationProcessor = async (job: Job<ConfirmationJobData>) => {
  const { orderId, merchantId, channels, templateId, variables } = job.data;

  console.log(`Processing confirmation for order ${orderId} via ${channels.join(', ')}`);

  try {
    const result = await confirmationService.sendConfirmation({
      orderId,
      merchantId,
      channels,
      templateId,
      variables,
    });

    return result;
  } catch (error: any) {
    console.error(`Failed to send confirmation for order ${orderId}:`, error);
    throw error;
  }
};

