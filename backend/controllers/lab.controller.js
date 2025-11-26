// controllers/lab.controller.js

import asyncHandler from 'express-async-handler';
import fs from 'fs';
import path from 'path';

import LabRequest from '../models/labRequest.model.js';
import FHIRDiagnosticReport from '../models/fhirDiagnosticReport.model.js';
import FHIRObservation from '../models/fhirObservation.model.js';
import FHIREncounter from '../models/fhirEncounter.model.js';
import FHIRPatient from '../models/fhirPatient.model.js';
import { getLabTestCoding, getLabTestConfig } from '../utils/labTestMappings.js';

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), 'uploads', 'lab');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Helper: delete uploaded file if rejected
function safeDeleteUploadedFile(file) {
  if (!file) return;
  try {
    fs.unlinkSync(file.path);
  } catch {}
}

// Build FHIR DiagnosticReport
function buildDiagnosticReport({
  patientPhn,
  encounterEncId,
  testType,
  resultText,
  fileUrl,
  mimeType,
  parameters
}) {
  const coding = getLabTestCoding(testType);
  const report = {
    resourceType: 'DiagnosticReport',
    status: 'final',
    subject: { reference: `Patient/${patientPhn}` },
    encounter: { reference: `Encounter/${encounterEncId}` },
    code: { coding: [coding] },
    conclusion: resultText || undefined,
    issued: new Date().toISOString()
  };

  if (fileUrl) {
    report.presentedForm = [
      {
        contentType: mimeType,
        url: fileUrl
      }
    ];
  }

  return report;
}

// Build Observation with parameters
function buildObservation({
  patientPhn,
  encounterEncId,
  testType,
  resultText,
  parameters
}) {
  const coding = getLabTestCoding(testType);

  const obs = {
    resourceType: 'Observation',
    status: 'final',
    subject: { reference: `Patient/${patientPhn}` },
    encounter: { reference: `Encounter/${encounterEncId}` },
    code: { coding: [coding] },
    effectiveDateTime: new Date().toISOString()
  };

  if (parameters && Object.keys(parameters).length > 0) {
    obs.component = Object.entries(parameters).map(([key, value]) => ({
      code: { text: key },
      valueString: String(value)
    }));
  } else if (resultText) {
    obs.valueString = resultText;
  }

  return obs;
}

// Validate strict test parameters
function validateAndExtractParameters(testType, body) {
  const config = getLabTestConfig(testType);
  if (!config) return { error: `Unsupported testType: ${testType}` };

  const requiredParams = config.requiredParams || [];
  const missing = [];
  const parameters = {};

  for (const param of requiredParams) {
    if (!body[param] || String(body[param]).trim() === '') {
      missing.push(param);
    } else {
      parameters[param] = body[param];
    }
  }

  if (missing.length > 0) {
    return { error: `Missing required parameters: ${missing.join(', ')}` };
  }

  return { parameters };
}

/* 
--------------------------------------------------------
    CREATE LAB REQUEST (Doctor Only)
--------------------------------------------------------
*/
export const createLabRequest = asyncHandler(async (req, res) => {
  const { patientPhn, encounterId, testType } = req.body;

  if (!patientPhn || !encounterId || !testType) {
    return res.status(400).json({
      success: false,
      message: 'patientPhn, encounterId and testType are required'
    });
  }

  if (!getLabTestConfig(testType)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid test type'
    });
  }

  const patient = await FHIRPatient.findOne({ phn: patientPhn });
  if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });

  const encounter = await FHIREncounter.findOne({ encId: encounterId });
  if (!encounter) return res.status(404).json({ success: false, message: 'Encounter not found' });

  if (!encounter.isActive)
    return res.status(400).json({ success: false, message: 'Encounter not active' });

  if (encounter.patientPhn !== patientPhn)
    return res.status(400).json({ success: false, message: 'Encounter mismatch' });

  // Doctor validation
  if (req.user.role !== 'doctor')
    return res.status(403).json({ success: false, message: 'Only doctor allowed' });

  if (encounter.doctorLicense !== req.user.medicalLicenseId)
    return res.status(403).json({ success: false, message: 'Doctor mismatch' });

  const labRequest = await LabRequest.create({
    patientPhn,
    doctorLicense: req.user.medicalLicenseId,
    encounterId: encounter._id,
    testType
  });

  res.status(201).json({
    success: true,
    message: 'Lab request created',
    data: labRequest
  });
});

/* 
--------------------------------------------------------
    GET PENDING LAB REQUESTS (Lab Assistant)
--------------------------------------------------------
*/
export const getPendingLabRequests = asyncHandler(async (req, res) => {
  const pending = await LabRequest.find({ status: 'pending' }).sort({ createdAt: -1 });
  res.json({ success: true, count: pending.length, data: pending });
});

/* 
--------------------------------------------------------
    GET REPORTS BY ENCOUNTER (Doctor)
--------------------------------------------------------
*/
export const getLabReportsForEncounter = asyncHandler(async (req, res) => {
  const { encounterId } = req.query;

  const encounter = await FHIREncounter.findOne({ encId: encounterId });
  if (!encounter) return res.status(404).json({ success: false, message: 'Encounter not found' });

  if (req.user.role !== 'doctor' || encounter.doctorLicense !== req.user.medicalLicenseId)
    return res.status(403).json({ success: false, message: 'Access denied' });

  const requests = await LabRequest.find({ encounterId: encounter._id });
  const reports = await FHIRDiagnosticReport.find({ encounterEncId: encounter.encId });

  res.json({ success: true, data: { requests, reports } });
});

/* 
--------------------------------------------------------
    GET REPORTS FOR A PATIENT (Doctor)
--------------------------------------------------------
*/
export const getLabReportsForPatient = asyncHandler(async (req, res) => {
  const { phn } = req.params;

  const patient = await FHIRPatient.findOne({ phn });
  if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });

  const requests = await LabRequest.find({ patientPhn: phn });
  const reports = await FHIRDiagnosticReport.find({
    labRequestId: { $in: requests.map(r => r._id) }
  });

  res.json({ success: true, data: { requests, reports } });
});

/* 
--------------------------------------------------------
    GET REPORTS REQUESTED BY DOCTOR
--------------------------------------------------------
*/
export const getDoctorRequestedReports = asyncHandler(async (req, res) => {
  const doctorLicense = req.user.medicalLicenseId;

  const requests = await LabRequest.find({ doctorLicense });
  const reports = await FHIRDiagnosticReport.find({
    labRequestId: { $in: requests.map(r => r._id) }
  });

  res.json({ success: true, data: { requests, reports } });
});

/* 
--------------------------------------------------------
    UPLOAD LAB REPORT (Lab Assistant)
--------------------------------------------------------
*/
export const uploadLabReport = asyncHandler(async (req, res) => {
  const { labRequestId } = req.params;
  const { resultText } = req.body;

  const labRequest = await LabRequest.findById(labRequestId);
  if (!labRequest) {
    safeDeleteUploadedFile(req.file);
    return res.status(404).json({ success: false, message: 'LabRequest not found' });
  }

  if (labRequest.status === 'completed') {
    safeDeleteUploadedFile(req.file);
    return res.status(400).json({ success: false, message: 'Already completed' });
  }

  const config = getLabTestConfig(labRequest.testType);

  // Validate file rules
  if (config.file.required && !req.file)
    return res.status(400).json({ success: false, message: 'File required' });

  if (config.file.prohibited && req.file) {
    safeDeleteUploadedFile(req.file);
    return res.status(400).json({ success: false, message: 'File not allowed' });
  }

  if (req.file && config.file.allowedMimeTypes?.length) {
    if (!config.file.allowedMimeTypes.includes(req.file.mimetype)) {
      safeDeleteUploadedFile(req.file);
      return res.status(400).json({
        success: false,
        message: `Invalid file type. Allowed: ${config.file.allowedMimeTypes.join(', ')}`
      });
    }
  }

  // Parameter validation
  const { error, parameters } = validateAndExtractParameters(
    labRequest.testType,
    req.body
  );
  if (error) {
    safeDeleteUploadedFile(req.file);
    return res.status(400).json({ success: false, message: error });
  }

  const fileUrl = req.file ? `/uploads/lab/${req.file.filename}` : undefined;

  // Update LabRequest
  labRequest.status = 'completed';
  labRequest.fileUrl = fileUrl;
  labRequest.resultText = resultText;
  labRequest.parameters = parameters;
  labRequest.completedAt = new Date();
  await labRequest.save();

  // Build FHIR diagnostic resources
  const encounter = await FHIREncounter.findById(labRequest.encounterId);

  const diagResource = buildDiagnosticReport({
    patientPhn: labRequest.patientPhn,
    encounterEncId: encounter.encId,
    testType: labRequest.testType,
    resultText,
    fileUrl,
    mimeType: req.file?.mimetype,
    parameters
  });

  const obsResource = buildObservation({
    patientPhn: labRequest.patientPhn,
    encounterEncId: encounter.encId,
    testType: labRequest.testType,
    resultText,
    parameters
  });

  const diag = await FHIRDiagnosticReport.create({
    labId: labRequest.labId,
    patientPhn: labRequest.patientPhn,
    encounterEncId: encounter.encId,
    labRequestId: labRequest._id,
    testType: labRequest.testType,
    status: 'final',
    resource: diagResource
  });

  const obs = await FHIRObservation.create({
    patientPhn: labRequest.patientPhn,
    encounterEncId: encounter.encId,
    labRequestId: labRequest._id,
    testType: labRequest.testType,
    resource: obsResource
  });

  res.status(201).json({
    success: true,
    message: 'Lab report uploaded',
    data: {
      labId: labRequest.labId,
      diagnosticReportId: diag._id,
      observationId: obs._id
    }
  });
});

/* 
--------------------------------------------------------
    GET LAB REPORT BY LAB ID (Doctor + Lab Assistant)
--------------------------------------------------------
*/
export const getLabReportByLabId = asyncHandler(async (req, res) => {
  const { labId } = req.params;

  const diag = await FHIRDiagnosticReport.findOne({ labId }).lean();
  if (!diag)
    return res.status(404).json({ success: false, message: 'Diagnostic report not found' });

  // Only doctor or lab assistant
  if (!['doctor', 'lab', 'lab_assistant'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  const labRequest = await LabRequest.findOne({ labId }).lean();
  const observation = await FHIRObservation.findOne({ labRequestId: labRequest?._id }).lean();
  const encounter = await FHIREncounter.findOne({ encId: diag.encounterEncId }).lean();
  const patient = await FHIRPatient.findOne({ phn: diag.patientPhn }).lean();

  res.json({
    success: true,
    data: {
      diagnosticReport: diag,
      observation,
      labRequest,
      encounter,
      patient
    }
  });
});

/* 
--------------------------------------------------------
    REVIEW LAB REPORT (Doctor)
--------------------------------------------------------
*/
export const reviewLabReport = asyncHandler(async (req, res) => {
  const { diagnosticReportId } = req.params;
  const { reviewNotes } = req.body;

  const diag = await FHIRDiagnosticReport.findById(diagnosticReportId);
  if (!diag)
    return res.status(404).json({ success: false, message: 'Report not found' });

  if (diag.status === 'amended')
    return res.status(400).json({ success: false, message: 'Already reviewed' });

  const labRequest = await LabRequest.findById(diag.labRequestId);
  if (!labRequest)
    return res.status(404).json({ success: false, message: 'Lab request missing' });

  const encounter = await FHIREncounter.findOne({ encId: diag.encounterEncId });
  if (encounter.doctorLicense !== req.user.medicalLicenseId)
    return res.status(403).json({ success: false, message: 'Not your patient' });

  // Update status (FHIR-compliant)
  diag.status = 'amended';
  diag.reviewNotes = reviewNotes;
  diag.reviewedAt = new Date();
  diag.reviewedBy = req.user.medicalLicenseId;

  await diag.save();

  res.json({
    success: true,
    message: 'Report reviewed',
    data: {
      id: diag._id,
      status: diag.status,
      reviewNotes: diag.reviewNotes
    }
  });
});
