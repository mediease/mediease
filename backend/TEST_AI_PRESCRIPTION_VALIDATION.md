# Test AI Prescription Validation API

## Quick Test - Single API Call

### Prerequisites:
1. **You must have an active encounter** for the patient first
2. **Get your auth token** from login
3. **Ensure AI service is running** on `http://0.0.0.0:8000`

---

## Single Test API Call (cURL)

```bash
curl -X POST http://localhost:5000/fhir/MedicationRequest \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN_HERE" \
  -d '{
    "patientPhn": "PH00001",
    "medicalLicenseId": "MED12345",
    "visitType": "OPD",
    "status": "Draft",
    "complaint": "Fever and headache",
    "prescriptionItems": [
      {
        "name": "Ibuprofen 200mg Tablet",
        "dose": "1 tablet",
        "frequency": "TDS",
        "period": "5 days",
        "doseComment": "After meals"
      },
      {
        "name": "Paracetamol 500mg",
        "dose": "2 tablets",
        "frequency": "BD",
        "period": "3 days",
        "doseComment": "With water"
      }
    ]
  }'
```

---

## Expected Response

```json
{
  "success": true,
  "message": "Prescription created",
  "data": {
    "resourceType": "MedicationRequest",
    "id": "PR00001",
    "status": "draft",
    "intent": "order",
    "subject": {
      "reference": "Patient/PH00001"
    },
    "requester": {
      "reference": "Practitioner/MED12345"
    },
    "authoredOn": "2025-01-XX...",
    "dosageInstruction": [...],
    "note": [...],
    "extension": [...]
  },
  "aiValidation": {
    "success": true,
    "warnings": [
      {
        "medicineName": "Ibuprofen 200mg Tablet",
        "drugClass": "NSAID",
        "relatedCondition": "Gastritis",
        "severity": "high",
        "message": "Ibuprofen 200mg Tablet is classified as NSAID. These drugs may worsen gastric irritation and increase the risk of gastric ulcers. Patient has Gastritis.",
        "suggestedAlternatives": ["Paracetamol", "Acetaminophen"]
      }
    ],
    "safe": false
  }
}
```

---

## Complete Test Flow

### Step 1: Login to get token
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor@hospital.com",
    "password": "password123",
    "role": "doctor"
  }'
```

### Step 2: Create an encounter (if not exists)
```bash
curl -X POST http://localhost:5000/clinic/start/PH00001 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "complaint": "Fever and headache",
    "weight": 70,
    "notes": "Patient presents with fever"
  }'
```

### Step 3: Create prescription (triggers AI validation)
```bash
curl -X POST http://localhost:5000/fhir/MedicationRequest \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "patientPhn": "PH00001",
    "medicalLicenseId": "MED12345",
    "visitType": "OPD",
    "status": "Draft",
    "complaint": "Fever and headache",
    "prescriptionItems": [
      {
        "name": "Ibuprofen 200mg Tablet",
        "dose": "1 tablet",
        "frequency": "TDS",
        "period": "5 days",
        "doseComment": "After meals"
      }
    ]
  }'
```

---

## Using Postman or Thunder Client

**URL:** `POST http://localhost:5000/fhir/MedicationRequest`

**Headers:**
```
Authorization: Bearer YOUR_AUTH_TOKEN_HERE
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "patientPhn": "PH00001",
  "medicalLicenseId": "MED12345",
  "visitType": "OPD",
  "status": "Draft",
  "complaint": "Fever and headache",
  "prescriptionItems": [
    {
      "name": "Ibuprofen 200mg Tablet",
      "dose": "1 tablet",
      "frequency": "TDS",
      "period": "5 days",
      "doseComment": "After meals"
    }
  ]
}
```

---

## JavaScript/Fetch Example

```javascript
const testPrescription = async () => {
  const token = 'YOUR_AUTH_TOKEN_HERE';
  
  const response = await fetch('http://localhost:5000/fhir/MedicationRequest', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      patientPhn: 'PH00001',
      medicalLicenseId: 'MED12345',
      visitType: 'OPD',
      status: 'Draft',
      complaint: 'Fever and headache',
      prescriptionItems: [
        {
          name: 'Ibuprofen 200mg Tablet',
          dose: '1 tablet',
          frequency: 'TDS',
          period: '5 days',
          doseComment: 'After meals'
        }
      ]
    })
  });
  
  const result = await response.json();
  console.log('AI Validation Result:', result.aiValidation);
  return result;
};

testPrescription();
```

---

## Notes

- Replace `YOUR_AUTH_TOKEN_HERE` with your actual JWT token
- Replace `PH00001` with a valid patient PHN that has an active encounter
- Replace `MED12345` with a valid doctor medical license ID
- The AI service must be running on `http://0.0.0.0:8000`
- The `aiValidation` field will be included in the response automatically

