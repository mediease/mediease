import express from 'express';
import {
  createPatient,
  getAllPatients,
  getPatientByPhn,
  updatePatientByPhn,
  deletePatientByPhn
} from '../controllers/patientController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// All patient routes require authentication
router.use(authMiddleware);

// POST /api/patients - Create a new patient (requires authentication)
router.post('/', createPatient);

// GET /api/patients - Get all patients (requires authentication)
router.get('/', getAllPatients);

// GET /api/patients/:phn - Get a single patient by PHN (requires authentication)
router.get('/:phn', getPatientByPhn);

// PUT /api/patients/:phn - Update patient info (requires authentication)
router.put('/:phn', updatePatientByPhn);

// DELETE /api/patients/:phn - Delete a patient (requires authentication)
router.delete('/:phn', deletePatientByPhn);

export default router;

