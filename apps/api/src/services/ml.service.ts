import axios from 'axios';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000';
const ML_API_KEY = process.env.ML_API_KEY || '';

export interface OrderFeatures {
  amount: number;
  currency: string;
  paymentMode: 'cod' | 'prepaid';
  customer: {
    name: string;
    address: string;
    pincode: string;
    country: string;
  };
  email: string;
  phone: string;
}

export class MLService {
  /**
   * Score order for risk
   */
  async scoreOrder(order: OrderFeatures): Promise<number> {
    try {
      const response = await axios.post(
        `${ML_SERVICE_URL}/score`,
        order,
        {
          headers: {
            'Content-Type': 'application/json',
            ...(ML_API_KEY && { 'X-API-Key': ML_API_KEY }),
          },
        }
      );

      return response.data.riskScore || 50; // Default risk score
    } catch (error) {
      console.error('ML service error:', error);
      // Return default risk score if ML service fails
      return 50;
    }
  }
}

export const mlService = new MLService();

