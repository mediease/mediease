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
} from '../controllers/lab.controller.js';

const router = express.Router();

// Multer storage
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

const fileFilter = (req, file, cb) => {
  const allowed = ['image/png', 'image/jpeg', 'application/pdf'];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error('Invalid file type. Allowed: png, jpeg, pdf'));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// -------------------- ROUTES --------------------

router.use(protect);

// Doctor creates request
router.post('/request', doctorOnly, createLabRequest);

// Lab pending list
router.get('/pending', labAssistantOnly, getPendingLabRequests);

// Doctor: reports for encounter
router.get('/reports', doctorOnly, getLabReportsForEncounter);

// Doctor: reports for patient
router.get('/patient/:phn', doctorOnly, getLabReportsForPatient);

// Doctor: all reports doctor requested
router.get('/doctor/reports', doctorOnly, getDoctorRequestedReports);

// Lab assistant uploads report
router.post(
  '/upload/:labRequestId',
  labAssistantOnly,
  upload.single('file'),
  uploadLabReport
);

// Doctor reviews report
router.put('/review/:diagnosticReportId', doctorOnly, reviewLabReport);

export default router;
