import asyncHandler from 'express-async-handler';
import FHIREncounter from '../models/fhirEncounter.model.js';
import FHIRAppointment from '../models/fhirAppointment.model.js';
import FHIRPatient from '../models/fhirPatient.model.js';
import { createFHIREncounter } from '../utils/fhirHelpers.js';
import { createENCID } from '../utils/idGenerators.js';

/**
 * @desc    Start clinic visit for walk-in patient (no appointment)
 * @route   POST /clinic/start/:phn
 * @access  Private/Doctor
 */
export const startWalkInEncounter = asyncHandler(async (req, res) => {
  const { phn } = req.params;
  const { complaint, weight, notes } = req.body;

  // Verify patient exists
  const patient = await FHIRPatient.findOne({ phn });
  if (!patient) {
    return res.status(404).json({
      success: false,
      message: `Patient not found with PHN: ${phn}`
    });
  }

  // Get doctor's medical license from authenticated user
  const doctorLicense = req.user.medicalLicenseId;

  if (!doctorLicense) {
    return res.status(400).json({
      success: false,
      message: 'Doctor medical license not found'
    });
  }

  // Generate encounter ID
  const encId = await createENCID();

  // Create encounter data
  const encounterData = {
    patientPhn: phn,
    doctorLicense,
    complaint,
    weight,
    notes,
    startTime: new Date().toISOString()
  };

  // Create FHIR resource
  const fhirResource = createFHIREncounter(encounterData, encId);

  // Create encounter
  const encounter = await FHIREncounter.create({
    encId,
    patientPhn: phn,
    doctorLicense,
    resource: fhirResource,
    status: 'in-progress',
    startTime: new Date(),
    complaint,
    weight,
    notes
  });

  res.status(201).json({
    success: true,
    message: 'Walk-in encounter started successfully',
    data: {
      id: encounter._id,
      encId: encounter.encId,
      resource: encounter.resource,
      metadata: {
        patientPhn: encounter.patientPhn,
        doctorLicense: encounter.doctorLicense,
        status: encounter.status,
        startTime: encounter.startTime,
        complaint: encounter.complaint
      }
    }
  });
});

/**
 * @desc    Start clinic visit from appointment
 * @route   POST /clinic/start-appointment/:apid
 * @access  Private/Doctor
 */
export const startAppointmentEncounter = asyncHandler(async (req, res) => {
  const { apid } = req.params;
  const { complaint, weight, notes } = req.body;

  // Find appointment
  const appointment = await FHIRAppointment.findOne({ apid });
  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: `Appointment not found with APID: ${apid}`
    });
  }

  // Verify appointment status
  if (appointment.status === 'completed') {
    return res.status(400).json({
      success: false,
      message: 'This appointment has already been completed'
    });
  }

  if (appointment.status === 'cancelled') {
    return res.status(400).json({
      success: false,
      message: 'Cannot start encounter for cancelled appointment'
    });
  }

  // Get doctor's medical license from authenticated user
  const doctorLicense = req.user.medicalLicenseId;

  // Verify doctor matches appointment
  if (appointment.doctorLicense !== doctorLicense) {
    return res.status(403).json({
      success: false,
      message: 'You can only start encounters for your own appointments'
    });
  }

  // Verify patient exists
  const patient = await FHIRPatient.findOne({ phn: appointment.patientPhn });
  if (!patient) {
    return res.status(404).json({
      success: false,
      message: `Patient not found with PHN: ${appointment.patientPhn}`
    });
  }

  // Check if encounter already exists for this appointment
  const existingEncounter = await FHIREncounter.findOne({ apid });
  if (existingEncounter) {
    return res.status(400).json({
      success: false,
      message: 'Encounter already exists for this appointment',
      data: {
        encId: existingEncounter.encId
      }
    });
  }

  // Generate encounter ID
  const encId = await createENCID();

  // Create encounter data
  const encounterData = {
    patientPhn: appointment.patientPhn,
    doctorLicense,
    apid,
    complaint,
    weight,
    notes,
    startTime: new Date().toISOString()
  };

  // Create FHIR resource
  const fhirResource = createFHIREncounter(encounterData, encId);

  // Create encounter
  const encounter = await FHIREncounter.create({
    encId,
    patientPhn: appointment.patientPhn,
    doctorLicense,
    apid,
    resource: fhirResource,
    status: 'in-progress',
    startTime: new Date(),
    complaint,
    weight,
    notes
  });

  // Update appointment status to completed (DO NOT DELETE)
  appointment.status = 'completed';
  appointment.resource.status = 'completed';
  await appointment.save();

  res.status(201).json({
    success: true,
    message: 'Encounter started from appointment successfully',
    data: {
      encounter: {
        id: encounter._id,
        encId: encounter.encId,
        resource: encounter.resource,
        metadata: {
          patientPhn: encounter.patientPhn,
          doctorLicense: encounter.doctorLicense,
          apid: encounter.apid,
          status: encounter.status,
          startTime: encounter.startTime,
          complaint: encounter.complaint
        }
      },
      appointment: {
        apid: appointment.apid,
        status: appointment.status,
        message: 'Appointment marked as completed'
      }
    }
  });
});

/**
 * @desc    Get encounter by ID or identifier
 * @route   GET /fhir/Encounter/:id
 * @route   GET /fhir/Encounter?identifier=AP00001
 * @access  Private
 */
export const getEncounter = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { identifier, patient, participant } = req.query;

  let encounter;

  if (identifier) {
    // Search by APID if provided
    encounter = await FHIREncounter.findOne({ apid: identifier });
  } else if (patient) {
    // Search by patient PHN
    const encounters = await FHIREncounter.find({ patientPhn: patient }).sort({ startTime: -1 });
    return res.json({
      success: true,
      count: encounters.length,
      data: encounters.map(enc => ({
        id: enc._id,
        encId: enc.encId,
        resource: enc.resource,
        metadata: {
          patientPhn: enc.patientPhn,
          doctorLicense: enc.doctorLicense,
          apid: enc.apid,
          status: enc.status,
          startTime: enc.startTime
        }
      }))
    });
  } else if (participant) {
    // Search by doctor medical license
    const encounters = await FHIREncounter.find({ doctorLicense: participant }).sort({ startTime: -1 });
    return res.json({
      success: true,
      count: encounters.length,
      data: encounters.map(enc => ({
        id: enc._id,
        encId: enc.encId,
        resource: enc.resource,
        metadata: {
          patientPhn: enc.patientPhn,
          doctorLicense: enc.doctorLicense,
          apid: enc.apid,
          status: enc.status,
          startTime: enc.startTime
        }
      }))
    });
  } else if (id) {
    encounter = await FHIREncounter.findById(id);
  } else {
    return res.status(400).json({
      success: false,
      message: 'Please provide encounter ID, identifier, patient PHN, or participant (doctor license)'
    });
  }

  if (!encounter) {
    return res.status(404).json({
      success: false,
      message: 'Encounter not found'
    });
  }

  res.json({
    success: true,
    data: {
      id: encounter._id,
      encId: encounter.encId,
      resource: encounter.resource,
      metadata: {
        patientPhn: encounter.patientPhn,
        doctorLicense: encounter.doctorLicense,
        apid: encounter.apid,
        status: encounter.status,
        startTime: encounter.startTime,
        endTime: encounter.endTime,
        complaint: encounter.complaint,
        weight: encounter.weight,
        notes: encounter.notes
      }
    }
  });
});

/**
 * @desc    Update encounter (add notes, close encounter)
 * @route   PUT /fhir/Encounter/:id
 * @access  Private/Doctor
 */
export const updateEncounter = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { notes, weight, status, endTime } = req.body;

  const encounter = await FHIREncounter.findById(id);

  if (!encounter) {
    return res.status(404).json({
      success: false,
      message: 'Encounter not found'
    });
  }

  // Verify doctor can only update their own encounters
  if (req.user.role === 'doctor' && encounter.doctorLicense !== req.user.medicalLicenseId) {
    return res.status(403).json({
      success: false,
      message: 'You can only update your own encounters'
    });
  }

  // Update allowed fields
  if (notes) {
    encounter.notes = notes;
  }

  if (weight) {
    encounter.weight = weight;
  }

  if (status) {
    encounter.status = status;
    encounter.resource.status = status;
  }

  if (endTime || status === 'finished') {
    encounter.endTime = endTime || new Date();
    encounter.status = 'finished';
    encounter.resource.status = 'finished';
    if (encounter.resource.period) {
      encounter.resource.period.end = encounter.endTime.toISOString();
    }
    encounter.isActive = false;
  }

  await encounter.save();

  res.json({
    success: true,
    message: 'Encounter updated successfully',
    data: {
      id: encounter._id,
      encId: encounter.encId,
      resource: encounter.resource,
      metadata: {
        status: encounter.status,
        endTime: encounter.endTime
      }
    }
  });
});

/**
 * @desc    Get all encounters (Admin only)
 * @route   GET /fhir/Encounter
 * @access  Private/Admin
 */
export const getAllEncounters = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;

  const query = {};

  if (status) {
    query.status = status;
  }

  const encounters = await FHIREncounter.find(query)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ startTime: -1 });

  const count = await FHIREncounter.countDocuments(query);

  res.json({
    success: true,
    count: encounters.length,
    total: count,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    data: encounters.map(enc => ({
      id: enc._id,
      encId: enc.encId,
      resource: enc.resource,
      metadata: {
        patientPhn: enc.patientPhn,
        doctorLicense: enc.doctorLicense,
        apid: enc.apid,
        status: enc.status,
        startTime: enc.startTime
      }
    }))
  });
});
