import express from 'express';
import { createAppointment, getPendingAppointments, getAllDoctorAppointments } from '../controllers/appointmentController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All appointment routes require authentication
router.use(authMiddleware);

// POST /api/appointments - Create appointment (Nurse only)
router.post('/', roleMiddleware('nurse'), createAppointment);

// GET /api/appointments/pending/:doctorId - Get pending appointments for a doctor (Doctor only)
router.get('/pending/:doctorId', roleMiddleware('doctor'), getPendingAppointments);

// GET /api/appointments/doctor/:doctorId - Get all appointments for a doctor (Doctor only)
router.get('/doctor/:doctorId', roleMiddleware('doctor'), getAllDoctorAppointments);

export default router;

