"""
Side effects lookup engine.
Maps drug classes to their known side effects using a curated JSON database.
"""
import json
import logging
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)


class SideEffectsEngine:
    """
    Looks up known side effects for drug classes using a curated database.
    """

    def __init__(self):
        self.db: Dict[str, Dict] = {}

    def load(self, db_path: str):
        """Load the side effects database from a JSON file."""
        try:
            with open(db_path, "r", encoding="utf-8") as f:
                self.db = json.load(f)
            logger.info(f"Loaded side effects database: {len(self.db)} drug classes")
        except FileNotFoundError:
            logger.error(f"Side effects database not found: {db_path}")
            raise
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON in side effects database: {e}")
            raise

    def get_side_effects(self, drug_class: str) -> Optional[Dict]:
        """
        Get side effects entry for a drug class.

        Args:
            drug_class: Classified drug class name

        Returns:
            Dict with severity, side_effects, and warnings, or None if not found
        """
        return self.db.get(drug_class)

    def format_message(self, entry: Dict) -> str:
        """
        Format the side effects entry into a human-readable message.

        Args:
            entry: Side effects dict with side_effects and warnings keys

        Returns:
            Formatted string message
        """
        parts = []

        side_effects = entry.get("side_effects", [])
        if side_effects:
            parts.append("Side effects: " + "; ".join(side_effects))

        warnings = entry.get("warnings", [])
        if warnings:
            parts.append("Warnings: " + "; ".join(warnings))

        return " | ".join(parts) if parts else "No additional information available."


# Global instance
_engine_instance: Optional[SideEffectsEngine] = None


def get_side_effects_engine() -> SideEffectsEngine:
    """Get the global side effects engine instance."""
    if _engine_instance is None:
        raise RuntimeError(
            "SideEffectsEngine not initialized. Call initialize_side_effects_engine() first."
        )
    return _engine_instance


def initialize_side_effects_engine(db_path: str = "data/side_effects_db.json") -> SideEffectsEngine:
    """
    Initialize the global side effects engine.

    Args:
        db_path: Path to the side_effects_db.json file
    """
    global _engine_instance
    _engine_instance = SideEffectsEngine()
    _engine_instance.load(db_path)
    logger.info("SideEffectsEngine initialized successfully")
    return _engine_instance
