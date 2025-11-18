/**
 * FHIR R4 Helper Functions
 * Utilities for building and validating FHIR-compliant resources
 */

/**
 * Create FHIR Patient resource
 * @param {Object} patientData - Patient data
 * @param {string} phn - Patient Health Number
 * @returns {Object} FHIR Patient resource
 */
export const createFHIRPatient = (patientData, phn) => {
  const {
    nic,
    firstName,
    lastName,
    gender,
    contactNumber,
    dob,
    address,
    guardianNIC,
    guardianName,
    height,
    weight,
    bloodPressure,
    sugarLevel
  } = patientData;

  const resource = {
    resourceType: 'Patient',
    identifier: [
      {
        system: process.env.FHIR_SYSTEM_PHN || 'urn:hospital:patient:phn',
        value: phn
      },
      {
        system: 'urn:hospital:patient:nic',
        value: nic
      }
    ],
    name: [
      {
        use: 'official',
        family: lastName,
        given: [firstName]
      }
    ],
    gender: gender.toLowerCase(),
    birthDate: dob,
    telecom: [
      {
        system: 'phone',
        value: contactNumber,
        use: 'mobile'
      }
    ],
    address: [
      {
        use: 'home',
        text: address,
        type: 'physical'
      }
    ],
    contact: [
      {
        relationship: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/v2-0131',
                code: 'N',
                display: 'Next-of-Kin'
              }
            ]
          }
        ],
        name: {
          text: guardianName
        },
        extension: [
          {
            url: 'urn:hospital:guardian:nic',
            valueString: guardianNIC
          }
        ]
      }
    ],
    extension: []
  };

  // Add optional extensions for vital signs if provided
  if (height) {
    resource.extension.push({
      url: 'urn:hospital:patient:height',
      valueQuantity: {
        value: parseFloat(height),
        unit: 'cm',
        system: 'http://unitsofmeasure.org',
        code: 'cm'
      }
    });
  }

  if (weight) {
    resource.extension.push({
      url: 'urn:hospital:patient:weight',
      valueQuantity: {
        value: parseFloat(weight),
        unit: 'kg',
        system: 'http://unitsofmeasure.org',
        code: 'kg'
      }
    });
  }

  if (bloodPressure) {
    resource.extension.push({
      url: 'urn:hospital:patient:bloodPressure',
      valueString: bloodPressure
    });
  }

  if (sugarLevel) {
    resource.extension.push({
      url: 'urn:hospital:patient:sugarLevel',
      valueQuantity: {
        value: parseFloat(sugarLevel),
        unit: 'mg/dL',
        system: 'http://unitsofmeasure.org',
        code: 'mg/dL'
      }
    });
  }

  return resource;
};

/**
 * Create FHIR Practitioner resource for Doctor
 * @param {Object} userData - User data
 * @returns {Object} FHIR Practitioner resource
 */
export const createFHIRPractitionerDoctor = (userData) => {
  const { firstName, lastName, medicalLicenseId, nic, division } = userData;

  return {
    resourceType: 'Practitioner',
    identifier: [
      {
        system: process.env.FHIR_SYSTEM_LICENSE || 'urn:hospital:practitioner:license',
        value: medicalLicenseId
      },
      {
        system: 'urn:hospital:practitioner:nic',
        value: nic
      }
    ],
    name: [
      {
        use: 'official',
        family: lastName,
        given: [firstName],
        prefix: ['Dr.']
      }
    ],
    active: true,
    qualification: [
      {
        code: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v2-0360',
              code: 'MD',
              display: 'Doctor of Medicine'
            }
          ],
          text: 'Medical Doctor'
        },
        identifier: [
          {
            system: process.env.FHIR_SYSTEM_LICENSE || 'urn:hospital:practitioner:license',
            value: medicalLicenseId
          }
        ],
        ...(division && {
          extension: [
            {
              url: 'urn:hospital:practitioner:division',
              valueString: division
            }
          ]
        })
      }
    ]
  };
};

/**
 * Create FHIR Practitioner resource for Nurse
 * @param {Object} userData - User data
 * @returns {Object} FHIR Practitioner resource
 */
export const createFHIRPractitionerNurse = (userData) => {
  const { firstName, lastName, nurId, nic } = userData;

  return {
    resourceType: 'Practitioner',
    identifier: [
      {
        system: process.env.FHIR_SYSTEM_NURID || 'urn:hospital:nurse:nurid',
        value: nurId
      },
      {
        system: 'urn:hospital:practitioner:nic',
        value: nic
      }
    ],
    name: [
      {
        use: 'official',
        family: lastName,
        given: [firstName]
      }
    ],
    active: true,
    qualification: [
      {
        code: {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '106292003',
              display: 'Professional nurse'
            }
          ],
          text: 'Registered Nurse'
        },
        identifier: [
          {
            system: process.env.FHIR_SYSTEM_NURID || 'urn:hospital:nurse:nurid',
            value: nurId
          }
        ]
      }
    ]
  };
};

/**
 * Create FHIR Appointment resource
 * @param {Object} appointmentData - Appointment data
 * @param {string} apid - Appointment ID
 * @returns {Object} FHIR Appointment resource
 */
export const createFHIRAppointment = (appointmentData, apid) => {
  const {
    patientPhn,
    doctorLicense,
    nurseId,
    roomNo,
    type,
    appointmentDate,
    status = 'pending'
  } = appointmentData;

  return {
    resourceType: 'Appointment',
    identifier: [
      {
        system: process.env.FHIR_SYSTEM_APID || 'urn:hospital:appointment:apid',
        value: apid
      }
    ],
    status: status,
    serviceType: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/service-type',
            code: type || 'general',
            display: type || 'General Consultation'
          }
        ]
      }
    ],
    appointmentType: {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/v2-0276',
          code: 'ROUTINE',
          display: 'Routine appointment'
        }
      ]
    },
    description: `Appointment at Room ${roomNo}`,
    start: appointmentDate || new Date().toISOString(),
    participant: [
      {
        actor: {
          reference: `Patient/${patientPhn}`,
          display: `Patient ${patientPhn}`
        },
        status: 'accepted'
      },
      {
        actor: {
          reference: `Practitioner/${doctorLicense}`,
          display: `Doctor ${doctorLicense}`
        },
        status: 'accepted'
      },
      {
        actor: {
          reference: `Practitioner/${nurseId}`,
          display: `Nurse ${nurseId}`
        },
        status: 'accepted'
      },
      {
        actor: {
          reference: `Location/Room-${roomNo}`,
          display: `Room ${roomNo}`
        },
        status: 'accepted'
      }
    ]
  };
};

/**
 * Create FHIR Encounter resource
 * @param {Object} encounterData - Encounter data
 * @param {string} encId - Encounter ID
 * @returns {Object} FHIR Encounter resource
 */
export const createFHIREncounter = (encounterData, encId) => {
  const {
    patientPhn,
    doctorLicense,
    apid,
    complaint,
    weight,
    notes,
    startTime,
    endTime
  } = encounterData;

  const identifiers = [
    {
      system: process.env.FHIR_SYSTEM_ENCID || 'urn:hospital:encounter:encid',
      value: encId
    }
  ];

  // Add appointment reference if this encounter is from an appointment
  if (apid) {
    identifiers.push({
      system: process.env.FHIR_SYSTEM_APID || 'urn:hospital:appointment:apid',
      value: apid
    });
  }

  const resource = {
    resourceType: 'Encounter',
    identifier: identifiers,
    status: endTime ? 'finished' : 'in-progress',
    class: {
      system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
      code: 'AMB',
      display: 'ambulatory'
    },
    subject: {
      reference: `Patient/${patientPhn}`,
      display: `Patient ${patientPhn}`
    },
    participant: [
      {
        type: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/v3-ParticipationType',
                code: 'PPRF',
                display: 'primary performer'
              }
            ]
          }
        ],
        individual: {
          reference: `Practitioner/${doctorLicense}`,
          display: `Doctor ${doctorLicense}`
        }
      }
    ],
    period: {
      start: startTime || new Date().toISOString(),
      ...(endTime && { end: endTime })
    },
    reasonCode: complaint ? [
      {
        text: complaint
      }
    ] : undefined,
    extension: []
  };

  if (weight) {
    resource.extension.push({
      url: 'urn:hospital:encounter:weight',
      valueQuantity: {
        value: parseFloat(weight),
        unit: 'kg',
        system: 'http://unitsofmeasure.org',
        code: 'kg'
      }
    });
  }

  if (notes) {
    resource.extension.push({
      url: 'urn:hospital:encounter:notes',
      valueString: notes
    });
  }

  return resource;
};

/**
 * Validate basic FHIR resource structure
 * @param {Object} resource - FHIR resource to validate
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export const validateFHIRResource = (resource) => {
  const errors = [];

  if (!resource.resourceType) {
    errors.push('Missing resourceType');
  }

  const validResourceTypes = ['Patient', 'Practitioner', 'Appointment', 'Encounter'];
  if (resource.resourceType && !validResourceTypes.includes(resource.resourceType)) {
    errors.push(`Invalid resourceType: ${resource.resourceType}`);
  }

  if (!resource.identifier || !Array.isArray(resource.identifier) || resource.identifier.length === 0) {
    errors.push('Missing or invalid identifier array');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};
