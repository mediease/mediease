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


class AllergyItem(BaseModel):
    """Model for a single patient allergy record."""
    substance: str = Field(..., description="The allergen substance name")
    criticality: str = Field(default="low", description="Criticality level: 'low' or 'high'")
    reaction: Optional[str] = Field(None, description="Observed reaction description")


class CurrentMedicationItem(BaseModel):
    """Model for a medicine the patient is currently taking."""
    name: str = Field(..., description="Name of the current medication")


class ValidatePrescriptionRequest(BaseModel):
    """Request model for prescription validation."""
    patientPhn: Optional[str] = Field(None, description="Patient's PHN (Personal Health Number)")
    patientConditions: Optional[List[str]] = Field(
        None,
        description="Patient's known health conditions extracted from encounter history"
    )
    patientAllergies: Optional[List[AllergyItem]] = Field(
        None,
        description="Patient's medication allergy records"
    )
    currentMedications: Optional[List[CurrentMedicationItem]] = Field(
        None,
        description="Medicines the patient is currently taking"
    )
    currentComplaint: Optional[str] = Field(None, description="Current complaint or chief complaint")
    medicines: List[MedicineItem] = Field(..., min_items=1, description="New medicines being prescribed")

    class Config:
        json_schema_extra = {
            "example": {
                "patientPhn": "PH12345",
                "patientConditions": ["Gastritis", "Asthma"],
                "patientAllergies": [
                    {"substance": "Penicillin", "criticality": "high", "reaction": "Anaphylaxis"}
                ],
                "currentMedications": [
                    {"name": "Warfarin 5mg"}
                ],
                "currentComplaint": "Fever for 2 days",
                "medicines": [
                    {
                        "name": "Ibuprofen 200mg Tablet",
                        "dose": "1 tablet",
                        "frequency": "TDS",
                        "period": "5 days",
                        "instructions": "After meals"
                    }
                ]
            }
        }

