import mongoose from 'mongoose';

const clinicVisitSchema = new mongoose.Schema({
  apid: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  patientPhn: {
    type: String,
    required: [true, 'Patient PHN is required'],
    trim: true
  },
  doctorId: {
    type: String,
    required: [true, 'Doctor ID is required'],
    trim: true
  },
  doctorName: {
    type: String,
    required: [true, 'Doctor name is required'],
    trim: true
  },
  doctorDivision: {
    type: String,
    required: [true, 'Doctor division is required'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  complaint: {
    type: String,
    required: [true, 'Complaint is required'],
    trim: true
  },
  weight: {
    type: Number,
    required: [true, 'Weight is required']
  },
  visitNote: {
    type: String,
    required: false,
    trim: true
  },
  appointmentApid: {
    type: String,
    default: null,
    trim: true
  }
}, {
  timestamps: true
});

const ClinicVisit = mongoose.model('ClinicVisit', clinicVisitSchema);

export default ClinicVisit;

