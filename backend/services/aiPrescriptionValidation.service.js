import axios from 'axios';
import Prescription from '../models/prescription.model.js';
import FHIREncounter from '../models/fhirEncounter.model.js';
import Allergy from '../models/allergy.model.js';
import mongoose from 'mongoose';

export async function runAiValidation(patientPhn, encounterId, newPrescriptionId) {
  try {
    console.log("=== AI VALIDATION START ===");
    console.log("patientPhn:", patientPhn);
    console.log("newPrescriptionId:", newPrescriptionId);

    // Load the new prescription
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

    // New medicines being prescribed
    const medicines = (newPrescription.dosageInstruction || []).map(item => ({
      name: item.medication,
      rxNormId: null,
      dose: item.dose || null,
      frequency: item.frequency || null,
      period: item.period || null,
      instructions: item.doseComment || ""
    }));

    // Fetch patient clinical context from MongoDB in parallel
    const [encounters, allergies, pastPrescriptions] = await Promise.all([
      FHIREncounter.find({ patientPhn }).select('complaint').lean(),
      Allergy.find({ patientPhn, category: 'medication' })
        .select('substance criticality reaction').lean(),
      Prescription.find({ subject: patientPhn, _id: { $ne: newPrescription._id } })
        .select('dosageInstruction').lean()
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

    console.log("\n=== PAYLOAD TO AI ===");
    console.log(JSON.stringify(payload, null, 2));

    const response = await axios.post(
      "http://0.0.0.0:8000/ai/validate-prescription", // DO NOT CHANGE
      payload,
      { timeout: 15000 }
    );

    console.log("\n=== AI RESPONSE ===");
    console.log(JSON.stringify(response.data, null, 2));

    return response.data;

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
