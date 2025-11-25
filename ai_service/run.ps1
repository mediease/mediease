# PowerShell script to run the AI Prescription Validation Service

Write-Host "Activating virtual environment..." -ForegroundColor Green
& .\venv\Scripts\Activate.ps1

Write-Host "Checking dependencies..." -ForegroundColor Yellow
$fastapiInstalled = pip show fastapi 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    pip install -r requirements.txt
}

Write-Host ""
Write-Host "Starting AI Prescription Validation Service..." -ForegroundColor Green
Write-Host "Service will be available at http://localhost:8000" -ForegroundColor Cyan
Write-Host "Press CTRL+C to stop the service" -ForegroundColor Yellow
Write-Host ""

uvicorn app:app --host 0.0.0.0 --port 8000

