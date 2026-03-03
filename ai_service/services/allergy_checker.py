"""
Allergy checker service.
Detects whether a new medicine may conflict with a patient's recorded medication allergies.

Two matching strategies:
1. Direct name match  — allergy substance is a substring of the medicine name (or vice versa)
2. Drug-class match   — classify both the medicine and the allergy substance; if they share
                        a drug class the prescriber is warned of a potential cross-reaction
"""
import logging
from typing import List

from schemas.request_schemas import AllergyItem, MedicineItem
from schemas.response_schemas import Warning
from services.classifier import get_classifier

logger = logging.getLogger(__name__)


def check_allergies(
    medicines: List[MedicineItem],
    allergies: List[AllergyItem],
) -> List[Warning]:
    """
    Compare new medicines against the patient's known medication allergies.

    Args:
        medicines:  New medicines being prescribed.
        allergies:  Patient's allergy records (medication category only).

    Returns:
        List of high-severity Warning objects for any allergy conflicts found.
    """
    if not allergies:
        return []

    classifier = get_classifier()
    warnings: List[Warning] = []

    # Pre-classify every allergy substance once so we can do class-level matching
    allergy_classes: dict[str, List[str]] = {}
    for allergy in allergies:
        substance = allergy.substance.strip()
        if not substance:
            continue
        try:
            allergy_classes[substance] = classifier.classify_drug(substance)
        except Exception:
            allergy_classes[substance] = []

    for medicine in medicines:
        med_name = medicine.name.strip()
        if not med_name:
            continue

        med_name_lower = med_name.lower()

        # Classify the new medicine
        try:
            med_classes = classifier.classify_drug(med_name)
        except Exception:
            med_classes = []

        for allergy in allergies:
            substance = allergy.substance.strip()
            if not substance:
                continue

            substance_lower = substance.lower()
            matched = False
            match_reason = ""

            # --- Strategy 1: direct substring match ---
            if substance_lower in med_name_lower or med_name_lower in substance_lower:
                matched = True
                match_reason = f"medicine name matches known allergen '{substance}'"

            # --- Strategy 2: shared drug class ---
            if not matched and med_classes and allergy_classes.get(substance):
                shared = set(med_classes) & set(allergy_classes[substance])
                if shared:
                    matched = True
                    match_reason = (
                        f"medicine belongs to drug class '{next(iter(shared))}' "
                        f"which is the same class as known allergen '{substance}'"
                    )

            if matched:
                reaction_detail = (
                    f" Recorded reaction: {allergy.reaction}." if allergy.reaction else ""
                )
                severity = "high" if allergy.criticality == "high" else "medium"

                warning = Warning(
                    medicineName=med_name,
                    drugClass=med_classes[0] if med_classes else "Unknown",
                    relatedCondition=f"Patient Allergy: {substance}",
                    severity=severity,
                    message=(
                        f"ALLERGY ALERT — {med_name} may conflict with the patient's recorded "
                        f"allergy to '{substance}' ({allergy.criticality} criticality).{reaction_detail} "
                        f"Match basis: {match_reason}."
                    ),
                    suggestedAlternatives=None,
                )
                warnings.append(warning)
                logger.warning(
                    f"Allergy conflict: '{med_name}' vs allergy '{substance}' — {match_reason}"
                )
                # Only one warning per medicine-allergy pair
                break

    return warnings
