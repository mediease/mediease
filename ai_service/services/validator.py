"""
Main validation pipeline that orchestrates drug classification and risk checking.
"""
import logging
from typing import List
from schemas.request_schemas import MedicineItem
from schemas.response_schemas import Warning
from services.classifier import get_classifier
from services.risk_engine import get_risk_engine

logger = logging.getLogger(__name__)


def validate_prescription(
    patient_conditions: List[str],
    medicines: List[MedicineItem]
) -> List[Warning]:
    """
    Validate a prescription against patient conditions.
    
    This is the main validation pipeline that:
    1. Classifies each medicine into drug classes
    2. Checks for risks between drug classes and patient conditions
    3. Returns aggregated warnings
    
    Args:
        patient_conditions: List of patient condition names
        medicines: List of MedicineItem objects
    
    Returns:
        List of Warning objects for any risks found
    """
    logger.info(
        f"Validating prescription: {len(medicines)} medicines, "
        f"{len(patient_conditions)} conditions"
    )
    
    all_warnings = []
    
    classifier = get_classifier()
    risk_engine = get_risk_engine()
    
    # Process each medicine
    for medicine in medicines:
        medicine_name = medicine.name
        
        logger.debug(f"Processing medicine: {medicine_name}")
        
        # Step 1: Classify the drug
        drug_classes = classifier.classify_drug(medicine_name)
        
        if drug_classes:
            logger.debug(f"Classified '{medicine_name}' as: {drug_classes}")
        else:
            logger.warning(f"Could not classify '{medicine_name}' into any drug class")
            # Continue anyway - we might still find risks if partial classification works
        
        # Step 2: Check for risks
        warnings = risk_engine.check_risks(
            patient_conditions=patient_conditions,
            medicine_name=medicine_name,
            drug_classes=drug_classes
        )
        
        all_warnings.extend(warnings)
    
    logger.info(f"Validation complete: found {len(all_warnings)} warnings")
    
    return all_warnings

