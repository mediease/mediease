import FHIREncounter from '../models/fhirEncounter.model.js';

/**
 * Validate that an active encounter exists for given patient and doctor before creating a prescription.
 * Active = isActive true AND status not in ['finished','cancelled'].
 * @param {string} patientPhn
 * @param {string} medicalLicenseId
 * @returns {Promise<{valid:boolean, encounter?:any, message?:string}>}
 */
export async function validateEncounterBeforePrescription(patientPhn, medicalLicenseId) {
  const encounter = await FHIREncounter.findOne({
    patientPhn,
    doctorLicense: medicalLicenseId,
    isActive: true,
    status: { $nin: ['finished', 'cancelled'] }
  });
  if (!encounter) {
    return {
      valid: false,
      message: 'Doctor must create an encounter before adding a prescription.'
    };
  }
  return { valid: true, encounter };
}

/**
 * Mark encounter as having a prescription and attach prescription ObjectId.
 * @param {string} encounterId MongoID of encounter document
 * @param {string} prescriptionId MongoID of prescription document
 */
export async function attachPrescriptionToEncounter(encounterId, prescriptionId) {
  await FHIREncounter.findByIdAndUpdate(
    encounterId,
    {
      $set: { hasPrescription: true },
      $addToSet: { prescriptions: prescriptionId }
    },
    { new: true }
  );
}
