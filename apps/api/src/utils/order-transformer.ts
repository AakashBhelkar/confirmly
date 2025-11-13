import { ShopifyOrder } from '../services/shopify.service';
import { ICustomer, IOrder } from '../models/Order';

/**
 * Transform Shopify order to Confirmly order format
 */
export const transformShopifyOrder = (
  shopifyOrder: ShopifyOrder,
  merchantId: string
): Partial<IOrder> => {
  const customer: ICustomer = {
    name: `${shopifyOrder.customer.first_name} ${shopifyOrder.customer.last_name}`.trim(),
    address: shopifyOrder.customer.default_address?.address1 || '',
    pincode: shopifyOrder.customer.default_address?.zip || '',
    country: shopifyOrder.customer.default_address?.country || 'IN',
  };

  // Determine payment mode based on financial status
  const paymentMode: 'cod' | 'prepaid' = shopifyOrder.financial_status === 'pending' ? 'cod' : 'prepaid';

  return {
    merchantId: merchantId as any,
    platform: 'shopify',
    platformOrderId: shopifyOrder.id.toString(),
    email: shopifyOrder.email,
    phone: shopifyOrder.phone || '',
    customer,
    amount: parseFloat(shopifyOrder.total_price),
    currency: shopifyOrder.currency || 'INR',
    paymentMode,
    status: 'pending',
    confirmations: [],
    autoActions: [],
    meta: {},
  };
};

