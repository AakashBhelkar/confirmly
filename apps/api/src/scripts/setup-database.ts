/**
 * Complete database setup script
 * Creates default plans and superadmin account
 * Usage: tsx src/scripts/setup-database.ts
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { Plan } from '../models/Plan';
import { hashPassword } from '../utils/password';
import { ensureIndexes } from '../db/indexes';

// Load environment variables
dotenv.config();

const createDefaultPlans = async () => {
  // Check if plans already exist
  const existingPlans = await Plan.find();
  if (existingPlans.length > 0) {
    console.log('⚠️  Plans already exist, skipping plan creation');
    return existingPlans;
  }

  const plans = [
    {
      name: 'Starter',
      price: 0,
      currency: 'INR',
      limits: {
        ordersPerMonth: 1000,
        messagesPerMonth: 2000,
      },
      features: [
        'Basic RTO reduction',
        'WhatsApp confirmations',
        'Email confirmations',
        'Basic analytics',
        '14-day free trial',
      ],
      public: true,
      sort: 1,
    },
    {
      name: 'Professional',
      price: 2999,
      currency: 'INR',
      limits: {
        ordersPerMonth: 10000,
        messagesPerMonth: 20000,
      },
      features: [
        'Advanced RTO reduction',
        'WhatsApp + SMS confirmations',
        'AI risk scoring',
        'Advanced analytics',
        'Custom templates',
        'Priority support',
      ],
      public: true,
      sort: 2,
    },
    {
      name: 'Enterprise',
      price: 9999,
      currency: 'INR',
      limits: {
        ordersPerMonth: 100000,
        messagesPerMonth: 200000,
      },
      features: [
        'Unlimited RTO reduction',
        'All channels (WhatsApp, SMS, Email)',
        'Advanced AI risk scoring',
        'Custom ML models',
        'Dedicated support',
        'API access',
        'White-label options',
      ],
      public: true,
      sort: 3,
    },
  ];

  const createdPlans = await Plan.insertMany(plans);
  console.log('✅ Created default plans:', createdPlans.map((p) => p.name).join(', '));
  return createdPlans;
};

const createSuperAdmin = async () => {
  // Check if superadmin already exists
  const existingAdmin = await User.findOne({ role: 'superadmin' });
  if (existingAdmin) {
    console.log('⚠️  Superadmin already exists:', existingAdmin.email);
    return existingAdmin;
  }

  // Default superadmin credentials
  const email = process.env.SUPERADMIN_EMAIL || 'admin@confirmly.com';
  const password = process.env.SUPERADMIN_PASSWORD || 'Admin123!';
  const name = process.env.SUPERADMIN_NAME || 'Super Admin';

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create superadmin user
  const superadmin = await User.create({
    email,
    name,
    role: 'superadmin',
    passwordHash,
    // merchantId is not required for superadmin
  });

  console.log('✅ Superadmin created successfully!');
  console.log('   📧 Email:', email);
  console.log('   🔑 Password:', password);
  console.log('   👤 Name:', name);
  console.log('   🆔 User ID:', superadmin._id.toString());
  console.log('');
  console.log('⚠️  Please change the password after first login!');
  
  return superadmin;
};

const setupDatabase = async () => {
  try {
    // Connect to database
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('❌ MONGO_URI not found in environment variables');
      console.error('   Please set MONGO_URI in apps/api/.env');
      process.exit(1);
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Create indexes
    console.log('📊 Creating database indexes...');
    await ensureIndexes();
    console.log('✅ Database indexes created');

    // Create default plans
    console.log('📦 Creating default plans...');
    await createDefaultPlans();

    // Create superadmin
    console.log('👤 Creating superadmin account...');
    await createSuperAdmin();

    console.log('');
    console.log('🎉 Database setup completed successfully!');
    console.log('');
    console.log('📋 Summary:');
    console.log('   ✅ Database connected');
    console.log('   ✅ Indexes created');
    console.log('   ✅ Default plans created');
    console.log('   ✅ Superadmin account created');
    console.log('');
    console.log('🚀 You can now start the API server and login with:');
    console.log('   Email: admin@confirmly.com');
    console.log('   Password: Admin123!');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error setting up database:', error);
    if (error.message) {
      console.error('   Error message:', error.message);
    }
    await mongoose.disconnect();
    process.exit(1);
  }
};

// Run the setup
setupDatabase();

