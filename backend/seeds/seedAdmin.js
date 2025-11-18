import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/user.model.js';
import connectDB from '../config/db.js';

// Load environment variables
dotenv.config();

/**
 * Seed admin user
 */
const seedAdmin = async () => {
  try {
    // Connect to database
    await connectDB();

    // Check if admin already exists
    const existingAdmin = await User.findOne({ 
      email: process.env.ADMIN_EMAIL || 'admin@hospital.com' 
    });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists');
      console.log(`Email: ${existingAdmin.email}`);
      console.log(`Role: ${existingAdmin.role}`);
      console.log(`Status: ${existingAdmin.status}`);
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      firstName: process.env.ADMIN_FIRST_NAME || 'System',
      lastName: process.env.ADMIN_LAST_NAME || 'Administrator',
      email: process.env.ADMIN_EMAIL || 'admin@hospital.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@123',
      role: 'admin',
      status: 'approved' // Admin is auto-approved
    });

    console.log('✅ Admin user created successfully!');
    console.log('\n📋 Admin Credentials:');
    console.log(`Email: ${admin.email}`);
    console.log(`Password: ${process.env.ADMIN_PASSWORD || 'Admin@123'}`);
    console.log(`Role: ${admin.role}`);
    console.log(`Status: ${admin.status}`);
    console.log('\n⚠️  Please change the admin password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin user:', error.message);
    process.exit(1);
  }
};

// Run seeder
seedAdmin();
