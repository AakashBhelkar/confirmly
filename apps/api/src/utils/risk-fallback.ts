import { IOrder } from '../models/Order';

/**
 * Calculate risk score using rule-based fallback when ML service is unavailable
 */
export function calculateRuleBasedRiskScore(order: IOrder): number {
  let score = 0;

  // Payment mode factor (COD is higher risk)
  if (order.paymentMode === 'cod') {
    score += 30;
  } else {
    score += 10;
  }

  // Order amount factor (higher amounts = higher risk)
  if (order.amount > 10000) {
    score += 25;
  } else if (order.amount > 5000) {
    score += 15;
  } else if (order.amount > 2000) {
    score += 10;
  } else {
    score += 5;
  }

  // Customer location factor (high-risk cities)
  const highRiskCities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai'];
  const customerCity = order.customer?.city || '';
  if (highRiskCities.some((city) => customerCity.toLowerCase().includes(city.toLowerCase()))) {
    score += 15;
  } else {
    score += 5;
  }

  // Time of day factor (late night orders = higher risk)
  const orderHour = new Date(order.createdAt).getHours();
  if (orderHour >= 22 || orderHour <= 6) {
    score += 10;
  }

  // Customer data completeness
  if (!order.email && !order.phone) {
    score += 20;
  } else if (!order.email || !order.phone) {
    score += 10;
  }

  // Ensure score is between 0-100
  return Math.min(100, Math.max(0, score));
}

/**
 * Get risk band from score
 */
export function getRiskBand(score: number): 'low' | 'medium' | 'high' {
  if (score < 40) {
    return 'low';
  } else if (score < 70) {
    return 'medium';
  } else {
    return 'high';
  }
}

