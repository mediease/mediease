import mongoose from 'mongoose';

// New Prescription schema per updated requirements
const dosageInstructionSchema = new mongoose.Schema({
  medication: { type: String, required: true },
  dose: { type: String },
  frequency: { type: String },
  period: { type: String },
  doseComment: { type: String }
}, { _id: false });

const prescriptionSchema = new mongoose.Schema({
  prescriptionId: { type: String, unique: true, index: true }, // PRxxxxx
  subject: { type: String, required: true, index: true }, // patient PHN
  requester: { type: String, required: true, index: true }, // doctor medicalLicenseId
  authoredOn: { type: String, required: true }, // ISO date string
  // Accept both UI (capitalized) and potential lowercase/FHIR forms; normalize to capitalized variant
  status: { 
    type: String, 
    enum: ['Draft', 'Pending', 'Completed'], 
    default: 'Draft',
    set: (v) => {
      if (!v) return 'Draft';
      const s = String(v).trim().toLowerCase();
      if (s === 'completed' || s === 'complete') return 'Completed';
      if (s === 'pending') return 'Pending';
      // treat any other value (including 'draft') as Draft
      return 'Draft';
    }
  },
  visitType: { type: String, enum: ['OPD', 'IPD', 'Clinic'], required: true },
  complaint: { type: String },
  dosageInstruction: { type: [dosageInstructionSchema], required: true },
  resource: { type: Object, required: true } // Full FHIR MedicationRequest resource for response
}, { timestamps: true });

// Generate prescriptionId PRxxxxx
prescriptionSchema.pre('validate', async function(next) {
  if (this.prescriptionId) return next();
  try {
    const last = await mongoose.model('Prescription').findOne({ prescriptionId: { $regex: /^PR\d{5}$/ } })
      .sort({ prescriptionId: -1 })
      .select('prescriptionId')
      .lean();
    let nextNum = 1;
    if (last && last.prescriptionId) {
      nextNum = parseInt(last.prescriptionId.substring(2), 10) + 1;
    }
    const formatted = String(nextNum).padStart(5, '0');
    this.prescriptionId = `PR${formatted}`;
    next();
  } catch (err) {
    next(err);
  }
});

const Prescription = mongoose.model('Prescription', prescriptionSchema);
export default Prescription;
