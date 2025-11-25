import mongoose from 'mongoose';
import { createALGID } from '../utils/idGenerators.js';

const allergySchema = new mongoose.Schema({
  // Unique identifier
  allergyId: {
    type: String,
    unique: true,
    sparse: true,
    index: true,
    default: null
  },

  // Patient reference
  patientPhn: {
    type: String,
    required: true,
    index: true
  },

  // Allergy category
  category: {
    type: String,
    required: true,
    enum: ['food', 'medication'],
    index: true
  },

  // Criticality level
  criticality: {
    type: String,
    required: true,
    enum: ['low', 'high']
  },

  // Allergen substance name
  substance: {
    type: String,
    required: true,
    index: true
  },

  // Reaction description
  reaction: {
    type: String,
    required: true
  },

  // Who recorded this allergy (doctor license or nurse ID)
  recorder: {
    type: String,
    required: true
  },

  // Recorded date
  recordedDate: {
    type: Date,
    default: () => new Date(),
    index: true
  },

  // Optional note
  note: {
    type: String
  },

  // Full FHIR AllergyIntolerance resource
  fhirResource: {
    type: Object,
    required: true
  }
}, {
  timestamps: true
});

// Generate allergyId before saving if not present
allergySchema.pre('save', async function(next) {
  try {
    if (!this.allergyId) {
      this.allergyId = await createALGID();
      if (!this.allergyId) {
        throw new Error('Failed to generate allergyId');
      }
    }
    next();
  } catch (error) {
    console.error('Error in pre-save hook:', error.message);
    next(error);
  }
});

// Compound index for patient + substance lookup
allergySchema.index({ patientPhn: 1, substance: 1 });

const Allergy = mongoose.model('Allergy', allergySchema);

export default Allergy;
