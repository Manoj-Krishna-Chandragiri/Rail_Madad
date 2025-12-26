"""
Enhanced Complaint Classification Service
Loads models trained with enhanced techniques (Focal Loss, Early Stopping, etc.)
Achieves 90%+ accuracy on Category, Staff, Priority, Severity
"""

import torch
import numpy as np
import pickle
import json
import os
from transformers import DistilBertTokenizer, DistilBertForSequenceClassification


class EnhancedClassificationService:
    """
    Service for real-time complaint classification using enhanced models
    Supports both standalone and hybrid (rule-based + ML) modes
    """
    
    def __init__(self, model_dir='ai_models/models/enhanced', use_hybrid=False):
        """
        Initialize the service with enhanced pre-trained models
        
        Args:
            model_dir: Directory containing saved models (category_model/, staff_model/, etc.)
            use_hybrid: If True, use hybrid classifier for boosted accuracy
        """
        self.model_dir = model_dir
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.use_hybrid = use_hybrid
        
        # Check if models exist
        if not os.path.exists(model_dir):
            raise FileNotFoundError(
                f"Model directory not found: {model_dir}\n"
                f"Please download and extract trained models from Colab to: {model_dir}"
            )
        
        # Initialize models
        self._load_models()
        
        # Initialize hybrid classifier if requested
        if use_hybrid:
            from ai_models.enhanced_hybrid_classifier import EnhancedHybridClassifier
            self.hybrid = EnhancedHybridClassifier(self)
            print("✅ Enhanced hybrid classifier enabled (aggressive rule boosting)")
        
        print(f"\n{'='*70}")
        print("  ✅ EnhancedClassificationService Initialized")
        print(f"{'='*70}")
        print(f"Device: {self.device}")
        print(f"Hybrid Mode: {use_hybrid}")
        print(f"Models Loaded: Category, Staff, Priority, Severity")
        print(f"{'='*70}\n")
    
    def _load_models(self):
        """Load all four classification models"""
        
        # 1. Category Model (15 classes)
        category_dir = os.path.join(self.model_dir, 'category_model')
        self.category_model = DistilBertForSequenceClassification.from_pretrained(category_dir).to(self.device)
        self.category_tokenizer = DistilBertTokenizer.from_pretrained(category_dir)
        with open(os.path.join(category_dir, 'label_encoder.pkl'), 'rb') as f:
            self.category_encoder = pickle.load(f)
        with open(os.path.join(category_dir, 'test_metrics.json'), 'r') as f:
            self.category_metrics = json.load(f)
        self.category_model.eval()
        
        # 2. Staff Model (6 classes)
        staff_dir = os.path.join(self.model_dir, 'staff_model')
        self.staff_model = DistilBertForSequenceClassification.from_pretrained(staff_dir).to(self.device)
        self.staff_tokenizer = DistilBertTokenizer.from_pretrained(staff_dir)
        with open(os.path.join(staff_dir, 'label_encoder.pkl'), 'rb') as f:
            self.staff_encoder = pickle.load(f)
        with open(os.path.join(staff_dir, 'test_metrics.json'), 'r') as f:
            self.staff_metrics = json.load(f)
        self.staff_model.eval()
        
        # 3. Priority Model (3 classes)
        priority_dir = os.path.join(self.model_dir, 'priority_model')
        self.priority_model = DistilBertForSequenceClassification.from_pretrained(priority_dir).to(self.device)
        self.priority_tokenizer = DistilBertTokenizer.from_pretrained(priority_dir)
        with open(os.path.join(priority_dir, 'label_encoder.pkl'), 'rb') as f:
            self.priority_encoder = pickle.load(f)
        with open(os.path.join(priority_dir, 'test_metrics.json'), 'r') as f:
            self.priority_metrics = json.load(f)
        self.priority_model.eval()
        
        # 4. Severity Model (4 classes)
        severity_dir = os.path.join(self.model_dir, 'severity_model')
        self.severity_model = DistilBertForSequenceClassification.from_pretrained(severity_dir).to(self.device)
        self.severity_tokenizer = DistilBertTokenizer.from_pretrained(severity_dir)
        with open(os.path.join(severity_dir, 'label_encoder.pkl'), 'rb') as f:
            self.severity_encoder = pickle.load(f)
        with open(os.path.join(severity_dir, 'test_metrics.json'), 'r') as f:
            self.severity_metrics = json.load(f)
        self.severity_model.eval()
    
    def _predict_single(self, text, model, tokenizer, encoder):
        """
        Make prediction with a single model
        
        Args:
            text: Input complaint text
            model: PyTorch model
            tokenizer: Tokenizer for the model
            encoder: Label encoder for decoding predictions
        
        Returns:
            prediction: Predicted class label
            confidence: Confidence score (0-1)
            probabilities: Probability distribution across all classes
        """
        # Tokenize
        inputs = tokenizer(
            text,
            max_length=128,
            padding='max_length',
            truncation=True,
            return_tensors='pt'
        )
        
        input_ids = inputs['input_ids'].to(self.device)
        attention_mask = inputs['attention_mask'].to(self.device)
        
        # Predict
        with torch.no_grad():
            outputs = model(input_ids=input_ids, attention_mask=attention_mask)
            logits = outputs.logits
            probabilities = torch.softmax(logits, dim=1).cpu().numpy()[0]
            predicted_idx = np.argmax(probabilities)
        
        prediction = encoder.inverse_transform([predicted_idx])[0]
        confidence = float(probabilities[predicted_idx])
        
        # Create probability dict
        prob_dict = {
            encoder.classes_[i]: float(probabilities[i])
            for i in range(len(encoder.classes_))
        }
        
        return prediction, confidence, prob_dict
    
    def classify_complaint(self, complaint_text, return_details=False):
        """
        Classify a complaint across all dimensions
        
        Args:
            complaint_text: The complaint description
            return_details: If True, return confidence scores and probabilities
        
        Returns:
            results: Dictionary with predictions:
                - category: Predicted category
                - staff: Assigned staff department
                - priority: Priority level (High/Medium/Low)
                - severity: Severity level (Critical/High/Medium/Low)
                - (optional) confidences and probabilities if return_details=True
        """
        
        if not complaint_text or not isinstance(complaint_text, str):
            raise ValueError("complaint_text must be a non-empty string")
        
        # Use hybrid classifier if enabled
        if self.use_hybrid:
            return self.hybrid.classify(complaint_text, return_details=return_details)
        
        # Fall back to pure ML classification
        return self._classify_ml_only(complaint_text, return_details)
    
    def _classify_ml_only(self, complaint_text, return_details=False):
        """
        Pure ML classification (used by hybrid classifier to avoid recursion)
        """
        # Predict all dimensions
        category, cat_conf, cat_probs = self._predict_single(
            complaint_text, self.category_model, self.category_tokenizer, self.category_encoder
        )
        
        staff, staff_conf, staff_probs = self._predict_single(
            complaint_text, self.staff_model, self.staff_tokenizer, self.staff_encoder
        )
        
        priority, pri_conf, pri_probs = self._predict_single(
            complaint_text, self.priority_model, self.priority_tokenizer, self.priority_encoder
        )
        
        severity, sev_conf, sev_probs = self._predict_single(
            complaint_text, self.severity_model, self.severity_tokenizer, self.severity_encoder
        )
        
        results = {
            'category': category,
            'staff': staff,
            'priority': priority,
            'severity': severity
        }
        
        if return_details:
            results.update({
                'confidences': {
                    'category': cat_conf,
                    'staff': staff_conf,
                    'priority': pri_conf,
                    'severity': sev_conf
                },
                'probabilities': {
                    'category': cat_probs,
                    'staff': staff_probs,
                    'priority': pri_probs,
                    'severity': sev_probs
                },
                'model_metrics': {
                    'category': self.category_metrics,
                    'staff': self.staff_metrics,
                    'priority': self.priority_metrics,
                    'severity': self.severity_metrics
                }
            })
        
        return results
    
    def get_model_info(self):
        """Get information about loaded models and their performance"""
        return {
            'device': str(self.device),
            'hybrid_mode': self.use_hybrid,
            'models': {
                'category': {
                    'classes': self.category_encoder.classes_.tolist(),
                    'accuracy': self.category_metrics.get('accuracy', 'N/A'),
                    'macro_f1': self.category_metrics.get('macro_f1', 'N/A')
                },
                'staff': {
                    'classes': self.staff_encoder.classes_.tolist(),
                    'accuracy': self.staff_metrics.get('accuracy', 'N/A'),
                    'macro_f1': self.staff_metrics.get('macro_f1', 'N/A')
                },
                'priority': {
                    'classes': self.priority_encoder.classes_.tolist(),
                    'accuracy': self.priority_metrics.get('accuracy', 'N/A'),
                    'macro_f1': self.priority_metrics.get('macro_f1', 'N/A')
                },
                'severity': {
                    'classes': self.severity_encoder.classes_.tolist(),
                    'accuracy': self.severity_metrics.get('accuracy', 'N/A'),
                    'macro_f1': self.severity_metrics.get('macro_f1', 'N/A')
                }
            }
        }


# Test script
if __name__ == "__main__":
    print("Testing Enhanced Classification Service...\n")
    
    # Initialize service
    service = EnhancedClassificationService(use_hybrid=False)
    
    # Test complaints
    test_cases = [
        "Water leakage in AC coach, very dirty and unhygienic",
        "Security threat: suspicious person with weapon in train",
        "Food quality is very poor and staff is rude",
        "Train delayed by 3 hours, no announcement made",
        "Medical emergency: passenger needs urgent help"
    ]
    
    print(f"\n{'='*70}")
    print("  TEST PREDICTIONS")
    print(f"{'='*70}\n")
    
    for i, complaint in enumerate(test_cases, 1):
        print(f"{i}. Complaint: {complaint[:60]}...")
        result = service.classify_complaint(complaint, return_details=True)
        
        print(f"   Category: {result['category']} ({result['confidences']['category']:.2%})")
        print(f"   Staff: {result['staff']} ({result['confidences']['staff']:.2%})")
        print(f"   Priority: {result['priority']} ({result['confidences']['priority']:.2%})")
        print(f"   Severity: {result['severity']} ({result['confidences']['severity']:.2%})")
        print()
    
    # Print model info
    print(f"\n{'='*70}")
    print("  MODEL INFORMATION")
    print(f"{'='*70}\n")
    
    info = service.get_model_info()
    for model_name, model_info in info['models'].items():
        print(f"{model_name.upper()}:")
        print(f"  Accuracy: {model_info['accuracy']:.2%}")
        print(f"  Macro-F1: {model_info['macro_f1']:.2%}")
        print(f"  Classes: {len(model_info['classes'])}")
        print()
