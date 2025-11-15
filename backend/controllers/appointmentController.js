import Appointment from '../models/appointmentModel.js';
import User from '../models/userModel.js';
import Patient from '../models/patientModel.js';

// Create a new appointment (Nurse only)
export const createAppointment = async (req, res) => {
  try {
    const { patientPhn, doctorId, roomNo, type } = req.body;
    const nurseNurId = req.user.nurId; // Get nurse NURID from authenticated user

    // Validate required fields
    const requiredFields = ['patientPhn', 'doctorId', 'roomNo', 'type'];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        missingFields: missingFields
      });
    }

    // Verify nurse has nurId
    if (!nurseNurId) {
      return res.status(400).json({
        success: false,
        message: 'Nurse ID not found. Please ensure you are logged in as a nurse.'
      });
    }

    // Verify patient exists by PHN
    const patient = await Patient.findOne({ phn: patientPhn });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Verify doctor exists by medicalLicenseId and is a doctor
    const doctor = await User.findOne({ medicalLicenseId: doctorId });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    if (doctor.role !== 'doctor') {
      return res.status(400).json({
        success: false,
        message: 'The specified user is not a doctor'
      });
    }

    if (doctor.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'The specified doctor is not approved'
      });
    }

    // Auto-fill doctorName and doctorDivision
    const doctorName = `${doctor.firstName} ${doctor.lastName}`;
    const doctorDivision = doctor.division || '';

    // Create appointment (store doctorId string, not ObjectId)
    const appointment = new Appointment({
      patientPhn,
      doctorId,
      nurseId: nurseNurId,
      doctorName,
      doctorDivision,
      roomNo,
      type,
      date: new Date(),
      status: 'pending'
    });

    const savedAppointment = await appointment.save();

    // Get patient and nurse info for response
    const patientInfo = {
      phn: patient.phn,
      fullName: patient.fullName,
      nic: patient.nic,
      contactNumber: patient.contactNumber
    };

    const nurse = await User.findOne({ nurId: nurseNurId });
    const nurseInfo = nurse ? {
      nurId: nurse.nurId,
      firstName: nurse.firstName,
      lastName: nurse.lastName,
      email: nurse.email
    } : null;

    const doctorInfo = {
      medicalLicenseId: doctor.medicalLicenseId,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      email: doctor.email,
      division: doctor.division
    };

    // Build response with populated data
    const responseData = {
      ...savedAppointment.toObject(),
      patientInfo,
      nurseInfo,
      doctorInfo
    };

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: responseData
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format'
      });
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      if (field === 'apid') {
        return res.status(400).json({
          success: false,
          message: 'APID generation error. Please try again.'
        });
      }
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }

    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get appointment by APID
export const getAppointmentByApid = async (req, res) => {
  try {
    const { apid } = req.params;
    const appointment = await Appointment.findOne({ apid });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Get patient and nurse info
    const patient = await Patient.findOne({ phn: appointment.patientPhn });
    const nurse = await User.findOne({ nurId: appointment.nurseId });
    const doctor = await User.findOne({ medicalLicenseId: appointment.doctorId });

    const responseData = {
      ...appointment.toObject(),
      patientInfo: patient ? {
        phn: patient.phn,
        fullName: patient.fullName,
        nic: patient.nic,
        contactNumber: patient.contactNumber
      } : null,
      nurseInfo: nurse ? {
        nurId: nurse.nurId,
        firstName: nurse.firstName,
        lastName: nurse.lastName,
        email: nurse.email
      } : null,
      doctorInfo: doctor ? {
        medicalLicenseId: doctor.medicalLicenseId,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        email: doctor.email,
        division: doctor.division
      } : null
    };

    res.status(200).json({
      success: true,
      data: responseData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointment',
      error: error.message
    });
  }
};

// Update appointment by APID
export const updateAppointment = async (req, res) => {
  try {
    const { apid } = req.params;

    // Prevent APID, patientPhn, nurseId from being updated
    if (req.body.apid) delete req.body.apid;
    if (req.body.patientPhn) delete req.body.patientPhn;
    if (req.body.nurseId) delete req.body.nurseId;

    const appointment = await Appointment.findOneAndUpdate(
      { apid },
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Get patient and nurse info
    const patient = await Patient.findOne({ phn: appointment.patientPhn });
    const nurse = await User.findOne({ nurId: appointment.nurseId });
    const doctor = await User.findOne({ medicalLicenseId: appointment.doctorId });

    const responseData = {
      ...appointment.toObject(),
      patientInfo: patient ? {
        phn: patient.phn,
        fullName: patient.fullName,
        nic: patient.nic,
        contactNumber: patient.contactNumber
      } : null,
      nurseInfo: nurse ? {
        nurId: nurse.nurId,
        firstName: nurse.firstName,
        lastName: nurse.lastName,
        email: nurse.email
      } : null,
      doctorInfo: doctor ? {
        medicalLicenseId: doctor.medicalLicenseId,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        email: doctor.email,
        division: doctor.division
      } : null
    };

    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully',
      data: responseData
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete appointment by APID
export const deleteAppointment = async (req, res) => {
  try {
    const { apid } = req.params;
    const appointment = await Appointment.findOneAndDelete({ apid });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Appointment deleted successfully',
      data: appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete appointment',
      error: error.message
    });
  }
};

// Get pending appointments for a doctor
export const getPendingAppointments = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const requestingLicenseId = req.user.medicalLicenseId;

    // Verify the doctor is requesting their own appointments
    if (doctorId !== requestingLicenseId) {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own pending appointments'
      });
    }

    // Verify the user is a doctor
    if (req.user.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Only doctors can view pending appointments'
      });
    }

    const appointments = await Appointment.find({
      doctorId: doctorId,
      status: 'pending'
    }).sort({ date: 1 });

    // Populate patient and nurse info
    const appointmentsWithInfo = await Promise.all(
      appointments.map(async (appointment) => {
          const patient = await Patient.findOne({ phn: appointment.patientPhn });
          const nurse = await User.findOne({ nurId: appointment.nurseId });

        return {
          ...appointment.toObject(),
          patientInfo: patient ? {
            phn: patient.phn,
            fullName: patient.fullName,
            nic: patient.nic,
            contactNumber: patient.contactNumber
          } : null,
          nurseInfo: nurse ? {
            nurId: nurse.nurId,
            firstName: nurse.firstName,
            lastName: nurse.lastName,
            email: nurse.email
          } : null
        };
      })
    );

    res.status(200).json({
      success: true,
      count: appointmentsWithInfo.length,
      data: appointmentsWithInfo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending appointments',
      error: error.message
    });
  }
};

// Get all appointments for a doctor (Doctor only)
export const getAllDoctorAppointments = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const requestingLicenseId = req.user.medicalLicenseId;

    // Verify the doctor is requesting their own appointments
    if (doctorId !== requestingLicenseId) {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own appointments'
      });
    }

    // Verify the user is a doctor
    if (req.user.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Only doctors can view appointments'
      });
    }

    const appointments = await Appointment.find({ doctorId: doctorId })
      .sort({ date: -1 });

    // Populate patient and nurse info
    const appointmentsWithInfo = await Promise.all(
      appointments.map(async (appointment) => {
        const patient = await Patient.findOne({ phn: appointment.patientPhn });
        const nurse = await User.findOne({ nurId: appointment.nurseId });
        const doctor = await User.findOne({ medicalLicenseId: appointment.doctorId });

        return {
          ...appointment.toObject(),
          patientInfo: patient ? {
            phn: patient.phn,
            fullName: patient.fullName,
            nic: patient.nic,
            contactNumber: patient.contactNumber
          } : null,
          nurseInfo: nurse ? {
            nurId: nurse.nurId,
            firstName: nurse.firstName,
            lastName: nurse.lastName
          } : null,
          doctorInfo: doctor ? {
            firstName: doctor.firstName,
            lastName: doctor.lastName,
            division: doctor.division
          } : null
        };
      })
    );

    res.status(200).json({
      success: true,
      message: 'All appointments for this doctor',
      data: appointmentsWithInfo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments',
      error: error.message
    });
  }
};

// Get all appointments (Admin only)
export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .sort({ date: -1 });

    // Populate patient, nurse, and doctor info
    const appointmentsWithInfo = await Promise.all(
      appointments.map(async (appointment) => {
        const patient = await Patient.findOne({ phn: appointment.patientPhn });
        const nurse = await User.findOne({ nurId: appointment.nurseId });
        const doctor = await User.findOne({ medicalLicenseId: appointment.doctorId });

        return {
          ...appointment.toObject(),
          patientInfo: patient ? {
            phn: patient.phn,
            fullName: patient.fullName,
            nic: patient.nic,
            contactNumber: patient.contactNumber
          } : null,
          nurseInfo: nurse ? {
            nurId: nurse.nurId,
            firstName: nurse.firstName,
            lastName: nurse.lastName,
            email: nurse.email
          } : null,
          doctorInfo: doctor ? {
            medicalLicenseId: doctor.medicalLicenseId,
            firstName: doctor.firstName,
            lastName: doctor.lastName,
            division: doctor.division,
            email: doctor.email
          } : null
        };
      })
    );

    res.status(200).json({
      success: true,
      message: 'All appointments in the system',
      data: appointmentsWithInfo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments',
      error: error.message
    });
  }
};
