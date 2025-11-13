/**
 * Seed script to create a superadmin account
 * Usage: tsx src/scripts/seed-admin.ts
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { hashPassword } from '../utils/password';

// Load environment variables
dotenv.config();

const createSuperAdmin = async () => {
  try {
    // Connect to database
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('❌ MONGO_URI not found in environment variables');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Check if superadmin already exists
    const existingAdmin = await User.findOne({ role: 'superadmin' });
    if (existingAdmin) {
      console.log('⚠️  Superadmin already exists:', existingAdmin.email);
      console.log('   To create a new one, delete the existing superadmin first');
      await mongoose.disconnect();
      process.exit(0);
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
    console.log('');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('👤 Name:', name);
    console.log('🆔 User ID:', superadmin._id.toString());
    console.log('');
    console.log('⚠️  Please change the password after first login!');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating superadmin:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

// Run the script
createSuperAdmin();

