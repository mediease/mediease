"""
Pydantic models for request schemas.
"""
from typing import List, Optional
from pydantic import BaseModel, Field


class MedicineItem(BaseModel):
    """Model for a single medicine in the prescription."""
    name: str = Field(..., description="Name of the medicine")
    rxNormId: Optional[str] = Field(None, description="RxNorm ID if available")
    dose: Optional[str] = Field(None, description="Dose of the medicine")
    frequency: Optional[str] = Field(None, description="Frequency of administration (e.g., TDS, BD)")
    period: Optional[str] = Field(None, description="Duration of treatment (e.g., 5 days)")
    instructions: Optional[str] = Field(None, description="Additional instructions")


class ValidatePrescriptionRequest(BaseModel):
    """Request model for prescription validation."""
    patientPhn: str = Field(..., description="Patient's PHN (Personal Health Number)")
    patientConditions: List[str] = Field(..., description="List of patient's conditions/diagnoses")
    currentComplaint: Optional[str] = Field(None, description="Current complaint or chief complaint")
    medicines: List[MedicineItem] = Field(..., min_items=1, description="List of medicines being prescribed")

    class Config:
        json_schema_extra = {
            "example": {
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
        }

