import mongoose from 'mongoose';

const fhirObservationSchema = new mongoose.Schema({
  patientPhn: { type: String },
  encounterEncId: { type: String },
  labRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'LabRequest' },
  testType: { type: String },
  resource: { type: Object, required: true }
}, { timestamps: true });

fhirObservationSchema.index({ patientPhn: 1 });

const FHIRObservation = mongoose.model('FHIRObservation', fhirObservationSchema);
export default FHIRObservation;
