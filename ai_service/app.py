"""
FastAPI application for AI prescription validation microservice.
"""
import logging
import os
from contextlib import asynccontextmanager
from typing import List

from fastapi import FastAPI, HTTPException, status
from fastapi.responses import JSONResponse

from schemas.request_schemas import ValidatePrescriptionRequest
from schemas.response_schemas import (
    ValidatePrescriptionResponse,
    HealthResponse,
    Warning
)
from services.classifier import initialize_classifier
from services.risk_engine import initialize_risk_engine
from services.validator import validate_prescription

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for FastAPI startup and shutdown events.
    Loads models and data on startup.
    """
    # Startup
    logger.info("Starting AI Prescription Validation Service...")
    
    try:
        # Initialize classifier
        logger.info("Initializing drug classifier...")
        initialize_classifier(
            model_name="sentence-transformers/all-MiniLM-L6-v2",
            examples_path="data/class_examples.json"
        )
        logger.info("Drug classifier initialized successfully")
        
        # Initialize risk engine
        logger.info("Initializing risk engine...")
        initialize_risk_engine(rules_path="data/risk_rules.json")
        logger.info("Risk engine initialized successfully")
        
        logger.info("Service startup complete. Ready to accept requests.")
        
    except Exception as e:
        logger.error(f"Failed to initialize service: {e}")
        raise
    
    yield
    
    # Shutdown (if needed)
    logger.info("Shutting down service...")


# Create FastAPI app with lifespan
app = FastAPI(
    title="AI Prescription Validation Service",
    description="Microservice for validating prescriptions against patient conditions using local AI models",
    version="1.0.0",
    lifespan=lifespan
)


@app.get("/ai/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """
    Health check endpoint to verify the service is running.
    
    Returns:
        HealthResponse with status "ok"
    """
    return HealthResponse(status="ok")


@app.post(
    "/ai/validate-prescription",
    response_model=ValidatePrescriptionResponse,
    tags=["Validation"],
    status_code=status.HTTP_200_OK
)
async def validate_prescription_endpoint(
    request: ValidatePrescriptionRequest
):
    """
    Validate a prescription against patient conditions.
    
    This endpoint:
    1. Classifies each medicine into drug classes using embeddings
    2. Checks for risky combinations with patient conditions
    3. Returns structured warnings
    
    Args:
        request: ValidatePrescriptionRequest containing patient info and medicines
    
    Returns:
        ValidatePrescriptionResponse with warnings and safety status
    """
    logger.info(
        f"Received validation request for patient PHN: {request.patientPhn}, "
        f"{len(request.medicines)} medicines, "
        f"{len(request.patientConditions)} conditions"
    )
    
    try:
        # Validate input
        if not request.patientConditions:
            return ValidatePrescriptionResponse(
                success=False,
                warnings=[],
                safe=True,
                error="patientConditions cannot be empty"
            )
        
        if not request.medicines:
            return ValidatePrescriptionResponse(
                success=False,
                warnings=[],
                safe=True,
                error="medicines cannot be empty"
            )
        
        # Run validation pipeline
        warnings: List[Warning] = validate_prescription(
            patient_conditions=request.patientConditions,
            medicines=request.medicines
        )
        
        # Determine if prescription is safe
        is_safe = len(warnings) == 0
        
        logger.info(
            f"Validation complete for patient {request.patientPhn}: "
            f"{len(warnings)} warnings, safe={is_safe}"
        )
        
        return ValidatePrescriptionResponse(
            success=True,
            warnings=warnings,
            safe=is_safe
        )
    
    except Exception as e:
        logger.error(f"Error during prescription validation: {e}", exc_info=True)
        return ValidatePrescriptionResponse(
            success=False,
            warnings=[],
            safe=False,
            error=f"Internal server error: {str(e)}"
        )


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """
    Global exception handler for unexpected errors.
    """
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": "Internal server error",
            "warnings": [],
            "safe": False
        }
    )


if __name__ == "__main__":
    import uvicorn
    
    # Get port from environment or default to 8000
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    
    uvicorn.run(
        "app:app",
        host=host,
        port=port,
        reload=False,  # Set to True for development
        log_level="info"
    )

