'use strict';

const express = require('express');
const { login } = require('../auth/login');

const router = express.Router();

router.post('/login', (req, res) => {
  const { email, password, role } = req.body || {};
  try {
    const result = login({ email, password, role });
    return res.status(200).json(result);
  } catch (err) {
    if (err && err.message === 'email, password, and role are required') {
      return res.status(400).json({ error: err.message });
    }
    if (err && (err.message === 'Invalid credentials' || err.message === 'Role mismatch')) {
      return res.status(401).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;


