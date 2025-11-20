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
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    enum: ['admin', 'doctor', 'nurse', 'lab_assistant'],
    required: [true, 'Role is required']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  // Doctor-specific fields
  medicalLicenseId: {
    type: String,
    sparse: true,
    unique: true,
    required: function() {
      return this.role === 'doctor';
    }
  },
  nic: {
    type: String,
    required: function() {
      return ['doctor','nurse','lab_assistant'].includes(this.role);
    }
  },
  division: {
    type: String,
    required: false
  },
  // Nurse-specific fields
  nurId: {
    type: String,
    sparse: true,
    unique: true,
    required: function() {
      return this.role === 'nurse';
    }
  },
  // Lab assistant specific - unique lab ID
  labId: {
    type: String,
    sparse: true,
    unique: true,
    required: function() {
      return this.role === 'lab_assistant';
    }
  }
}, {
  timestamps: true
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

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Don't return password in JSON
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose.model('User', userSchema);

export default User;
