'use strict';

const jwt = require('jsonwebtoken');
const env = require('../config/env');
const ROLES = require('./roles');

const HARDCODED_USERS = [
  { email: 'admin@mediease.local', password: 'admin123', role: ROLES.ADMIN },
  { email: 'doctor@mediease.local', password: 'doctor123', role: ROLES.DOCTOR },
  { email: 'nurse@mediease.local', password: 'nurse123', role: ROLES.NURSE },
];

function findUserByCredentials(email, password) {
  return HARDCODED_USERS.find((u) => u.email === email && u.password === password) || null;
}

function login({ email, password, role }) {
  if (!email || !password || !role) {
    throw new Error('email, password, and role are required');
  }

  const user = findUserByCredentials(email, password);
  if (!user) {
    throw new Error('Invalid credentials');
  }

  if (user.role !== role) {
    throw new Error('Role mismatch');
  }

  const payload = {
    sub: user.email,
    role: user.role,
  };

  const token = jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
    issuer: 'mediease-backend',
    audience: 'mediease-clients',
  });

  return { token, user: { email: user.email, role: user.role } };
}

module.exports = { login, ROLES };


