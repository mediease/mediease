'use strict';

const mongoose = require('mongoose');
const ROLES = require('../auth/roles');

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: Object.values(ROLES), required: true },
    name: { type: String },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

module.exports = User;


