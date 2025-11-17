import asyncHandler from 'express-async-handler';
import User from '../models/user.model.js';
import FHIRPractitioner from '../models/fhirPractitioner.model.js';
import { generateToken } from '../middleware/authMiddleware.js';
import { createFHIRPractitionerDoctor, createFHIRPractitionerNurse } from '../utils/fhirHelpers.js';

/**
 * @desc    Register a new user (doctor or nurse)
 * @route   POST /auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, confirmPassword, role, medicalLicenseId, nurId, nic, division } = req.body;

  // Validate required fields
  if (!firstName || !lastName || !email || !password || !confirmPassword || !role || !nic) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required fields'
    });
  }

  // Validate role
  if (!['doctor', 'nurse'].includes(role)) {
    return res.status(400).json({
      success: false,
      message: 'Role must be either doctor or nurse'
    });
  }

  // Validate password match
  if (password !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: 'Passwords do not match'
    });
  }

  // Check if doctor and validate medical license
  if (role === 'doctor' && !medicalLicenseId) {
    return res.status(400).json({
      success: false,
      message: 'Medical License ID is required for doctors'
    });
  }

  // Check if nurse and validate nurId
  if (role === 'nurse' && !nurId) {
    return res.status(400).json({
      success: false,
      message: 'Nurse ID is required for nurses'
    });
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User with this email already exists'
    });
  }

  // Check if medical license already exists (for doctors)
  if (role === 'doctor') {
    const existingLicense = await User.findOne({ medicalLicenseId });
    if (existingLicense) {
      return res.status(400).json({
        success: false,
        message: 'Medical License ID already registered'
      });
    }
  }

  // Check if nurId already exists (for nurses)
  if (role === 'nurse') {
    const existingNurId = await User.findOne({ nurId });
    if (existingNurId) {
      return res.status(400).json({
        success: false,
        message: 'Nurse ID already registered'
      });
    }
  }

  // Create user
  const userData = {
    firstName,
    lastName,
    email,
    password,
    role,
    nic,
    status: 'pending'
  };

  if (role === 'doctor') {
    userData.medicalLicenseId = medicalLicenseId;
    if (division) {
      userData.division = division;
    }
  }

  if (role === 'nurse') {
    userData.nurId = nurId;
  }

  const user = await User.create(userData);

  res.status(201).json({
    success: true,
    message: `${role.charAt(0).toUpperCase() + role.slice(1)} registered successfully. Awaiting admin approval.`,
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        status: user.status,
        ...(role === 'doctor' && { medicalLicenseId: user.medicalLicenseId }),
        ...(role === 'nurse' && { nurId: user.nurId })
      }
    }
  });
});

/**
 * @desc    Login user
 * @route   POST /auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  const { email, nurId, password } = req.body;

  // Validate input
  if ((!email && !nurId) || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide (email or nurId) and password'
    });
  }

  // Find user by email or nurId
  const user = await User.findOne(nurId ? { nurId } : { email });

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Check if user is approved (only for doctors and nurses, admins can always login)
  if (user.role !== 'admin' && user.status !== 'approved') {
    return res.status(403).json({
      success: false,
      message: `Your account is ${user.status}. Please wait for admin approval.`
    });
  }

  // Generate token
  const token = generateToken(
    user._id,
    user.role,
    user.email,
    user.medicalLicenseId,
    user.nurId
  );

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        status: user.status,
        ...(user.role === 'doctor' && { medicalLicenseId: user.medicalLicenseId }),
        ...(user.role === 'nurse' && user.nurId && { nurId: user.nurId })
      }
    }
  });
});

/**
 * @desc    Approve doctor by medical license ID
 * @route   PUT /admin/approve/doctor/:medicalLicenseId
 * @access  Private/Admin
 */
export const approveDoctor = asyncHandler(async (req, res) => {
  const { medicalLicenseId } = req.params;

  const user = await User.findOne({ medicalLicenseId, role: 'doctor' });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Doctor not found with this medical license ID'
    });
  }

  if (user.status === 'approved') {
    return res.status(400).json({
      success: false,
      message: 'Doctor is already approved'
    });
  }

  // Update user status
  user.status = 'approved';
  await user.save();

  // Create FHIR Practitioner resource
  const fhirResource = createFHIRPractitionerDoctor({
    firstName: user.firstName,
    lastName: user.lastName,
    medicalLicenseId: user.medicalLicenseId,
    nic: user.nic,
    division: user.division
  });

  const practitioner = await FHIRPractitioner.create({
    role: 'doctor',
    medicalLicenseId: user.medicalLicenseId,
    resource: fhirResource,
    firstName: user.firstName,
    lastName: user.lastName,
    nic: user.nic,
    division: user.division
  });

  res.json({
    success: true,
    message: 'Doctor approved successfully',
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        status: user.status,
        medicalLicenseId: user.medicalLicenseId
      },
      practitioner: {
        id: practitioner._id,
        resource: practitioner.resource
      }
    }
  });
});

/**
 * @desc    Approve nurse by nurId
 * @route   PUT /admin/approve/nurse/:nurId
 * @access  Private/Admin
 */
export const approveNurse = asyncHandler(async (req, res) => {
  const { nurId } = req.params;

  const user = await User.findOne({ nurId, role: 'nurse' });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Nurse not found with this ID'
    });
  }

  if (user.status === 'approved') {
    return res.status(400).json({
      success: false,
      message: 'Nurse is already approved'
    });
  }

  // Update user status only
  user.status = 'approved';
  await user.save();

  // Create FHIR Practitioner resource
  const fhirResource = createFHIRPractitionerNurse({
    firstName: user.firstName,
    lastName: user.lastName,
    nurId: user.nurId,
    nic: user.nic
  });

  const practitioner = await FHIRPractitioner.create({
    role: 'nurse',
    nurId: user.nurId,
    resource: fhirResource,
    firstName: user.firstName,
    lastName: user.lastName,
    nic: user.nic
  });

  res.json({
    success: true,
    message: 'Nurse approved successfully',
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        status: user.status,
        nurId: user.nurId
      },
      practitioner: {
        id: practitioner._id,
        resource: practitioner.resource
      }
    }
  });
});

/**
 * @desc    Reject user (doctor or nurse)
 * @route   PUT /admin/reject/:userId
 * @access  Private/Admin
 */
export const rejectUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  if (user.role === 'admin') {
    return res.status(400).json({
      success: false,
      message: 'Cannot reject admin users'
    });
  }

  user.status = 'rejected';
  await user.save();

  res.json({
    success: true,
    message: `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} rejected`,
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        status: user.status
      }
    }
  });
});

/**
 * @desc    Get all pending users (for admin approval)
 * @route   GET /admin/pending-users
 * @access  Private/Admin
 */
export const getPendingUsers = asyncHandler(async (req, res) => {
  const pendingUsers = await User.find({ status: 'pending' }).select('-password');

  res.json({
    success: true,
    count: pendingUsers.length,
    data: pendingUsers
  });
});
