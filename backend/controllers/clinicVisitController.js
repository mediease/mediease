import ClinicVisit from '../models/clinicVisitModel.js';
import Appointment from '../models/appointmentModel.js';
import Patient from '../models/patientModel.js';
import User from '../models/userModel.js';

// Start a clinic visit (Doctor only)
export const startClinicVisit = async (req, res) => {
  try {
    const { patientId, appointmentId, complaint, weight, notes } = req.body;
    const doctorId = req.user._id; // Get doctor ID from authenticated user

    // Validate required fields
    const requiredFields = ['patientId', 'complaint', 'weight', 'notes'];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        missingFields: missingFields
      });
    }

    // Verify patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Verify the user is a doctor
    if (req.user.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Only doctors can start clinic visits'
      });
    }

    // Auto-fill doctor information from current session
    const doctorName = `${req.user.firstName} ${req.user.lastName}`;
    const doctorDivision = req.user.division || '';

    // Auto-fill date and time
    const now = new Date();
    const date = now;
    const time = now.toTimeString().split(' ')[0]; // Format: HH:MM:SS

    // If appointmentId is provided, verify and update appointment
    if (appointmentId) {
      const appointment = await Appointment.findById(appointmentId);

      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found'
        });
      }

      // Verify the appointment belongs to this doctor
      if (appointment.doctorId.toString() !== doctorId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'This appointment does not belong to you'
        });
      }

      // Verify the appointment is pending
      if (appointment.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'This appointment is already completed'
        });
      }

      // Verify patient matches
      if (appointment.patientId.toString() !== patientId) {
        return res.status(400).json({
          success: false,
          message: 'Patient ID does not match the appointment'
        });
      }

      // Mark appointment as completed (do not delete)
      appointment.status = 'completed';
      await appointment.save();
    }

    // Create clinic visit
    const clinicVisit = new ClinicVisit({
      patientId,
      doctorId,
      doctorName,
      doctorDivision,
      date,
      time,
      complaint,
      weight,
      notes,
      appointmentId: appointmentId || null
    });

    const savedVisit = await clinicVisit.save();

    // Populate references for response
    await savedVisit.populate('patientId', 'fullName nic contactNumber dob gender');
    await savedVisit.populate('doctorId', 'firstName lastName email doctorId division');

    res.status(201).json({
      success: true,
      message: 'Clinic visit started successfully',
      data: savedVisit
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format'
      });
    }

    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get all clinic visits (Admin only)
export const getAllClinicVisits = async (req, res) => {
  try {
    const clinicVisits = await ClinicVisit.find()
      .populate('patientId', 'fullName nic contactNumber dob gender')
      .populate('doctorId', 'firstName lastName email doctorId division')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: clinicVisits.length,
      data: clinicVisits
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch clinic visits',
      error: error.message
    });
  }
};

