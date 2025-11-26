import axios from 'axios';
import FHIREncounter from '../models/fhirEncounter.model.js';
import Prescription from '../models/prescription.model.js';
import mongoose from 'mongoose';

export async function runAiValidation(patientPhn, encounterId, newPrescriptionId) {
  try {
    // Load encounter
    const encounter = await FHIREncounter.findById(encounterId);

    if (!encounter) {
      return {
        success: false,
        warnings: [],
        safe: true,
        error: 'Encounter not found'
      };
    }

    // Debug logs
    console.log("=== AI VALIDATION START ===");
    console.log("patientPhn:", patientPhn);
    console.log("encounterId:", encounterId);
    console.log("newPrescriptionId:", newPrescriptionId);

    // ------------------------------------------------------
    // ⭐ FIX: Correctly load new Prescription
    // ------------------------------------------------------
    let newPrescription = null;

    // If newPrescriptionId is a valid Mongo ObjectId
    if (mongoose.Types.ObjectId.isValid(newPrescriptionId)) {
      newPrescription = await Prescription.findById(newPrescriptionId);
    }

    // If not found, assume it's prescriptionId (like PR00021)
    if (!newPrescription) {
      newPrescription = await Prescription.findOne({
        prescriptionId: newPrescriptionId
      });
    }

    if (!newPrescription) {
      return {
        success: false,
        warnings: [],
        safe: true,
        error: `New prescription not found (${newPrescriptionId})`
      };
    }

    // Convert only THIS prescription's medicines
    const medicines = (newPrescription.dosageInstruction || []).map(item => ({
      name: item.medication,
      rxNormId: null,
      dose: item.dose || null,
      frequency: item.frequency || null,
      period: item.period || null,
      instructions: item.doseComment || ""
    }));

    // Collect past complaints
    const past = await FHIREncounter.find({
      patientPhn,
      _id: { $ne: encounterId }
    });

    const allComplaints = past
      .map(e => e.complaint)
      .filter(Boolean)
      .map(c => c.trim())
      .filter(c => c.length > 0);

    const uniqueConditions = [...new Set(allComplaints.map(c => c.toLowerCase()))]
      .map(c => c.charAt(0).toUpperCase() + c.slice(1));

    // Build final payload
    const payload = {
      patientPhn,
      patientConditions: uniqueConditions,
      currentComplaint: encounter.complaint || null,
      medicines
    };

    console.log("\n=== PAYLOAD TO AI ===");
    console.log(JSON.stringify(payload, null, 2));

    // Send request to AI service
    const response = await axios.post(
      "http://0.0.0.0:8000/ai/validate-prescription", // DO NOT CHANGE
      payload,
      { timeout: 10000 }
    );

    // ------------------------------------------------------
    // ⭐ Deduplicate warnings
    // ------------------------------------------------------
    if (response.data?.warnings && Array.isArray(response.data.warnings)) {
      const unique = [];
      const seen = new Set();

      for (const w of response.data.warnings) {
        const key = `${w.medicineName}-${w.drugClass}-${w.relatedCondition}`;
        if (!seen.has(key)) {
          seen.add(key);
          unique.push(w);
        }
      }

      response.data.warnings = unique;
      response.data.safe = unique.length === 0;
    }

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
