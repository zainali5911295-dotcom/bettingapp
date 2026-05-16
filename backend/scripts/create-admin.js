#!/usr/bin/env node

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from '../src/models/User.js';

dotenv.config();   // .env file load karne ke liye

async function createAdminUser() {
  try {
    const mongoUri = process.env.MONGODB_URI;   // ← Yeh change kiya

    if (!mongoUri) {
      console.error('❌ MONGODB_URI not found in .env file');
      process.exit(1);
    }

    console.log('🔗 Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB Atlas');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@admin.com' });
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      await mongoose.disconnect();
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash('admin123', 10);

    await User.create({
      email: 'admin@admin.com',
      username: 'admin',
      passwordHash,
      role: 'admin',
      referralCode: 'ADMIN',
      balance: 0,
      isActive: true,
    });

    console.log('🎉 Admin user created successfully!');
    console.log('📧 Email: admin@admin.com');
    console.log('🔑 Password: admin123');
    console.log('👑 Role: admin');

  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createAdminUser();