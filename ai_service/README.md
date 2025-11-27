# AI Prescription Validation Microservice

A production-ready Python FastAPI microservice that validates prescriptions against patient conditions using local AI models. This service uses sentence-transformers for drug classification and rule-based logic for risk detection.

## Features

- **Local AI Processing**: Uses `sentence-transformers/all-MiniLM-L6-v2` for drug classification (runs on CPU)
- **Rule-Based Risk Engine**: Checks for dangerous drug-condition interactions
- **RESTful API**: Clean HTTP endpoints for integration with Node.js EMR backend
- **Production-Ready**: Includes error handling, logging, and health checks
- **Lightweight**: Designed to run on small servers (2-4 GB RAM)

## Project Structure

```
ai_service/
├── app.py                 # FastAPI entry point
├── models/
│   └── __init__.py
├── services/
│   ├── __init__.py
│   ├── classifier.py      # Drug classification using embeddings
│   ├── risk_engine.py     # Rule-based risk checking
│   └── validator.py       # Main validation pipeline
├── data/
│   ├── risk_rules.json    # Clinical rules for conditions vs drug classes
│   └── class_examples.json# Example texts for each drug class
├── schemas/
│   ├── request_schemas.py # Pydantic request models
│   └── response_schemas.py # Pydantic response models
├── requirements.txt
└── README.md
```

## Prerequisites

- Python 3.10 or higher
- pip (Python package manager)
- 2-4 GB RAM (for model loading and inference)

## Setup Instructions

### 1. Create Virtual Environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

**Note**: The first time you install `sentence-transformers`, it will download the model (`all-MiniLM-L6-v2`) which is approximately 80-90 MB. This happens automatically.

### 3. Verify Data Files

Ensure the following files exist:
- `data/risk_rules.json` - Contains clinical risk rules
- `data/class_examples.json` - Contains drug class examples for classification

## Running the Service

### Start the Service

```bash
uvicorn app:app --host 0.0.0.0 --port 8000
```

Or using Python directly:

```bash
python app.py
```

The service will:
1. Load the sentence-transformers model (takes ~10-30 seconds on first run)
2. Load and precompute embeddings for drug class examples
3. Load risk rules
4. Start listening on `http://0.0.0.0:8000`

### Environment Variables (Optional)

- `PORT`: Server port (default: 8000)
- `HOST`: Server host (default: 0.0.0.0)

Example:
```bash
# Windows PowerShell
$env:PORT=8080; uvicorn app:app --host 0.0.0.0 --port $env:PORT

# Linux/Mac
PORT=8080 uvicorn app:app --host 0.0.0.0 --port $PORT
```

## API Endpoints

### 1. Health Check

**GET** `/ai/health`

Check if the service is running.

**Response:**
```json
{
  "status": "ok"
}
```

**Example:**
```bash
curl http://localhost:8000/ai/health
```

### 2. Validate Prescription

**POST** `/ai/validate-prescription`

Validate a prescription against patient conditions.

**Request Body:**
```json
{
  "patientPhn": "PH12345",
  "patientConditions": ["Gastritis", "Asthma"],
  "currentComplaint": "Fever for 2 days",
  "medicines": [
    {
      "name": "Ibuprofen 200mg Tablet",
      "rxNormId": "123456",
      "dose": "1 tablet",
      "frequency": "TDS",
      "period": "5 days",
      "instructions": "After meals"
    }
  ]
}
```

**Response (with warnings):**
```json
{
  "success": true,
  "warnings": [
    {
      "medicineName": "Ibuprofen 200mg Tablet",
      "drugClass": "NSAID",
      "relatedCondition": "Gastritis",
      "severity": "high",
      "message": "Ibuprofen 200mg Tablet is classified as NSAID. These drugs may worsen gastric irritation and increase the risk of gastric ulcers. Patient has Gastritis.",
      "suggestedAlternatives": ["Paracetamol", "Acetaminophen"]
    },
    {
      "medicineName": "Ibuprofen 200mg Tablet",
      "drugClass": "NSAID",
      "relatedCondition": "Asthma",
      "severity": "medium",
      "message": "Ibuprofen 200mg Tablet is classified as NSAID. These drugs may trigger bronchospasm and worsen asthma symptoms. Patient has Asthma.",
      "suggestedAlternatives": ["Paracetamol", "Acetaminophen"]
    }
  ],
  "safe": false
}
```

**Response (no warnings):**
```json
{
  "success": true,
  "warnings": [],
  "safe": true
}
```

**Response (error):**
```json
{
  "success": false,
  "warnings": [],
  "safe": false,
  "error": "patientConditions cannot be empty"
}
```

**Example:**
```bash
curl -X POST http://localhost:8000/ai/validate-prescription \
  -H "Content-Type: application/json" \
  -d '{
    "patientPhn": "PH12345",
    "patientConditions": ["Gastritis", "Asthma"],
    "currentComplaint": "Fever for 2 days",
    "medicines": [
      {
        "name": "Ibuprofen 200mg Tablet",
        "dose": "1 tablet",
        "frequency": "TDS",
        "period": "5 days"
      }
    ]
  }'
```

**PowerShell Example:**
```powershell
$body = @{
    patientPhn = "PH12345"
    patientConditions = @("Gastritis", "Asthma")
    currentComplaint = "Fever for 2 days"
    medicines = @(
        @{
            name = "Ibuprofen 200mg Tablet"
            dose = "1 tablet"
            frequency = "TDS"
            period = "5 days"
        }
    )
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri "http://localhost:8000/ai/validate-prescription" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body
```

## How It Works

### 1. Drug Classification

The service uses `sentence-transformers/all-MiniLM-L6-v2` to:
- Encode drug names into embeddings
- Compare against pre-encoded examples for each drug class
- Assign drugs to classes based on cosine similarity (threshold: 0.3)

Drug classes include: NSAID, Steroid, Antibiotic, Beta-blocker, Paracetamol, etc.

### 2. Risk Detection

The risk engine:
- Matches patient conditions to rules in `data/risk_rules.json`
- Checks if any drug class is flagged as risky for that condition
- Generates warnings with severity levels and suggested alternatives

### 3. Validation Pipeline

1. For each medicine:
   - Classify into drug classes
   - Check against all patient conditions
   - Generate warnings for risky combinations
2. Aggregate all warnings
3. Return structured response

## Customization

### Adding New Drug Classes

Edit `data/class_examples.json` and add example phrases for your new class:

```json
{
  "YourNewClass": [
    "example drug 1",
    "example drug 2"
  ]
}
```

The model will automatically use these examples for classification.

### Adding New Risk Rules

Edit `data/risk_rules.json` and add new condition rules:

```json
{
  "YourCondition": {
    "risky_classes": ["NSAID", "Steroid"],
    "message": "Your warning message here."
  }
}
```

### Adjusting Classification Threshold

In `services/classifier.py`, modify the `similarity_threshold` in the `DrugClassifier.__init__` method:

```python
self.similarity_threshold = 0.3  # Lower = more permissive, Higher = more strict
```

## Integration with Node.js Backend

From your Node.js EMR backend, call the service using `fetch` or `axios`:

```javascript
const response = await fetch('http://localhost:8000/ai/validate-prescription', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    patientPhn: patient.phn,
    patientConditions: patient.conditions,
    currentComplaint: encounter.chiefComplaint,
    medicines: prescription.medicines.map(m => ({
      name: m.name,
      rxNormId: m.rxNormId,
      dose: m.dose,
      frequency: m.frequency,
      period: m.period,
      instructions: m.instructions
    }))
  })
});

const result = await response.json();
if (!result.safe) {
  // Display warnings to doctor
  console.log('Warnings:', result.warnings);
}
```

## Logging

The service logs:
- Request information (patient PHN, number of medicines/conditions)
- Classification results
- Risk detections
- Errors and exceptions

Logs are output to stdout with INFO level by default.

## Performance

- **Model Loading**: ~10-30 seconds on first startup
- **Request Processing**: ~100-500ms per request (depending on number of medicines)
- **Memory Usage**: ~500 MB - 1 GB (model + embeddings)

## Troubleshooting

### Model Download Issues

If the model fails to download:
1. Check internet connection (required only on first run)
2. The model is cached in `~/.cache/huggingface/` after first download

### Import Errors

If you get import errors:
1. Ensure virtual environment is activated
2. Run `pip install -r requirements.txt` again
3. Check Python version: `python --version` (should be 3.10+)

### File Not Found Errors

Ensure you're running the service from the project root directory where `app.py` is located.

## License

This is a proprietary microservice for the MediEase EMR system.

## Support

For issues or questions, contact the development team.

Set-Location 'd:\applications\mediease\ai_service'; .\venv\Scripts\python.exe -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload