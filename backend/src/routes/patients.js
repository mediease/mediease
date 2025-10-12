'use strict';

const express = require('express');
const authenticateJwt = require('../middleware/auth');
const Patient = require('../models/Patient');

const router = express.Router();

// Create patient
router.post('/', authenticateJwt, async (req, res) => {
  try {
    const {
      name,
      nic,
      gender,
      contactNo,
      address,
      guardianNic,
      guardianName,
    } = req.body || {};

    if (!name || !nic || !gender || !contactNo || !address || !guardianNic || !guardianName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const phid = await Patient.generateUniquePhid();
    const createdBy = req.user && req.user.sub ? req.user.sub : 'unknown';

    const patient = await Patient.create({
      phid,
      name,
      nic,
      gender,
      contactNo,
      address,
      guardianNic,
      guardianName,
      createdBy,
    });

    return res.status(201).json({ phid: patient.phid, id: patient._id });
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({ error: 'PHID already exists, retry' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get by PHID
router.get('/:phid', authenticateJwt, async (req, res) => {
  try {
    const { phid } = req.params;
    const patient = await Patient.findOne({ phid }).lean();
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    return res.status(200).json(patient);
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;



