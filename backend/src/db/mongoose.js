'use strict';

const mongoose = require('mongoose');


let isConnected = false;

async function connectToDatabase(mongoUri) {
  if (!mongoUri) {
    throw new Error('MONGODB_URI is required to establish a database connection');
  }

  if (isConnected) {
    return mongoose.connection;
  }

  mongoose.set('strictQuery', true);

  await mongoose.connect(mongoUri, {
    autoIndex: true,
  });

  isConnected = true;
  return mongoose.connection;
}

async function disconnectFromDatabase() {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
  }
}

module.exports = {
  connectToDatabase,
  disconnectFromDatabase,
};


