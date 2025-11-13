/**
 * Base provider interface for communication channels
 */
export interface IProvider {
  /**
   * Send a message
   */
  send(params: SendParams): Promise<SendResult>;

  /**
   * Get message status
   */
  getStatus(messageId: string): Promise<MessageStatus>;

  /**
   * Validate configuration
   */
  validateConfig(config: any): boolean;
}

export interface SendParams {
  to: string;
  message: string;
  templateId?: string;
  variables?: Record<string, string>;
  metadata?: Record<string, any>;
}

export interface SendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  provider?: string;
}

export interface MessageStatus {
  messageId: string;
  status: 'sent' | 'delivered' | 'read' | 'replied' | 'failed';
  timestamp?: Date;
  error?: string;
}

export abstract class BaseProvider implements IProvider {
  protected config: any;

  constructor(config: any) {
    this.config = config;
    if (!this.validateConfig(config)) {
      throw new Error('Invalid provider configuration');
    }
  }

  abstract send(params: SendParams): Promise<SendResult>;
  abstract getStatus(messageId: string): Promise<MessageStatus>;
  abstract validateConfig(config: any): boolean;
}

