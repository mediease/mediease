import asyncHandler from 'express-async-handler';
import Allergy from '../models/allergy.model.js';
import FHIRPatient from '../models/fhirPatient.model.js';
import User from '../models/user.model.js';
import { isValidALGID } from '../utils/idGenerators.js';

/**
 * @desc Create new allergy for patient
 * @route POST /fhir/AllergyIntolerance
 * @access Private/Doctor,Nurse
 */
export const createAllergy = asyncHandler(async (req, res) => {
  const { patientPhn, category, criticality, substance, reaction, recorder, note } = req.body;

  // Validate required fields
  if (!patientPhn || !category || !criticality || !substance || !reaction || !recorder) {
    return res.status(400).json({
      success: false,
      message: 'patientPhn, category, criticality, substance, reaction, and recorder are required'
    });
  }

  // Validate category
  if (!['food', 'medication'].includes(category)) {
    return res.status(400).json({
      success: false,
      message: 'Category must be either "food" or "medication"'
    });
  }

  // Validate criticality
  if (!['low', 'high'].includes(criticality)) {
    return res.status(400).json({
      success: false,
      message: 'Criticality must be either "low" or "high"'
    });
  }

  // Validate patient exists
  const patient = await FHIRPatient.findOne({ phn: patientPhn });
  if (!patient) {
    return res.status(404).json({
      success: false,
      message: 'Patient not found'
    });
  }

  // Validate user is doctor or nurse
  if (!['doctor', 'nurse'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Only doctors and nurses can create allergies'
    });
  }

  // Build FHIR AllergyIntolerance resource
  const fhirResource = {
    resourceType: 'AllergyIntolerance',
    id: null, // Will be set after save (using MongoDB _id)
    meta: {
      lastUpdated: new Date().toISOString(),
      profile: ['http://hl7.org/fhir/StructureDefinition/AllergyIntolerance']
    },
    category: [category === 'food' ? 'food' : 'medication'],
    criticality: criticality,
    code: {
      text: substance
    },
    patient: {
      reference: `Patient/${patientPhn}`,
      display: `${patient.firstName} ${patient.lastName}`
    },
    reaction: [
      {
        description: reaction
      }
    ],
    recordedDate: new Date().toISOString(),
    recorder: {
      reference: `Practitioner/${recorder}`,
      display: recorder
    },
    note: note ? [{ text: note }] : undefined
  };

  // Remove undefined fields
  if (!fhirResource.note) {
    delete fhirResource.note;
  }

  try {
    // Create document without validation first to allow pre-save hook to run
    const allergyDoc = new Allergy({
      patientPhn,
      category,
      criticality,
      substance,
      reaction,
      recorder,
      note: note || null,
      recordedDate: new Date(),
      fhirResource
    });

    // Save with pre-save hook (which will generate allergyId)
    const allergy = await allergyDoc.save();

    // Update fhirResource with allergyId after save
    if (allergy.allergyId) {
      allergy.fhirResource.id = allergy.allergyId;
      await allergy.save();
    }

    return res.status(201).json({
      success: true,
      message: 'Allergy created successfully',
      data: {
        allergyId: allergy.allergyId,
        fhirResource: allergy.fhirResource
      }
    });
  } catch (error) {
    console.error('Error creating allergy:', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating allergy',
      error: error.message
    });
  }
});

/**
 * @desc Get all allergies for a patient (FHIR Bundle)
 * @route GET /fhir/AllergyIntolerance/patient/:patientPhn
 * @access Private/Doctor,Nurse,Admin
 */
export const getAllergiesForPatient = asyncHandler(async (req, res) => {
  const { patientPhn } = req.params;

  // Validate patient exists
  const patient = await FHIRPatient.findOne({ phn: patientPhn });
  if (!patient) {
    return res.status(404).json({
      success: false,
      message: 'Patient not found'
    });
  }

  try {
    const allergies = await Allergy.find({ patientPhn }).sort({ recordedDate: -1 });

    // Build FHIR Bundle response
    const bundle = {
      resourceType: 'Bundle',
      type: 'searchset',
      total: allergies.length,
      link: [
        {
          relation: 'self',
          url: `/fhir/AllergyIntolerance/patient/${patientPhn}`
        }
      ],
      entry: allergies.map((allergy) => ({
        fullUrl: `AllergyIntolerance/${allergy.allergyId}`,
        resource: allergy.fhirResource
      }))
    };

    return res.status(200).json({
      success: true,
      data: bundle
    });
  } catch (error) {
    console.error('Error retrieving allergies:', error);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving allergies',
      error: error.message
    });
  }
});

/**
 * @desc Get single allergy by ID
 * @route GET /fhir/AllergyIntolerance/:allergyId
 * @access Private/Doctor,Nurse,Admin
 */
export const getAllergyById = asyncHandler(async (req, res) => {
  const { allergyId } = req.params;

  // Validate format
  if (!isValidALGID(allergyId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid allergy ID format. Expected ALG##### format.'
    });
  }

  try {
    const allergy = await Allergy.findOne({ allergyId });
    if (!allergy) {
      return res.status(404).json({
        success: false,
        message: 'Allergy not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: allergy.fhirResource
    });
  } catch (error) {
    console.error('Error retrieving allergy:', error);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving allergy',
      error: error.message
    });
  }
});

/**
 * @desc Delete allergy (hard delete)
 * @route DELETE /fhir/AllergyIntolerance/:allergyId
 * @access Private/Doctor,Nurse,Admin
 */
export const deleteAllergy = asyncHandler(async (req, res) => {
  const { allergyId } = req.params;

  // Validate format
  if (!isValidALGID(allergyId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid allergy ID format. Expected ALG##### format.'
    });
  }

  try {
    const allergy = await Allergy.findOneAndDelete({ allergyId });
    if (!allergy) {
      return res.status(404).json({
        success: false,
        message: 'Allergy not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Allergy deleted successfully',
      data: {
        allergyId: allergy.allergyId
      }
    });
  } catch (error) {
    console.error('Error deleting allergy:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting allergy',
      error: error.message
    });
  }
});

/**
 * @desc Get allergies summary for patient (simplified list)
 * @route GET /fhir/AllergyIntolerance/summary/patient/:patientPhn
 * @access Private/Doctor,Nurse,Admin
 */
export const getAllergiesSummary = asyncHandler(async (req, res) => {
  const { patientPhn } = req.params;

  // Validate patient exists
  const patient = await FHIRPatient.findOne({ phn: patientPhn });
  if (!patient) {
    return res.status(404).json({
      success: false,
      message: 'Patient not found'
    });
  }

  try {
    const allergies = await Allergy.find({ patientPhn }).select('allergyId substance category criticality reaction recordedDate');

    return res.status(200).json({
      success: true,
      count: allergies.length,
      data: allergies
    });
  } catch (error) {
    console.error('Error retrieving allergy summary:', error);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving allergy summary',
      error: error.message
    });
  }
});
