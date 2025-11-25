# AllergyIntolerance Module - Quick Reference

## 🎯 Module Overview

FHIR-compliant allergy management for food and medication allergies with auto-generated ALGID.

---

## 📦 Files Added

```
models/allergy.model.js                    ← Database model
controllers/allergy.controller.js          ← 5 API handlers
routes/allergy.routes.js                   ← 5 endpoints
utils/idGenerators.js                      ← Updated with createALGID()
docs/ALLERGY_MODULE_DOCS.md               ← Full documentation
docs/ALLERGY_MODULE_IMPLEMENTATION.md     ← This implementation summary
postman_final_complete_suite.json         ← Added Section 7 (7 tests)
app.js                                     ← Updated with allergy routes
```

---

## 🔌 API Endpoints

```
POST   /fhir/AllergyIntolerance                          Create allergy
GET    /fhir/AllergyIntolerance/patient/:phn            Get all (Bundle)
GET    /fhir/AllergyIntolerance/summary/patient/:phn    Get summary list
GET    /fhir/AllergyIntolerance/:allergyId              Get single
DELETE /fhir/AllergyIntolerance/:allergyId              Delete
```

---

## 🔑 Key Features

| Feature | Value |
|---------|-------|
| ID Format | ALG##### (e.g., ALG00001) |
| ID Generation | Auto on create (pre-save hook) |
| Categories | food \| medication |
| Criticality | low \| high |
| FHIR Compliant | ✓ Yes (R4) |
| Authentication | JWT required |
| Authorization | Doctor, Nurse (create); Doctor, Nurse, Admin (read/delete) |
| Database | MongoDB allergies collection |
| Error Handling | Comprehensive with proper HTTP codes |

---

## 📝 Create Allergy Request

```bash
POST /fhir/AllergyIntolerance
{
  "patientPhn": "PH00001",
  "category": "food",              # or "medication"
  "criticality": "high",            # or "low"
  "substance": "Peanut",
  "reaction": "Hives and swelling",
  "recorder": "MED12345",           # or "NUR00001"
  "note": "Optional note"           # optional
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "allergyId": "ALG00001",
    "fhirResource": { ... }
  }
}
```

---

## 🧪 Postman Tests (Section 7)

| # | Test | Validates |
|---|------|-----------|
| 7.1 | Create Food Allergy | POST, ALGID format, FHIR resource |
| 7.2 | Create Medication Allergy | Medication category, high criticality |
| 7.3 | Get All Allergies (Bundle) | FHIR Bundle response type, entries |
| 7.4 | Get Summary List | Simplified list structure |
| 7.5 | Get Single Allergy | Individual retrieval by ALGID |
| 7.6 | Delete Allergy | Successful deletion |
| 7.7 | Create by Nurse | Nurse authorization |

---

## 🛡️ Authorization Matrix

| Endpoint | Doctor | Nurse | Admin | Lab Asst |
|----------|--------|-------|-------|---------|
| POST (Create) | ✓ | ✓ | ✗ | ✗ |
| GET (Read) | ✓ | ✓ | ✓ | ✗ |
| DELETE | ✓ | ✓ | ✓ | ✗ |

---

## 🔍 Database Schema

```javascript
{
  allergyId: String,         // ALG##### (unique)
  patientPhn: String,        // Patient reference
  category: String,          // food | medication
  criticality: String,       // low | high
  substance: String,         // Allergen name
  reaction: String,          // Reaction description
  recorder: String,          // Doctor license or Nurse ID
  recordedDate: Date,        // Auto-filled
  note: String,              // Optional
  fhirResource: Object,      // Full FHIR resource
  createdAt: Date,           // MongoDB
  updatedAt: Date            // MongoDB
}
```

---

## ⚡ Quick Start (Testing)

1. **Start Server:**
   ```bash
   npm start
   ```
   Expected: "Server running on port 5000"

2. **Login (Postman):**
   - Run Section 1 (Auth) → Get doctor/nurse tokens

3. **Create Allergy:**
   - Run Section 7.1 → Should get ALG##### in response

4. **View Allergies:**
   - Run Section 7.3 or 7.4 → See FHIR Bundle or summary

5. **Delete Allergy:**
   - Run Section 7.6 → Should succeed

---

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| 403 Forbidden | Ensure user is doctor/nurse and approved |
| 404 Patient not found | Verify patientPhn exists and format is PH##### |
| 400 Invalid category | Use "food" or "medication" (lowercase) |
| 400 Invalid criticality | Use "low" or "high" (lowercase) |
| 401 No token | Include `Authorization: Bearer {token}` header |

---

## 📊 FHIR Resource Example

```json
{
  "resourceType": "AllergyIntolerance",
  "id": "ALG00001",
  "meta": {
    "lastUpdated": "2025-11-24T10:30:00.000Z"
  },
  "category": ["food"],
  "criticality": "high",
  "code": { "text": "Peanut" },
  "patient": {
    "reference": "Patient/PH00001",
    "display": "John Doe"
  },
  "reaction": [{
    "description": "Hives and facial swelling"
  }],
  "recordedDate": "2025-11-24T10:30:00.000Z",
  "recorder": {
    "reference": "Practitioner/MED12345",
    "display": "MED12345"
  },
  "note": [{
    "text": "Patient confirmed severe reaction"
  }]
}
```

---

## 🔗 Integration

- **Authentication:** Uses existing JWT middleware
- **Authorization:** Uses existing role middleware
- **Database:** Connected via MongoDB
- **Patient Lookup:** References FHIRPatient via PHN
- **Routes:** Mounted at `/fhir` (REST prefix)

---

## 📚 Documentation

- **Full API Docs:** `ALLERGY_MODULE_DOCS.md`
- **Implementation Summary:** `ALLERGY_MODULE_IMPLEMENTATION.md`
- **Postman Tests:** Section 7 in `postman_final_complete_suite.json`

---

## ✅ Validation

```
✓ All files created successfully
✓ No syntax errors
✓ Server running and connected to MongoDB
✓ Allergy routes mounted correctly
✓ All middleware properly configured
✓ Postman tests ready to execute
✓ FHIR compliance verified
✓ Documentation complete
```

---

## 🚀 Status

**MODULE STATUS:** ✅ COMPLETE AND OPERATIONAL

**Server:** Running on http://localhost:5000
**Database:** MongoDB Connected
**Ready for:** Production testing

---

**Created:** November 24, 2025
**Version:** 1.0
**Specification:** FHIR R4 AllergyIntolerance
