import asyncHandler from 'express-async-handler';
import Prescription from '../models/prescription.model.js';
import FHIRPatient from '../models/fhirPatient.model.js';
import User from '../models/user.model.js';
import { validateEncounterBeforePrescription, attachPrescriptionToEncounter } from '../services/prescriptionEncounter.service.js';
import { runAiValidation, validateMedicines } from '../services/aiPrescriptionValidation.service.js';
import { generatePrescriptionQR, verifyQRToken } from '../utils/qrGenerator.js';

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

  // Build medicines list from draft items
  const medicines = prescriptionItems.map(item => ({
    name: item.name || item.drugName,
    rxNormId: null,
    dose: item.dose || null,
    frequency: item.frequency || null,
    period: item.period || null,
    instructions: item.doseComment || item.comment || ""
  }));

  try {
    const aiData = await validateMedicines(patientPhn, medicines);

    // Deduplicate by medicine + drug class
    if (Array.isArray(aiData?.warnings)) {
      const seen = new Set();
      aiData.warnings = aiData.warnings.filter(w => {
        const key = `${w.medicineName}-${w.drugClass}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }

    return res.json({
      success: true,
      aiValidation: aiData
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

/**
 * @desc    Validate a saved prescription and generate a QR code
 * @route   POST /fhir/MedicationRequest/:prescriptionId/validate
 * @access  Private (doctor)
 *
 * Query params:
 *   force=true  — regenerate QR even if already VALIDATED
 *
 * Sample response:
 *   { success, message, data: { prescriptionId, validationStatus, validatedAt, qrCodeData } }
 */
export const validateAndGenerateQR = asyncHandler(async (req, res) => {
  const { prescriptionId } = req.params;
  const force = req.query.force === 'true';

  const prescription = await Prescription.findOne({ prescriptionId });
  if (!prescription) {
    return res.status(404).json({ success: false, message: 'Prescription not found' });
  }

  // Return existing QR if already validated and not forced
  if (prescription.validationStatus === 'VALIDATED' && !force) {
    return res.json({
      success: true,
      message: 'Prescription already validated',
      data: {
        prescriptionId: prescription.prescriptionId,
        validationStatus: prescription.validationStatus,
        validatedAt: prescription.validatedAt,
        qrCodeData: prescription.qrCodeData,
      }
    });
  }

  // Validate required fields
  if (!prescription.subject || !prescription.requester) {
    return res.status(400).json({
      success: false,
      message: 'Prescription is missing required fields (patient or doctor)'
    });
  }

  if (!prescription.dosageInstruction || prescription.dosageInstruction.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Prescription must contain at least one medicine'
    });
  }

  for (const item of prescription.dosageInstruction) {
    if (!item.medication) {
      return res.status(400).json({
        success: false,
        message: 'All prescription items must have a medication name'
      });
    }
  }

  // Generate QR code
  const { dataUrl, hash } = await generatePrescriptionQR(prescriptionId);

  prescription.validationStatus = 'VALIDATED';
  prescription.validatedAt = new Date();
  prescription.qrCodeData = dataUrl;
  prescription.qrPayloadHash = hash;
  await prescription.save();

  return res.json({
    success: true,
    message: 'Prescription validated and QR code generated',
    data: {
      prescriptionId: prescription.prescriptionId,
      validationStatus: prescription.validationStatus,
      validatedAt: prescription.validatedAt,
      qrCodeData: prescription.qrCodeData,
    }
  });
});

/**
 * @desc    Get the stored QR code for a validated prescription
 * @route   GET /fhir/MedicationRequest/:prescriptionId/qrcode
 * @access  Private
 */
export const getQRCode = asyncHandler(async (req, res) => {
  const { prescriptionId } = req.params;

  const prescription = await Prescription.findOne({ prescriptionId })
    .select('prescriptionId validationStatus validatedAt qrCodeData');

  if (!prescription) {
    return res.status(404).json({ success: false, message: 'Prescription not found' });
  }

  if (prescription.validationStatus !== 'VALIDATED' || !prescription.qrCodeData) {
    return res.status(404).json({
      success: false,
      message: 'QR code not yet generated. Validate the prescription first.'
    });
  }

  return res.json({
    success: true,
    data: {
      prescriptionId: prescription.prescriptionId,
      validationStatus: prescription.validationStatus,
      validatedAt: prescription.validatedAt,
      qrCodeData: prescription.qrCodeData,
    }
  });
});

/**
 * @desc    Public endpoint — verify a prescription by scanning its QR code
 * @route   GET /verify-prescription/:prescriptionId?token=<signedJWT>
 * @access  Public (no auth required)
 *
 * Returns VALID/INVALID status and safe prescription summary.
 */
export const verifyPrescriptionById = asyncHandler(async (req, res) => {
  const { prescriptionId } = req.params;
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({
      success: false,
      valid: false,
      message: 'Verification token is required'
    });
  }

  const { valid, reason } = verifyQRToken(token);
  if (!valid) {
    return res.status(400).json({
      success: false,
      valid: false,
      message: `Invalid token: ${reason}`
    });
  }

  const prescription = await Prescription.findOne({ prescriptionId })
    .select('prescriptionId subject requester authoredOn visitType validationStatus validatedAt dosageInstruction');

  if (!prescription) {
    return res.status(404).json({ success: false, valid: false, message: 'Prescription not found' });
  }

  if (prescription.validationStatus !== 'VALIDATED') {
    return res.json({
      success: true,
      valid: false,
      message: 'Prescription exists but has not been officially validated',
      prescriptionId
    });
  }

  return res.json({
    success: true,
    valid: true,
    message: 'VALID — This prescription is authentic',
    data: {
      prescriptionId: prescription.prescriptionId,
      patientPhn: prescription.subject,
      doctorLicense: prescription.requester,
      visitType: prescription.visitType,
      authoredOn: prescription.authoredOn,
      validatedAt: prescription.validatedAt,
      medicines: prescription.dosageInstruction.map(d => ({
        name: d.medication,
        dose: d.dose,
        frequency: d.frequency,
        period: d.period,
      })),
    }
  });
});
