/**
 * Seed script for local dummy data
 * Creates admin user, merchants, users, orders, templates, and policies
 * Usage: tsx src/scripts/seed-dummy-data.ts
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { Merchant } from '../models/Merchant';
import { Order } from '../models/Order';
import { Plan } from '../models/Plan';
import { Template } from '../models/Template';
import { Policy } from '../models/Policy';
import { hashPassword } from '../utils/password';
import { ensureIndexes } from '../db/indexes';

// Load environment variables
dotenv.config();

const createAdminUser = async () => {
  // Check if admin already exists
  const existingAdmin = await User.findOne({ role: 'superadmin' });
  if (existingAdmin) {
    console.log('⚠️  Admin user already exists:', existingAdmin.email);
    return existingAdmin;
  }

  const passwordHash = await hashPassword('Admin123!');
  const admin = await User.create({
    email: 'admin@confirmly.com',
    name: 'Super Admin',
    role: 'superadmin',
    passwordHash,
  });

  console.log('✅ Admin user created:', admin.email);
  return admin;
};

const createPlans = async () => {
  const existingPlans = await Plan.find();
  if (existingPlans.length > 0) {
    console.log('⚠️  Plans already exist, skipping');
    return existingPlans;
  }

  const plans = [
    {
      name: 'Starter',
      price: 0,
      currency: 'INR',
      limits: { ordersPerMonth: 1000, messagesPerMonth: 2000 },
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
      limits: { ordersPerMonth: 10000, messagesPerMonth: 20000 },
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
      limits: { ordersPerMonth: 100000, messagesPerMonth: 200000 },
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
  console.log('✅ Plans created:', createdPlans.map((p) => p.name).join(', '));
  return createdPlans;
};

const createMerchants = async (plans: any[]) => {
  const existingMerchants = await Merchant.find();
  if (existingMerchants.length > 0) {
    console.log('⚠️  Merchants already exist, skipping');
    return existingMerchants;
  }

  const starterPlan = plans.find((p) => p.name === 'Starter');
  const proPlan = plans.find((p) => p.name === 'Professional');

  // Create merchants first with temporary ownerUserId (we'll update after creating owners)
  const tempOwnerId1 = new mongoose.Types.ObjectId();
  const tempOwnerId2 = new mongoose.Types.ObjectId();

  const merchants = [
    {
      name: 'Fashion Store',
      slug: 'fashion-store',
      ownerUserId: tempOwnerId1,
      domains: ['fashionstore.com'],
      plan: {
        planId: starterPlan?._id.toString() || '',
        name: starterPlan?.name || 'Starter',
        price: starterPlan?.price || 0,
        currency: 'INR',
        limits: starterPlan?.limits || { ordersPerMonth: 1000, messagesPerMonth: 2000 },
        status: 'trial' as const,
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      },
      settings: {
        confirmCODOnly: true,
        confirmPrepaid: false,
        confirmWindowHours: 24,
        autoCancelUnconfirmed: false,
        locale: 'en-IN',
      },
    },
    {
      name: 'Electronics Hub',
      slug: 'electronics-hub',
      ownerUserId: tempOwnerId2,
      domains: ['electronicshub.in'],
      plan: {
        planId: proPlan?._id.toString() || '',
        name: proPlan?.name || 'Professional',
        price: proPlan?.price || 2999,
        currency: 'INR',
        limits: proPlan?.limits || { ordersPerMonth: 10000, messagesPerMonth: 20000 },
        status: 'active' as const,
      },
      settings: {
        confirmCODOnly: true,
        confirmPrepaid: true,
        confirmWindowHours: 48,
        autoCancelUnconfirmed: true,
        locale: 'en-IN',
      },
    },
  ];

  const createdMerchants = await Merchant.insertMany(merchants);
  console.log('✅ Merchants created:', createdMerchants.map((m) => m.name).join(', '));

  // Now create owners with merchantId
  const owner1Password = await hashPassword('Password123!');
  const owner1 = await User.create({
    email: 'owner1@example.com',
    name: 'Rajesh Kumar',
    role: 'owner',
    merchantId: createdMerchants[0]._id,
    passwordHash: owner1Password,
  });

  const owner2Password = await hashPassword('Password123!');
  const owner2 = await User.create({
    email: 'owner2@example.com',
    name: 'Priya Sharma',
    role: 'owner',
    merchantId: createdMerchants[1]._id,
    passwordHash: owner2Password,
  });

  // Update merchants with correct ownerUserId
  await Merchant.updateOne({ _id: createdMerchants[0]._id }, { ownerUserId: owner1._id });
  await Merchant.updateOne({ _id: createdMerchants[1]._id }, { ownerUserId: owner2._id });

  // Create team members
  const member1Password = await hashPassword('Password123!');
  await User.create({
    email: 'member1@fashionstore.com',
    name: 'Amit Singh',
    role: 'admin',
    merchantId: createdMerchants[0]._id,
    passwordHash: member1Password,
  });

  const member2Password = await hashPassword('Password123!');
  await User.create({
    email: 'member2@electronicshub.in',
    name: 'Sneha Patel',
    role: 'member',
    merchantId: createdMerchants[1]._id,
    passwordHash: member2Password,
  });

  console.log('✅ Team members created');

  return createdMerchants;
};

const createOrders = async (merchants: any[]) => {
  const existingOrders = await Order.find();
  if (existingOrders.length > 0) {
    console.log('⚠️  Orders already exist, skipping');
    return existingOrders;
  }

  const orders = [];
  const statuses: Array<'pending' | 'confirmed' | 'unconfirmed' | 'canceled' | 'fulfilled'> = [
    'pending',
    'confirmed',
    'unconfirmed',
    'canceled',
    'fulfilled',
  ];

  // Create orders for first merchant
  for (let i = 0; i < 15; i++) {
    const status = statuses[i % statuses.length];
    const isCOD = i % 2 === 0;
    const riskScore = Math.floor(Math.random() * 100);

    const order: any = {
      merchantId: merchants[0]._id,
      platform: 'shopify' as const,
      platformOrderId: `SHOP-${1000 + i}`,
      email: `customer${i}@example.com`,
      phone: `+91${9000000000 + i}`,
      customer: {
        name: `Customer ${i + 1}`,
        address: `${i + 1} Main Street, Area ${i + 1}`,
        pincode: `${400000 + i}`,
        country: 'IN',
      },
      amount: Math.floor(Math.random() * 5000) + 500,
      currency: 'INR',
      paymentMode: isCOD ? 'cod' : 'prepaid',
      status,
      riskScore,
      confirmations: [],
      autoActions: [],
      meta: {
        sourceTags: ['organic', 'social'],
      },
      createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000), // Spread over last 15 days
    };

    // Add confirmations for some orders
    if (status === 'confirmed' || status === 'unconfirmed') {
      order.confirmations = [
        {
          channel: 'whatsapp' as const,
          status: status === 'confirmed' ? 'replied' : 'sent',
          reply: status === 'confirmed' ? 'yes' : undefined,
          timestamps: {
            sent: new Date(Date.now() - (i + 1) * 60 * 60 * 1000),
            delivered: status === 'confirmed' ? new Date(Date.now() - i * 60 * 60 * 1000) : undefined,
            replied: status === 'confirmed' ? new Date(Date.now() - (i - 1) * 60 * 60 * 1000) : undefined,
          },
          messageId: `msg-${i}`,
        },
      ];
    }

    orders.push(order);
  }

  // Create orders for second merchant
  for (let i = 0; i < 10; i++) {
    const status = statuses[i % statuses.length];
    const isCOD = i % 3 === 0;
    const riskScore = Math.floor(Math.random() * 100);

    const order: any = {
      merchantId: merchants[1]._id,
      platform: 'api' as const,
      platformOrderId: `API-${2000 + i}`,
      email: `buyer${i}@example.com`,
      phone: `+91${8000000000 + i}`,
      customer: {
        name: `Buyer ${i + 1}`,
        address: `${i + 10} Tech Park, Sector ${i + 1}`,
        pincode: `${500000 + i}`,
        country: 'IN',
      },
      amount: Math.floor(Math.random() * 10000) + 1000,
      currency: 'INR',
      paymentMode: isCOD ? 'cod' : 'prepaid',
      status,
      riskScore,
      confirmations: [],
      autoActions: [],
      meta: {
        sourceTags: ['paid', 'organic'],
      },
      createdAt: new Date(Date.now() - i * 12 * 60 * 60 * 1000), // Spread over last 10 days
    };

    if (status === 'confirmed') {
      order.confirmations = [
        {
          channel: 'whatsapp' as const,
          status: 'replied',
          reply: 'yes',
          timestamps: {
            sent: new Date(Date.now() - (i + 1) * 60 * 60 * 1000),
            delivered: new Date(Date.now() - i * 60 * 60 * 1000),
            replied: new Date(Date.now() - (i - 1) * 60 * 60 * 1000),
          },
          messageId: `msg-${20 + i}`,
        },
      ];
    }

    orders.push(order);
  }

  const createdOrders = await Order.insertMany(orders);
  console.log(`✅ Created ${createdOrders.length} orders`);
  return createdOrders;
};

const createTemplates = async (merchants: any[]) => {
  const existingTemplates = await Template.find();
  if (existingTemplates.length > 0) {
    console.log('⚠️  Templates already exist, skipping');
    return existingTemplates;
  }

  const templates = [
    {
      merchantId: merchants[0]._id,
      channel: 'whatsapp' as const,
      name: 'Order Confirmation',
      variant: 'A' as const,
      content:
        'Hi {{customerName}}, your order #{{orderId}} of ₹{{amount}} is confirmed! We will deliver to {{address}} within 24 hours.',
      variables: ['customerName', 'orderId', 'amount', 'address'],
      status: 'active' as const,
    },
    {
      merchantId: merchants[0]._id,
      channel: 'whatsapp' as const,
      name: 'Order Confirmation',
      variant: 'B' as const,
      content:
        'Hello {{customerName}}! Great news - your order #{{orderId}} worth ₹{{amount}} is ready for delivery to {{address}}.',
      variables: ['customerName', 'orderId', 'amount', 'address'],
      status: 'active' as const,
    },
    {
      merchantId: merchants[0]._id,
      channel: 'sms' as const,
      name: 'Order Reminder',
      variant: 'A' as const,
      content: 'Your order #{{orderId}} is pending confirmation. Please reply YES to confirm delivery.',
      variables: ['orderId'],
      status: 'active' as const,
    },
    {
      merchantId: merchants[1]._id,
      channel: 'whatsapp' as const,
      name: 'Order Confirmation',
      variant: 'A' as const,
      content:
        'Hi {{customerName}}, your order #{{orderId}} of ₹{{amount}} is confirmed! Delivery to {{address}} in 48 hours.',
      variables: ['customerName', 'orderId', 'amount', 'address'],
      status: 'active' as const,
    },
    {
      merchantId: merchants[1]._id,
      channel: 'email' as const,
      name: 'Order Confirmation Email',
      variant: 'A' as const,
      content:
        'Dear {{customerName}},\n\nYour order #{{orderId}} for ₹{{amount}} has been confirmed.\n\nDelivery Address: {{address}}\n\nThank you for shopping with us!',
      variables: ['customerName', 'orderId', 'amount', 'address'],
      status: 'active' as const,
    },
  ];

  const createdTemplates = await Template.insertMany(templates);
  console.log(`✅ Created ${createdTemplates.length} templates`);
  return createdTemplates;
};

const createPolicies = async (merchants: any[]) => {
  const existingPolicies = await Policy.find();
  if (existingPolicies.length > 0) {
    console.log('⚠️  Policies already exist, skipping');
    return existingPolicies;
  }

  const policies = [
    {
      merchantId: merchants[0]._id,
      rules: [
        {
          key: 'paymentMode',
          operator: 'equals' as const,
          value: 'cod',
          effect: 'confirm' as const,
        },
        {
          key: 'amount',
          operator: 'greater_than' as const,
          value: 5000,
          effect: 'confirm' as const,
        },
        {
          key: 'riskScore',
          operator: 'greater_than' as const,
          value: 70,
          effect: 'cancel' as const,
        },
      ],
    },
    {
      merchantId: merchants[1]._id,
      rules: [
        {
          key: 'paymentMode',
          operator: 'equals' as const,
          value: 'cod',
          effect: 'confirm' as const,
        },
        {
          key: 'amount',
          operator: 'greater_than' as const,
          value: 10000,
          effect: 'confirm' as const,
        },
      ],
    },
  ];

  const createdPolicies = await Policy.insertMany(policies);
  console.log(`✅ Created ${createdPolicies.length} policies`);
  return createdPolicies;
};

const seedDatabase = async () => {
  try {
    // Connect to database
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/confirmly';
    if (!mongoUri) {
      console.error('❌ MONGO_URI not found in environment variables');
      console.error('   Using default: mongodb://localhost:27017/confirmly');
    }

    console.log('🔌 Connecting to MongoDB...');
    console.log('   URI:', mongoUri.replace(/\/\/.*@/, '//***:***@')); // Hide credentials
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Create indexes
    console.log('📊 Creating database indexes...');
    try {
      await ensureIndexes();
      console.log('✅ Database indexes created');
    } catch (error: any) {
      // Index errors are often just warnings about duplicates, continue anyway
      if (error.codeName === 'IndexKeySpecsConflict' || error.message?.includes('existing index')) {
        console.log('⚠️  Some indexes already exist (this is OK)');
      } else {
        console.error('⚠️  Error creating indexes:', error.message);
      }
    }

    // Create plans
    console.log('📦 Creating plans...');
    const plans = await createPlans();

    // Create admin user
    console.log('👤 Creating admin user...');
    await createAdminUser();

    // Create merchants
    console.log('🏪 Creating merchants...');
    const merchants = await createMerchants(plans);

    // Create orders
    console.log('📦 Creating orders...');
    await createOrders(merchants);

    // Create templates
    console.log('📝 Creating templates...');
    await createTemplates(merchants);

    // Create policies
    console.log('📋 Creating policies...');
    await createPolicies(merchants);

    console.log('');
    console.log('🎉 Database seeded successfully!');
    console.log('');
    console.log('📋 Summary:');
    console.log('   ✅ Plans created');
    console.log('   ✅ Admin user created');
    console.log('   ✅ Merchants created');
    console.log('   ✅ Users created');
    console.log('   ✅ Orders created');
    console.log('   ✅ Templates created');
    console.log('   ✅ Policies created');
    console.log('');
    console.log('🔑 Login Credentials:');
    console.log('   Admin: admin@confirmly.com / Admin123!');
    console.log('   Owner 1: owner1@example.com / Password123!');
    console.log('   Owner 2: owner2@example.com / Password123!');
    console.log('   Member 1: member1@fashionstore.com / Password123!');
    console.log('   Member 2: member2@electronicshub.in / Password123!');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error seeding database:', error);
    if (error.message) {
      console.error('   Error message:', error.message);
    }
    await mongoose.disconnect();
    process.exit(1);
  }
};

// Run the seed
seedDatabase();


