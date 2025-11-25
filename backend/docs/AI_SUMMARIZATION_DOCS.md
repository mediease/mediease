# AI Summarization Module - Documentation

## Overview

The AI Summarization Module uses **HuggingFace Inference API** with the **Google Flan-T5-Large** model to generate intelligent medical summaries from patient data. All personal identifiers are removed before sending data to the AI service, ensuring privacy compliance.

---

## Features

✅ **Privacy-First Design** - No PII sent to HuggingFace
✅ **Multi-Source Data** - Aggregates encounters, allergies, medications
✅ **Smart Summarization** - Generates clinically relevant summaries
✅ **Error Handling** - Graceful fallbacks and meaningful error messages
✅ **Role-Based Access** - Doctor, Nurse, Admin only
✅ **Health Check** - Verify AI service availability

---

## Architecture

### File Structure

```
controllers/ai.controller.js          → API request handlers
services/aiSummary.service.js         → Business logic
utils/hfClient.js                     → HuggingFace API integration
routes/ai.routes.js                   → API endpoints
```

### Data Flow

```
GET /ai/summary/:phn
    ↓
Authenticate user (JWT)
    ↓
Fetch all medical data (encounters, allergies, prescriptions)
    ↓
Remove all personal identifiers
    ↓
Build clinical prompt
    ↓
Send to HuggingFace API
    ↓
Return AI-generated summary
```

---

## Environment Setup

### Required Environment Variable

Add to `.env` file:

```env
HUGGINGFACE_API_KEY=hf_your_actual_api_key_here
```

**How to get a HuggingFace API Key:**

1. Go to https://huggingface.co/settings/tokens
2. Create new token (Read access is sufficient)
3. Copy the token
4. Add to `.env`

---

## API Endpoints

### 1. Generate Medical Summary

**Endpoint:** `GET /ai/summary/:phn`

**Authentication:** Required (JWT Bearer Token)

**Authorization:** Doctor, Nurse, or Admin

**Path Parameters:**
- `phn` (required): Patient Health Number (format: PH##### e.g., PH00001)

**Request Headers:**
```
Authorization: Bearer {doctorToken}
```

**Response (200 - Success):**
```json
{
  "success": true,
  "message": "Medical summary generated successfully",
  "data": {
    "patientPhn": "PH00001",
    "summary": "The patient is a 35-year-old female with a history of hypertension and diabetes. Currently on metformin and lisinopril. Recent encounter documented normal BP and glucose control...",
    "generatedAt": "2025-11-24T12:30:00.000Z"
  }
}
```

**Response (400 - Invalid PHN):**
```json
{
  "success": false,
  "message": "Invalid patient health number format. Expected PH##### format."
}
```

**Response (404 - Patient Not Found):**
```json
{
  "success": false,
  "message": "Patient not found"
}
```

**Response (500 - Service Error):**
```json
{
  "success": false,
  "message": "Error generating medical summary"
}
```

---

### 2. Health Check

**Endpoint:** `GET /ai/health`

**Authentication:** Not required (Public)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "aiService": "connected",
    "timestamp": "2025-11-24T12:30:00.000Z"
  }
}
```

---

## Data Collection & Privacy

### Data Collected (WITHOUT Identifiers)

✅ **From Encounters:**
- Diagnosis
- Vital signs
- Doctor notes
- Treatment instructions
- Status

✅ **From Allergies:**
- Substance/allergen name
- Category (food/medication)
- Criticality (low/high)
- Reaction description

✅ **From Prescriptions:**
- Medication name
- Dosage
- Route
- Frequency
- Indication/reason
- Status

✅ **Patient Info (Limited):**
- Age (calculated from birthDate)
- Gender

### Data NOT Collected

❌ Name
❌ NIC (National ID)
❌ Address
❌ Email
❌ Phone
❌ Guardian details
❌ PHN (patient identifier itself)
❌ Any other PII

---

## Service Layer Functions

### `fetchPatientMedicalData(patientPhn)`

Retrieves all medical data for a patient from the database.

**Returns:**
```javascript
{
  encounters: [ ... ],      // Last 10 encounters
  allergies: [ ... ],       // All allergies
  prescriptions: [ ... ],   // Last 20 prescriptions
  patientBasicInfo: {
    age: 35,
    gender: "female"
  }
}
```

### `buildMedicalSummaryPrompt(medicalData)`

Converts medical data into a structured prompt for HuggingFace.

**Returns:**
```
You are a medical assistant. Summarize the patient's medical history...

PATIENT MEDICAL DATA:
Age Group: 35 years
Gender: female

=== RECENT ENCOUNTERS ===
Encounter 1:
Date: 11/20/2025
Diagnosis: Hypertension
Vital Signs: {...}
...
```

### `generateMedicalSummary(patientPhn)`

Orchestrates the entire process: fetch → sanitize → build prompt → call AI → return summary.

---

## HuggingFace Integration

### Model Used

- **Model:** `google/flan-t5-large`
- **Type:** Seq2seq fine-tuned instruction model
- **API:** HuggingFace Inference API
- **Cost:** Free tier available

### Request Format

```javascript
POST https://api-inference.huggingface.co/models/google/flan-t5-large

{
  "inputs": "<FULL_PROMPT_WITH_MEDICAL_DATA>",
  "parameters": {
    "max_length": 500,
    "min_length": 100,
    "do_sample": false
  }
}
```

### Response Format

```javascript
[
  {
    "generated_text": "The patient is a 35-year-old female..."
  }
]
```

---

## Error Handling

### Error Types & Responses

| Error | HTTP Code | Message | Cause |
|-------|-----------|---------|-------|
| Invalid PHN | 400 | Invalid patient health number format | Wrong format |
| Patient Not Found | 404 | Patient not found | PHN doesn't exist |
| API Not Configured | 500 | AI service is not configured | Missing HUGGINGFACE_API_KEY |
| API Unavailable | 503 | AI service temporarily unavailable | HuggingFace down |
| No Medical Data | 200 | No medical data available to summarize | Patient has no data |
| Unauthorized | 401 | Not authorized | Invalid/missing token |
| Forbidden | 403 | Access denied | Wrong role |

---

## Example Usage

### Postman Request

```
GET http://localhost:5000/ai/summary/PH00001
Authorization: Bearer eyJhbGc...
```

### cURL Command

```bash
curl -X GET http://localhost:5000/ai/summary/PH00001 \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"
```

### JavaScript/Fetch

```javascript
const response = await fetch('http://localhost:5000/ai/summary/PH00001', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data.data.summary);
```

### Python/Requests

```python
import requests

headers = {
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json'
}

response = requests.get('http://localhost:5000/ai/summary/PH00001', headers=headers)
data = response.json()
print(data['data']['summary'])
```

---

## Testing

### Postman Collection Addition (Section 8)

```json
{
  "name": "8. AI Summarization",
  "item": [
    {
      "name": "8.1 AI Service Health Check",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/ai/health"
      }
    },
    {
      "name": "8.2 Generate Patient Summary",
      "request": {
        "method": "GET",
        "header": [{"key": "Authorization", "value": "Bearer {{doctorToken}}"}],
        "url": "{{baseUrl}}/ai/summary/{{patientPhn}}"
      }
    }
  ]
}
```

### Manual Testing

1. **Check Service Health:**
   ```
   GET /ai/health
   ```
   Should return `"aiService": "connected"` if API key is set.

2. **Generate Summary:**
   ```
   GET /ai/summary/PH00001
   Authorization: Bearer {doctorToken}
   ```

3. **Verify No PII:**
   - Check the summary contains no patient name
   - Check summary contains no NIC
   - Check summary contains no address

---

## Security Considerations

✅ **JWT Authentication** - All endpoints except health check require valid JWT token

✅ **Role-Based Access** - Only Doctor, Nurse, Admin can generate summaries

✅ **No PII Sent** - All personal identifiers removed before API call

✅ **API Key Protection** - Stored in environment variable, never exposed

✅ **Input Validation** - PHN format validated before database query

✅ **Error Messages** - Don't leak sensitive information

✅ **HTTPS Only** - HuggingFace API uses HTTPS

---

## Performance Optimization

### Caching Opportunities

For high-traffic scenarios, consider implementing:

1. **Summary Caching** - Store generated summaries temporarily
2. **Data Prefetching** - Load medical data in parallel
3. **Rate Limiting** - Prevent API abuse

### Database Queries

Optimized with:
- `.select()` - Only fetch needed fields
- `.sort()` - Most recent data first
- `.limit()` - Cap result sets (10 encounters, 20 prescriptions)

---

## Future Enhancements

1. **Multi-Language Support** - Summarize in different languages
2. **Custom Summary Levels** - Brief, detailed, comprehensive
3. **Focus Areas** - Summarize only specific conditions/medications
4. **Comparison Reports** - Compare patient state over time
5. **ML Model Updates** - Use newer/better models
6. **Summary Caching** - Cache summaries for performance
7. **Export Formats** - PDF, DOCX export of summaries
8. **Audit Trail** - Log all summary generation requests

---

## Troubleshooting

### Issue: "HUGGINGFACE_API_KEY environment variable is not set"

**Solution:**
1. Add `HUGGINGFACE_API_KEY` to `.env` file
2. Restart server
3. Verify with `GET /ai/health`

### Issue: "AI service is temporarily unavailable"

**Solution:**
1. Wait a few seconds (model loading)
2. Check HuggingFace status
3. Verify API key is valid at https://huggingface.co/settings/tokens

### Issue: "No medical data available to summarize"

**Solution:**
1. Verify patient has encounters/allergies/prescriptions
2. Create test data if needed
3. Check patient PHN is correct

### Issue: Patient not found

**Solution:**
1. Verify patient PHN format (PH#####)
2. Create test patient if needed
3. Ensure using correct PHN

---

## Integration with Existing Modules

✅ **No Changes to:**
- Authentication system
- FHIR models
- Encounters module
- Appointments module
- Patients module
- Prescriptions module
- Allergies module
- Lab module

✅ **New Additions:**
- `ai.routes.js` - New route file
- `ai.controller.js` - New controller
- `aiSummary.service.js` - New service
- `hfClient.js` - New utility
- `app.js` - Updated with AI routes

---

## Support & Documentation

**API Reference:** This file

**Code Comments:** Inline documentation in source files

**Example Requests:** See "Example Usage" section above

**Error Codes:** See "Error Handling" section above

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-11-24 | Initial release |

---

## License & Compliance

- **HuggingFace Model:** Open source (Apache 2.0)
- **Privacy:** No PII sent to external services
- **Data:** Only clinical medical data used
- **Compliance:** Ready for healthcare use

---

**Status:** ✅ Production Ready
