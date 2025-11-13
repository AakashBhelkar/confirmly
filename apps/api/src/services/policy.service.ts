import { Order, IOrder } from '../models/Order';
import { Policy, IPolicy, IPolicyRule } from '../models/Policy';
import { AppError } from '../middlewares/error-handler';

export class PolicyService {
  /**
   * Evaluate policy rules against an order
   */
  evaluatePolicy(order: IOrder, policy: IPolicy): boolean {
    if (!policy.rules || policy.rules.length === 0) {
      return true; // No rules means allow
    }

    // Evaluate each rule
    for (const rule of policy.rules) {
      const matches = this.evaluateRule(order, rule);

      if (matches) {
        // Rule matched, apply effect
        if (rule.effect === 'confirm') {
          return true;
        } else if (rule.effect === 'skip') {
          return false;
        } else if (rule.effect === 'cancel') {
          return false;
        }
      }
    }

    // No rules matched, default behavior
    return true;
  }

  /**
   * Evaluate a single rule against an order
   */
  private evaluateRule(order: IOrder, rule: IPolicyRule): boolean {
    const value = this.getOrderValue(order, rule.key);

    switch (rule.operator) {
      case 'equals':
        return value === rule.value;

      case 'not_equals':
        return value !== rule.value;

      case 'greater_than':
        return Number(value) > Number(rule.value);

      case 'less_than':
        return Number(value) < Number(rule.value);

      case 'contains':
        return String(value).includes(String(rule.value));

      case 'in':
        return Array.isArray(rule.value) && rule.value.includes(value);

      default:
        return false;
    }
  }

  /**
   * Get value from order by key
   */
  private getOrderValue(order: IOrder, key: string): any {
    const keys = key.split('.');
    let value: any = order;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return undefined;
      }
    }

    return value;
  }

  /**
   * Create or update policy
   */
  async savePolicy(merchantId: string, rules: IPolicyRule[]): Promise<IPolicy> {
    let policy = await Policy.findOne({ merchantId });

    if (policy) {
      policy.rules = rules;
      await policy.save();
    } else {
      policy = await Policy.create({
        merchantId,
        rules,
      });
    }

    return policy;
  }

  /**
   * Get policy for merchant
   */
  async getPolicy(merchantId: string): Promise<IPolicy | null> {
    return Policy.findOne({ merchantId });
  }

  /**
   * Delete policy
   */
  async deletePolicy(merchantId: string): Promise<void> {
    await Policy.deleteOne({ merchantId });
  }

  /**
   * Test policy with sample order data
   */
  async testPolicy(merchantId: string, orderData: any): Promise<{ effect: string; matchedRules: IPolicyRule[] }> {
    const policy = await this.getPolicy(merchantId);
    if (!policy || !policy.rules || policy.rules.length === 0) {
      return {
        effect: 'confirm',
        matchedRules: [],
      };
    }

    const matchedRules: IPolicyRule[] = [];
    let effect = 'confirm'; // Default effect

    // Create a mock order object from orderData
    const mockOrder: Partial<IOrder> = {
      riskScore: orderData.riskScore,
      amount: orderData.amount,
      paymentMode: orderData.paymentMode,
      customer: {
        city: orderData.customerCity,
      },
      // Add other fields as needed
    } as Partial<IOrder>;

    // Evaluate each rule
    for (const rule of policy.rules) {
      const matches = this.evaluateRule(mockOrder as IOrder, rule);
      if (matches) {
        matchedRules.push(rule);
        // First matching rule determines effect
        if (effect === 'confirm') {
          effect = rule.effect;
        }
      }
    }

    return {
      effect,
      matchedRules,
    };
  }
}

export const policyService = new PolicyService();

