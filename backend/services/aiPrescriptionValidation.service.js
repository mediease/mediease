import axios from 'axios';
import Prescription from '../models/prescription.model.js';
import FHIREncounter from '../models/fhirEncounter.model.js';
import Allergy from '../models/allergy.model.js';
import mongoose from 'mongoose';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

/**
 * Shared helper: fetch patient clinical context from MongoDB and call the AI
 * validation service. Used by both validatePrescriptionDraft (controller) and
 * runAiValidation (post-save service).
 *
 * @param {string} patientPhn - Patient health number
 * @param {Array}  medicines  - Array of { name, rxNormId, dose, frequency, period, instructions }
 * @param {string} [excludePrescriptionId] - _id to exclude from past-prescription lookup (avoid self-reference)
 * @returns {Promise<Object>} Raw AI service response data
 */
export async function validateMedicines(patientPhn, medicines, excludePrescriptionId = null) {
  const pastQuery = { subject: patientPhn };
  if (excludePrescriptionId) {
    pastQuery._id = { $ne: excludePrescriptionId };
  }

  const [encounters, allergies, pastPrescriptions] = await Promise.all([
    FHIREncounter.find({ patientPhn }).select('complaint').lean(),
    Allergy.find({ patientPhn, category: 'medication' })
      .select('substance criticality reaction').lean(),
    Prescription.find(pastQuery).select('dosageInstruction').lean()
  ]);

  // Health conditions — unique non-empty complaints
  const patientConditions = [
    ...new Set(
      encounters
        .map(e => (e.complaint || '').trim())
        .filter(c => c.length > 0)
        .map(c => c.charAt(0).toUpperCase() + c.slice(1).toLowerCase())
    )
  ];

  // Allergy records (medication category)
  const patientAllergies = allergies.map(a => ({
    substance: a.substance,
    criticality: a.criticality,
    reaction: a.reaction || null
  }));

  // Current medications — exclude the new prescription's own medicines
  const newMedNames = new Set(medicines.map(m => (m.name || '').toLowerCase().trim()));
  const currentMedications = [
    ...new Set(
      pastPrescriptions.flatMap(p =>
        (p.dosageInstruction || []).map(d => (d.medication || '').trim())
      ).filter(name => name.length > 0 && !newMedNames.has(name.toLowerCase()))
    )
  ].map(name => ({ name }));

  const payload = {
    patientPhn,
    medicines,
    patientConditions,
    patientAllergies,
    currentMedications
  };

  const response = await axios.post(
    `${AI_SERVICE_URL}/ai/validate-prescription`,
    payload,
    { timeout: 15000 }
  );

  return response.data;
}

/**
 * Run AI validation for a saved prescription (called after prescription is saved).
 *
 * @param {string} patientPhn         - Patient health number
 * @param {string} encounterId        - Encounter ID (unused by AI, kept for callers)
 * @param {string} newPrescriptionId  - _id or prescriptionId of the saved prescription
 * @returns {Promise<Object>} AI validation result
 */
export async function runAiValidation(patientPhn, encounterId, newPrescriptionId) {
  try {
    // Load the saved prescription
    let newPrescription = null;
    if (mongoose.Types.ObjectId.isValid(newPrescriptionId)) {
      newPrescription = await Prescription.findById(newPrescriptionId);
    }
    if (!newPrescription) {
      newPrescription = await Prescription.findOne({ prescriptionId: newPrescriptionId });
    }
    if (!newPrescription) {
      return {
        success: false,
        warnings: [],
        safe: true,
        error: `New prescription not found (${newPrescriptionId})`
      };
    }

    const medicines = (newPrescription.dosageInstruction || []).map(item => ({
      name: item.medication,
      rxNormId: null,
      dose: item.dose || null,
      frequency: item.frequency || null,
      period: item.period || null,
      instructions: item.doseComment || ""
    }));

    return await validateMedicines(patientPhn, medicines, newPrescription._id);

  } catch (error) {
    console.error("AI validation error:", error.message);
    return {
      success: false,
      warnings: [],
      safe: true,
      error: error.response?.data?.error || error.message
    };
  }
}
