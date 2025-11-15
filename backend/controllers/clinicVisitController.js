import ClinicVisit from '../models/clinicVisitModel.js';
import Appointment from '../models/appointmentModel.js';
import Patient from '../models/patientModel.js';
import User from '../models/userModel.js';

// Start clinic visit by PHN (no appointment)
export const startClinicVisitByPhn = async (req, res) => {
  try {
    const { phn } = req.params;
    const { complaint, weight, visitNote } = req.body;
    const doctorId = req.user.medicalLicenseId; // doctor's medicalLicenseId

    // Validate required fields
    const requiredFields = ['complaint', 'weight'];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        missingFields
      });
    }

    // Verify patient exists by PHN
    const patient = await Patient.findOne({ phn });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    if (req.user.role !== 'doctor') {
      return res.status(403).json({ success: false, message: 'Only doctors can start clinic visits' });
    }

    const doctorName = `${req.user.firstName} ${req.user.lastName}`;
    const doctorDivision = req.user.division || '';

    const clinicVisit = new ClinicVisit({
      patientPhn: phn,
      doctorId,
      doctorName,
      doctorDivision,
      complaint,
      weight,
      visitNote: visitNote || null
    });

    const savedVisit = await clinicVisit.save();

    const responseVisit = savedVisit.toObject();
    responseVisit.doctorInfo = {
      medicalLicenseId: req.user.medicalLicenseId,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      division: req.user.division
    };

    res.status(201).json({ success: true, message: 'Clinic visit started (walk-in)', data: responseVisit });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Start clinic visit by APID (uses existing appointment)
export const startClinicVisitByApid = async (req, res) => {
  try {
    const { apid } = req.params;
    const { complaint, weight, visitNote } = req.body;
    const doctorId = req.user.medicalLicenseId;

    if (!complaint || !weight) {
      return res.status(400).json({ success: false, message: 'Missing required fields: complaint or weight' });
    }

    const appointment = await Appointment.findOne({ apid });
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

    // Verify appointment belongs to this doctor
    if (appointment.doctorId !== doctorId) {
      return res.status(403).json({ success: false, message: 'This appointment does not belong to you' });
    }

    if (appointment.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'This appointment is already completed' });
    }

    // Get patientPhn from appointment
    const patientPhn = appointment.patientPhn;
    const patient = await Patient.findOne({ phn: patientPhn });
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });

    // Mark appointment as completed (do not delete)
    appointment.status = 'completed';
    await appointment.save();

    // Create clinic visit (include apid)
    const clinicVisit = new ClinicVisit({
      apid: apid,
      patientPhn,
      doctorId,
      doctorName: `${req.user.firstName} ${req.user.lastName}`,
      doctorDivision: req.user.division || '',
      complaint,
      weight,
      visitNote: visitNote || null,
      appointmentApid: apid
    });

    const savedVisit = await clinicVisit.save();

    const responseVisit = savedVisit.toObject();
    responseVisit.doctorInfo = {
      medicalLicenseId: req.user.medicalLicenseId,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      division: req.user.division
    };

    res.status(201).json({ success: true, message: 'Clinic visit started (from appointment)', data: responseVisit });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get all clinic visits (Admin only)
export const getAllClinicVisits = async (req, res) => {
  try {
    const clinicVisits = await ClinicVisit.find().sort({ createdAt: -1 });

    const visitsWithDoctor = await Promise.all(clinicVisits.map(async (visit) => {
      const v = visit.toObject();
      const doctor = await User.findOne({ medicalLicenseId: v.doctorId }).select('firstName lastName email medicalLicenseId division');
      v.doctorInfo = doctor || null;
      return v;
    }));

    res.status(200).json({ success: true, count: visitsWithDoctor.length, data: visitsWithDoctor });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch clinic visits', error: error.message });
  }
};

