'use strict';

const jwt = require('jsonwebtoken');
const env = require('../config/env');

function authenticateJwt(req, res, next) {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }
  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, env.jwtSecret, {
      issuer: 'mediease-backend',
      audience: 'mediease-clients',
    });
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = authenticateJwt;



