import express from 'express';
import {
  createPatient,
  getAllPatients,
  getPatientById,
  updatePatient,
  deletePatient
} from '../controllers/patientController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// All patient routes require authentication
router.use(authMiddleware);

// POST /api/patients - Create a new patient (requires authentication)
router.post('/', createPatient);

// GET /api/patients - Get all patients (requires authentication)
router.get('/', getAllPatients);

// GET /api/patients/:id - Get a single patient by ID (requires authentication)
router.get('/:id', getPatientById);

// PUT /api/patients/:id - Update patient info (requires authentication)
router.put('/:id', updatePatient);

// DELETE /api/patients/:id - Delete a patient (requires authentication)
router.delete('/:id', deletePatient);

export default router;

