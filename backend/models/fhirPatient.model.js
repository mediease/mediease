import mongoose from 'mongoose';
import { createPHN } from '../utils/idGenerators.js';

const fhirPatientSchema = new mongoose.Schema({
  resourceType: {
    type: String,
    default: 'Patient',
    immutable: true
  },
  // Helper field for fast lookup
  phn: {
    type: String,
    unique: true,
    required: true,
    match: [/^PH\d{5}$/, 'PHN must be in format PH00001']
  },
  // Full FHIR Patient resource
  resource: {
    type: Object,
    required: true
  },
  // Helper fields extracted from resource for indexing and search
  nic: {
    type: String,
    required: true,
    unique: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    required: true,
    enum: ['male', 'female', 'other', 'unknown']
  },
  birthDate: {
    type: String,
    required: true
  },
  contactNumber: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  guardianNIC: {
    type: String,
    required: false
  },
  guardianName: {
    type: String,
    required: false
  },
  // Optional vital signs
  height: Number,
  weight: Number,
  bloodPressure: String,
  sugarLevel: Number
}, {
  timestamps: true
});

// Generate PHN before saving if not present
fhirPatientSchema.pre('save', async function(next) {
  if (!this.phn) {
    this.phn = await createPHN();
  }
  next();
});

// Index for compound search (unique fields already indexed automatically)
fhirPatientSchema.index({ firstName: 1, lastName: 1 });

const FHIRPatient = mongoose.model('FHIRPatient', fhirPatientSchema);

export default FHIRPatient;
