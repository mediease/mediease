import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

/**
 * Protect routes - verify JWT token
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token (excluding password)
      req.user = await User.findById(decoded.userId).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token invalid or expired'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: error.message
    });
  }
};

/**
 * Generate JWT token
 * @param {string} userId - User ID
 * @param {string} role - User role
 * @param {string} email - User email
 * @param {string} medicalLicenseId - Medical license ID (for doctors)
 * @param {string} nurId - Nurse ID (for nurses)
 * @returns {string} JWT token
 */
export const generateToken = (userId, role, email, medicalLicenseId = null, nurId = null) => {
  const payload = {
    userId,
    role,
    email
  };

  if (role === 'doctor' && medicalLicenseId) {
    payload.medicalLicenseId = medicalLicenseId;
  }

  if (role === 'nurse' && nurId) {
    payload.nurId = nurId;
  }

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};
