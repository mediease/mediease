@echo off
echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Checking if dependencies are installed...
pip show fastapi >nul 2>&1
if errorlevel 1 (
    echo Installing dependencies...
    pip install -r requirements.txt
)

echo.
echo Starting AI Prescription Validation Service...
echo Service will be available at http://localhost:8000
echo Press CTRL+C to stop the service
echo.

uvicorn app:app --host 0.0.0.0 --port 8000

