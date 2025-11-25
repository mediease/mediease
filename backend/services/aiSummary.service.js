/**
 * AI Summarization Service
 * Collects medical data and builds summarization prompts
 */

import FHIRPatient from '../models/fhirPatient.model.js';
import FHIREncounter from '../models/fhirEncounter.model.js';
import Allergy from '../models/allergy.model.js';
import Prescription from '../models/prescription.model.js';

/**
 * Fetch all medical data for a patient (WITHOUT identifiers)
 * @param {string} patientPhn - Patient health number
 * @returns {Promise<Object>} - Sanitized medical data
 */
export const fetchPatientMedicalData = async (patientPhn) => {
  try {
    // Validate patient exists
    const patient = await FHIRPatient.findOne({ phn: patientPhn });
    if (!patient) {
      return null;
    }

    // Fetch encounters (clinical notes, vital signs, diagnoses)
    const encounters = await FHIREncounter.find({ patientPhn })
      .select('encId diagnosis vitals doctorNotes instructions status createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    // Fetch allergies
    const allergies = await Allergy.find({ patientPhn })
      .select('category substance criticality reaction recordedDate')
      .sort({ recordedDate: -1 });

    // Fetch prescriptions
    const prescriptions = await Prescription.find({ patientPhn })
      .select('medicationName dosage route frequency status startDate endDate indication')
      .sort({ startDate: -1 })
      .limit(20);

    return {
      encounters,
      allergies,
      prescriptions,
      patientBasicInfo: {
        age: calculateAge(patient.birthDate),
        gender: patient.gender
      }
    };
  } catch (error) {
    console.error('Error fetching patient medical data:', error.message);
    throw error;
  }
};

/**
 * Calculate age from birthDate
 * @param {string} birthDate - ISO date string
 * @returns {number} - Age in years
 */
const calculateAge = (birthDate) => {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

/**
 * Build medical summarization prompt
 * Removes all personal identifiers before sending to AI
 * @param {Object} medicalData - Medical data object
 * @returns {string} - Formatted prompt for OpenAI
 */
export const buildMedicalSummaryPrompt = (medicalData) => {
  if (!medicalData || Object.keys(medicalData).length === 0) {
    return null;
  }

  let prompt = '';

  // Add patient basic info (age and gender only - no identifiers)
  if (medicalData.patientBasicInfo) {
    if (medicalData.patientBasicInfo.age) {
      prompt += `Age: ${medicalData.patientBasicInfo.age} years\n`;
    }
    if (medicalData.patientBasicInfo.gender) {
      prompt += `Gender: ${medicalData.patientBasicInfo.gender}\n`;
    }
  }

  // Add encounters
  if (medicalData.encounters && medicalData.encounters.length > 0) {
    prompt += '\nRecent Encounters:\n';
    medicalData.encounters.slice(0, 3).forEach((encounter) => {
      if (encounter.diagnosis) prompt += `- Diagnosis: ${encounter.diagnosis}\n`;
      if (encounter.doctorNotes) prompt += `- Notes: ${encounter.doctorNotes}\n`;
      if (encounter.vitals) prompt += `- Vitals: ${JSON.stringify(encounter.vitals)}\n`;
    });
  }

  // Add allergies
  if (medicalData.allergies && medicalData.allergies.length > 0) {
    prompt += '\nAllergies:\n';
    medicalData.allergies.forEach((allergy) => {
      prompt += `- ${allergy.substance} (${allergy.criticality} severity)\n`;
    });
  }

  // Add prescriptions
  if (medicalData.prescriptions && medicalData.prescriptions.length > 0) {
    prompt += '\nCurrent Medications:\n';
    medicalData.prescriptions.slice(0, 5).forEach((prescription) => {
      prompt += `- ${prescription.medicationName} ${prescription.dosage || ''} (${prescription.frequency || 'as needed'})\n`;
    });
  }

  if (!prompt.trim()) {
    return null;
  }

  return prompt;
};

/**
 * Generate AI-powered medical summary
 * @param {string} patientPhn - Patient health number
 * @returns {Promise<string>} - AI-generated summary
 */
export const generateMedicalSummary = async (patientPhn) => {
  try {
    // Fetch all medical data
    const medicalData = await fetchPatientMedicalData(patientPhn);

    if (!medicalData) {
      return 'Patient not found.';
    }

    // Build prompt
    const prompt = buildMedicalSummaryPrompt(medicalData);

    if (!prompt) {
      return 'No medical data available to summarize.';
    }

    // Return the prompt and medical data for the controller to use
    return { prompt, medicalData };
  } catch (error) {
    console.error('Error generating medical summary:', error.message);
    throw error;
  }
};
