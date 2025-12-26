"""
Hybrid Intelligence System: Rule-Based + AI Classification
Combines pattern matching with ML predictions for higher accuracy
"""

import re
from typing import Dict, List, Tuple, Optional
import numpy as np


class RuleBasedClassifier:
    """Rule-based classifier for obvious complaint patterns"""
    
    def __init__(self):
        # Define rules for each category
        self.category_rules = {
            'Security': {
                'keywords': [
                    'stolen', 'theft', 'robbed', 'snatched', 'missing', 'thief',
                    'pickpocket', 'harass', 'threat', 'unsafe', 'stalking', 'assault',
                    'robbery', 'chain snatch', 'bag stolen', 'wallet stolen', 
                    'phone stolen', 'laptop stolen', 'violence', 'attack'
                ],
                'patterns': [
                    r'\b(my|our)\s+(bag|wallet|phone|luggage|laptop)\s+was\s+stolen\b',
                    r'\btheft\b',
                    r'\bharass(ment|ing|ed)\b',
                    r'\bunsafe\b',
                ],
                'staff': 'RPF Security',
                'priority': 'High',
                'severity': 'Critical'
            },
            'Coach - Cleanliness': {
                'keywords': [
                    'dirty', 'filthy', 'unclean', 'toilet', 'washroom', 'bathroom',
                    'smell', 'odor', 'stench', 'garbage', 'trash', 'litter',
                    'cockroach', 'rat', 'insect', 'pest', 'unhygienic', 'sanitation'
                ],
                'patterns': [
                    r'\btoilet\s+(is|was)\s+(dirty|filthy|overflowing)\b',
                    r'\bwashroom\s+(is|was)\s+(dirty|filthy|unclean)\b',
                    r'\b(bad|foul|terrible)\s+smell\b',
                    r'\b(cockroach|rat|insect)s?\b',
                ],
                'staff': 'Housekeeping Staff',
                'priority': 'High',
                'severity': 'High'
            },
            'Electrical Equipment': {
                'keywords': [
                    'ac', 'air conditioning', 'fan', 'light', 'electricity',
                    'charging', 'socket', 'power', 'not working', 'broken',
                    'spark', 'switch'
                ],
                'patterns': [
                    r'\b(ac|air conditioning|fan|light)\s+(not|is not|isn\'t)\s+working\b',
                    r'\bno\s+(power|electricity)\b',
                    r'\bcharging\s+(point|socket)\s+(not|is not)\s+working\b',
                ],
                'staff': 'Maintenance Staff',
                'priority': 'Medium',
                'severity': 'Medium'
            },
            'Water Availability': {
                'keywords': [
                    'water', 'tap', 'drinking water', 'no water', 'water supply',
                    'leaking', 'overflow'
                ],
                'patterns': [
                    r'\bno\s+water\b',
                    r'\bwater\s+(not|is not)\s+available\b',
                    r'\btap\s+(not|is not)\s+working\b',
                ],
                'staff': 'Maintenance Staff',
                'priority': 'High',
                'severity': 'High'
            },
            'Punctuality': {
                'keywords': [
                    'late', 'delay', 'delayed', 'behind schedule', 'not on time',
                    'hours late', 'missed', 'slow', 'cancelled', 'cancel'
                ],
                'patterns': [
                    r'\b\d+\s+hours?\s+late\b',
                    r'\btrain\s+(is|was)\s+(late|delayed)\b',
                    r'\bdelayed?\s+by\s+\d+\s+hours?\b',
                ],
                'staff': 'Station Master',
                'priority': 'High',
                'severity': 'High'
            },
            'Catering': {
                'keywords': [
                    'food', 'meal', 'tea', 'coffee', 'breakfast', 'lunch', 'dinner',
                    'pantry', 'catering', 'stale', 'cold', 'quality', 'taste',
                    'overcharged', 'price'
                ],
                'patterns': [
                    r'\bfood\s+(is|was)\s+(stale|cold|bad|spoiled)\b',
                    r'\bmeal\s+quality\b',
                    r'\bpantry\s+staff\b',
                ],
                'staff': 'Catering Staff',
                'priority': 'Medium',
                'severity': 'Medium'
            },
            'Medical Assistance': {
                'keywords': [
                    'medical', 'doctor', 'emergency', 'health', 'sick', 'ill',
                    'heart attack', 'fainted', 'collapsed', 'ambulance',
                    'first aid', 'medicine', 'hospital'
                ],
                'patterns': [
                    r'\bmedical\s+(emergency|assistance|help)\b',
                    r'\b(heart attack|fainted|collapsed)\b',
                    r'\bneed\s+(doctor|ambulance|medical help)\b',
                ],
                'staff': 'Station Master',
                'priority': 'High',
                'severity': 'Critical'
            },
            'Coach - Maintenance': {
                'keywords': [
                    'seat', 'berth', 'broken', 'damaged', 'window', 'door',
                    'handle', 'lock', 'ladder', 'defective'
                ],
                'patterns': [
                    r'\b(seat|berth|window|door)\s+(is|was)\s+(broken|damaged)\b',
                    r'\b(broken|damaged)\s+(seat|berth|window|door)\b',
                ],
                'staff': 'Maintenance Staff',
                'priority': 'Medium',
                'severity': 'Medium'
            }
        }
        
        # Define confidence thresholds
        self.confidence_thresholds = {
            'high': 0.85,      # Very confident rule match
            'medium': 0.65,    # Moderate rule match
            'low': 0.30        # Use rule as fallback if AI < 30%
        }
    
    def _match_score(self, text: str, keywords: List[str], patterns: List[str]) -> float:
        """Calculate match score for a category"""
        text_lower = text.lower()
        
        # Keyword matching
        keyword_matches = sum(1 for kw in keywords if kw in text_lower)
        keyword_score = min(keyword_matches / max(len(keywords) * 0.2, 1), 1.0)
        
        # Pattern matching
        pattern_matches = sum(1 for pattern in patterns if re.search(pattern, text_lower, re.IGNORECASE))
        pattern_score = min(pattern_matches / max(len(patterns) * 0.3, 1), 1.0) if patterns else 0
        
        # Combined score (weighted average)
        score = 0.6 * keyword_score + 0.4 * pattern_score
        
        return score
    
    def classify(self, complaint_text: str) -> Dict[str, any]:
        """
        Classify complaint using rule-based matching
        
        Returns:
            Dict with 'category', 'staff', 'priority', 'severity', 'confidence', 'rule_match'
        """
        best_category = None
        best_score = 0
        best_metadata = {}
        
        # Try each category's rules
        for category, rules in self.category_rules.items():
            score = self._match_score(
                complaint_text,
                rules['keywords'],
                rules.get('patterns', [])
            )
            
            if score > best_score:
                best_score = score
                best_category = category
                best_metadata = {
                    'staff': rules['staff'],
                    'priority': rules['priority'],
                    'severity': rules['severity']
                }
        
        # Determine confidence level
        if best_score >= self.confidence_thresholds['high']:
            confidence_level = 'high'
        elif best_score >= self.confidence_thresholds['medium']:
            confidence_level = 'medium'
        elif best_score >= self.confidence_thresholds['low']:
            confidence_level = 'low'
        else:
            confidence_level = 'none'
        
        return {
            'category': best_category,
            'staff': best_metadata.get('staff'),
            'priority': best_metadata.get('priority'),
            'severity': best_metadata.get('severity'),
            'confidence': best_score,
            'confidence_level': confidence_level,
            'rule_match': True
        }


class HybridClassifier:
    """
    Hybrid classifier combining rule-based and ML predictions
    
    Strategy:
    1. Run rule-based classifier
    2. Run ML classifier
    3. If rule confidence > 85%, use rule
    4. If ML confidence > 70%, use ML
    5. If ML confidence < 30% and rule confidence > 30%, use rule
    6. Otherwise use ML (with warning)
    """
    
    def __init__(self, ml_classifier, rule_classifier: Optional[RuleBasedClassifier] = None):
        """
        Args:
            ml_classifier: The trained ML model classifier
            rule_classifier: Rule-based classifier (creates new if None)
        """
        self.ml_classifier = ml_classifier
        self.rule_classifier = rule_classifier or RuleBasedClassifier()
        
        # Thresholds for decision making
        self.high_confidence_threshold = 0.70
        self.low_confidence_threshold = 0.30
        self.rule_override_threshold = 0.85
    
    def classify(self, complaint_text: str) -> Dict[str, any]:
        """
        Classify using hybrid approach
        
        Returns dict with:
            - category, staff, priority, severity (predictions)
            - confidence scores for each
            - decision_source ('ml', 'rule', or 'hybrid')
            - explanation
        """
        # Get rule-based prediction
        rule_result = self.rule_classifier.classify(complaint_text)
        
        # Get ML prediction
        ml_result = self.ml_classifier.classify_complaint(complaint_text)
        
        # Decision logic
        decision = {
            'category': None,
            'staff': None,
            'priority': None,
            'severity': None,
            'confidence': {},
            'decision_source': None,
            'explanation': None
        }
        
        # Category decision
        if rule_result['confidence'] >= self.rule_override_threshold:
            # Strong rule match - use rule
            decision['category'] = rule_result['category']
            decision['confidence']['category'] = rule_result['confidence']
            decision['decision_source'] = 'rule'
            decision['explanation'] = f"Strong rule match ({rule_result['confidence']:.2f})"
        elif ml_result['confidence']['category'] >= self.high_confidence_threshold:
            # High ML confidence - use ML
            decision['category'] = ml_result['category']
            decision['confidence']['category'] = ml_result['confidence']['category']
            decision['decision_source'] = 'ml'
            decision['explanation'] = f"High ML confidence ({ml_result['confidence']['category']:.2f})"
        elif (ml_result['confidence']['category'] < self.low_confidence_threshold and 
              rule_result['confidence'] >= self.low_confidence_threshold):
            # Low ML confidence but decent rule match - use rule as fallback
            decision['category'] = rule_result['category']
            decision['confidence']['category'] = rule_result['confidence']
            decision['decision_source'] = 'rule_fallback'
            decision['explanation'] = f"ML low confidence ({ml_result['confidence']['category']:.2f}), using rule fallback"
        else:
            # Default to ML
            decision['category'] = ml_result['category']
            decision['confidence']['category'] = ml_result['confidence']['category']
            decision['decision_source'] = 'ml_default'
            decision['explanation'] = f"Using ML default ({ml_result['confidence']['category']:.2f})"
        
        # For staff, priority, severity - use the same source as category
        if decision['decision_source'].startswith('rule'):
            decision['staff'] = rule_result['staff']
            decision['priority'] = rule_result['priority']
            decision['severity'] = rule_result['severity']
            decision['confidence']['staff'] = rule_result['confidence']
            decision['confidence']['priority'] = rule_result['confidence']
            decision['confidence']['severity'] = rule_result['confidence']
        else:
            decision['staff'] = ml_result['staff']
            decision['priority'] = ml_result['priority']
            decision['severity'] = ml_result['severity']
            decision['confidence']['staff'] = ml_result['confidence']['staff']
            decision['confidence']['priority'] = ml_result['confidence']['priority']
            decision['confidence']['severity'] = ml_result['confidence']['severity']
        
        # Add metadata
        decision['ml_prediction'] = ml_result
        decision['rule_prediction'] = rule_result
        
        return decision
    
    def evaluate_hybrid_performance(self, test_data: List[Dict]) -> Dict:
        """
        Evaluate hybrid classifier performance
        
        Args:
            test_data: List of dicts with 'complaint' and 'true_category' etc.
        
        Returns:
            Performance metrics and decision statistics
        """
        results = {
            'predictions': [],
            'decision_sources': {'ml': 0, 'rule': 0, 'rule_fallback': 0, 'ml_default': 0},
            'correct': {'ml': 0, 'rule': 0, 'rule_fallback': 0, 'ml_default': 0},
            'total': len(test_data)
        }
        
        for item in test_data:
            prediction = self.classify(item['complaint'])
            
            # Track decision source
            source = prediction['decision_source']
            results['decision_sources'][source] += 1
            
            # Check if correct
            if prediction['category'] == item['true_category']:
                results['correct'][source] += 1
            
            results['predictions'].append({
                'complaint': item['complaint'],
                'predicted': prediction['category'],
                'actual': item['true_category'],
                'source': source,
                'confidence': prediction['confidence']['category']
            })
        
        # Calculate accuracy by source
        results['accuracy_by_source'] = {}
        for source in results['decision_sources']:
            if results['decision_sources'][source] > 0:
                accuracy = results['correct'][source] / results['decision_sources'][source]
                results['accuracy_by_source'][source] = accuracy
        
        # Overall accuracy
        total_correct = sum(results['correct'].values())
        results['overall_accuracy'] = total_correct / results['total']
        
        return results


def demo_hybrid_classifier():
    """Demo of hybrid classifier (for testing)"""
    
    print("="*70)
    print("HYBRID CLASSIFIER DEMO")
    print("="*70)
    
    # Test complaints
    test_complaints = [
        {
            'text': 'My laptop was stolen from overhead rack while I was sleeping',
            'expected_category': 'Security'
        },
        {
            'text': 'The toilet is very dirty and smells terrible needs immediate cleaning',
            'expected_category': 'Coach - Cleanliness'
        },
        {
            'text': 'AC is not working and it is very hot in the coach',
            'expected_category': 'Electrical Equipment'
        },
        {
            'text': 'Train is running 4 hours late without any announcement',
            'expected_category': 'Punctuality'
        },
        {
            'text': 'A passenger has fainted and needs urgent medical help',
            'expected_category': 'Medical Assistance'
        }
    ]
    
    # Create rule classifier
    rule_classifier = RuleBasedClassifier()
    
    print("\nTesting rule-based classification:\n")
    for complaint in test_complaints:
        result = rule_classifier.classify(complaint['text'])
        match = "✓" if result['category'] == complaint['expected_category'] else "✗"
        print(f"{match} Text: {complaint['text'][:60]}...")
        print(f"  Expected: {complaint['expected_category']}")
        print(f"  Predicted: {result['category']} (confidence: {result['confidence']:.2f})")
        print(f"  Staff: {result['staff']}, Priority: {result['priority']}, Severity: {result['severity']}")
        print()


if __name__ == '__main__':
    demo_hybrid_classifier()
