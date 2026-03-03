"""
Drug-drug interaction engine.
Classifies current patient medications and new medicines into drug classes, then
checks every new-medicine / current-medication class pair against the curated
drug_interactions.json database.
"""
import json
import logging
from typing import Dict, List, Optional, Tuple

from schemas.request_schemas import CurrentMedicationItem, MedicineItem
from schemas.response_schemas import Warning
from services.classifier import get_classifier

logger = logging.getLogger(__name__)


class DrugInteractionEngine:
    """
    Checks for clinically significant drug-drug interactions using a curated
    pair-based rule set.
    """

    def __init__(self):
        # List of interaction dicts:
        # { class_a, class_b, severity, message }
        self._rules: List[Dict] = []

    def load(self, db_path: str):
        """Load interaction rules from a JSON file."""
        try:
            with open(db_path, "r", encoding="utf-8") as f:
                self._rules = json.load(f)
            logger.info(f"Loaded {len(self._rules)} drug-drug interaction rules")
        except FileNotFoundError:
            logger.error(f"Drug interactions database not found: {db_path}")
            raise
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON in drug interactions database: {e}")
            raise

    def _find_interaction(
        self, class_a: str, class_b: str
    ) -> Optional[Dict]:
        """Return the first matching rule for the given class pair (order-independent)."""
        ca, cb = class_a.lower(), class_b.lower()
        for rule in self._rules:
            ra = rule.get("class_a", "").lower()
            rb = rule.get("class_b", "").lower()
            if (ra == ca and rb == cb) or (ra == cb and rb == ca):
                return rule
        return None

    def check_interactions(
        self,
        new_medicines: List[MedicineItem],
        current_medications: List[CurrentMedicationItem],
    ) -> List[Warning]:
        """
        Check for interactions between new medicines and current medications.

        Args:
            new_medicines:       New medicines being prescribed.
            current_medications: Medicines the patient is already taking.

        Returns:
            List of Warning objects for any interactions found.
        """
        if not current_medications:
            return []

        classifier = get_classifier()
        warnings: List[Warning] = []

        # Classify current medications (once)
        current_classified: List[Tuple[str, List[str]]] = []
        for cm in current_medications:
            name = cm.name.strip()
            if not name:
                continue
            try:
                classes = classifier.classify_drug(name)
            except Exception:
                classes = []
            if classes:
                current_classified.append((name, classes))

        if not current_classified:
            return []

        # For each new medicine check against every current medication
        for medicine in new_medicines:
            med_name = medicine.name.strip()
            if not med_name:
                continue

            try:
                med_classes = classifier.classify_drug(med_name)
            except Exception:
                med_classes = []

            if not med_classes:
                continue

            # Track which current-medication interactions we already reported
            # (to avoid duplicate warnings for the same current drug)
            reported_current: set = set()

            for current_name, current_classes in current_classified:
                if current_name in reported_current:
                    continue

                for new_cls in med_classes:
                    for cur_cls in current_classes:
                        rule = self._find_interaction(new_cls, cur_cls)
                        if rule:
                            severity = rule.get("severity", "medium")
                            message = (
                                f"DRUG INTERACTION — {med_name} ({new_cls}) may interact "
                                f"with the patient's current medication '{current_name}' ({cur_cls}). "
                                f"{rule.get('message', '')}"
                            )
                            warning = Warning(
                                medicineName=med_name,
                                drugClass=new_cls,
                                relatedCondition=f"Drug Interaction: {current_name}",
                                severity=severity,
                                message=message,
                                suggestedAlternatives=None,
                            )
                            warnings.append(warning)
                            reported_current.add(current_name)
                            logger.info(
                                f"Drug interaction: '{med_name}' ({new_cls}) + "
                                f"'{current_name}' ({cur_cls}) — severity={severity}"
                            )
                            break  # one warning per current-medication pair is enough
                    else:
                        continue
                    break

        return warnings


# --------------------------------------------------------------------------- #
# Global instance                                                              #
# --------------------------------------------------------------------------- #
_engine_instance: Optional[DrugInteractionEngine] = None


def get_drug_interaction_engine() -> DrugInteractionEngine:
    """Return the global DrugInteractionEngine instance."""
    if _engine_instance is None:
        raise RuntimeError(
            "DrugInteractionEngine not initialized. "
            "Call initialize_drug_interaction_engine() first."
        )
    return _engine_instance


def initialize_drug_interaction_engine(
    db_path: str = "data/drug_interactions.json",
) -> DrugInteractionEngine:
    """Initialize the global DrugInteractionEngine."""
    global _engine_instance
    _engine_instance = DrugInteractionEngine()
    _engine_instance.load(db_path)
    logger.info("DrugInteractionEngine initialized successfully")
    return _engine_instance
