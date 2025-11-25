"""
Drug classification service using sentence-transformers for embedding-based classification.
"""
import json
import logging
import os
from typing import List, Dict, Tuple
import numpy as np
from sentence_transformers import SentenceTransformer

logger = logging.getLogger(__name__)


class DrugClassifier:
    """
    Classifies drugs into drug classes using sentence-transformers embeddings.
    Uses cosine similarity to match drug names to predefined class examples.
    """
    
    def __init__(self, model_name: str = "sentence-transformers/all-MiniLM-L6-v2"):
        """
        Initialize the drug classifier.
        
        Args:
            model_name: Name of the sentence-transformers model to use
        """
        self.model_name = model_name
        self.model = None
        self.class_examples = {}
        self.class_embeddings = {}
        self.similarity_threshold = 0.3  # Minimum cosine similarity to assign a class
        
        logger.info(f"Initializing DrugClassifier with model: {model_name}")
    
    def load_model(self):
        """Load the sentence-transformers model."""
        try:
            logger.info("Loading sentence-transformers model...")
            self.model = SentenceTransformer(self.model_name)
            logger.info("Model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            raise
    
    def load_class_examples(self, examples_path: str):
        """
        Load drug class examples from JSON file.
        
        Args:
            examples_path: Path to the class_examples.json file
        """
        try:
            logger.info(f"Loading class examples from {examples_path}")
            with open(examples_path, 'r', encoding='utf-8') as f:
                self.class_examples = json.load(f)
            
            logger.info(f"Loaded {len(self.class_examples)} drug classes")
            
            # Precompute embeddings for all class examples
            self._precompute_class_embeddings()
            
        except FileNotFoundError:
            logger.error(f"Class examples file not found: {examples_path}")
            raise
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON in class examples file: {e}")
            raise
    
    def _precompute_class_embeddings(self):
        """Precompute embeddings for all class examples to speed up classification."""
        if self.model is None:
            raise RuntimeError("Model must be loaded before precomputing embeddings")
        
        logger.info("Precomputing embeddings for class examples...")
        
        for drug_class, examples in self.class_examples.items():
            # Encode all examples for this class
            embeddings = self.model.encode(examples, convert_to_numpy=True)
            
            # Store the mean embedding for the class (or we could store all and use max similarity)
            # Using mean gives a centroid representation
            self.class_embeddings[drug_class] = np.mean(embeddings, axis=0)
        
        logger.info(f"Precomputed embeddings for {len(self.class_embeddings)} classes")
    
    def classify_drug(self, drug_name: str) -> List[str]:
        """
        Classify a drug into one or more drug classes.
        
        Args:
            drug_name: Name of the drug to classify (e.g., "Ibuprofen 200mg Tablet")
        
        Returns:
            List of drug class names, ordered by confidence (highest first)
        """
        if self.model is None:
            raise RuntimeError("Model not loaded. Call load_model() first.")
        
        if not self.class_embeddings:
            raise RuntimeError("Class embeddings not computed. Call load_class_examples() first.")
        
        if not drug_name or not drug_name.strip():
            logger.warning("Empty drug name provided")
            return []
        
        # Encode the drug name
        drug_embedding = self.model.encode([drug_name], convert_to_numpy=True)[0]
        
        # Compute cosine similarity to each class
        similarities = {}
        for drug_class, class_embedding in self.class_embeddings.items():
            # Cosine similarity
            similarity = np.dot(drug_embedding, class_embedding) / (
                np.linalg.norm(drug_embedding) * np.linalg.norm(class_embedding)
            )
            similarities[drug_class] = float(similarity)
        
        # Sort by similarity (descending)
        sorted_classes = sorted(
            similarities.items(),
            key=lambda x: x[1],
            reverse=True
        )
        
        # Filter by threshold and return class names
        classified_classes = [
            drug_class
            for drug_class, similarity in sorted_classes
            if similarity >= self.similarity_threshold
        ]
        
        if classified_classes:
            logger.debug(
                f"Classified '{drug_name}' as: {classified_classes} "
                f"(top similarity: {sorted_classes[0][1]:.3f})"
            )
        else:
            logger.debug(
                f"Could not classify '{drug_name}' "
                f"(max similarity: {sorted_classes[0][1]:.3f} < threshold {self.similarity_threshold})"
            )
        
        return classified_classes
    
    def get_primary_class(self, drug_name: str) -> str:
        """
        Get the primary (most likely) drug class for a drug.
        
        Args:
            drug_name: Name of the drug
        
        Returns:
            Primary drug class name, or empty string if none found
        """
        classes = self.classify_drug(drug_name)
        return classes[0] if classes else ""


# Global instance (will be initialized in app startup)
classifier_instance: DrugClassifier = None


def get_classifier() -> DrugClassifier:
    """Get the global classifier instance."""
    if classifier_instance is None:
        raise RuntimeError("Classifier not initialized. Call initialize_classifier() first.")
    return classifier_instance


def initialize_classifier(model_name: str = "sentence-transformers/all-MiniLM-L6-v2",
                         examples_path: str = "data/class_examples.json"):
    """
    Initialize the global classifier instance.
    
    Args:
        model_name: Name of the sentence-transformers model
        examples_path: Path to class examples JSON file
    """
    global classifier_instance
    
    classifier_instance = DrugClassifier(model_name)
    classifier_instance.load_model()
    classifier_instance.load_class_examples(examples_path)
    
    logger.info("Classifier initialized successfully")
    return classifier_instance

