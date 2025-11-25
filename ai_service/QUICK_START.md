# Quick Start Guide - Running the AI Prescription Validation Service

## Step-by-Step Instructions (Windows)

### Step 1: Create Virtual Environment (if not already created)

```powershell
python -m venv venv
```

### Step 2: Activate Virtual Environment

```powershell
venv\Scripts\activate
```

You should see `(venv)` in your prompt when activated.

### Step 3: Install Dependencies

```powershell
pip install -r requirements.txt
```

**Note**: This will take a few minutes the first time as it downloads:
- FastAPI and Uvicorn
- sentence-transformers model (~80-90 MB)
- Other dependencies

### Step 4: Start the Service

```powershell
uvicorn app:app --host 0.0.0.0 --port 8000
```

**OR** using Python directly:

```powershell
python app.py
```

### Step 5: Verify Service is Running

You should see output like:
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Initializing drug classifier...
INFO:     Loading sentence-transformers model...
INFO:     Model loaded successfully
INFO:     Drug classifier initialized successfully
INFO:     Initializing risk engine...
INFO:     Risk engine initialized successfully
INFO:     Service startup complete. Ready to accept requests.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

### Step 6: Test the Service

Open a new terminal/PowerShell window and test:

**Health Check:**
```powershell
curl http://localhost:8000/ai/health
```

**Or in PowerShell:**
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/ai/health"
```

**Test Prescription Validation:**
```powershell
$body = @{
    patientPhn = "PH12345"
    patientConditions = @("Gastritis")
    medicines = @(
        @{
            name = "Ibuprofen 200mg Tablet"
            dose = "1 tablet"
            frequency = "TDS"
        }
    )
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri "http://localhost:8000/ai/validate-prescription" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body
```

## Troubleshooting

### Issue: "Module not found" errors
**Solution**: Make sure virtual environment is activated and dependencies are installed:
```powershell
venv\Scripts\activate
pip install -r requirements.txt
```

### Issue: Port 8000 already in use
**Solution**: Use a different port:
```powershell
uvicorn app:app --host 0.0.0.0 --port 8001
```

### Issue: Model download fails
**Solution**: Check internet connection. The model downloads automatically on first use.

### Issue: "File not found" errors
**Solution**: Make sure you're running commands from the project root directory (`ai_service/`)

## Accessing the Service

Once running, the service is available at:
- **API Base URL**: `http://localhost:8000`
- **Health Check**: `http://localhost:8000/ai/health`
- **API Docs**: `http://localhost:8000/docs` (FastAPI auto-generated Swagger UI)
- **Alternative Docs**: `http://localhost:8000/redoc` (ReDoc format)

## Stopping the Service

Press `CTRL+C` in the terminal where the service is running.

## Next Steps

- Import the Postman collection (`postman_collection.json`) to test all endpoints
- Integrate with your Node.js EMR backend
- Customize risk rules in `data/risk_rules.json`
- Add more drug classes in `data/class_examples.json`

