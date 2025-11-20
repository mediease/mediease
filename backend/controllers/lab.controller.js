import asyncHandler from 'express-async-handler';
import fs from 'fs';
import path from 'path';
import LabRequest from '../models/labRequest.model.js';
import FHIRDiagnosticReport from '../models/fhirDiagnosticReport.model.js';
import FHIRObservation from '../models/fhirObservation.model.js';
import FHIREncounter from '../models/fhirEncounter.model.js';
import FHIRPatient from '../models/fhirPatient.model.js';
import User from '../models/user.model.js';
import { getLabTestCoding } from '../utils/labTestMappings.js';

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), 'uploads', 'lab');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * @desc Doctor creates lab test request linked to encounter
 * @route POST /api/lab/request
 * @access Private/Doctor
 */
export const createLabRequest = asyncHandler(async (req, res) => {
  const { patientPhn, encounterId, testType } = req.body;

  if (!patientPhn || !encounterId || !testType) {
    return res.status(400).json({ success: false, message: 'patientPhn, encounterId and testType are required' });
  }
  if (!['xray','ecg','blood_sugar','cbc'].includes(testType)) {
    return res.status(400).json({ success: false, message: 'Invalid testType' });
  }

  // Validate patient
  const patient = await FHIRPatient.findOne({ phn: patientPhn });
  if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });

  // Validate encounter (query by custom encId, not MongoDB _id)
  const encounter = await FHIREncounter.findOne({ encId: encounterId });
  if (!encounter) return res.status(404).json({ success: false, message: 'Encounter not found' });
  if (!encounter.isActive) return res.status(400).json({ success: false, message: 'Encounter is not active' });
  if (encounter.patientPhn !== patientPhn) return res.status(400).json({ success: false, message: 'Encounter does not belong to patient' });

  // Validate doctor identity
  if (req.user.role !== 'doctor') {
    return res.status(403).json({ success: false, message: 'Only doctor can create lab requests' });
  }
  if (encounter.doctorLicense !== req.user.medicalLicenseId) {
    return res.status(403).json({ success: false, message: 'You can only create lab requests for your encounters' });
  }

  const labRequest = await LabRequest.create({
    patientPhn,
    doctorLicense: req.user.medicalLicenseId,
    encounterId: encounter._id,
    testType
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
      createdAt: labRequest.createdAt
    }
  });
});

/**
 * @desc Lab assistant views pending lab requests
 * @route GET /api/lab/pending
 * @access Private/Lab Assistant
 */
export const getPendingLabRequests = asyncHandler(async (req, res) => {
  const pending = await LabRequest.find({ status: 'pending' }).sort({ createdAt: -1 });
  return res.json({ success: true, count: pending.length, data: pending });
});

/**
 * @desc Doctor views lab reports for a specific encounter
 * @route GET /api/lab/reports?encounterId=XXX
 * @access Private/Doctor
 */
export const getLabReportsForEncounter = asyncHandler(async (req, res) => {
  const { encounterId } = req.query;
  if (!encounterId) return res.status(400).json({ success: false, message: 'encounterId is required' });

  const encounter = await FHIREncounter.findOne({ encId: encounterId });
  if (!encounter) return res.status(404).json({ success: false, message: 'Encounter not found' });
  if (req.user.role !== 'doctor' || encounter.doctorLicense !== req.user.medicalLicenseId) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  const requests = await LabRequest.find({ encounterId: encounter._id });
  const reports = await FHIRDiagnosticReport.find({ encounterEncId: encounter.encId });

  return res.json({ success: true, data: { requests, reports } });
});

// Helper to build FHIR resources
function buildDiagnosticReport({ patientPhn, encounterEncId, testType, resultText, fileUrl, mimeType }) {
  const coding = getLabTestCoding(testType);
  return {
    resourceType: 'DiagnosticReport',
    status: 'final',
    subject: { reference: `Patient/${patientPhn}` },
    encounter: { reference: `Encounter/${encounterEncId}` },
    code: { coding: [coding] },
    conclusion: resultText || undefined,
    presentedForm: fileUrl ? [{ contentType: mimeType, url: fileUrl }] : undefined,
    issued: new Date().toISOString()
  };
}

function buildObservation({ patientPhn, encounterEncId, testType, resultText }) {
  const coding = getLabTestCoding(testType);
  return {
    resourceType: 'Observation',
    status: 'final',
    subject: { reference: `Patient/${patientPhn}` },
    encounter: { reference: `Encounter/${encounterEncId}` },
    code: { coding: [coding] },
    valueString: resultText || '',
    effectiveDateTime: new Date().toISOString()
  };
}

/**
 * @desc Upload lab report file and complete request
 * @route POST /api/lab/upload/:labRequestId
 * @access Private/Lab Assistant
 */
export const uploadLabReport = asyncHandler(async (req, res) => {
  const { labRequestId } = req.params;
  const { resultText } = req.body;

  const labRequest = await LabRequest.findById(labRequestId);
  if (!labRequest) return res.status(404).json({ success: false, message: 'LabRequest not found' });
  if (labRequest.status === 'completed') return res.status(400).json({ success: false, message: 'LabRequest already completed' });

  // Multer attaches file metadata on req.file
  if (!req.file) return res.status(400).json({ success: false, message: 'File is required' });
  const fileUrl = `/uploads/lab/${req.file.filename}`;

  // Update lab request
  labRequest.status = 'completed';
  labRequest.fileUrl = fileUrl;
  labRequest.resultText = resultText;
  labRequest.completedAt = new Date();
  await labRequest.save();

  // Build & persist FHIR resources
  const encounter = await FHIREncounter.findOne({ _id: labRequest.encounterId });
  if (!encounter) return res.status(404).json({ success: false, message: 'Encounter not found' });
  const diagnosticReportResource = buildDiagnosticReport({
    patientPhn: labRequest.patientPhn,
    encounterEncId: encounter.encId,
    testType: labRequest.testType,
    resultText,
    fileUrl,
    mimeType: req.file.mimetype
  });
  const observationResource = buildObservation({
    patientPhn: labRequest.patientPhn,
    encounterEncId: encounter.encId,
    testType: labRequest.testType,
    resultText
  });

  const diag = await FHIRDiagnosticReport.create({
    labId: labRequest.labId,
    patientPhn: labRequest.patientPhn,
    encounterEncId: encounter.encId,
    labRequestId: labRequest._id,
    testType: labRequest.testType,
    resource: diagnosticReportResource
  });
  const obs = await FHIRObservation.create({
    patientPhn: labRequest.patientPhn,
    encounterEncId: encounter.encId,
    labRequestId: labRequest._id,
    testType: labRequest.testType,
    resource: observationResource
  });

  return res.status(201).json({ success: true, message: 'Lab report uploaded', data: { labId: labRequest.labId, labRequest, diagnosticReport: diag.resource, observation: obs.resource } });
});

/**
 * @desc Doctor reviews lab report and updates status
 * @route PUT /api/lab/review/:diagnosticReportId
 * @access Private/Doctor
 */
export const reviewLabReport = asyncHandler(async (req, res) => {
  const { diagnosticReportId } = req.params;
  const { reviewNotes } = req.body;

  if (!reviewNotes) {
    return res.status(400).json({ success: false, message: 'reviewNotes is required' });
  }

  const report = await FHIRDiagnosticReport.findById(diagnosticReportId);
  if (!report) return res.status(404).json({ success: false, message: 'Diagnostic Report not found' });
  if (report.status === 'reviewed') return res.status(400).json({ success: false, message: 'Report already reviewed' });

  // Verify doctor owns this encounter (via labRequest)
  const labRequest = await LabRequest.findById(report.labRequestId);
  if (!labRequest) return res.status(404).json({ success: false, message: 'Lab Request not found' });
  
  // Check if lab request is completed
  if (labRequest.status !== 'completed') {
    return res.status(400).json({ success: false, message: 'Lab request must be completed before reviewing the report' });
  }

  const encounter = await FHIREncounter.findOne({ encId: report.encounterEncId });
  if (!encounter) return res.status(404).json({ success: false, message: 'Encounter not found' });
  if (req.user.role !== 'doctor' || encounter.doctorLicense !== req.user.medicalLicenseId) {
    return res.status(403).json({ success: false, message: 'Only the treating doctor can review this report' });
  }

  // Update report status
  report.status = 'reviewed';
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
        reviewedAt: report.reviewedAt
      }
    }
  });
});
