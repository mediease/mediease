# Postman Setup for AI Prescription Validation Testing

## Quick Import Guide

### Step 1: Import Collection
1. Open Postman
2. Click **Import** button (top left)
3. Select the file: `backend/docs/postman_ai_prescription_validation_collection.json`
4. Click **Import**

### Step 2: Set Environment Variables
After importing, set these variables in Postman:

1. Click on the collection name → **Variables** tab
2. Or create a new Environment and set:

| Variable | Example Value | Description |
|----------|---------------|-------------|
| `baseUrl` | `http://localhost:5000` | Your backend URL |
| `authToken` | (auto-filled) | JWT token from login |
| `patientPhn` | `PH00001` | Patient Health Number |
| `medicalLicenseId` | `MED12345` | Doctor's Medical License ID |
| `userRole` | (auto-filled) | User role (doctor/nurse/admin) |

### Step 3: Run Tests in Order

#### Request 1: Login (Get Token)
- **Purpose**: Get authentication token
- **Updates**: Automatically saves `authToken` and `medicalLicenseId` to variables
- **Update**: Change email/password/role in the body as needed

#### Request 2: Create Encounter (Required First)
- **Purpose**: Create an active encounter for the patient
- **Important**: Must run before creating prescription
- **Updates**: Uses `{{patientPhn}}` variable

#### Request 3: Create Prescription with AI Validation ⭐
- **Purpose**: Main test - creates prescription and triggers AI validation
- **What it does**:
  - Creates a prescription with Ibuprofen and Paracetamol
  - Automatically calls AI validation service
  - Returns response with `aiValidation` field
- **Tests**: Automatically validates response structure and logs warnings

#### Request 4: Test with Risky Drug
- **Purpose**: Test AI validation with a known risky combination
- **Scenario**: Ibuprofen (NSAID) for patient with Gastritis history
- **Expected**: Should return warnings in `aiValidation.warnings`

---

## Single Request (Standalone)

If you just want to test the prescription creation directly:

### URL
```
POST http://localhost:5000/fhir/MedicationRequest
```

### Headers
```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

### Body (JSON)
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

### Expected Response
```json
{
  "success": true,
  "message": "Prescription created",
  "data": {
    "resourceType": "MedicationRequest",
    "id": "PR00001",
    ...
  },
  "aiValidation": {
    "success": true,
    "warnings": [],
    "safe": true
  }
}
```

---

## Prerequisites

1. ✅ **Backend running** on `http://localhost:5000`
2. ✅ **AI service running** on `http://0.0.0.0:8000`
3. ✅ **Valid patient** with PHN that exists in database
4. ✅ **Active encounter** for that patient (create via Request 2)
5. ✅ **Valid doctor** with medical license ID
6. ✅ **Authentication token** (get from Request 1)

---

## Troubleshooting

### "AI validation service unavailable"
- Make sure AI service is running: `http://0.0.0.0:8000`
- Check AI service health: `GET http://0.0.0.0:8000/ai/health`

### "Doctor must create an encounter before adding a prescription"
- Run Request 2 first to create an encounter
- Or create encounter via: `POST /clinic/start/:phn`

### "Invalid credentials" or 401
- Run Request 1 (Login) first to get a fresh token
- Check that user role matches (doctor/nurse/admin)

### No `aiValidation` in response
- Check backend logs for AI service errors
- Verify AI service is accessible from backend
- Check network connectivity between backend and AI service

---

## Test Scenarios

### Scenario 1: Safe Prescription
- **Medicines**: Paracetamol
- **Expected**: `aiValidation.safe = true`, no warnings

### Scenario 2: Risky Combination
- **Medicines**: Ibuprofen (NSAID)
- **Patient History**: Has "Gastritis" complaint in past encounters
- **Expected**: `aiValidation.safe = false`, warnings about NSAID + Gastritis

### Scenario 3: Multiple Medicines
- **Medicines**: Ibuprofen + Paracetamol + Antibiotic
- **Expected**: Validation checks all medicines against all conditions

---

## What Gets Validated

The AI validation checks:
- ✅ Drug classification (what class each medicine belongs to)
- ✅ Patient conditions (from all past encounter complaints)
- ✅ Drug-condition interactions (risky combinations)
- ✅ Severity assessment (low/medium/high)
- ✅ Suggested alternatives (if risky)

All validation happens automatically when you create a prescription!

