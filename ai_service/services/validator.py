"""
Main validation pipeline — orchestrates four checks:
  1. General side effects          (side_effects_engine)
  2. Drug × patient condition      (risk_engine  —  uses risk_rules.json)
  3. Drug × patient allergy        (allergy_checker)
  4. Drug × current medications    (drug_interaction_engine)
"""
import logging
from typing import List, Optional

from schemas.request_schemas import AllergyItem, CurrentMedicationItem, MedicineItem
from schemas.response_schemas import Warning
from services.classifier import get_classifier
from services.side_effects_engine import get_side_effects_engine
from services.risk_engine import get_risk_engine
from services.allergy_checker import check_allergies
from services.drug_interaction_engine import get_drug_interaction_engine

logger = logging.getLogger(__name__)


def validate_prescription(
    medicines: List[MedicineItem],
    patient_conditions: Optional[List[str]] = None,
    patient_allergies: Optional[List[AllergyItem]] = None,
    current_medications: Optional[List[CurrentMedicationItem]] = None,
) -> List[Warning]:
    """
    Validate a prescription against the patient's full clinical context.

    Args:
        medicines:            New medicines being prescribed.
        patient_conditions:   Known health conditions from encounter history.
        patient_allergies:    Medication allergy records.
        current_medications:  Medicines the patient is currently taking.

    Returns:
        List of Warning objects from all four checks.
    """
    logger.info(
        f"Validating {len(medicines)} medicines | "
        f"conditions={len(patient_conditions or [])} | "
        f"allergies={len(patient_allergies or [])} | "
        f"current_meds={len(current_medications or [])}"
    )

    classifier = get_classifier()
    side_effects_engine = get_side_effects_engine()
    risk_engine = get_risk_engine()
    interaction_engine = get_drug_interaction_engine()

    all_warnings: List[Warning] = []

    # ------------------------------------------------------------------ #
    # Per-medicine checks (side effects + condition interactions)         #
    # ------------------------------------------------------------------ #
    for medicine in medicines:
        med_name = medicine.name.strip()
        if not med_name:
            continue

        logger.debug(f"Processing medicine: {med_name}")

        # Classify into drug classes
        try:
            drug_classes = classifier.classify_drug(med_name)
        except Exception as exc:
            logger.warning(f"Classifier error for '{med_name}': {exc}")
            drug_classes = []

        # --- Check 1: General side effects ---
        matched_class = None
        entry = None
        for cls in drug_classes:
            candidate = side_effects_engine.get_side_effects(cls)
            if candidate is not None:
                matched_class = cls
                entry = candidate
                break

        if entry:
            warning = Warning(
                medicineName=med_name,
                drugClass=matched_class,
                relatedCondition="General Side Effects",
                severity=entry.get("severity", "low"),
                message=side_effects_engine.format_message(entry),
                suggestedAlternatives=None,
            )
            all_warnings.append(warning)
            logger.debug(f"Side effects warning for '{med_name}' ({matched_class})")

        # --- Check 2: Drug × patient conditions ---
        if patient_conditions and drug_classes:
            condition_warnings = risk_engine.check_risks(
                patient_conditions=patient_conditions,
                medicine_name=med_name,
                drug_classes=drug_classes,
            )
            for w in condition_warnings:
                # Prefix condition name so it's clear in the frontend
                w.relatedCondition = f"Patient Condition: {w.relatedCondition}"
            all_warnings.extend(condition_warnings)
            if condition_warnings:
                logger.info(f"Condition warnings for '{med_name}': {len(condition_warnings)}")

    # ------------------------------------------------------------------ #
    # Patient-level checks (allergy + drug-drug interactions)             #
    # ------------------------------------------------------------------ #

    # --- Check 3: Drug × patient allergies ---
    if patient_allergies:
        allergy_warnings = check_allergies(medicines, patient_allergies)
        all_warnings.extend(allergy_warnings)
        if allergy_warnings:
            logger.info(f"Allergy warnings: {len(allergy_warnings)}")

    # --- Check 4: Drug × current medications ---
    if current_medications:
        interaction_warnings = interaction_engine.check_interactions(
            medicines, current_medications
        )
        all_warnings.extend(interaction_warnings)
        if interaction_warnings:
            logger.info(f"Drug interaction warnings: {len(interaction_warnings)}")

    logger.info(f"Validation complete: {len(all_warnings)} total warnings")
    return all_warnings
