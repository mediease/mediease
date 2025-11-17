import asyncHandler from 'express-async-handler';
import FHIRPractitioner from '../models/fhirPractitioner.model.js';

/**
 * @desc    Create new practitioner (Admin only - usually done during approval)
 * @route   POST /fhir/Practitioner
 * @access  Private/Admin
 */
export const createPractitioner = asyncHandler(async (req, res) => {
  const { role, medicalLicenseId, nurId, resource, firstName, lastName, nic, division } = req.body;

  if (!resource) {
    return res.status(400).json({
      success: false,
      message: 'FHIR Practitioner resource is required'
    });
  }

  // Check for duplicate
  if (role === 'doctor' && medicalLicenseId) {
    const existing = await FHIRPractitioner.findOne({ medicalLicenseId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Practitioner with this medical license already exists'
      });
    }
  }

  if (role === 'nurse' && nurId) {
    const existing = await FHIRPractitioner.findOne({ nurId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Practitioner with this nurse ID already exists'
      });
    }
  }

  const practitioner = await FHIRPractitioner.create({
    role,
    medicalLicenseId,
    nurId,
    resource,
    firstName,
    lastName,
    nic,
    division
  });

  res.status(201).json({
    success: true,
    message: 'Practitioner created successfully',
    data: {
      id: practitioner._id,
      role: practitioner.role,
      ...(practitioner.medicalLicenseId && { medicalLicenseId: practitioner.medicalLicenseId }),
      ...(practitioner.nurId && { nurId: practitioner.nurId }),
      resource: practitioner.resource
    }
  });
});

/**
 * @desc    Get practitioner by identifier
 * @route   GET /fhir/Practitioner?identifier=MED12345 or ?identifier=NUR00001
 * @route   GET /fhir/Practitioner/:id
 * @access  Private
 */
export const getPractitioner = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { identifier } = req.query;

  let practitioner;

  if (identifier) {
    // Check if it's a medical license or nurse ID
    if (identifier.startsWith('NUR')) {
      practitioner = await FHIRPractitioner.findOne({ nurId: identifier });
    } else {
      practitioner = await FHIRPractitioner.findOne({ medicalLicenseId: identifier });
    }
  } else if (id) {
    practitioner = await FHIRPractitioner.findById(id);
  } else {
    return res.status(400).json({
      success: false,
      message: 'Please provide practitioner ID or identifier'
    });
  }

  if (!practitioner) {
    return res.status(404).json({
      success: false,
      message: 'Practitioner not found'
    });
  }

  res.json({
    success: true,
    data: {
      id: practitioner._id,
      role: practitioner.role,
      ...(practitioner.medicalLicenseId && { medicalLicenseId: practitioner.medicalLicenseId }),
      ...(practitioner.nurId && { nurId: practitioner.nurId }),
      resource: practitioner.resource,
      metadata: {
        firstName: practitioner.firstName,
        lastName: practitioner.lastName,
        nic: practitioner.nic,
        division: practitioner.division
      }
    }
  });
});

/**
 * @desc    Search practitioners
 * @route   GET /fhir/Practitioner?role=doctor or ?role=nurse
 * @access  Private
 */
export const searchPractitioners = asyncHandler(async (req, res) => {
  const { role, name, active, page = 1, limit = 10 } = req.query;

  const query = {};

  if (role) {
    query.role = role;
  }

  if (name) {
    query.$or = [
      { firstName: { $regex: name, $options: 'i' } },
      { lastName: { $regex: name, $options: 'i' } }
    ];
  }

  if (active !== undefined) {
    query.active = active === 'true';
  }

  const practitioners = await FHIRPractitioner.find(query)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const count = await FHIRPractitioner.countDocuments(query);

  res.json({
    success: true,
    count: practitioners.length,
    total: count,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    data: practitioners.map(p => ({
      id: p._id,
      role: p.role,
      ...(p.medicalLicenseId && { medicalLicenseId: p.medicalLicenseId }),
      ...(p.nurId && { nurId: p.nurId }),
      resource: p.resource,
      metadata: {
        firstName: p.firstName,
        lastName: p.lastName
      }
    }))
  });
});

/**
 * @desc    Update practitioner
 * @route   PUT /fhir/Practitioner/:id
 * @access  Private/Admin
 */
export const updatePractitioner = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const practitioner = await FHIRPractitioner.findById(id);

  if (!practitioner) {
    return res.status(404).json({
      success: false,
      message: 'Practitioner not found'
    });
  }

  // Update allowed fields
  const allowedUpdates = ['resource', 'active', 'division'];

  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      practitioner[field] = req.body[field];
    }
  });

  await practitioner.save();

  res.json({
    success: true,
    message: 'Practitioner updated successfully',
    data: {
      id: practitioner._id,
      resource: practitioner.resource
    }
  });
});

/**
 * @desc    Delete practitioner
 * @route   DELETE /fhir/Practitioner/:id
 * @access  Private/Admin
 */
export const deletePractitioner = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const practitioner = await FHIRPractitioner.findByIdAndDelete(id);

  if (!practitioner) {
    return res.status(404).json({
      success: false,
      message: 'Practitioner not found'
    });
  }

  res.json({
    success: true,
    message: 'Practitioner deleted successfully'
  });
});
