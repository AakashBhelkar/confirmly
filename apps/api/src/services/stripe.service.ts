import Stripe from 'stripe';
import { Merchant } from '../models/Merchant';
import { Billing } from '../models/Billing';
import { Plan } from '../models/Plan';
import { AppError } from '../middlewares/error-handler';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
});

export class StripeService {
  /**
   * Create checkout session
   */
  async createCheckoutSession(
    merchantId: string,
    planId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<Stripe.Checkout.Session> {
    const merchant = await Merchant.findById(merchantId);
    if (!merchant) {
      throw new AppError(404, 'MERCHANT_NOT_FOUND', 'Merchant not found');
    }

    const plan = await Plan.findById(planId);
    if (!plan) {
      throw new AppError(404, 'PLAN_NOT_FOUND', 'Plan not found');
    }

    // Create or get Stripe customer
    let customerId: string;
    const billing = await Billing.findOne({ merchantId });

    if (billing?.stripe.customerId) {
      customerId = billing.stripe.customerId;
    } else {
      const customer = await stripe.customers.create({
        email: merchant.ownerUserId ? (await import('../models/User')).User.findById(merchant.ownerUserId).then(u => u?.email) : undefined,
        metadata: {
          merchantId: merchant._id.toString(),
        },
      });
      customerId = customer.id;

      // Save customer ID
      if (billing) {
        billing.stripe.customerId = customerId;
        await billing.save();
      } else {
        await Billing.create({
          merchantId,
          stripe: {
            customerId,
            subscriptionId: '',
            priceId: '',
          },
          status: 'trialing',
          currentPeriodEnd: new Date(),
        });
      }
    }

    // Create price if needed
    let priceId: string;
    try {
      const prices = await stripe.prices.list({
        product: plan._id.toString(),
        active: true,
      });

      if (prices.data.length > 0) {
        priceId = prices.data[0].id;
      } else {
        const price = await stripe.prices.create({
          product: plan._id.toString(),
          unit_amount: plan.price * 100, // Convert to cents
          currency: plan.currency.toLowerCase(),
          recurring: {
            interval: 'month',
          },
        });
        priceId = price.id;
      }
    } catch (error) {
      // Create product first
      const product = await stripe.products.create({
        id: plan._id.toString(),
        name: plan.name,
        description: `Confirmly ${plan.name} Plan`,
      });

      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.price * 100,
        currency: plan.currency.toLowerCase(),
        recurring: {
          interval: 'month',
        },
      });
      priceId = price.id;
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        merchantId: merchant._id.toString(),
        planId: plan._id.toString(),
      },
    });

    return session;
  }

  /**
   * Create customer portal session
   */
  async createPortalSession(merchantId: string, returnUrl: string): Promise<Stripe.BillingPortal.Session> {
    const billing = await Billing.findOne({ merchantId });
    if (!billing || !billing.stripe.customerId) {
      throw new AppError(404, 'BILLING_NOT_FOUND', 'Billing not found');
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: billing.stripe.customerId,
      return_url: returnUrl,
    });

    return session;
  }

  /**
   * Handle webhook event
   */
  async handleWebhook(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await this.handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
    }
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const merchantId = session.metadata?.merchantId;
    if (!merchantId) return;

    const subscriptionId = session.subscription as string;
    const priceId = session.line_items?.data[0]?.price?.id || '';

    const billing = await Billing.findOne({ merchantId });
    if (billing) {
      billing.stripe.subscriptionId = subscriptionId;
      billing.stripe.priceId = priceId;
      billing.status = 'active';
      await billing.save();
    }

    // Update merchant plan
    const merchant = await Merchant.findById(merchantId);
    if (merchant && session.metadata?.planId) {
      const plan = await Plan.findById(session.metadata.planId);
      if (plan) {
        merchant.plan = {
          planId: plan._id.toString(),
          name: plan.name,
          price: plan.price,
          currency: plan.currency,
          limits: plan.limits,
          status: 'active',
        };
        await merchant.save();
      }
    }
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const customerId = subscription.customer as string;
    const billing = await Billing.findOne({ 'stripe.customerId': customerId });
    if (!billing) return;

    billing.status = subscription.status as any;
    billing.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
    await billing.save();

    // Update merchant plan status
    const merchant = await Merchant.findById(billing.merchantId);
    if (merchant) {
      if (subscription.status === 'active') {
        merchant.plan.status = 'active';
      } else if (subscription.status === 'past_due') {
        merchant.plan.status = 'past_due';
      } else if (subscription.status === 'canceled') {
        merchant.plan.status = 'canceled';
      }
      await merchant.save();
    }
  }

  private async handlePaymentSucceeded(invoice: Stripe.Invoice) {
    // Payment succeeded, ensure subscription is active
    const customerId = invoice.customer as string;
    const billing = await Billing.findOne({ 'stripe.customerId': customerId });
    if (billing) {
      billing.status = 'active';
      await billing.save();
    }
  }

  private async handlePaymentFailed(invoice: Stripe.Invoice) {
    // Payment failed, mark as past_due
    const customerId = invoice.customer as string;
    const billing = await Billing.findOne({ 'stripe.customerId': customerId });
    if (billing) {
      billing.status = 'past_due';
      await billing.save();
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): Stripe.Event {
    try {
      return stripe.webhooks.constructEvent(payload, signature, STRIPE_WEBHOOK_SECRET);
    } catch (error: any) {
      throw new AppError(400, 'INVALID_SIGNATURE', 'Invalid webhook signature');
    }
  }
}

export const stripeService = new StripeService();

