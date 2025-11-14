import Patient from '../models/patientModel.js';

// Create a new patient
export const createPatient = async (req, res) => {
  try {
    // Validate required fields
    const requiredFields = ['nic', 'fullName', 'gender', 'contactNumber', 'dob', 'address', 'guardianNIC', 'guardianName'];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        missingFields: missingFields
      });
    }

    const patient = new Patient(req.body);
    const savedPatient = await patient.save();
    
    res.status(201).json({
      success: true,
      message: 'Patient created successfully',
      data: savedPatient
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Patient with this NIC already exists'
      });
    }
    
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get all patients
export const getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: patients.length,
      data: patients
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patients',
      error: error.message
    });
  }
};

// Get a single patient by ID
export const getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.status(200).json({
      success: true,
      data: patient
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid patient ID'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patient',
      error: error.message
    });
  }
};

// Update patient info
export const updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Patient updated successfully',
      data: patient
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid patient ID'
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Patient with this NIC already exists'
      });
    }

    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete a patient
export const deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Patient deleted successfully',
      data: patient
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid patient ID'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to delete patient',
      error: error.message
    });
  }
};

