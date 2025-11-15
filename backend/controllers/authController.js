import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';

// Generate JWT Token (includes medicalLicenseId when available)
const generateToken = (user) => {
  const payload = {
    userId: user._id
  };

  if (user.medicalLicenseId) {
    payload.medicalLicenseId = user.medicalLicenseId;
  }

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '1d'
  });
};

// Register a new user
export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, confirmPassword, role, nic, medicalLicenseId, division, nurId } = req.body;

    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'password', 'confirmPassword', 'role', 'nic'];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        missingFields: missingFields
      });
    }

    // Validate password match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Validate role
    if (!['doctor', 'nurse'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Only doctors and nurses can register. Admin accounts are created manually.'
      });
    }

    // Validate doctor-specific fields
    if (role === 'doctor') {
      if (!medicalLicenseId) {
        return res.status(400).json({
          success: false,
          message: 'Medical License ID is required for doctor registration'
        });
      }
      if (!division) {
        return res.status(400).json({
          success: false,
          message: 'Division is required for doctor registration'
        });
      }
    }

    // Validate nurse-specific fields
    if (role === 'nurse') {
      if (!nurId) {
        return res.status(400).json({
          success: false,
          message: 'NURID is required for nurse registration'
        });
      }
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { nic: nic }
      ]
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }
      if (existingUser.nic === nic) {
        return res.status(400).json({
          success: false,
          message: 'User with this NIC already exists'
        });
      }
    }

    // Check if medicalLicenseId already exists (for doctors)
    if (role === 'doctor') {
      const existingDoctor = await User.findOne({ medicalLicenseId });
      if (existingDoctor) {
        return res.status(400).json({
          success: false,
          message: 'Doctor with this Medical License ID already exists'
        });
      }
    }

    // Create user
    const userData = {
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      role,
      nic,
      status: 'pending'
    };

    if (role === 'doctor') {
      userData.medicalLicenseId = medicalLicenseId;
      userData.division = division;
    }
    if (role === 'nurse') {
      userData.nurId = nurId;
    }

    const user = new User(userData);
    await user.save();

    // Remove password from response
    const userResponse = user.toJSON();

    res.status(201).json({
      success: true,
      message: 'Registration successful. Your account is pending admin approval.',
      data: userResponse
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }

    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is approved (for doctors and nurses)
    if (user.role !== 'admin' && user.status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Your account is pending approval. Please wait for admin approval.'
      });
    }

    // Generate token
    const token = generateToken(user);

    // Remove password from response
    const userResponse = user.toJSON();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

