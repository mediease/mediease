// models/fhirObservation.model.js

import mongoose from 'mongoose';

const fhirObservationSchema = new mongoose.Schema(
  {
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
    resource: {
      type: Object,
      required: true
    }
  },
  { timestamps: true }
);

fhirObservationSchema.index({ patientPhn: 1 });
fhirObservationSchema.index({ encounterEncId: 1 });

const FHIRObservation = mongoose.model(
  'FHIRObservation',
  fhirObservationSchema
);

export default FHIRObservation;
