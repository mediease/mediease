'use strict';

const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const bcrypt = require('bcryptjs');
const env = require('../config/env');
const { connectToDatabase, disconnectFromDatabase } = require('../db/mongoose');
const ROLES = require('../auth/roles');
const User = require('../models/User');

async function ensureUser(email, password, role, name) {
  const existing = await User.findOne({ email });
  if (existing) return existing;
  const passwordHash = await bcrypt.hash(password, 10);
  return User.create({ email, passwordHash, role, name });
}

(async () => {
  try {
    await connectToDatabase(env.mongoUri);
    await ensureUser('admin@mediease.local', 'admin123', ROLES.ADMIN, 'Admin');
    await ensureUser('doctor@mediease.local', 'doctor123', ROLES.DOCTOR, 'Doctor');
    await ensureUser('nurse@mediease.local', 'nurse123', ROLES.NURSE, 'Nurse');
    // eslint-disable-next-line no-console
    console.log('Seeded default users (admin/doctor/nurse).');
    await disconnectFromDatabase();
    process.exit(0);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Seeding failed:', err.message);
    process.exit(1);
  }
})();


