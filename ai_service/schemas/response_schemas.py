"""
Pydantic models for response schemas.
"""
from typing import List, Optional
from pydantic import BaseModel, Field


class Warning(BaseModel):
    """Model for a single warning about a medicine-condition interaction."""
    medicineName: str = Field(..., description="Name of the medicine that triggered the warning")
    drugClass: str = Field(..., description="Drug class that caused the risk")
    relatedCondition: str = Field(..., description="Patient condition related to the warning")
    severity: str = Field(..., description="Severity level: 'low', 'medium', or 'high'")
    message: str = Field(..., description="Human-readable warning message")
    suggestedAlternatives: Optional[List[str]] = Field(
        default=None,
        description="List of suggested alternative medicines"
    )


class ValidatePrescriptionResponse(BaseModel):
    """Response model for prescription validation."""
    success: bool = Field(..., description="Whether the validation request was successful")
    warnings: List[Warning] = Field(default_factory=list, description="List of warnings if any")
    safe: bool = Field(..., description="True if no warnings, False otherwise")
    error: Optional[str] = Field(None, description="Error message if success is False")


class HealthResponse(BaseModel):
    """Response model for health check endpoint."""
    status: str = Field(default="ok", description="Service status")

