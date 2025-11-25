# Postman Test Suite Setup Guide

This guide explains how to import and use the Postman collection for testing the AI Prescription Validation Service.

## Files Included

1. **postman_collection.json** - Complete Postman collection with all test cases
2. **postman_environment.json** - Environment variables for easy configuration

## Import Instructions

### Step 1: Import Collection

1. Open Postman
2. Click **Import** button (top left)
3. Select **File** tab
4. Choose `postman_collection.json`
5. Click **Import**

### Step 2: Import Environment (Optional but Recommended)

1. Click **Import** again
2. Select **File** tab
3. Choose `postman_environment.json`
4. Click **Import**
5. Select the imported environment from the environment dropdown (top right)

## Collection Structure

The collection includes the following test cases:

### 1. Health Check
- **GET** `/ai/health`
- Verifies service is running
- Tests response structure and timing

### 2. Validate Prescription - NSAID with Gastritis (Should Warn)
- Tests Ibuprofen with Gastritis condition
- Expects high severity warning
- Validates warning structure

### 3. Validate Prescription - Multiple Conditions (Asthma + Gastritis)
- Tests NSAID with multiple conditions
- Expects multiple warnings (one per condition)

### 4. Validate Prescription - Safe Prescription (No Warnings)
- Tests Amoxicillin with Hypertension
- Expects no warnings (safe prescription)

### 5. Validate Prescription - Multiple Medicines
- Tests multiple medicines at once
- Validates batch processing

### 6. Validate Prescription - Steroid with Diabetes
- Tests Prednisolone with Diabetes
- Expects steroid-related warning

### 7. Validate Prescription - Error: Missing Conditions
- Tests validation with empty conditions array
- Expects error response

### 8. Validate Prescription - Error: Missing Medicines
- Tests validation with empty medicines array
- Expects error response

### 9. Validate Prescription - Unknown Drug (Low Similarity)
- Tests edge case with unknown drug
- Validates graceful handling

### 10. Validate Prescription - Paracetamol (Safe Analgesic)
- Tests Paracetamol with Gastritis
- Validates that Paracetamol doesn't trigger NSAID warnings

## Running Tests

### Run Individual Request

1. Select a request from the collection
2. Click **Send**
3. View response in the bottom panel
4. Check **Test Results** tab for automated test results

### Run All Tests (Collection Runner)

1. Click on the collection name
2. Click **Run** button
3. In the Collection Runner:
   - Select which requests to run
   - Choose environment (if using)
   - Click **Run AI Prescription Validation Service**
4. View results summary

### Run Tests via Newman (CLI)

```bash
# Install Newman
npm install -g newman

# Run collection
newman run postman_collection.json -e postman_environment.json

# Run with HTML report
newman run postman_collection.json -e postman_environment.json -r html
```

## Environment Variables

The collection uses the following environment variable:

- **base_url**: Base URL of the service (default: `http://localhost:8000`)

### Changing the Base URL

**Option 1: Using Environment**
1. Select the imported environment
2. Click **Edit**
3. Change `base_url` value
4. Save

**Option 2: Using Collection Variable**
1. Right-click collection → **Edit**
2. Go to **Variables** tab
3. Change `base_url` value
4. Save

## Test Scripts

Each request includes automated test scripts that verify:

- HTTP status codes
- Response structure
- Expected fields presence
- Business logic (warnings, safety flags)
- Response times

## Example Test Scenarios

### Scenario 1: High-Risk Prescription
```
Request: Ibuprofen + Gastritis
Expected: 
  - success: true
  - safe: false
  - warnings: [1+ warning with severity "high"]
```

### Scenario 2: Safe Prescription
```
Request: Amoxicillin + Hypertension
Expected:
  - success: true
  - safe: true
  - warnings: []
```

### Scenario 3: Multiple Warnings
```
Request: Ibuprofen + [Gastritis, Asthma]
Expected:
  - success: true
  - safe: false
  - warnings: [2 warnings, one per condition]
```

## Troubleshooting

### Tests Failing

1. **Service not running**: Ensure the FastAPI service is running on `http://localhost:8000`
   ```bash
   uvicorn app:app --host 0.0.0.0 --port 8000
   ```

2. **Wrong base URL**: Check environment variable `base_url` matches your service URL

3. **Model not loaded**: First request may take longer if model is still loading

### Response Time Issues

- First request after service start may be slower (model initialization)
- Subsequent requests should be < 500ms
- Adjust test timeout if needed in Postman settings

## CI/CD Integration

### GitHub Actions Example

```yaml
name: API Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.10'
      - name: Install dependencies
        run: |
          pip install -r requirements.txt
      - name: Start service
        run: |
          uvicorn app:app --host 0.0.0.0 --port 8000 &
          sleep 30  # Wait for model to load
      - name: Install Newman
        run: npm install -g newman
      - name: Run Postman tests
        run: newman run postman_collection.json -e postman_environment.json
```

## Additional Resources

- [Postman Documentation](https://learning.postman.com/docs/)
- [Newman CLI Documentation](https://learning.postman.com/docs/running-collections/using-newman-cli/command-line-integration-with-newman/)

