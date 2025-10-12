'use strict';

const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');

function applySecurityMiddlewares(app) {
  app.use(helmet());
  app.use(cors());
  app.use(compression());
}

module.exports = applySecurityMiddlewares;



