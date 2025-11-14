import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  nic: {
    type: String,
    required: [true, 'NIC is required'],
    unique: true,
    trim: true
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    trim: true
  },
  contactNumber: {
    type: String,
    required: [true, 'Contact number is required'],
    trim: true
  },
  dob: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  guardianNIC: {
    type: String,
    required: [true, 'Guardian NIC is required'],
    trim: true
  },
  guardianName: {
    type: String,
    required: [true, 'Guardian name is required'],
    trim: true
  },
  height: {
    type: Number,
    default: null
  },
  weight: {
    type: Number,
    default: null
  },
  bloodPressure: {
    type: String,
    default: null,
    trim: true
  },
  sugarLevel: {
    type: String,
    default: null,
    trim: true
  }
}, {
  timestamps: true
});

const Patient = mongoose.model('Patient', patientSchema);

export default Patient;

