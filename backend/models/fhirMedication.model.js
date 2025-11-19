import mongoose from 'mongoose';

const fhirMedicationSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true }, // human-readable name
  identifier: { type: String }, // external or internal code
  identifierSystem: { type: String }, // system URL for identifier (e.g., RxNorm)
  form: { type: String }, // e.g., tablet, capsule
  strength: { type: String }, // e.g., 500 mg
  source: { type: String, enum: ['local', 'external'], default: 'local' }
}, { timestamps: true });

// Avoid duplicate by name + identifier
fhirMedicationSchema.index({ name: 1, identifier: 1 }, { unique: true, sparse: true });

const FHIRMedication = mongoose.model('FHIRMedication', fhirMedicationSchema);
export default FHIRMedication;
