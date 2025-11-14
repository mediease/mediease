import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/userModel.js';

dotenv.config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin', email: process.argv[2] });
    if (existingAdmin) {
      console.log('Admin user already exists with this email');
      process.exit(0);
    }

    // Create admin user
    const admin = new User({
      firstName: process.argv[3] || 'Admin',
      lastName: process.argv[4] || 'User',
      email: process.argv[2],
      password: process.argv[5],
      role: 'admin',
      status: 'approved',
      nic: process.argv[6] || 'ADMIN001'
    });

    await admin.save();
    console.log('Admin user created successfully!');
    console.log('Email:', admin.email);
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error.message);
    process.exit(1);
  }
};

// Usage: node scripts/createAdmin.js <email> <firstName> <lastName> <password> <nic>
if (process.argv.length < 3) {
  console.log('Usage: node scripts/createAdmin.js <email> [firstName] [lastName] [password] [nic]');
  console.log('Example: node scripts/createAdmin.js admin@example.com Admin User admin123 ADMIN001');
  process.exit(1);
}

createAdmin();

