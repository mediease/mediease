import mongoose from 'mongoose';

const diagnosticReportSchema = new mongoose.Schema({
  labId: { type: String },
  patientPhn: { type: String },
  encounterEncId: { type: String },
  labRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'LabRequest' },
  testType: { type: String },
  status: {
    type: String,
    enum: ['final', 'amended', 'corrected', 'appended', 'cancelled', 'entered-in-error', 'unknown', 'reviewed'],
    default: 'final'
  },
  reviewedBy: { type: String },
  reviewNotes: { type: String },
  reviewedAt: { type: Date },
  resource: { type: Object, required: true }
}, { timestamps: true });

diagnosticReportSchema.index({ patientPhn: 1 });
diagnosticReportSchema.index({ encounterEncId: 1 });
diagnosticReportSchema.index({ labId: 1 });

const FHIRDiagnosticReport = mongoose.model('FHIRDiagnosticReport', diagnosticReportSchema);
export default FHIRDiagnosticReport;
