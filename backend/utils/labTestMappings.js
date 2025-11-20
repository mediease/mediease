export const LAB_TEST_CODE_MAP = {
  xray: { system: 'http://snomed.info/sct', code: '30758008', display: 'Plain X-ray study' },
  ecg: { system: 'http://snomed.info/sct', code: '164847007', display: 'Electrocardiography' },
  blood_sugar: { system: 'http://loinc.org', code: '2339-0', display: 'Glucose [Mass/volume] in Blood' },
  cbc: { system: 'http://loinc.org', code: '57021-8', display: 'Complete blood count panel' }
};

export function getLabTestCoding(testType) {
  return LAB_TEST_CODE_MAP[testType] || { system: 'http://example.org/unknown', code: testType, display: testType };
}
