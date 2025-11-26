export const LAB_TEST_CODE_MAP = {
  ecg: { system: 'http://snomed.info/sct', code: '164847007', display: 'Electrocardiography' },
  blood_sugar: { system: 'http://loinc.org', code: '2339-0', display: 'Blood Glucose' },
  cbc: { system: 'http://loinc.org', code: '57021-8', display: 'Complete blood count panel' },
  xray: { system: 'http://snomed.info/sct', code: '30758008', display: 'X-ray study' },

  lipid_profile: { system: 'http://loinc.org', code: '24331-1', display: 'Lipid Panel' },
  urine_test: { system: 'http://loinc.org', code: 'LAB347', display: 'Urinalysis' },
  lft: { system: 'http://loinc.org', code: 'LAB20', display: 'Liver Function Test' },
  kft: { system: 'http://loinc.org', code: 'LAB15', display: 'Kidney Function Test' },
};

export function getLabTestCoding(testType) {
  return LAB_TEST_CODE_MAP[testType] || {
    system: 'http://example.org/custom',
    code: testType,
    display: testType
  };
}

// RULE ENGINE
export function getLabTestConfig(testType) {
  const config = {
    ecg: {
      file: { required: true, prohibited: false, allowedMimeTypes: ['application/pdf'] },
      requiredParams: []
    },
    blood_sugar: {
      file: { required: false, prohibited: true },
      requiredParams: ['value']
    },
    cbc: {
      file: { required: false, prohibited: false },
      requiredParams: ['wbc', 'rbc', 'platelets']
    },
    xray: {
      file: {
        required: true,
        prohibited: false,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'application/pdf']
      },
      requiredParams: []
    },
    kft: {
      file: { required: false, prohibited: false },
      requiredParams: ['creatinine', 'urea', 'bun', 'egfr', 'uric_acid', 'sodium', 'potassium', 'chloride']
    }
  };

  return config[testType];
}
