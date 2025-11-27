import { validateFHIRResource } from '../utils/fhirHelpers.js';

/**
 * Middleware to validate basic FHIR resource structure
 */
export const validateFHIRStructure = (req, res, next) => {
  const { resource } = req.body;

  if (!resource) {
    return res.status(400).json({
      success: false,
      message: 'FHIR resource is required in request body'
    });
  }

  const validation = validateFHIRResource(resource);

  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      message: 'Invalid FHIR resource structure',
      errors: validation.errors
    });
  }

  next();
};

/**
 * Middleware to validate Patient data
 */
export const validatePatientData = (req, res, next) => {
  const requiredFields = [
    'nic',
    'firstName',
    'lastName',
    'gender',
    'contactNumber',
    'dob',
    'address'
  ];

  const missingFields = requiredFields.filter(field => {
    const value = req.body[field];
    return value === undefined || value === null || (typeof value === 'string' && value.trim() === '');
  });

  if (missingFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Missing required patient fields',
      missingFields
    });
  }

  // Validate gender
  const validGenders = ['male', 'female', 'other', 'unknown'];
  if (!validGenders.includes(req.body.gender.toLowerCase())) {
    return res.status(400).json({
      success: false,
      message: 'Invalid gender. Must be one of: male, female, other, unknown'
    });
  }

  // Validate contact number format (basic check)
  // Allow digits, spaces, dashes, parentheses, and optional + at start
  // Also allow common formats like +94xxxxxxxxx or 0xxxxxxxxx
  const contactNumber = String(req.body.contactNumber).trim();
  if (contactNumber && !/^\+?[\d\s\-()]+$/.test(contactNumber)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid contact number format. Please use digits, spaces, dashes, or parentheses. Example: +94771234567 or 0771234567'
    });
  }

  next();
};

/**
 * Middleware to validate Appointment data
 */
export const validateAppointmentData = (req, res, next) => {
  const requiredFields = ['patientPhn', 'doctorLicense', 'nurseId', 'roomNo'];
  
  const missingFields = requiredFields.filter(field => !req.body[field]);

  if (missingFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Missing required appointment fields',
      missingFields
    });
  }

  // Validate PHN format
  if (!/^PH\d{5}$/.test(req.body.patientPhn)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid Patient Health Number format. Must be PH followed by 5 digits (e.g., PH00001)'
    });
  }

  // Validate Nurse ID is provided (format validation removed - accepts any format)
  if (!req.body.nurseId || String(req.body.nurseId).trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Nurse ID is required'
    });
  }

  next();
};

/**
 * Middleware to validate Encounter data
 */
export const validateEncounterData = (req, res, next) => {
  const requiredFields = ['complaint'];
  
  const missingFields = requiredFields.filter(field => !req.body[field]);

  if (missingFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Missing required encounter fields',
      missingFields
    });
  }

  // Validate weight if provided
  if (req.body.weight && (isNaN(req.body.weight) || req.body.weight <= 0)) {
    return res.status(400).json({
      success: false,
      message: 'Weight must be a positive number'
    });
  }

  next();
};
