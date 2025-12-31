"""
Complaint Classification Service - Simplified Fallback Version
Uses simple rule-based classification to avoid ML library hangs on startup
"""

import os
import json
import logging

logger = logging.getLogger(__name__)


class ComplaintClassificationService:
    """
    Service for complaint classification using fallback simple methods
    Avoids heavy ML library imports to prevent server startup hangs
    """
    
    def __init__(self, model_dir='ai_models/models/complaint_classifier'):
        """
        Initialize the service with fallback simple classification
        
        Args:
            model_dir: Directory containing saved models (optional)
        """
        self.model_dir = model_dir
        self.use_fallback = True
        
        # Initialize with default categories
        self.category_classes = {
            0: 'Train_Cleanliness',
            1: 'Safety_Security',
            2: 'Ticketing',
            3: 'Staff_Behavior',
            4: 'Schedule_Delay'
        }
        
        self.priority_classes = {
            0: 'Critical',
            1: 'High',
            2: 'Medium',
            3: 'Low'
        }
        
        self.severity_classes = {
            0: 'High',
            1: 'Medium',
            2: 'Low'
        }
        
        # Try to load actual label encoders if they exist
        try:
            if os.path.exists(model_dir):
                with open(f"{model_dir}/label_encoders.json", 'r') as f:
                    encoders = json.load(f)
                    self.category_classes = encoders.get('category', self.category_classes)
                    self.priority_classes = encoders.get('priority', self.priority_classes)
                    self.severity_classes = encoders.get('severity', self.severity_classes)
                logger.info("Loaded actual label encoders from model directory")
        except Exception as e:
            logger.warning(f"Could not load label encoders, using defaults: {e}")
        
        logger.info("ComplaintClassificationService initialized in fallback mode")
    
    def classify_complaint(self, complaint_text, return_probabilities=False):
        """
        Classify a complaint using simple rule-based approach
        
        Args:
            complaint_text: The complaint description text
            return_probabilities: If True, return probability distributions
        
        Returns:
            Dictionary with predictions
        """
        if not complaint_text or not isinstance(complaint_text, str):
            return {
                'category': 'Schedule_Delay',
                'staff_assignment': 'General_Staff',
                'priority': 'Medium',
                'severity': 'Medium',
                'confidence_scores': {'overall': 0.5}
            }
        
        text_lower = complaint_text.lower()
        
        # Simple keyword-based classification
        # Category detection
        if any(word in text_lower for word in ['clean', 'dirty', 'trash', 'garbage', 'filth', 'mess']):
            category = 'Train_Cleanliness'
            category_conf = 0.8
        elif any(word in text_lower for word in ['safe', 'security', 'theft', 'robbery', 'attack', 'danger']):
            category = 'Safety_Security'
            category_conf = 0.85
        elif any(word in text_lower for word in ['ticket', 'fare', 'booking', 'reservation', 'refund']):
            category = 'Ticketing'
            category_conf = 0.8
        elif any(word in text_lower for word in ['rude', 'staff', 'behavior', 'behavior', 'polite', 'professional']):
            category = 'Staff_Behavior'
            category_conf = 0.75
        elif any(word in text_lower for word in ['delay', 'late', 'schedule', 'timing', 'ontime']):
            category = 'Schedule_Delay'
            category_conf = 0.8
        else:
            category = 'Schedule_Delay'
            category_conf = 0.5
        
        # Priority detection based on keywords and length
        if any(word in text_lower for word in ['urgent', 'critical', 'emergency', 'severe', 'serious']):
            priority = 'Critical'
            priority_conf = 0.85
        elif any(word in text_lower for word in ['important', 'high', 'major', 'significant']):
            priority = 'High'
            priority_conf = 0.8
        elif len(complaint_text) > 200:
            priority = 'High'
            priority_conf = 0.65
        elif any(word in text_lower for word in ['minor', 'small', 'slight', 'little']):
            priority = 'Low'
            priority_conf = 0.75
        else:
            priority = 'Medium'
            priority_conf = 0.7
        
        # Severity detection
        if any(word in text_lower for word in ['critical', 'severe', 'serious', 'danger', 'emergency']):
            severity = 'High'
            severity_conf = 0.85
        elif any(word in text_lower for word in ['problem', 'issue', 'complaint', 'dissatisfied']):
            severity = 'Medium'
            severity_conf = 0.75
        else:
            severity = 'Low'
            severity_conf = 0.6
        
        result = {
            'category': category,
            'staff_assignment': 'General_Staff',
            'priority': priority,
            'severity': severity,
            'confidence_scores': {
                'category': category_conf,
                'priority': priority_conf,
                'severity': severity_conf,
                'overall': (category_conf + priority_conf + severity_conf) / 3
            }
        }
        
        if not return_probabilities:
            result.pop('confidence_scores', None)
        
        return result
    
    def predict(self, complaint_text):
        """Alias for classify_complaint for API compatibility"""
        return self.classify_complaint(complaint_text)


# Global instance (lazy loaded)
_service_instance = None


def get_classification_service():
    """Get or create the global service instance"""
    global _service_instance
    if _service_instance is None:
        _service_instance = ComplaintClassificationService()
    return _service_instance


def classify_complaint(complaint_text, return_probabilities=False):
    """
    Top-level function to classify a complaint
    Creates service instance on first call and caches it
    
    Args:
        complaint_text: The complaint description text
        return_probabilities: If True, return probability distributions
    
    Returns:
        Dictionary with predictions
    """
    service = get_classification_service()
    return service.classify_complaint(complaint_text, return_probabilities)
