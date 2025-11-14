import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

export const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from token
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is approved (for doctors and nurses)
    // Admins are always allowed, but doctors and nurses must be approved
    if (user.role !== 'admin' && user.status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Account not approved by admin'
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: error.message
    });
  }
};

