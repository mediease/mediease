import FHIRPatient from '../models/fhirPatient.model.js';
import FHIRAppointment from '../models/fhirAppointment.model.js';
import User from '../models/user.model.js';

/**
 * Generate unique PHN (Patient Health Number) - Format: PH + 5 digits
 * @returns {Promise<string>} Generated PHN (e.g., PH00001)
 */
export const createPHN = async () => {
  const lastPatient = await FHIRPatient.findOne().sort({ phn: -1 }).select('phn');
  
  if (!lastPatient || !lastPatient.phn) {
    return 'PH00001';
  }
  
  const lastNumber = parseInt(lastPatient.phn.substring(2));
  const nextNumber = lastNumber + 1;
  return `PH${String(nextNumber).padStart(5, '0')}`;
};

/**
 * Generate unique NURID (Nurse ID) - Format: NUR + 5 digits
 * @returns {Promise<string>} Generated NURID (e.g., NUR00001)
 */
export const createNURID = async () => {
  const lastNurse = await User.findOne({ role: 'nurse', nurId: { $exists: true } })
    .sort({ nurId: -1 })
    .select('nurId');
  
  if (!lastNurse || !lastNurse.nurId) {
    return 'NUR00001';
  }
  
  const lastNumber = parseInt(lastNurse.nurId.substring(3));
  const nextNumber = lastNumber + 1;
  return `NUR${String(nextNumber).padStart(5, '0')}`;
};

/**
 * Generate unique APID (Appointment ID) - Format: AP + 5 digits
 * @returns {Promise<string>} Generated APID (e.g., AP00001)
 */
export const createAPID = async () => {
  const lastAppointment = await FHIRAppointment.findOne().sort({ apid: -1 }).select('apid');
  
  if (!lastAppointment || !lastAppointment.apid) {
    return 'AP00001';
  }
  
  const lastNumber = parseInt(lastAppointment.apid.substring(2));
  const nextNumber = lastNumber + 1;
  return `AP${String(nextNumber).padStart(5, '0')}`;
};

/**
 * Generate unique ENCID (Encounter ID) - Format: ENC + 5 digits
 * @returns {string} Generated ENCID (e.g., ENC00001)
 * Note: This is a simple counter-based generator. For production use,
 * consider using a dedicated counter collection to prevent race conditions.
 */
export const createENCID = async () => {
  // Simple timestamp-based generation for encounters
  const timestamp = Date.now().toString().slice(-5);
  return `ENC${timestamp}`;
};

/**
 * Validate PHN format
 * @param {string} phn - Patient Health Number to validate
 * @returns {boolean} True if valid format
 */
export const isValidPHN = (phn) => {
  return /^PH\d{5}$/.test(phn);
};

/**
 * Validate NURID format
 * @param {string} nurId - Nurse ID to validate
 * @returns {boolean} True if valid format
 */
export const isValidNURID = (nurId) => {
  return /^NUR\d{5}$/.test(nurId);
};

/**
 * Validate APID format
 * @param {string} apid - Appointment ID to validate
 * @returns {boolean} True if valid format
 */
export const isValidAPID = (apid) => {
  return /^AP\d{5}$/.test(apid);
};

/**
 * Validate Medical License ID format (alphanumeric, 6-20 characters)
 * @param {string} licenseId - Medical License ID to validate
 * @returns {boolean} True if valid format
 */
export const isValidMedicalLicense = (licenseId) => {
  return /^[A-Z0-9]{6,20}$/.test(licenseId);
};
