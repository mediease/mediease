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
  ,
  // Prescription linkage fields
  hasPrescription: {
    type: Boolean,
    default: false
  },
  prescriptions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prescription'
    }
  ],
  // Active flag for quick checks (true while encounter in progress and not finished/cancelled)
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true
});

// Generate ENCID before saving if not present
fhirEncounterSchema.pre('save', async function(next) {
  if (!this.encId) {
    this.encId = await createENCID();
  }
  // Derive isActive from status
  if (['finished', 'cancelled'].includes(this.status)) {
    this.isActive = false;
  } else {
    this.isActive = true;
  }
  next();
});

// Indexes for search fields (encId unique field already indexed automatically)
fhirEncounterSchema.index({ patientPhn: 1 });
fhirEncounterSchema.index({ doctorLicense: 1 });
fhirEncounterSchema.index({ apid: 1 });
fhirEncounterSchema.index({ status: 1 });
fhirEncounterSchema.index({ hasPrescription: 1 });

const FHIREncounter = mongoose.model('FHIREncounter', fhirEncounterSchema);

export default FHIREncounter;
