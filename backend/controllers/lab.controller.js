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

// Helper: delete uploaded file if we need to reject
function safeDeleteUploadedFile(file) {
  if (!file) return;
  try {
    fs.unlinkSync(file.path);
  } catch (err) {
    console.error('Error deleting file:', err.message);
  }
}

// Helper to build FHIR DiagnosticReport
function buildDiagnosticReport({ patientPhn, encounterEncId, testType, resultText, fileUrl, mimeType, parameters }) {
  const coding = getLabTestCoding(testType);
  const report = {
    resourceType: 'DiagnosticReport',
    status: 'final',
    subject: { reference: `Patient/${patientPhn}` },
    encounter: { reference: `Encounter/${encounterEncId}` },
    code: { coding: [coding] },
    conclusion: resultText || undefined,
    issued: new Date().toISOString(),
  };

  if (fileUrl && mimeType) {
    report.presentedForm = [
      {
        contentType: mimeType,
        url: fileUrl,
      },
    ];
  }

  return report;
}

// Helper to build FHIR Observation with components for parameters
function buildObservation({ patientPhn, encounterEncId, testType, resultText, parameters }) {
  const coding = getLabTestCoding(testType);
  const observation = {
    resourceType: 'Observation',
    status: 'final',
    subject: { reference: `Patient/${patientPhn}` },
    encounter: { reference: `Encounter/${encounterEncId}` },
    code: { coding: [coding] },
    effectiveDateTime: new Date().toISOString(),
  };

  if (parameters && Object.keys(parameters).length > 0) {
    observation.component = Object.entries(parameters).map(([key, value]) => ({
      code: {
        text: key,
      },
      valueString: String(value),
    }));
  } else if (resultText) {
    observation.valueString = resultText;
  }

  return observation;
}

// Helper: validate parameters for a given test type
function validateAndExtractParameters(testType, body) {
  const config = getLabTestConfig(testType);
  if (!config) {
    return { error: `Unsupported testType: ${testType}` };
  }

  const requiredParams = config.requiredParams || [];
  const parameters = {};
  const missing = [];

  for (const paramName of requiredParams) {
    const value = body[paramName];
    if (value === undefined || value === null || String(value).trim() === '') {
      missing.push(paramName);
    } else {
      parameters[paramName] = value;
    }
  }

  if (missing.length > 0) {
    return {
      error: `Missing required parameters for ${testType}: ${missing.join(', ')}`,
    };
  }

  return { parameters };
}

/**
 * @desc Doctor creates lab test request linked to encounter
 * @route POST /api/lab/request
 * @access Private/Doctor
 */
export const createLabRequest = asyncHandler(async (req, res) => {
  const { patientPhn, encounterId, testType } = req.body;

  if (!patientPhn || !encounterId || !testType) {
    return res.status(400).json({
      success: false,
      message: 'patientPhn, encounterId and testType are required',
    });
  }

  const config = getLabTestConfig(testType);
  if (!config) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or unsupported testType',
    });
  }

  // Validate patient
  const patient = await FHIRPatient.findOne({ phn: patientPhn });
  if (!patient) {
    return res.status(404).json({
      success: false,
      message: 'Patient not found',
    });
  }

  // Validate encounter (query by custom encId)
  const encounter = await FHIREncounter.findOne({ encId: encounterId });
  if (!encounter) {
    return res.status(404).json({
      success: false,
      message: 'Encounter not found',
    });
  }

  if (!encounter.isActive) {
    return res.status(400).json({
      success: false,
      message: 'Encounter is not active',
    });
  }

  if (encounter.patientPhn !== patientPhn) {
    return res.status(400).json({
      success: false,
      message: 'Encounter does not belong to patient',
    });
  }

  // Validate doctor
  if (req.user.role !== 'doctor') {
    return res.status(403).json({
      success: false,
      message: 'Only doctor can create lab requests',
    });
  }

  if (encounter.doctorLicense !== req.user.medicalLicenseId) {
    return res.status(403).json({
      success: false,
      message: 'You can only create lab requests for your encounters',
    });
  }

  const labRequest = await LabRequest.create({
    patientPhn,
    doctorLicense: req.user.medicalLicenseId,
    encounterId: encounter._id,
    testType,
  });

  return res.status(201).json({
    success: true,
    message: 'Lab request created',
    data: {
      labId: labRequest.labId,
      _id: labRequest._id,
      patientPhn: labRequest.patientPhn,
      testType: labRequest.testType,
      status: labRequest.status,
      createdAt: labRequest.createdAt,
    },
  });
});

/**
 * @desc Lab assistant views pending lab requests
 * @route GET /api/lab/pending
 * @access Private/Lab Assistant
 */
export const getPendingLabRequests = asyncHandler(async (req, res) => {
  const pending = await LabRequest.find({ status: 'pending' })
    .sort({ createdAt: -1 })
    .lean();

  return res.json({
    success: true,
    count: pending.length,
    data: pending,
  });
});

/**
 * @desc Doctor views lab reports for a specific encounter
 * @route GET /api/lab/reports?encounterId=XXX
 * @access Private/Doctor
 */
export const getLabReportsForEncounter = asyncHandler(async (req, res) => {
  const { encounterId } = req.query;
  if (!encounterId) {
    return res.status(400).json({
      success: false,
      message: 'encounterId is required',
    });
  }

  const encounter = await FHIREncounter.findOne({ encId: encounterId });
  if (!encounter) {
    return res.status(404).json({
      success: false,
      message: 'Encounter not found',
    });
  }

  if (req.user.role !== 'doctor' || encounter.doctorLicense !== req.user.medicalLicenseId) {
    return res.status(403).json({
      success: false,
      message: 'Access denied',
    });
  }

  const requests = await LabRequest.find({ encounterId: encounter._id }).lean();
  const reports = await FHIRDiagnosticReport.find({ encounterEncId: encounter.encId }).lean();

  return res.json({
    success: true,
    data: {
      requests,
      reports,
    },
  });
});

/**
 * @desc Doctor views all lab reports for a specific patient
 * @route GET /api/lab/patient/:phn
 * @access Private/Doctor
 */
export const getLabReportsForPatient = asyncHandler(async (req, res) => {
  const { phn } = req.params;

  if (!phn) {
    return res.status(400).json({
      success: false,
      message: 'Patient PHN is required',
    });
  }

  if (req.user.role !== 'doctor') {
    return res.status(403).json({
      success: false,
      message: 'Only doctors can view patient lab reports',
    });
  }

  const patient = await FHIRPatient.findOne({ phn });
  if (!patient) {
    return res.status(404).json({
      success: false,
      message: 'Patient not found',
    });
  }

  const requests = await LabRequest.find({ patientPhn: phn }).lean();
  const labRequestIds = requests.map((r) => r._id);

  const reports = await FHIRDiagnosticReport.find({
    labRequestId: { $in: labRequestIds },
  }).lean();

  return res.json({
    success: true,
    data: {
      patientPhn: phn,
      requests,
      reports,
    },
  });
});

/**
 * @desc Doctor views lab reports requested by this doctor (all patients)
 * @route GET /api/lab/doctor/reports
 * @access Private/Doctor
 */
export const getDoctorRequestedReports = asyncHandler(async (req, res) => {
  if (req.user.role !== 'doctor') {
    return res.status(403).json({
      success: false,
      message: 'Only doctors can view requested reports',
    });
  }

  const doctorLicense = req.user.medicalLicenseId;

  const requests = await LabRequest.find({ doctorLicense }).lean();
  const labRequestIds = requests.map((r) => r._id);

  const reports = await FHIRDiagnosticReport.find({
    labRequestId: { $in: labRequestIds },
  }).lean();

  return res.json({
    success: true,
    data: {
      doctorLicense,
      requests,
      reports,
    },
  });
});

/**
 * @desc Upload lab report and complete request
 * @route POST /api/lab/upload/:labRequestId
 * @access Private/Lab Assistant
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
    return res.status(400).json({ success: false, message: 'LabRequest already completed' });
  }

  const config = getLabTestConfig(labRequest.testType);
  if (!config) {
    safeDeleteUploadedFile(req.file);
    return res.status(400).json({ success: false, message: 'Unsupported testType for this lab request' });
  }

  // Validate file type rules
  if (config.file.prohibited && req.file) {
    safeDeleteUploadedFile(req.file);
    return res.status(400).json({
      success: false,
      message: `File upload is not allowed for test type: ${labRequest.testType}`,
    });
  }

  if (config.file.required && !req.file) {
    return res.status(400).json({
      success: false,
      message: `File is required for test type: ${labRequest.testType}`,
    });
  }

  if (req.file && config.file.allowedMimeTypes?.length) {
    if (!config.file.allowedMimeTypes.includes(req.file.mimetype)) {
      const allowedText = config.file.allowedMimeTypes.join(', ');
      safeDeleteUploadedFile(req.file);
      return res.status(400).json({
        success: false,
        message: `Invalid file type for ${labRequest.testType}. Allowed: ${allowedText}`,
      });
    }
  }

  // Validate required parameters
  const { error, parameters } = validateAndExtractParameters(
    labRequest.testType,
    req.body
  );
  if (error) {
    safeDeleteUploadedFile(req.file);
    return res.status(400).json({
      success: false,
      message: error,
    });
  }

  const fileUrl = req.file ? `/uploads/lab/${req.file.filename}` : undefined;

  // Update lab request
  labRequest.status = 'completed';
  labRequest.fileUrl = fileUrl;
  labRequest.resultText = resultText;
  labRequest.parameters = parameters;
  labRequest.completedAt = new Date();
  await labRequest.save();

  // Build & save FHIR resources
  const encounter = await FHIREncounter.findById(labRequest.encounterId);
  if (!encounter) {
    return res.status(404).json({
      success: false,
      message: 'Encounter not found',
    });
  }

  const diagnosticReportResource = buildDiagnosticReport({
    patientPhn: labRequest.patientPhn,
    encounterEncId: encounter.encId,
    testType: labRequest.testType,
    resultText,
    fileUrl,
    mimeType: req.file?.mimetype,
    parameters,
  });

  const observationResource = buildObservation({
    patientPhn: labRequest.patientPhn,
    encounterEncId: encounter.encId,
    testType: labRequest.testType,
    resultText,
    parameters,
  });

  const diag = await FHIRDiagnosticReport.create({
    labId: labRequest.labId,
    patientPhn: labRequest.patientPhn,
    encounterEncId: encounter.encId,
    labRequestId: labRequest._id,
    testType: labRequest.testType,
    status: 'final',
    resource: diagnosticReportResource,
  });

  const obs = await FHIRObservation.create({
    patientPhn: labRequest.patientPhn,
    encounterEncId: encounter.encId,
    labRequestId: labRequest._id,
    testType: labRequest.testType,
    resource: observationResource,
  });

  return res.status(201).json({
    success: true,
    message: 'Lab report uploaded',
    data: {
      labId: labRequest.labId,
      labRequest,
      diagnosticReport: {
        id: diag._id,              // FIXED
        ...diag.resource,
      },
      observation: {
        id: obs._id,
        ...obs.resource,
      },
    },
  });
});

/**
 * @desc Doctor reviews lab report
 * @route PUT /api/lab/review/:diagnosticReportId
 * @access Private/Doctor
 */
export const reviewLabReport = asyncHandler(async (req, res) => {
  const { diagnosticReportId } = req.params;
  const { reviewNotes } = req.body;

  if (!reviewNotes) {
    return res.status(400).json({
      success: false,
      message: 'reviewNotes is required',
    });
  }

  const report = await FHIRDiagnosticReport.findById(diagnosticReportId);
  if (!report) {
    return res.status(404).json({
      success: false,
      message: 'Diagnostic Report not found',
    });
  }

  if (report.status === 'amended') {
    return res.status(400).json({
      success: false,
      message: 'Report already reviewed',
    });
  }

  // Verify doctor owns the encounter
  const labRequest = await LabRequest.findById(report.labRequestId);
  if (!labRequest) {
    return res.status(404).json({
      success: false,
      message: 'Lab Request not found',
    });
  }

  if (labRequest.status !== 'completed') {
    return res.status(400).json({
      success: false,
      message: 'Lab request must be completed before reviewing the report',
    });
  }

  const encounter = await FHIREncounter.findOne({ encId: report.encounterEncId });
  if (!encounter) {
    return res.status(404).json({
      success: false,
      message: 'Encounter not found',
    });
  }

  if (
    req.user.role !== 'doctor' ||
    encounter.doctorLicense !== req.user.medicalLicenseId
  ) {
    return res.status(403).json({
      success: false,
      message: 'Only the treating doctor can review this report',
    });
  }

  // Update to REVIEWED
  report.status = 'amended';
  report.reviewedBy = req.user.medicalLicenseId;
  report.reviewNotes = reviewNotes;
  report.reviewedAt = new Date();
  await report.save();

  return res.json({
    success: true,
    message: 'Lab report reviewed successfully',
    data: {
      report: {
        id: report._id,
        testType: report.testType,
        status: report.status,
        reviewedBy: report.reviewedBy,
        reviewNotes: report.reviewNotes,
        reviewedAt: report.reviewedAt,
      },
    },
  });
});
