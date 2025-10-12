'use strict';

const http = require('http');
const createApp = require('./app');
const env = require('./config/env');
const { connectToDatabase } = require('./db/mongoose');

async function bootstrap() {
  const app = createApp();

  if (env.mongoUri) {
    await connectToDatabase(env.mongoUri);
  } else {
    // eslint-disable-next-line no-console
    console.warn('MONGODB_URI not set. Starting server without database connection.');
  }

  const server = http.createServer(app);

  server.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on port ${env.port} (${env.nodeEnv})`);
  });

  return server;
}

if (require.main === module) {
  bootstrap().catch((error) => {
    // eslint-disable-next-line no-console
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}

module.exports = { bootstrap };


