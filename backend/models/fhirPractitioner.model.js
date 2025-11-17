import mongoose from 'mongoose';

const fhirPractitionerSchema = new mongoose.Schema({
  resourceType: {
    type: String,
    default: 'Practitioner',
    immutable: true
  },
  // Helper field for fast lookup
  role: {
    type: String,
    enum: ['doctor', 'nurse'],
    required: true
  },
  // Doctor identifier
  medicalLicenseId: {
    type: String,
    sparse: true,
    unique: true,
    required: function() {
      return this.role === 'doctor';
    }
  },
  // Nurse identifier
  nurId: {
    type: String,
    sparse: true,
    unique: true,
    required: function() {
      return this.role === 'nurse';
    }
  },
  // Full FHIR Practitioner resource
  resource: {
    type: Object,
    required: true
  },
  // Helper fields
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  nic: {
    type: String,
    required: true
  },
  division: String,
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for role search (unique fields already indexed automatically)
fhirPractitionerSchema.index({ role: 1 });

const FHIRPractitioner = mongoose.model('FHIRPractitioner', fhirPractitionerSchema);

export default FHIRPractitioner;
