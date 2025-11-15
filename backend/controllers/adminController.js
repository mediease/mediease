import User from '../models/userModel.js';

// Get all pending doctors
export const getPendingDoctors = async (req, res) => {
  try {
    const pendingDoctors = await User.find({
      role: 'doctor',
      status: 'pending'
    }).select('-password');

    res.status(200).json({
      success: true,
      count: pendingDoctors.length,
      data: pendingDoctors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending doctors',
      error: error.message
    });
  }
};

// Approve doctor registration
export const approveDoctor = async (req, res) => {
  try {
    const { medicalLicenseId } = req.params;

    const user = await User.findOne({ medicalLicenseId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role !== 'doctor') {
      return res.status(400).json({
        success: false,
        message: 'This user is not a doctor'
      });
    }

    if (user.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Doctor is already approved'
      });
    }

    user.status = 'approved';
    await user.save();

    const userResponse = user.toJSON();

    res.status(200).json({
      success: true,
      message: 'Doctor approved successfully',
      data: userResponse
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to approve doctor',
      error: error.message
    });
  }
};

// Reject doctor registration
export const rejectDoctor = async (req, res) => {
  try {
    const { medicalLicenseId } = req.params;

    const user = await User.findOne({ medicalLicenseId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role !== 'doctor') {
      return res.status(400).json({
        success: false,
        message: 'This user is not a doctor'
      });
    }

    if (user.status === 'rejected') {
      return res.status(400).json({
        success: false,
        message: 'Doctor is already rejected'
      });
    }

    user.status = 'rejected';
    await user.save();

    const userResponse = user.toJSON();

    res.status(200).json({
      success: true,
      message: 'Doctor registration rejected',
      data: userResponse
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to reject doctor',
      error: error.message
    });
  }
};

// Get all pending nurses
export const getPendingNurses = async (req, res) => {
  try {
    const pendingNurses = await User.find({
      role: 'nurse',
      status: 'pending'
    }).select('-password');

    res.status(200).json({
      success: true,
      count: pendingNurses.length,
      data: pendingNurses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending nurses',
      error: error.message
    });
  }
};

// Approve nurse registration
export const approveNurse = async (req, res) => {
  try {
    const { nurId } = req.params;

    const user = await User.findOne({ nurId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role !== 'nurse') {
      return res.status(400).json({
        success: false,
        message: 'This user is not a nurse'
      });
    }

    if (user.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Nurse is already approved'
      });
    }

    user.status = 'approved';
    await user.save();

    const userResponse = user.toJSON();

    res.status(200).json({
      success: true,
      message: 'Nurse approved successfully',
      data: userResponse
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to approve nurse',
      error: error.message
    });
  }
};

// Reject nurse registration
export const rejectNurse = async (req, res) => {
  try {
    const { nurId } = req.params;

    const user = await User.findOne({ nurId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role !== 'nurse') {
      return res.status(400).json({
        success: false,
        message: 'This user is not a nurse'
      });
    }

    if (user.status === 'rejected') {
      return res.status(400).json({
        success: false,
        message: 'Nurse is already rejected'
      });
    }

    user.status = 'rejected';
    await user.save();

    const userResponse = user.toJSON();

    res.status(200).json({
      success: true,
      message: 'Nurse registration rejected',
      data: userResponse
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to reject nurse',
      error: error.message
    });
  }
};

// Get all users (admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
};

