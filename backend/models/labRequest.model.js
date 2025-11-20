import mongoose from 'mongoose';
import { createLABID } from '../utils/idGenerators.js';

const labRequestSchema = new mongoose.Schema({
  labId: { type: String, unique: true, index: true }, // Format: LAB00001
  patientPhn: { type: String, required: true, index: true },
  doctorLicense: { type: String, required: true, index: true },
  encounterId: { type: mongoose.Schema.Types.ObjectId, ref: 'FHIREncounter', required: true, index: true },
  testType: { type: String, required: true, enum: ['xray','ecg','blood_sugar','cbc'] },
  status: { type: String, enum: ['pending','completed'], default: 'pending', index: true },
  fileUrl: { type: String },
  resultText: { type: String },
  completedAt: { type: Date },
}, { timestamps: true });

// Generate labId before saving if not present
labRequestSchema.pre('save', async function(next) {
  if (!this.labId) {
    this.labId = await createLABID();
  }
  next();
});

// Index for quick lookup by labId
labRequestSchema.index({ labId: 1 });

const LabRequest = mongoose.model('LabRequest', labRequestSchema);
export default LabRequest;
