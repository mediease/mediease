// models/fhirDiagnosticReport.model.js

import mongoose from 'mongoose';

const diagnosticReportSchema = new mongoose.Schema(
  {
    resourceType: {
      type: String,
      default: 'DiagnosticReport',
      immutable: true
    },

    labId: {
      type: String,
      required: true
    },

    patientPhn: {
      type: String,
      required: true
    },

    encounterEncId: {
      type: String,
      required: true
    },

    labRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LabRequest',
      required: true
    },

    testType: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: [
        'registered',
        'partial',
        'preliminary',
        'final',
        'amended',
        'corrected',
        'appended',
        'cancelled',
        'entered-in-error',
        'unknown'
      ],
      default: 'final'
    },

    reviewedBy: {
      type: String
    },
    reviewNotes: {
      type: String
    },
    reviewedAt: {
      type: Date
    },

    resource: {
      type: Object,
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes
diagnosticReportSchema.index({ patientPhn: 1 });
diagnosticReportSchema.index({ encounterEncId: 1 });
diagnosticReportSchema.index({ labId: 1 });
diagnosticReportSchema.index({ testType: 1 });

const FHIRDiagnosticReport = mongoose.model(
  'FHIRDiagnosticReport',
  diagnosticReportSchema
);

export default FHIRDiagnosticReport;
