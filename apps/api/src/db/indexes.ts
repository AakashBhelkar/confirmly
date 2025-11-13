import mongoose from 'mongoose';
import { Merchant } from '../models/Merchant';
import { User } from '../models/User';
import { Order } from '../models/Order';
import { Template } from '../models/Template';
import { Policy } from '../models/Policy';
import { Plan } from '../models/Plan';
import { Billing } from '../models/Billing';
import { EventLog } from '../models/EventLog';

/**
 * Ensure all indexes are created
 * This should be called after database connection
 */
export const ensureIndexes = async (): Promise<void> => {
  // Skip if not connected to database (preview mode)
  if (mongoose.connection.readyState === 0) {
    console.warn('⚠️  Skipping index creation (no database connection)');
    return;
  }

  try {
    await Promise.all([
      Merchant.createIndexes(),
      User.createIndexes(),
      Order.createIndexes(),
      Template.createIndexes(),
      Policy.createIndexes(),
      Plan.createIndexes(),
      Billing.createIndexes(),
      EventLog.createIndexes(),
    ]);
    console.log('✅ All database indexes created successfully');
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    // Don't throw in preview mode
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
  }
};

