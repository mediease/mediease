"""
Rule-based risk engine for checking drug-condition interactions.
"""
import json
import logging
import os
from typing import List, Dict, Optional
from schemas.response_schemas import Warning

logger = logging.getLogger(__name__)


class RiskEngine:
    """
    Rule-based engine that checks for risky drug-condition combinations.
    Uses a JSON ruleset to determine which drug classes are risky for specific conditions.
    """
    
    def __init__(self):
        """Initialize the risk engine."""
        self.risk_rules: Dict[str, Dict] = {}
        logger.info("Initializing RiskEngine")
    
    def load_risk_rules(self, rules_path: str):
        """
        Load risk rules from JSON file.
        
        Args:
            rules_path: Path to the risk_rules.json file
        """
        try:
            logger.info(f"Loading risk rules from {rules_path}")
            with open(rules_path, 'r', encoding='utf-8') as f:
                self.risk_rules = json.load(f)
            
            logger.info(f"Loaded {len(self.risk_rules)} risk rules")
            
        except FileNotFoundError:
            logger.error(f"Risk rules file not found: {rules_path}")
            raise
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON in risk rules file: {e}")
            raise
    
    def _normalize_condition(self, condition: str) -> str:
        """
        Normalize condition name for matching (case-insensitive).
        
        Args:
            condition: Condition name to normalize
        
        Returns:
            Normalized condition name
        """
        return condition.strip().lower()
    
    def _find_matching_rule(self, condition: str) -> Optional[Dict]:
        """
        Find a matching risk rule for a condition.
        
        Args:
            condition: Patient condition name
        
        Returns:
            Matching rule dictionary, or None if not found
        """
        normalized_condition = self._normalize_condition(condition)
        
        # Try exact match first
        for rule_condition, rule_data in self.risk_rules.items():
            if self._normalize_condition(rule_condition) == normalized_condition:
                return rule_data
        
        # Try partial match (condition contains rule key or vice versa)
        for rule_condition, rule_data in self.risk_rules.items():
            rule_normalized = self._normalize_condition(rule_condition)
            if normalized_condition in rule_normalized or rule_normalized in normalized_condition:
                logger.debug(f"Partial match: '{condition}' -> '{rule_condition}'")
                return rule_data
        
        return None
    
    def _get_suggested_alternatives(self, drug_class: str, condition: str) -> List[str]:
        """
        Get suggested alternative medicines for a drug class and condition.
        This is a simple placeholder implementation.
        In production, this could use a more sophisticated lookup.
        
        Args:
            drug_class: The risky drug class
            condition: The patient condition
        
        Returns:
            List of suggested alternative medicine names
        """
        # Simple mapping of alternatives
        alternatives_map = {
            "NSAID": {
                "Gastritis": ["Paracetamol", "Acetaminophen"],
                "Asthma": ["Paracetamol", "Acetaminophen"],
                "default": ["Paracetamol"]
            },
            "Steroid": {
                "default": ["Consult specialist for alternatives"]
            },
            "Beta-blocker": {
                "Asthma": ["Calcium Channel Blocker (if appropriate)", "Consult cardiologist"],
                "default": ["Consult specialist"]
            },
            "Paracetamol": {
                "Liver Disease": ["Consult specialist for alternatives"]
            }
        }
        
        condition_lower = condition.lower()
        
        if drug_class in alternatives_map:
            class_alternatives = alternatives_map[drug_class]
            
            # Check for condition-specific alternatives
            for cond_key, alts in class_alternatives.items():
                if cond_key != "default" and cond_key.lower() in condition_lower:
                    return alts
            
            # Use default alternatives
            if "default" in class_alternatives:
                return class_alternatives["default"]
        
        return []
    
    def check_risks(self, 
                   patient_conditions: List[str],
                   medicine_name: str,
                   drug_classes: List[str]) -> List[Warning]:
        """
        Check for risks between patient conditions and drug classes.
        
        Args:
            patient_conditions: List of patient condition names
            medicine_name: Name of the medicine being checked
            drug_classes: List of drug classes for this medicine
        
        Returns:
            List of Warning objects for any risks found
        """
        warnings = []
        
        if not drug_classes:
            # If we couldn't classify the drug, we can't check risks
            logger.debug(f"No drug classes for '{medicine_name}', skipping risk check")
            return warnings
        
        for condition in patient_conditions:
            if not condition or not condition.strip():
                continue
            
            rule = self._find_matching_rule(condition)
            
            if rule is None:
                logger.debug(f"No risk rule found for condition: {condition}")
                continue
            
            risky_classes = rule.get("risky_classes", [])
            base_message = rule.get("message", "This drug may interact with the patient's condition.")
            
            # Check if any of the drug's classes are risky for this condition
            for drug_class in drug_classes:
                if drug_class in risky_classes:
                    # Create a warning
                    suggested_alternatives = self._get_suggested_alternatives(drug_class, condition)
                    
                    # Determine severity (simple heuristic)
                    severity = "high"  # Default to high for safety
                    if drug_class in ["NSAID"] and condition.lower() in ["gastritis", "peptic ulcer"]:
                        severity = "high"
                    elif drug_class in ["Steroid"]:
                        severity = "high"
                    else:
                        severity = "medium"
                    
                    # Create detailed message
                    message = (
                        f"{medicine_name} is classified as {drug_class}. "
                        f"{base_message} "
                        f"Patient has {condition}."
                    )
                    
                    warning = Warning(
                        medicineName=medicine_name,
                        drugClass=drug_class,
                        relatedCondition=condition,
                        severity=severity,
                        message=message,
                        suggestedAlternatives=suggested_alternatives if suggested_alternatives else None
                    )
                    
                    warnings.append(warning)
                    logger.info(
                        f"Risk detected: {medicine_name} ({drug_class}) + {condition} "
                        f"(severity: {severity})"
                    )
        
        return warnings


# Global instance (will be initialized in app startup)
risk_engine_instance: RiskEngine = None


def get_risk_engine() -> RiskEngine:
    """Get the global risk engine instance."""
    if risk_engine_instance is None:
        raise RuntimeError("Risk engine not initialized. Call initialize_risk_engine() first.")
    return risk_engine_instance


def initialize_risk_engine(rules_path: str = "data/risk_rules.json"):
    """
    Initialize the global risk engine instance.
    
    Args:
        rules_path: Path to risk rules JSON file
    """
    global risk_engine_instance
    
    risk_engine_instance = RiskEngine()
    risk_engine_instance.load_risk_rules(rules_path)
    
    logger.info("Risk engine initialized successfully")
    return risk_engine_instance

