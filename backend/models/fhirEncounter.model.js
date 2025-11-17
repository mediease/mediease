import mongoose from 'mongoose';
import { createENCID } from '../utils/idGenerators.js';

const fhirEncounterSchema = new mongoose.Schema({
  resourceType: {
    type: String,
    default: 'Encounter',
    immutable: true
  },
  // Helper field for fast lookup
  encId: {
    type: String,
    required: true,
    unique: true
  },
  // Full FHIR Encounter resource
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
  // Optional - only present if encounter was created from an appointment
  apid: {
    type: String,
    match: [/^AP\d{5}$/, 'APID must be in format AP00001']
  },
  status: {
    type: String,
    enum: ['planned', 'arrived', 'triaged', 'in-progress', 'onleave', 'finished', 'cancelled'],
    default: 'in-progress'
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  // Clinical fields
  complaint: String,
  weight: Number,
  notes: String
}, {
  timestamps: true
});

// Generate ENCID before saving if not present
fhirEncounterSchema.pre('save', async function(next) {
  if (!this.encId) {
    this.encId = await createENCID();
  }
  next();
});

// Indexes for search fields (encId unique field already indexed automatically)
fhirEncounterSchema.index({ patientPhn: 1 });
fhirEncounterSchema.index({ doctorLicense: 1 });
fhirEncounterSchema.index({ apid: 1 });
fhirEncounterSchema.index({ status: 1 });

const FHIREncounter = mongoose.model('FHIREncounter', fhirEncounterSchema);

export default FHIREncounter;
