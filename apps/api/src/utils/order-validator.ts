import { IOrder } from '../models/Order';
import { AppError } from '../middlewares/error-handler';

/**
 * Validate order data
 */
export function validateOrder(order: Partial<IOrder>): void {
  if (!order.merchantId) {
    throw new AppError(400, 'INVALID_ORDER', 'Merchant ID is required');
  }

  if (!order.platformOrderId) {
    throw new AppError(400, 'INVALID_ORDER', 'Platform Order ID is required');
  }

  if (!order.amount || order.amount <= 0) {
    throw new AppError(400, 'INVALID_ORDER', 'Order amount must be greater than 0');
  }

  if (!order.currency) {
    throw new AppError(400, 'INVALID_ORDER', 'Currency is required');
  }

  if (!order.paymentMode || !['cod', 'prepaid'].includes(order.paymentMode)) {
    throw new AppError(400, 'INVALID_ORDER', 'Payment mode must be cod or prepaid');
  }

  if (!order.email && !order.phone) {
    throw new AppError(400, 'INVALID_ORDER', 'Either email or phone is required');
  }

  // Validate email format if provided
  if (order.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(order.email)) {
    throw new AppError(400, 'INVALID_ORDER', 'Invalid email format');
  }

  // Validate phone format if provided (basic validation)
  if (order.phone && !/^\+?[1-9]\d{1,14}$/.test(order.phone.replace(/\s/g, ''))) {
    throw new AppError(400, 'INVALID_ORDER', 'Invalid phone format');
  }
}

/**
 * Validate order status transition
 */
export function validateStatusTransition(currentStatus: string, newStatus: string): void {
  const validTransitions: Record<string, string[]> = {
    pending: ['confirmed', 'unconfirmed', 'canceled'],
    confirmed: ['fulfilled'],
    unconfirmed: ['canceled'],
    canceled: [],
    fulfilled: [],
  };

  const allowed = validTransitions[currentStatus] || [];
  if (!allowed.includes(newStatus)) {
    throw new AppError(
      400,
      'INVALID_STATUS_TRANSITION',
      `Cannot transition from ${currentStatus} to ${newStatus}`
    );
  }
}

