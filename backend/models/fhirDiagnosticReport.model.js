import mongoose from 'mongoose';

const diagnosticReportSchema = new mongoose.Schema({
  labId: { type: String, unique: true }, // Unique Lab Report ID (LAB00001)
  patientPhn: { type: String, required: true, index: true },
  encounterEncId: { type: String, required: true, index: true },
  labRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'LabRequest', required: true, index: true },
  testType: { type: String, required: true },
  resource: { type: Object, required: true },
  // Review fields
  status: { type: String, enum: ['pending', 'reviewed'], default: 'pending', index: true },
  reviewedBy: { type: String }, // doctor's medicalLicenseId
  reviewNotes: { type: String },
  reviewedAt: { type: Date }
}, { timestamps: true });

const FHIRDiagnosticReport = mongoose.model('FHIRDiagnosticReport', diagnosticReportSchema);
export default FHIRDiagnosticReport;
