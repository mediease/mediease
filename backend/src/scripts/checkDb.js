'use strict';

const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const env = require('../config/env');
const { connectToDatabase, disconnectFromDatabase } = require('../db/mongoose');

(async () => {
  try {
    const conn = await connectToDatabase(env.mongoUri);
    // eslint-disable-next-line no-console
    console.log('✅ MongoDB connected:', conn.name, `(${conn.host}:${conn.port})`);
    await disconnectFromDatabase();
    process.exit(0);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
})();



