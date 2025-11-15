import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  role: {
    type: String,
    enum: ['admin', 'doctor', 'nurse'],
    required: [true, 'Role is required']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  nic: {
    type: String,
    required: [true, 'NIC is required'],
    unique: true,
    trim: true
  },
  // Doctor-specific fields
  medicalLicenseId: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  // Nurse-specific ID (NURID)
  nurId: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  division: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Validate doctorId and division for doctors
userSchema.pre('validate', function(next) {
  if (this.role === 'doctor') {
    if (!this.medicalLicenseId) {
      this.invalidate('medicalLicenseId', 'Medical License ID is required for doctors');
    }
    if (!this.division) {
      this.invalidate('division', 'Division is required for doctors');
    }
  } else {
    // Remove medicalLicenseId and division for non-doctors
    if (this.medicalLicenseId) {
      this.medicalLicenseId = undefined;
    }
    if (this.division) {
      this.division = undefined;
    }
  }

  // Validate nurse-specific ID
  if (this.role === 'nurse') {
    if (!this.nurId) {
      this.invalidate('nurId', 'NURID is required for nurses');
    }
  } else {
    if (this.nurId) {
      this.nurId = undefined;
    }
  }
  next();
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

const User = mongoose.model('User', userSchema);

export default User;

