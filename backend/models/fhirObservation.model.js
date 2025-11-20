import mongoose from 'mongoose';

const observationSchema = new mongoose.Schema({
  patientPhn: { type: String, required: true, index: true },
  encounterEncId: { type: String, required: true, index: true },
  labRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'LabRequest', required: true, index: true },
  testType: { type: String, required: true },
  resource: { type: Object, required: true },
}, { timestamps: true });

const FHIRObservation = mongoose.model('FHIRObservation', observationSchema);
export default FHIRObservation;
