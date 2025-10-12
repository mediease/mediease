'use strict';

const express = require('express');
const applySecurityMiddlewares = require('./middleware/security');
const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');

function createApp() {
  const app = express();

  app.disable('x-powered-by');
  applySecurityMiddlewares(app);
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use('/auth', authRoutes);
  app.use('/patients', patientRoutes);

  return app;
}

module.exports = createApp;


