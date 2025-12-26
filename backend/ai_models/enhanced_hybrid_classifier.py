"""
Enhanced Hybrid Classifier for 95%+ Accuracy
Combines rule-based logic with ML predictions for Indian Railways complaint system
Special focus on Priority and Severity classification
"""

import re
from typing import Dict, List, Tuple, Optional


class EnhancedRuleBasedClassifier:
    """
    Enhanced rule-based classifier with aggressive Priority/Severity rules
    Designed for high-volume Indian Railways complaint processing
    """
    
    def __init__(self):
        # Critical Priority/Severity triggers (highest confidence)
        self.critical_triggers = {
            'keywords': [
                'emergency', 'urgent', 'critical', 'life threatening', 'death',
                'heart attack', 'fainted', 'collapsed', 'unconscious',
                'weapon', 'gun', 'knife', 'bomb', 'terror', 'attack',
                'fire', 'smoke', 'accident', 'derail', 'crash'
            ],
            'patterns': [
                r'\b(medical|health)\s+emergency\b',
                r'\b(life|death)\s+(threat|threatening|danger)\b',
                r'\b(heart attack|cardiac arrest)\b',
                r'\bfainted\b|\bcollapsed\b|\bunconscious\b',
                r'\b(weapon|gun|knife|bomb)\b',
                r'\bterror(ist|ism)?\s+(threat|attack)\b',
                r'\bfire\b|\bsmoke\b|\bflames?\b',
                r'\baccident\b|\bderail(ment|ed)?\b|\bcrash(ed)?\b'
            ],
            'priority': 'High',
            'severity': 'Critical',
            'confidence_boost': 0.95  # Very high confidence for these
        }
        
        # High Priority triggers
        self.high_priority_triggers = {
            'keywords': [
                'theft', 'stolen', 'robbery', 'missing', 'harass', 'assault',
                'unsafe', 'security threat', 'suspicious person',
                'no water', 'water not available', 'extreme cold', 'extreme heat',
                'very late', 'severely delayed', 'hours late', 'cancelled',
                'food poisoning', 'sick after eating', 'contaminated'
            ],
            'patterns': [
                r'\b(theft|stolen|robbery|robbed|snatched)\b',
                r'\bharass(ment|ing|ed)\b|\bassault(ed)?\b',
                r'\bsecurity\s+threat\b|\bsuspicious\s+person\b',
                r'\bno\s+water\b|\bwater\s+not\s+available\b',
                r'\b\d+\s+hours?\s+late\b|\bseverely\s+delayed?\b',
                r'\bfood\s+poison(ing|ed)\b|\bcontaminated\s+food\b'
            ],
            'priority': 'High',
            'severity': 'High',
            'confidence_boost': 0.85
        }
        
        # Medium Priority triggers
        self.medium_priority_triggers = {
            'keywords': [
                'ac not working', 'fan not working', 'no cooling', 'hot',
                'dirty', 'unclean', 'smell', 'bathroom', 'toilet',
                'seat broken', 'berth damaged', 'door not closing',
                'delayed', 'late', 'slow', 'behind schedule',
                'cold food', 'stale food', 'poor quality', 'overcharged'
            ],
            'patterns': [
                r'\b(ac|air conditioning|fan)\s+(not|is not|isn\'t)\s+working\b',
                r'\b(dirty|unclean|filthy)\b.*\b(toilet|bathroom|coach)\b',
                r'\b(seat|berth|door|window)\s+(broken|damaged|not working)\b',
                r'\b(delayed?|late)\b.*\b(minutes?|hour)\b',
                r'\b(cold|stale|poor quality)\s+(food|meal)\b'
            ],
            'priority': 'Medium',
            'severity': 'Medium',
            'confidence_boost': 0.70
        }
        
        # Low Priority triggers
        self.low_priority_triggers = {
            'keywords': [
                'minor', 'small issue', 'suggestion', 'feedback',
                'improvement', 'request', 'query', 'question',
                'slightly', 'a little', 'somewhat'
            ],
            'patterns': [
                r'\bminor\s+(issue|problem|complaint)\b',
                r'\bsuggestion\b|\bfeedback\b|\brequest\b',
                r'\bslightly\b|\ba little\b|\bsomewhat\b'
            ],
            'priority': 'Low',
            'severity': 'Low',
            'confidence_boost': 0.60
        }
        
        # Category-specific rules
        self.category_rules = {
            'Security': {
                'keywords': [
                    'stolen', 'theft', 'robbed', 'snatched', 'missing', 'thief',
                    'pickpocket', 'harass', 'threat', 'unsafe', 'stalking', 'assault',
                    'robbery', 'chain snatch', 'bag stolen', 'wallet stolen',
                    'phone stolen', 'laptop stolen', 'violence', 'attack',
                    'weapon', 'suspicious person', 'security guard'
                ],
                'patterns': [
                    r'\b(my|our)\s+(bag|wallet|phone|luggage|laptop)\s+was\s+stolen\b',
                    r'\btheft\b|\brobber(y|ies)\b',
                    r'\bharass(ment|ing|ed)\b',
                    r'\bunsafe\b|\bsecurity\s+(threat|issue)\b'
                ],
                'default_priority': 'High',
                'default_severity': 'Critical'
            },
            'Coach - Cleanliness': {
                'keywords': [
                    'dirty', 'filthy', 'unclean', 'toilet', 'washroom', 'bathroom',
                    'smell', 'odor', 'stench', 'garbage', 'trash', 'litter',
                    'cockroach', 'rat', 'insect', 'pest', 'unhygienic', 'sanitation'
                ],
                'patterns': [
                    r'\btoilet\s+(is|was)\s+(dirty|filthy|overflowing)\b',
                    r'\b(bad|foul|terrible)\s+smell\b',
                    r'\b(cockroach|rat|insect)s?\b'
                ],
                'default_priority': 'High',
                'default_severity': 'High'
            },
            'Medical Assistance': {
                'keywords': [
                    'medical', 'doctor', 'emergency', 'health', 'sick', 'ill',
                    'heart attack', 'fainted', 'collapsed', 'ambulance',
                    'first aid', 'medicine', 'hospital', 'patient'
                ],
                'patterns': [
                    r'\bmedical\s+(emergency|assistance|help)\b',
                    r'\b(heart attack|fainted|collapsed)\b',
                    r'\bneed\s+(doctor|ambulance|medical help)\b'
                ],
                'default_priority': 'High',
                'default_severity': 'Critical'
            },
            'Water Availability': {
                'keywords': [
                    'water', 'tap', 'drinking water', 'no water', 'water supply',
                    'leaking', 'overflow', 'water not available'
                ],
                'patterns': [
                    r'\bno\s+water\b',
                    r'\bwater\s+(not|is not)\s+available\b',
                    r'\btap\s+(not|is not)\s+working\b'
                ],
                'default_priority': 'High',
                'default_severity': 'High'
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
                    r'\bcancelled?\b'
                ],
                'default_priority': 'High',
                'default_severity': 'High'
            }
        }
    
    def _match_score(self, text: str, keywords: List[str], patterns: List[str]) -> float:
        """Calculate match score for keywords and patterns"""
        text_lower = text.lower()
        
        # Keyword matching
        keyword_matches = sum(1 for kw in keywords if kw.lower() in text_lower)
        keyword_score = min(keyword_matches / max(len(keywords) * 0.15, 1), 1.0)
        
        # Pattern matching (higher weight)
        pattern_matches = sum(1 for pattern in patterns if re.search(pattern, text_lower, re.IGNORECASE))
        pattern_score = min(pattern_matches / max(len(patterns) * 0.25, 1), 1.0) if patterns else 0
        
        # Combined score
        score = 0.5 * keyword_score + 0.5 * pattern_score
        return score
    
    def classify_priority_severity(self, complaint_text: str) -> Dict[str, any]:
        """
        Classify Priority and Severity using rule-based logic
        Returns: dict with 'priority', 'severity', 'confidence', 'trigger_type'
        """
        text_lower = complaint_text.lower()
        
        # Check critical triggers first
        critical_score = self._match_score(
            complaint_text,
            self.critical_triggers['keywords'],
            self.critical_triggers['patterns']
        )
        
        if critical_score > 0.3:  # Any match with critical triggers
            return {
                'priority': 'High',
                'severity': 'Critical',
                'confidence': min(critical_score + self.critical_triggers['confidence_boost'], 0.99),
                'trigger_type': 'critical',
                'rule_match': True
            }
        
        # Check high priority triggers
        high_score = self._match_score(
            complaint_text,
            self.high_priority_triggers['keywords'],
            self.high_priority_triggers['patterns']
        )
        
        if high_score > 0.25:
            return {
                'priority': 'High',
                'severity': 'High',
                'confidence': min(high_score + self.high_priority_triggers['confidence_boost'], 0.95),
                'trigger_type': 'high',
                'rule_match': True
            }
        
        # Check medium priority triggers
        medium_score = self._match_score(
            complaint_text,
            self.medium_priority_triggers['keywords'],
            self.medium_priority_triggers['patterns']
        )
        
        if medium_score > 0.20:
            return {
                'priority': 'Medium',
                'severity': 'Medium',
                'confidence': min(medium_score + self.medium_priority_triggers['confidence_boost'], 0.85),
                'trigger_type': 'medium',
                'rule_match': True
            }
        
        # Check low priority triggers
        low_score = self._match_score(
            complaint_text,
            self.low_priority_triggers['keywords'],
            self.low_priority_triggers['patterns']
        )
        
        if low_score > 0.15:
            return {
                'priority': 'Low',
                'severity': 'Low',
                'confidence': min(low_score + self.low_priority_triggers['confidence_boost'], 0.75),
                'trigger_type': 'low',
                'rule_match': True
            }
        
        # No strong rule match
        return {
            'priority': None,
            'severity': None,
            'confidence': 0.0,
            'trigger_type': 'none',
            'rule_match': False
        }
    
    def classify_category(self, complaint_text: str) -> Dict[str, any]:
        """
        Classify Category using rule-based logic
        Returns: dict with 'category', 'confidence', 'default_priority', 'default_severity'
        """
        best_category = None
        best_score = 0
        best_metadata = {}
        
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
                    'default_priority': rules.get('default_priority', 'Medium'),
                    'default_severity': rules.get('default_severity', 'Medium')
                }
        
        if best_score > 0.3:  # Reasonable match
            return {
                'category': best_category,
                'confidence': min(best_score + 0.70, 0.95),
                'default_priority': best_metadata['default_priority'],
                'default_severity': best_metadata['default_severity'],
                'rule_match': True
            }
        
        return {
            'category': None,
            'confidence': 0.0,
            'default_priority': None,
            'default_severity': None,
            'rule_match': False
        }


class EnhancedHybridClassifier:
    """
    Enhanced Hybrid Classifier for 95%+ accuracy
    Aggressive rule boosting for Priority/Severity
    """
    
    def __init__(self, ml_service):
        """
        Args:
            ml_service: EnhancedClassificationService with trained models
        """
        self.ml_service = ml_service
        self.rule_classifier = EnhancedRuleBasedClassifier()
        
        # Thresholds for decision making
        self.rule_confidence_high = 0.80  # Use rule if above this
        self.ml_confidence_high = 0.75    # Use ML if above this
        self.ml_confidence_low = 0.40     # Use rule fallback if ML below this
    
    def classify(self, complaint_text: str, return_details=False) -> Dict[str, any]:
        """
        Classify using enhanced hybrid approach
        
        Args:
            complaint_text: The complaint description
            return_details: If True, return full decision details
        
        Returns:
            dict with category, staff, priority, severity predictions
        """
        # Get ML predictions (use direct ML method to avoid recursion)
        ml_result = self.ml_service._classify_ml_only(complaint_text, return_details=True)
        
        # Get rule-based predictions
        rule_priority_severity = self.rule_classifier.classify_priority_severity(complaint_text)
        rule_category = self.rule_classifier.classify_category(complaint_text)
        
        # Decision: Category (keep ML, it's already 96%)
        final_category = ml_result['category']
        final_staff = ml_result['staff']
        category_source = 'ml'
        category_confidence = ml_result['confidences']['category']
        
        # Override category if rule is very confident
        if rule_category['rule_match'] and rule_category['confidence'] > 0.90:
            if ml_result['confidences']['category'] < 0.85:
                final_category = rule_category['category']
                category_source = 'rule_override'
                category_confidence = rule_category['confidence']
        
        # Decision: Priority (aggressive rule boosting)
        ml_priority_conf = ml_result['confidences']['priority']
        
        if rule_priority_severity['rule_match'] and rule_priority_severity['confidence'] >= self.rule_confidence_high:
            # High confidence rule - use rule
            final_priority = rule_priority_severity['priority']
            priority_source = 'rule'
            priority_confidence = rule_priority_severity['confidence']
        elif ml_priority_conf >= self.ml_confidence_high:
            # High ML confidence - use ML
            final_priority = ml_result['priority']
            priority_source = 'ml'
            priority_confidence = ml_priority_conf
        elif (ml_priority_conf < self.ml_confidence_low and 
              rule_priority_severity['rule_match'] and 
              rule_priority_severity['confidence'] > 0.30):
            # Low ML confidence but decent rule match - use rule as fallback
            final_priority = rule_priority_severity['priority']
            priority_source = 'rule_fallback'
            priority_confidence = rule_priority_severity['confidence']
        else:
            # Default to ML
            final_priority = ml_result['priority']
            priority_source = 'ml_default'
            priority_confidence = ml_priority_conf
        
        # Decision: Severity (aggressive rule boosting)
        ml_severity_conf = ml_result['confidences']['severity']
        
        if rule_priority_severity['rule_match'] and rule_priority_severity['confidence'] >= self.rule_confidence_high:
            # High confidence rule - use rule
            final_severity = rule_priority_severity['severity']
            severity_source = 'rule'
            severity_confidence = rule_priority_severity['confidence']
        elif ml_severity_conf >= self.ml_confidence_high:
            # High ML confidence - use ML
            final_severity = ml_result['severity']
            severity_source = 'ml'
            severity_confidence = ml_severity_conf
        elif (ml_severity_conf < self.ml_confidence_low and 
              rule_priority_severity['rule_match'] and 
              rule_priority_severity['confidence'] > 0.30):
            # Low ML confidence but decent rule match - use rule as fallback
            final_severity = rule_priority_severity['severity']
            severity_source = 'rule_fallback'
            severity_confidence = rule_priority_severity['confidence']
        else:
            # Default to ML
            final_severity = ml_result['severity']
            severity_source = 'ml_default'
            severity_confidence = ml_severity_conf
        
        result = {
            'category': final_category,
            'staff': final_staff,
            'priority': final_priority,
            'severity': final_severity
        }
        
        if return_details:
            result.update({
                'confidences': {
                    'category': category_confidence,
                    'staff': ml_result['confidences']['staff'],
                    'priority': priority_confidence,
                    'severity': severity_confidence
                },
                'decision_sources': {
                    'category': category_source,
                    'staff': 'ml',  # Always use ML for staff
                    'priority': priority_source,
                    'severity': severity_source
                },
                'ml_predictions': ml_result,
                'rule_predictions': {
                    'priority_severity': rule_priority_severity,
                    'category': rule_category
                }
            })
        
        return result


# Test/Demo function
if __name__ == '__main__':
    print("="*70)
    print("ENHANCED HYBRID CLASSIFIER - RULE-BASED TESTING")
    print("="*70)
    
    rule_classifier = EnhancedRuleBasedClassifier()
    
    test_cases = [
        "Passenger has heart attack and collapsed in AC coach need urgent doctor",
        "My wallet was stolen by pickpocket while boarding train",
        "Toilet is very dirty and smelly needs cleaning",
        "AC not working in coach and it is very hot",
        "Train is 5 hours late without any announcement",
        "Food quality is average could be better",
        "Minor scratch on window glass"
    ]
    
    print("\nTesting Priority/Severity Rules:\n")
    for complaint in test_cases:
        print(f"Complaint: {complaint[:60]}...")
        result = rule_classifier.classify_priority_severity(complaint)
        print(f"  Priority: {result['priority']}, Severity: {result['severity']}")
        print(f"  Confidence: {result['confidence']:.2f}, Trigger: {result['trigger_type']}")
        print()
