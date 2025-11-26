import mongoose from 'mongoose';
import { createLABID } from '../utils/idGenerators.js';

const labRequestSchema = new mongoose.Schema({
  labId: { type: String, unique: true },
  patientPhn: { type: String, required: true, index: true },
  doctorLicense: { type: String, required: true, index: true },
  encounterId: { type: mongoose.Schema.Types.ObjectId, ref: 'FHIREncounter', required: true },
  testType: { type: String, required: true },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  fileUrl: { type: String },
  resultText: { type: String },
  parameters: { type: Object },
  completedAt: { type: Date },
}, { timestamps: true });

labRequestSchema.pre('save', async function (next) {
  if (!this.labId) {
    this.labId = await createLABID();
  }
  next();
});

const LabRequest = mongoose.model('LabRequest', labRequestSchema);
export default LabRequest;
