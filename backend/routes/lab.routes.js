import express from 'express';
import multer from 'multer';
import path from 'path';
import { protect } from '../middleware/authMiddleware.js';
import { doctorOnly, labAssistantOnly } from '../middleware/roleMiddleware.js';
import { createLabRequest, getPendingLabRequests, getLabReportsForEncounter, uploadLabReport, reviewLabReport } from '../controllers/lab.controller.js';

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
  // Allow images and pdf
  const allowed = ['image/png','image/jpeg','application/pdf'];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error('Invalid file type. Allowed: png, jpg, pdf'));
  }
  cb(null, true);
}

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

// Auth middleware for all lab routes
router.use(protect);

// Create lab request (doctor)
router.post('/request', doctorOnly, createLabRequest);

// Pending lab requests (lab assistant)
router.get('/pending', labAssistantOnly, getPendingLabRequests);

// Encounter reports (doctor)
router.get('/reports', doctorOnly, getLabReportsForEncounter);

// Review lab report (doctor)
router.put('/review/:diagnosticReportId', doctorOnly, reviewLabReport);

// Upload lab report (lab assistant)
router.post('/upload/:labRequestId', labAssistantOnly, upload.single('file'), uploadLabReport);

export default router;
