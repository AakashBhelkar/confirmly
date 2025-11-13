import { providerFactory } from './providers/factory';
import { ProviderType } from './providers/factory';
import { Merchant } from '../models/Merchant';

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  /**
   * Send invitation email
   */
  async sendInvitationEmail(
    merchantId: string,
    email: string,
    token: string,
    inviterName?: string
  ): Promise<void> {
    const merchant = await Merchant.findById(merchantId);
    if (!merchant) {
      throw new Error('Merchant not found');
    }

    const inviteUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/invite/${token}`;
    const merchantName = merchant.name || 'Confirmly';

    const template: EmailTemplate = {
      subject: `You've been invited to join ${merchantName} on Confirmly`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #3C73FF; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>You've been invited!</h2>
            <p>${inviterName || 'Someone'} has invited you to join <strong>${merchantName}</strong> on Confirmly.</p>
            <p>Confirmly helps eCommerce brands reduce RTO losses through automated order confirmations.</p>
            <a href="${inviteUrl}" class="button">Accept Invitation</a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #3C73FF;">${inviteUrl}</p>
            <p>This invitation will expire in 7 days.</p>
            <div class="footer">
              <p>If you didn't expect this invitation, you can safely ignore this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        You've been invited to join ${merchantName} on Confirmly.
        
        ${inviterName || 'Someone'} has invited you to join ${merchantName} on Confirmly.
        Confirmly helps eCommerce brands reduce RTO losses through automated order confirmations.
        
        Accept your invitation: ${inviteUrl}
        
        This invitation will expire in 7 days.
        
        If you didn't expect this invitation, you can safely ignore this email.
      `,
    };

    await this.sendEmail(merchantId, email, template);
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    const template: EmailTemplate = {
      subject: 'Reset your Confirmly password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #3C73FF; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
            .warning { color: #FF9800; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Reset your password</h2>
            <p>We received a request to reset your password for your Confirmly account.</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #3C73FF;">${resetUrl}</p>
            <p class="warning">This link will expire in 24 hours.</p>
            <p>If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.</p>
            <div class="footer">
              <p>For security reasons, never share this link with anyone.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Reset your Confirmly password
        
        We received a request to reset your password for your Confirmly account.
        
        Reset your password: ${resetUrl}
        
        This link will expire in 24 hours.
        
        If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.
        
        For security reasons, never share this link with anyone.
      `,
    };

    // Find merchant by user email to get merchantId
    const { User } = await import('../models/User');
    const user = await User.findOne({ email });
    if (!user || !user.merchantId) {
      // If user not found, we still want to send email (for security, don't reveal if user exists)
      // Use a default merchant or system email
      return;
    }

    await this.sendEmail(user.merchantId.toString(), email, template);
  }

  /**
   * Send email using configured provider
   */
  private async sendEmail(merchantId: string, to: string, template: EmailTemplate): Promise<void> {
    try {
      const merchant = await Merchant.findById(merchantId);
      if (!merchant || !merchant.integrations?.email) {
        console.warn(`Email provider not configured for merchant ${merchantId}`);
        // In development, log the email instead
        if (process.env.NODE_ENV === 'development') {
          console.log('=== EMAIL (Development Mode) ===');
          console.log(`To: ${to}`);
          console.log(`Subject: ${template.subject}`);
          console.log(`Body: ${template.text || template.html}`);
          console.log('================================');
        }
        return;
      }

      const emailConfig = merchant.integrations.email;
      const provider = providerFactory.createProvider(ProviderType.EMAIL, emailConfig);

      await provider.send({
        to,
        message: template.html,
        metadata: {
          subject: template.subject,
        },
      });
    } catch (error) {
      console.error('Failed to send email:', error);
      // Don't throw - email failures shouldn't break the flow
      // In production, queue for retry
    }
  }
}

export const emailService = new EmailService();

