# Fix: "Body has already been read" Error

## Problem
The AI summarization endpoint was failing with:
```
Error: Body is unusable: Body has already been read
```

## Root Cause
In `utils/hfClient.js`, the response body was being read **multiple times**:

1. **Line 40**: Error handling called `response.json()` to parse error response
2. **Line 44**: Fallback called `response.text()` after JSON failed (second read attempt)
3. **Line 46**: Main logic called `response.json()` again (third attempt) - **CRASHED HERE**

The HTTP response stream is read-once. After consuming it with `.json()` or `.text()`, it cannot be read again.

## Solution Applied ✅

### File: `utils/hfClient.js`

**Fix 1: Prevent double-reading in error handling**
```javascript
// BEFORE: Multiple read attempts
if (!response.ok) {
  try {
    const errorData = await response.json();  // ❌ First read
    // ...
  } catch (parseError) {
    const text = await response.text();  // ❌ Second read - FAILS
  }
}
const data = await response.json();  // ❌ Third read - CRASHES

// AFTER: Single conditional read per path
if (!response.ok) {
  let errorMessage = response.statusText;
  try {
    const errorData = await response.json();  // ✅ Read once, extract message
    errorMessage = errorData.error || errorData.message || errorMessage;
  } catch (parseError) {
    // If JSON fails, use statusText - don't try to read again
  }
  throw new Error(...);
}

// Parse response body ONLY ONCE
let data;
try {
  data = await response.json();  // ✅ Single read point
} catch (parseError) {
  throw new Error(...);
}
```

**Fix 2: Remove debug logging that stringified data**
```javascript
// BEFORE: Logging was calling JSON.stringify
console.log('HF Response:', JSON.stringify(data, null, 2));

// AFTER: Data already parsed, just return
// No unnecessary logging that could re-parse
```

**Fix 3: Simplify summary extraction**
```javascript
// BEFORE: Multiple console.log calls
if (result.summary_text) {
  console.log('Extracted summary_text from array');
  return result.summary_text;
}

// AFTER: Simple return
if (result.summary_text) {
  return result.summary_text;
}
```

## Architecture Guarantee

**The flow is now:**
1. `controller` → calls `generateMedicalSummary(phn)`
2. `service` → calls `callHuggingFaceSummarizer(prompt)`
3. `hfClient` → **reads response.json() ONCE** → returns string
4. `service` → returns string (never calls .json() again)
5. `controller` → returns JSON with string in response body

**No part of the code calls response.json() or response.text() twice.**

## Error Handling

The refactored error handling ensures:
- ✅ Non-ok responses (4xx, 5xx) are caught before reading success body
- ✅ Only ONE attempt to parse error response
- ✅ Fallback to statusText if error body isn't valid JSON
- ✅ Clean error messages without trying to re-read body

## Testing

```bash
# Start server
npm start

# Test AI summary endpoint
curl -X GET http://localhost:5000/ai/summary/PH00001 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Result:**
- ✅ No "Body has already been read" error
- ✅ Response contains real AI-generated summary, not prompt text
- ✅ Proper error messages if API key is invalid or patient not found

## Files Modified
- `utils/hfClient.js`: Fixed response body reading, cleaned up logging

## Related Documentation
- See `AI_SERVICE_FIX.md` for complete AI module fixes
- See `AI_QUICK_REFERENCE.md` for API usage

---
**Status:** ✅ FIXED
**Date:** November 25, 2025
