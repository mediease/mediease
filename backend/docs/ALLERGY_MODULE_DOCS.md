# FHIR AllergyIntolerance Module Documentation

## Overview

The AllergyIntolerance module implements FHIR R4-compliant allergy management with support for two allergy categories:
1. **Food Allergies** - Food-related reactions
2. **Medication Allergies** - Drug/pharmaceutical reactions

Each allergy is identified by a unique **ALGID** (format: `ALG00001`, `ALG00002`, etc.) auto-generated on creation.

---

## Database Model

### Collection: `allergies`

```javascript
{
  allergyId: String,                  // Unique ALG##### format (auto-generated)
  patientPhn: String,                 // Reference to Patient (PH00001)
  category: String,                   // "food" | "medication"
  criticality: String,                // "low" | "high"
  substance: String,                  // Allergen name (e.g., "Peanut", "Penicillin")
  reaction: String,                   // Reaction description
  recorder: String,                   // Doctor license or Nurse ID who recorded
  recordedDate: Date,                 // ISO date when allergy was recorded
  note: String,                       // Optional free-text note
  fhirResource: Object,               // Full FHIR AllergyIntolerance resource
  createdAt: Date,                    // MongoDB timestamp
  updatedAt: Date                     // MongoDB timestamp
}
```

### Indexes
- `allergyId` (unique)
- `patientPhn` (index)
- `substance` (index)
- `category` (index)
- `recordedDate` (index)
- Compound: `patientPhn + substance`

---

## FHIR AllergyIntolerance Resource Structure

```json
{
  "resourceType": "AllergyIntolerance",
  "id": "ALG00001",
  "meta": {
    "lastUpdated": "2025-11-24T10:30:00.000Z",
    "profile": ["http://hl7.org/fhir/StructureDefinition/AllergyIntolerance"]
  },
  "category": ["food"],
  "criticality": "high",
  "code": {
    "text": "Peanut"
  },
  "patient": {
    "reference": "Patient/PH00001",
    "display": "John Doe"
  },
  "reaction": [
    {
      "description": "Hives and facial swelling"
    }
  ],
  "recordedDate": "2025-11-24T10:30:00.000Z",
  "recorder": {
    "reference": "Practitioner/MED12345",
    "display": "MED12345"
  },
  "note": [
    {
      "text": "Patient confirmed severe reaction on previous exposure"
    }
  ]
}
```

---

## API Endpoints

### 1. Create Allergy

**Endpoint:** `POST /fhir/AllergyIntolerance`

**Authentication:** JWT Required (Bearer Token)

**Authorization:** Doctor or Nurse

**Request Body:**
```json
{
  "patientPhn": "PH00001",
  "category": "food",
  "criticality": "high",
  "substance": "Peanut",
  "reaction": "Hives and facial swelling",
  "recorder": "MED12345",
  "note": "Optional note about the allergy"
}
```

**Field Validation:**
- `patientPhn` (required): Must exist in Patient collection, format PH#####
- `category` (required): Either `"food"` or `"medication"`
- `criticality` (required): Either `"low"` or `"high"`
- `substance` (required): Allergen name (string, max 255 chars)
- `reaction` (required): Reaction description (string)
- `recorder` (required): Doctor license ID or Nurse ID who recorded
- `note` (optional): Free-text note

**Success Response (201):**
```json
{
  "success": true,
  "message": "Allergy created successfully",
  "data": {
    "allergyId": "ALG00001",
    "fhirResource": { ... }
  }
}
```

**Error Responses:**
- `400` - Missing required fields or invalid category/criticality
- `404` - Patient not found
- `403` - Insufficient permissions (not doctor/nurse)

---

### 2. Get All Allergies for Patient (FHIR Bundle)

**Endpoint:** `GET /fhir/AllergyIntolerance/patient/:patientPhn`

**Authentication:** JWT Required

**Authorization:** Doctor, Nurse, or Admin

**Path Parameters:**
- `patientPhn` (required): Patient health number (e.g., `PH00001`)

**Query Parameters:** None

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "resourceType": "Bundle",
    "type": "searchset",
    "total": 2,
    "link": [
      {
        "relation": "self",
        "url": "/fhir/AllergyIntolerance/patient/PH00001"
      }
    ],
    "entry": [
      {
        "fullUrl": "AllergyIntolerance/ALG00001",
        "resource": { ... }
      },
      {
        "fullUrl": "AllergyIntolerance/ALG00002",
        "resource": { ... }
      }
    ]
  }
}
```

**Error Responses:**
- `404` - Patient not found
- `401` - Unauthorized (no token)

---

### 3. Get Allergies Summary (Simplified List)

**Endpoint:** `GET /fhir/AllergyIntolerance/summary/patient/:patientPhn`

**Authentication:** JWT Required

**Authorization:** Doctor, Nurse, or Admin

**Path Parameters:**
- `patientPhn` (required): Patient health number

**Success Response (200):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "allergyId": "ALG00001",
      "substance": "Peanut",
      "category": "food",
      "criticality": "high",
      "reaction": "Hives and facial swelling",
      "recordedDate": "2025-11-24T10:30:00.000Z"
    },
    {
      "allergyId": "ALG00002",
      "substance": "Penicillin",
      "category": "medication",
      "criticality": "high",
      "reaction": "Anaphylaxis",
      "recordedDate": "2025-11-24T10:35:00.000Z"
    }
  ]
}
```

---

### 4. Get Single Allergy

**Endpoint:** `GET /fhir/AllergyIntolerance/:allergyId`

**Authentication:** JWT Required

**Authorization:** Doctor, Nurse, or Admin

**Path Parameters:**
- `allergyId` (required): Allergy ID (e.g., `ALG00001`)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "resourceType": "AllergyIntolerance",
    "id": "ALG00001",
    ...
  }
}
```

**Error Responses:**
- `400` - Invalid allergyId format
- `404` - Allergy not found

---

### 5. Delete Allergy

**Endpoint:** `DELETE /fhir/AllergyIntolerance/:allergyId`

**Authentication:** JWT Required

**Authorization:** Doctor, Nurse, or Admin

**Path Parameters:**
- `allergyId` (required): Allergy ID to delete

**Success Response (200):**
```json
{
  "success": true,
  "message": "Allergy deleted successfully",
  "data": {
    "allergyId": "ALG00001"
  }
}
```

**Error Responses:**
- `400` - Invalid allergyId format
- `404` - Allergy not found

---

## Workflow Examples

### Example 1: Record Food Allergy During Patient Onboarding

1. Doctor creates encounter with patient
2. During encounter, doctor records allergy via POST `/fhir/AllergyIntolerance`
3. System auto-generates `ALG00001` for the allergy
4. Allergy stored with FHIR structure and can be retrieved later

### Example 2: Review Patient Allergies Before Prescribing

1. Doctor searches for patient (gets PHN, e.g., `PH00001`)
2. Calls `GET /fhir/AllergyIntolerance/summary/patient/PH00001` for quick list
3. Sees medication allergies: Penicillin (high criticality)
4. Prescribes alternative antibiotic to avoid contraindication

### Example 3: Comprehensive Allergy Report

1. Administrator requests FHIR Bundle: `GET /fhir/AllergyIntolerance/patient/PH00001`
2. Receives full FHIR-compliant bundle with all allergies
3. Can export bundle to other FHIR-compatible systems

---

## Security & Authorization

| Endpoint | Doctor | Nurse | Admin | Lab Assistant |
|----------|--------|-------|-------|---------------|
| POST (Create) | ✓ | ✓ | ✗ | ✗ |
| GET (Read) | ✓ | ✓ | ✓ | ✗ |
| DELETE | ✓ | ✓ | ✓ | ✗ |

**Notes:**
- All endpoints require JWT authentication
- Doctor and Nurse must be "approved" status
- Admin bypasses approval requirement
- Lab assistants have no access to allergy module

---

## ID Generation

### ALGID (Allergy ID) Format

- **Pattern:** `ALG` + 5 digits
- **Example:** `ALG00001`, `ALG00002`, ..., `ALG99999`
- **Generation:** Automatic on allergy creation (pre-save hook)
- **Uniqueness:** Database unique constraint prevents duplicates
- **Query Logic:** Auto-increments based on last highest allergyId

### Generation Algorithm

```javascript
// idGenerators.js - createALGID()
1. Query Allergy collection for last document sorted by allergyId descending
2. Extract numeric part (substring after "ALG")
3. Increment by 1
4. Pad with zeros to 5 digits
5. Return "ALG" + padded number
```

---

## Error Handling

### Common Error Scenarios

| Scenario | HTTP Code | Message |
|----------|-----------|---------|
| Missing required field | 400 | "patientPhn, category, criticality, substance, reaction, and recorder are required" |
| Invalid category | 400 | "Category must be either 'food' or 'medication'" |
| Invalid criticality | 400 | "Criticality must be either 'low' or 'high'" |
| Patient not found | 404 | "Patient not found" |
| Allergy not found | 404 | "Allergy not found" |
| Invalid allergyId format | 400 | "Invalid allergy ID format. Expected ALG##### format." |
| Insufficient permissions | 403 | "Only doctors and nurses can create allergies" |
| No token provided | 401 | "Not authorized, no token provided" |

---

## Postman Collection Tests

The Postman collection includes 7 comprehensive tests in section "7. Allergy Management":

1. **7.1 Create Food Allergy** - POST with food category, validates ALGID generation
2. **7.2 Create Medication Allergy** - POST with medication category
3. **7.3 Get All Patient Allergies** - GET FHIR Bundle format
4. **7.4 Get Allergies Summary** - GET simplified list
5. **7.5 Get Single Allergy** - GET by allergyId
6. **7.6 Delete Allergy** - DELETE allergy
7. **7.7 Create Allergy by Nurse** - POST by nurse role to verify authorization

All tests include:
- Status code validation
- Response structure validation
- Field validation
- Variable capture for subsequent requests
- Error message validation

---

## Coding Standards

### Model File: `models/allergy.model.js`
- Mongoose schema with pre-save hook for ALGID generation
- Compound index on patientPhn + substance for quick lookup
- Stores both helper fields and full FHIR resource

### Controller File: `controllers/allergy.controller.js`
- Using `express-async-handler` for clean async/await error handling
- Proper try/catch blocks with descriptive error messages
- FHIR resource construction with proper structure
- Pagination support for bundle responses

### Routes File: `routes/allergy.routes.js`
- Protected endpoints with JWT middleware (`protect`)
- Role-based authorization via `authorize` middleware
- Approval status check via `checkApprovalStatus`

### ID Generator: `utils/idGenerators.js`
- `createALGID()` - Async function to generate next ALGID
- `isValidALGID()` - Regex validator for ALGID format
- Handles edge case of first allergy (returns ALG00001)

---

## Testing Guide

### Prerequisites
1. Start server: `npm start`
2. Open Postman collection: `docs/postman_final_complete_suite.json`
3. Set `baseUrl` to `http://localhost:5000`

### Test Sequence
1. Run Section 1 (Auth) - Get tokens
2. Run Section 2 (Patients) - Create test patient, capture PHN
3. Run Section 3 (Practitioners) - Create test doctor/nurse
4. Run Section 7 (Allergies) - Test all allergy operations
5. Verify responses and FHIR structure

### Expected Results
- All 7 tests in Section 7 should pass
- ALGID format should match `/^ALG\d{5}$/`
- FHIR Bundle should contain valid AllergyIntolerance resources
- Deletion should succeed and allergy should not be retrievable

---

## Future Enhancements

1. **Severity Levels** - Add severity beyond just criticality
2. **Onset Date** - Track when allergy was first detected
3. **Last Occurrence** - Track last reaction date
4. **Status Field** - Track allergy status (active, inactive, resolved)
5. **Clinical Notes** - Support rich text or markdown for detailed notes
6. **Reaction Coding** - Support SNOMED/LOINC codes for reactions
7. **Verification Status** - Track if allergy has been confirmed by lab test
8. **Management Plans** - Track treatment/avoidance plans for each allergy
9. **Audit Trail** - Log all creates/updates/deletes with user tracking
10. **Export** - Export allergies as FHIR XML or HL7v2 formats

---

## Related Resources

- **FHIR Standard:** [AllergyIntolerance](http://hl7.org/fhir/R4/allergyintolerance.html)
- **Project Structure:** See `STRUCTURE.md`
- **API Documentation:** See `README_COMPLETE.md`
- **Lab Module:** See lab documentation in `docs/api-docs.md`
