import asyncHandler from 'express-async-handler';
import axios from 'axios';
import FHIRMedication from '../models/fhirMedication.model.js';

// Simple in-memory rate limiting (debounce style)
const recentSearches = new Map();
const MIN_INTERVAL_MS = 300; // minimum interval between searches per IP

export const rateLimitMedicationSearch = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const last = recentSearches.get(ip) || 0;
  if (now - last < MIN_INTERVAL_MS) {
    return res.status(429).json({ success: false, error: 'Too many requests. Please slow down.' });
  }
  recentSearches.set(ip, now);
  next();
};

// Fetch from RxNorm (or similar) external API
const fetchExternalMedications = async (term) => {
  const url = `https://rxnav.nlm.nih.gov/REST/drugs.json?name=${encodeURIComponent(term)}`;
  const results = [];
  try {
    const response = await axios.get(url, { timeout: 5000 });
    const conceptGroups = response.data?.drugGroup?.conceptGroup || [];
    for (const group of conceptGroups) {
      const props = group.conceptProperties || [];
      for (const p of props) {
        if (p.name) {
          results.push({
            name: p.name,
            identifier: p.rxcui,
            identifierSystem: 'http://www.nlm.nih.gov/research/umls/rxnorm'
          });
        }
      }
    }
  } catch (e) {
    // Fail silently; return empty array
  }
  return results;
};

// Convert model instance to FHIR Medication resource
const toFHIRMedication = (med) => {
  const resource = {
    resourceType: 'Medication',
    id: med._id.toString(),
    code: { text: med.name }
  };
  if (med.identifier) {
    resource.identifier = [
      {
        system: med.identifierSystem || 'http://example.org/medication-identifier',
        value: med.identifier
      }
    ];
  }
  if (med.form) {
    resource.form = { text: med.form };
  }
  if (med.strength) {
    resource.extension = [
      {
        url: 'http://example.org/fhir/StructureDefinition/medication-strength',
        valueString: med.strength
      }
    ];
  }
  return resource;
};

/**
 * @desc    Real-time medication search combining local + external lookup
 * @route   GET /fhir/Medication/search?query=<term>
 * @access  Private (nurse/doctor/admin)
 */
export const searchMedications = asyncHandler(async (req, res) => {
  const { query } = req.query;

  if (!query || query.trim() === '') {
    return res.status(400).json({ success: false, error: 'Query parameter is required' });
  }

  // Local search (case-insensitive partial)
  const regex = new RegExp(query, 'i');
  let localResults = await FHIRMedication.find({ name: { $regex: regex } })
    .limit(20)
    .sort({ name: 1 });

  let combined = [...localResults];

  // If fewer than 5 local results, augment with external
  if (localResults.length < 5) {
    const external = await fetchExternalMedications(query);

    for (const ext of external) {
      if (combined.length >= 20) break; // enforce overall cap
      const exists = combined.some(m => m.name.toLowerCase() === ext.name.toLowerCase());
      if (!exists) {
        // Optionally cache externally fetched medication
        try {
          const cached = await FHIRMedication.create({
            name: ext.name,
            identifier: ext.identifier,
            identifierSystem: ext.identifierSystem,
            source: 'external'
          });
          combined.push(cached);
        } catch (e) {
          // Ignore duplicate or save errors
        }
      }
    }
  }

  const fhirBundle = {
    resourceType: 'Bundle',
    type: 'searchset',
    total: combined.length,
    entry: combined.map(med => ({ resource: toFHIRMedication(med) }))
  };

  return res.json({ success: true, data: fhirBundle });
});
