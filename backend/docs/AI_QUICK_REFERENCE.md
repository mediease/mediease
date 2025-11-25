# AI Summarization Module - Quick Start Guide

## Setup (2 Steps)

### 1. Get HuggingFace API Key

```
1. Visit: https://huggingface.co/settings/tokens
2. Click "New token"
3. Select "Read" access
4. Copy the token
```

### 2. Add to .env

```env
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## API Endpoint

```
GET /ai/summary/:phn
Authorization: Bearer {token}
```

**Example:**
```bash
curl -X GET http://localhost:5000/ai/summary/PH00001 \
  -H "Authorization: Bearer {doctorToken}"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "patientPhn": "PH00001",
    "summary": "The patient is a 35-year-old female with a history of hypertension...",
    "generatedAt": "2025-11-24T12:30:00.000Z"
  }
}
```

---

## Files Added

```
controllers/ai.controller.js      ← API handlers
services/aiSummary.service.js     ← Business logic
utils/hfClient.js                 ← HuggingFace integration
routes/ai.routes.js               ← Endpoints
```

## Files Modified

```
app.js                             ← Added AI routes import & mounting
```

---

## Features

✅ Privacy-first (no PII sent to AI)
✅ Multi-source data (encounters, allergies, meds)
✅ Smart summarization
✅ Role-based access (Doctor/Nurse/Admin)
✅ Health check endpoint
✅ Comprehensive error handling

---

## Data Sources

**Encounters:**
- Diagnosis
- Vital signs
- Doctor notes
- Instructions

**Allergies:**
- Substance
- Criticality
- Reaction

**Prescriptions:**
- Medication
- Dosage
- Frequency
- Indication

**Patient Info:**
- Age (calculated)
- Gender

---

## Security

- JWT authentication required
- Role-based authorization
- All PII removed before sending to AI
- API key stored in environment variable
- HTTPS-only HuggingFace connection

---

## Testing

### Health Check
```
GET /ai/health
```

### Generate Summary
```
GET /ai/summary/PH00001
Authorization: Bearer {token}
```

---

## Error Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Invalid PHN or bad request |
| 401 | Unauthorized (no token) |
| 403 | Forbidden (wrong role) |
| 404 | Patient not found |
| 500 | Server error |
| 503 | AI service unavailable |

---

## Example Flow

```
1. Doctor logs in → Gets JWT token
2. Doctor requests: GET /ai/summary/PH00001
3. System fetches patient medical data
4. System removes all personal identifiers
5. System sends clinical data to HuggingFace
6. HuggingFace AI generates summary
7. System returns summary to doctor
```

---

## Integration

✅ Works with existing:
- Patient data
- Encounters
- Allergies
- Prescriptions
- Authentication
- Authorization

❌ Does NOT modify:
- Any existing modules
- Database schemas
- Authentication system
- FHIR models

---

## Troubleshooting

**"AI service not configured"**
→ Add HUGGINGFACE_API_KEY to .env

**"AI service temporarily unavailable"**
→ Wait a minute, HuggingFace model is loading

**"Patient not found"**
→ Verify PHN format (PH##### ) and patient exists

**"No medical data to summarize"**
→ Patient has no encounters/allergies/prescriptions

---

## Service Health

Check AI service status:
```
GET /ai/health
```

Returns:
- `connected` - API key configured and working
- `not_configured` - API key missing

---

**Version:** 1.0
**Status:** ✅ Production Ready
**Model:** Google Flan-T5-Large (HuggingFace)
