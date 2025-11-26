import asyncHandler from 'express-async-handler';
import axios from 'axios';
import Prescription from '../models/prescription.model.js';
import FHIRPatient from '../models/fhirPatient.model.js';
import User from '../models/user.model.js';
import FHIREncounter from '../models/fhirEncounter.model.js';
import { validateEncounterBeforePrescription, attachPrescriptionToEncounter } from '../services/prescriptionEncounter.service.js';
import { runAiValidation } from '../services/aiPrescriptionValidation.service.js';

// Map UI status to FHIR-compliant status values
const mapStatusToFHIR = (status) => {
  const normalized = (status || 'Draft').trim();
  const map = {
    Draft: 'draft',
    Pending: 'draft', // Pending treated as draft (FHIR has no pending)
    Completed: 'completed'
  };
  return map[normalized] || 'draft';
};

/**
 * @desc    Validate a prescription draft using AI (NO DB SAVE)
 * @route   POST /fhir/MedicationRequest/validate
 * @access  Private (doctor/nurse/admin)
 */
export const validatePrescriptionDraft = asyncHandler(async (req, res) => {
  const {
    patientPhn,
    medicalLicenseId,
    complaint,
    visitType,
    status,
    prescriptionItems
  } = req.body;

  if (!patientPhn || !medicalLicenseId || !visitType || !Array.isArray(prescriptionItems) || prescriptionItems.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'patientPhn, medicalLicenseId, visitType and non-empty prescriptionItems are required'
    });
  }

  // Validate patient
  const patient = await FHIRPatient.findOne({ phn: patientPhn });
  if (!patient) {
    return res.status(404).json({ success: false, message: 'Patient not found' });
  }

  // Validate doctor
  const doctor = await User.findOne({ role: 'doctor', medicalLicenseId });
  if (!doctor) {
    return res.status(404).json({ success: false, message: 'Doctor not found' });
  }

  // ❗ IMPORTANT FIX:
  // Validation mode DOES NOT need encounterCheck

  // Build dosageInstruction-like structure from draft
  const medicines = prescriptionItems.map(item => ({
    name: item.name || item.drugName,
    rxNormId: null,
    dose: item.dose || null,
    frequency: item.frequency || null,
    period: item.period || null,
    instructions: item.doseComment || item.comment || ""
  }));

  // Collect ALL past encounter complaints
  const past = await FHIREncounter.find({
    patientPhn
  });

  const allComplaints = past
    .map(e => e.complaint)
    .filter(Boolean)
    .map(c => c.trim())
    .filter(c => c.length > 0);

  const uniqueConditions = [...new Set(allComplaints.map(c => c.toLowerCase()))]
    .map(c => c.charAt(0).toUpperCase() + c.slice(1));

  const payload = {
    patientPhn,
    patientConditions: uniqueConditions,
    currentComplaint: complaint || null,
    medicines
  };

  console.log('=== VALIDATE DRAFT PAYLOAD TO AI ===');
  console.log(JSON.stringify(payload, null, 2));

  try {
    const response = await axios.post(
      'http://0.0.0.0:8000/ai/validate-prescription',
      payload,
      { timeout: 10000 }
    );

    // Deduplicate warnings
    if (Array.isArray(response.data?.warnings)) {
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

    return res.json({
      success: true,
      aiValidation: response.data
    });

  } catch (error) {
    console.error('AI validate draft error:', error.message);
    return res.json({
      success: false,
      aiValidation: {
        success: false,
        warnings: [],
        safe: true,
        error: error.response?.data?.error || error.message
      }
    });
  }
});


/**
 * @desc    Create a single FHIR MedicationRequest with multiple dosageInstruction items
 * @route   POST /fhir/MedicationRequest
 * @access  Private (doctor/nurse/admin)
 */
export const createPrescription = asyncHandler(async (req, res) => {
  const {
    patientPhn,
    medicalLicenseId,
    complaint,
    visitType,
    status,
    prescribeDate,
    prescriptionItems
  } = req.body;

  if (!patientPhn || !medicalLicenseId || !visitType || !Array.isArray(prescriptionItems) || prescriptionItems.length === 0) {
    return res.status(400).json({ success: false, message: 'patientPhn, medicalLicenseId, visitType and non-empty prescriptionItems are required' });
  }

  // Validate patient
  const patient = await FHIRPatient.findOne({ phn: patientPhn });
  if (!patient) {
    return res.status(404).json({ success: false, message: 'Patient not found' });
  }

  // Validate doctor
  const doctor = await User.findOne({ role: 'doctor', medicalLicenseId });
  if (!doctor) {
    return res.status(404).json({ success: false, message: 'Doctor not found' });
  }

  // Validate active encounter exists first
  const encounterCheck = await validateEncounterBeforePrescription(patientPhn, medicalLicenseId);
  if (!encounterCheck.valid) {
    return res.status(400).json({ success: false, message: encounterCheck.message });
  }

  // Build dosageInstruction array per specification
  const dosageInstruction = [];
  for (const item of prescriptionItems) {
    const { name, drugName, dose, frequency, period, doseComment, comment } = item;
    const medicationName = name || drugName;
    if (!medicationName) {
      return res.status(400).json({ success: false, message: 'Each prescription item must include name or drugName' });
    }
    const effectiveDoseComment = doseComment ?? comment ?? '';
    const textParts = [];
    if (dose) textParts.push(`Dose: ${dose}`);
    if (frequency) textParts.push(`Frequency: ${frequency}`);
    if (period) textParts.push(`Period: ${period}`);
    if (effectiveDoseComment) textParts.push(`Comment: ${effectiveDoseComment}`);
    dosageInstruction.push({
      medication: medicationName,
      dose,
      frequency,
      period,
      doseComment: effectiveDoseComment,
      text: textParts.join(', ')
    });
  }

  // Prepare authoredOn ISO date
  const authoredOn = prescribeDate ? new Date(prescribeDate).toISOString() : new Date().toISOString();
  const fhirStatus = mapStatusToFHIR(status);

  // Create Prescription doc (generate ID in validate hook)
  const prescDoc = new Prescription({
    subject: patientPhn,
    requester: medicalLicenseId,
    authoredOn,
    status: status || 'Draft',
    visitType,
    complaint,
    dosageInstruction,
    resource: {} // placeholder
  });
  await prescDoc.validate();

  // Build FHIR MedicationRequest resource
  const resource = {
    resourceType: 'MedicationRequest',
    id: prescDoc.prescriptionId,
    status: fhirStatus,
    intent: 'order',
    subject: { reference: `Patient/${patientPhn}` },
    requester: { reference: `Practitioner/${medicalLicenseId}` },
    authoredOn,
    dosageInstruction: dosageInstruction.map(di => ({
      text: di.text,
      extension: [
        {
          url: 'http://example.org/fhir/StructureDefinition/prescription-medication',
          valueString: di.medication
        }
      ],
      ...(di.dose && {
        doseAndRate: [{
          doseQuantity: { value: di.dose }
        }]
      })
    })),
    note: []
  };
  if (complaint) {
    resource.note.push({ text: `Complaint: ${complaint}` });
  }
  resource.extension = [
    { url: 'http://example.org/fhir/StructureDefinition/visit-type', valueString: visitType },
    { url: 'http://example.org/fhir/StructureDefinition/raw-dosageInstruction', valueString: JSON.stringify(dosageInstruction) }
  ];

  prescDoc.resource = resource;
  await prescDoc.save();

  // Attach prescription to encounter
  await attachPrescriptionToEncounter(encounterCheck.encounter._id, prescDoc._id);

  resource.extension = resource.extension || [];
  resource.extension.push({
    url: 'http://example.org/fhir/StructureDefinition/encounter-reference',
    valueString: encounterCheck.encounter.encId
  });

  // Run AI validation (post-save)
  const aiResult = await runAiValidation(patientPhn, encounterCheck.encounter._id, prescDoc._id);

  return res.status(201).json({
    success: true,
    message: 'Prescription created',
    data: resource,
    aiValidation: aiResult
  });
});

/**
 * @desc    Get all prescriptions for a patient (Bundle of MedicationRequest)
 * @route   GET /fhir/MedicationRequest/:patientPhn
 * @access  Private
 */
export const getPrescriptionsByPatient = asyncHandler(async (req, res) => {
  const { patientPhn } = req.params;
  if (!patientPhn) return res.status(400).json({ success: false, message: 'patientPhn is required' });
  const prescriptions = await Prescription.find({ subject: patientPhn }).sort({ createdAt: -1 });
  const bundle = {
    resourceType: 'Bundle',
    type: 'collection',
    total: prescriptions.length,
    entry: prescriptions.map(p => ({ resource: p.resource }))
  };
  return res.json({ success: true, data: bundle });
});

/**
 * @desc    Get all prescriptions issued by a doctor (Bundle of MedicationRequest)
 * @route   GET /fhir/MedicationRequest/doctor/:medicalLicenseId
 * @access  Private
 */
export const getPrescriptionsByDoctor = asyncHandler(async (req, res) => {
  const { medicalLicenseId } = req.params;
  if (!medicalLicenseId) return res.status(400).json({ success: false, message: 'medicalLicenseId is required' });
  const prescriptions = await Prescription.find({ requester: medicalLicenseId }).sort({ createdAt: -1 });
  const bundle = {
    resourceType: 'Bundle',
    type: 'collection',
    total: prescriptions.length,
    entry: prescriptions.map(p => ({ resource: p.resource }))
  };
  return res.json({ success: true, data: bundle });
});
