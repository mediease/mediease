import express from 'express';
import {
  createAppointment,
  getAppointment,
  getDoctorAppointments,
  getAllAppointments,
  updateAppointment,
  cancelAppointment
} from '../controllers/fhirAppointment.controller.js';
import { protect } from '../middleware/authMiddleware.js';
import { nurseOnly, doctorOnly, adminOnly, checkApprovalStatus } from '../middleware/roleMiddleware.js';
import { validateAppointmentData } from '../middleware/fhirValidationMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Create appointment (nurse only)
router.post('/Appointment', nurseOnly, validateAppointmentData, createAppointment);

// Get appointment by ID or identifier
router.get('/Appointment/:id', checkApprovalStatus, getAppointment);
router.get('/Appointment', checkApprovalStatus, getAppointment);

// Update appointment
router.put('/Appointment/:id', checkApprovalStatus, updateAppointment);

// Cancel appointment
router.delete('/Appointment/:id', checkApprovalStatus, cancelAppointment);

// Doctor routes - get their appointments
router.get('/appointments/:medicalLicenseId', doctorOnly, getDoctorAppointments);

// Admin routes - get all appointments
router.get('/appointments', adminOnly, getAllAppointments);

export default router;
