import mongoose from 'mongoose';

const clinicVisitSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'Patient ID is required']
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Doctor ID is required']
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
  time: {
    type: String,
    required: [true, 'Time is required']
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
  notes: {
    type: String,
    required: [true, 'Notes are required'],
    trim: true
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    default: null
  }
}, {
  timestamps: true
});

const ClinicVisit = mongoose.model('ClinicVisit', clinicVisitSchema);

export default ClinicVisit;

