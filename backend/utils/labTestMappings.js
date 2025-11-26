// utils/labTestMappings.js

export const LAB_TEST_CODE_MAP = {
  ecg: {
    system: 'http://snomed.info/sct',
    code: '164847007',
    display: 'Electrocardiography'
  },
  blood_sugar: {
    system: 'http://loinc.org',
    code: '2339-0',
    display: 'Glucose [Mass/volume] in Blood'
  },
  cbc: {
    system: 'http://loinc.org',
    code: '57021-8',
    display: 'Complete blood count panel'
  },
  xray: {
    system: 'http://snomed.info/sct',
    code: '30758008',
    display: 'Plain X-ray study'
  },
  lipid_profile: {
    system: 'http://loinc.org',
    code: '24331-1',
    display: 'Lipid Panel'
  },
  urine_test: {
    system: 'http://loinc.org',
    code: 'LAB347',
    display: 'Urinalysis'
  },
  lft: {
    system: 'http://loinc.org',
    code: 'LAB20',
    display: 'Liver Function Tests'
  },
  kft: {
    system: 'http://loinc.org',
    code: 'LAB15',
    display: 'Kidney Function Tests'
  }
};

export function getLabTestCoding(testType) {
  return (
    LAB_TEST_CODE_MAP[testType] || {
      system: 'http://example.org/custom',
      code: testType,
      display: testType
    }
  );
}

/**
 * Strict rules for each test:
 * - file: { required, prohibited, allowedMimeTypes }
 * - requiredParams: all required fields in req.body
 */
export function getLabTestConfig(testType) {
  const configs = {
    ecg: {
      file: {
        required: true,
        prohibited: false,
        allowedMimeTypes: ['application/pdf']
      },
      requiredParams: [] // no structured parameters, PDF + optional text
    },

    blood_sugar: {
      file: {
        required: false,
        prohibited: true // no file allowed
      },
      // Strict: require numeric or text value in this field
      requiredParams: ['value']
    },

    cbc: {
      file: {
        required: false,
        prohibited: false // text required, file optional
      },
      requiredParams: [
        'hemoglobin',
        'rbc',
        'hematocrit',
        'mcv',
        'mch',
        'mchc',
        'wbc',
        'neutrophils',
        'lymphocytes',
        'monocytes',
        'eosinophils',
        'basophils',
        'platelets'
      ]
    },

    xray: {
      file: {
        required: true,
        prohibited: false,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'application/pdf']
      },
      requiredParams: [] // radiologist findings can go into resultText
    },

    lipid_profile: {
      file: {
        required: false,
        prohibited: false
      },
      requiredParams: [
        'totalCholesterol',
        'ldl',
        'hdl',
        'triglycerides',
        'vldl'
      ]
    },

    urine_test: {
      file: {
        required: false,
        prohibited: false // PDF optional
      },
      requiredParams: [
        'color',
        'clarity',
        'pH',
        'specificGravity',
        'protein',
        'glucose',
        'ketones',
        'bilirubin',
        'nitrites',
        'leukocytes',
        'rbc',
        'wbc',
        'epithelialCells',
        'bacteria'
      ]
    },

    lft: {
      file: {
        required: false,
        prohibited: false
      },
      requiredParams: [
        'alt',
        'ast',
        'alp',
        'ggt',
        'totalBilirubin',
        'directBilirubin',
        'indirectBilirubin',
        'albumin',
        'totalProtein'
      ]
    },

    kft: {
      file: {
        required: false,
        prohibited: false
      },
      requiredParams: [
        'creatinine',
        'urea',
        'bun',
        'egfr',
        'uricAcid',
        'sodium',
        'potassium',
        'chloride'
      ]
    }
  };

  return configs[testType];
}
