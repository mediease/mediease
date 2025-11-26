// routes/lab.routes.js

import express from 'express';
import multer from 'multer';
import path from 'path';

import { protect } from '../middleware/authMiddleware.js';
import { doctorOnly, labAssistantOnly } from '../middleware/roleMiddleware.js';

import {
  createLabRequest,
  getPendingLabRequests,
  getLabReportsForEncounter,
  getLabReportsForPatient,
  getDoctorRequestedReports,
  uploadLabReport,
  reviewLabReport,
  getLabReportByLabId
} from '../controllers/lab.controller.js';

const router = express.Router();

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), 'uploads', 'lab'));
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e6);
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  }
});

function fileFilter(req, file, cb) {
  const allowed = ['image/png', 'image/jpeg', 'application/pdf'];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error('Invalid file type. Allowed: png, jpg, pdf'));
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});

// Auth
router.use(protect);

// Doctor
router.post('/request', doctorOnly, createLabRequest);
router.get('/reports', doctorOnly, getLabReportsForEncounter);
router.get('/patient/:phn', doctorOnly, getLabReportsForPatient);
router.get('/doctor/reports', doctorOnly, getDoctorRequestedReports);
router.put('/review/:diagnosticReportId', doctorOnly, reviewLabReport);

// Lab assistant
router.get('/pending', labAssistantOnly, getPendingLabRequests);
router.post('/upload/:labRequestId', labAssistantOnly, upload.single('file'), uploadLabReport);

// NEW: Get full report using labId
router.get('/report/lab/:labId', getLabReportByLabId);

export default router;
