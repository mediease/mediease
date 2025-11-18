import mongoose from 'mongoose';
import { createAPID } from '../utils/idGenerators.js';

const fhirAppointmentSchema = new mongoose.Schema({
  resourceType: {
    type: String,
    default: 'Appointment',
    immutable: true
  },
  // Helper field for fast lookup
  apid: {
    type: String,
    unique: true,
    required: true,
    match: [/^AP\d{5}$/, 'APID must be in format AP00001']
  },
  // Full FHIR Appointment resource
  resource: {
    type: Object,
    required: true
  },
  // Helper fields extracted from resource for indexing and search
  patientPhn: {
    type: String,
    required: true,
    match: [/^PH\d{5}$/, 'PHN must be in format PH00001']
  },
  doctorLicense: {
    type: String,
    required: true
  },
  nurseId: {
    type: String,
    required: true,
    match: [/^NUR\d{5}$/, 'Nurse ID must be in format NUR00001']
  },
  roomNo: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'general'
  },
  status: {
    type: String,
    enum: ['pending', 'booked', 'arrived', 'fulfilled', 'cancelled', 'noshow', 'completed'],
    default: 'pending'
  },
  appointmentDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Generate APID before saving if not present
fhirAppointmentSchema.pre('save', async function(next) {
  if (!this.apid) {
    this.apid = await createAPID();
  }
  next();
});

// Indexes for search fields (apid unique field already indexed automatically)
fhirAppointmentSchema.index({ patientPhn: 1 });
fhirAppointmentSchema.index({ doctorLicense: 1 });
fhirAppointmentSchema.index({ nurseId: 1 });
fhirAppointmentSchema.index({ status: 1 });

const FHIRAppointment = mongoose.model('FHIRAppointment', fhirAppointmentSchema);

export default FHIRAppointment;
