"""
AI-powered Complaint Categorization System
Automatically categorizes complaints based on description text using machine learning
"""

import re
import json
import pickle
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, accuracy_score
from sklearn.pipeline import Pipeline
from django.conf import settings
import os
import logging

logger = logging.getLogger(__name__)

class ComplaintCategorizer:
    """
    Advanced AI model for categorizing railway complaints automatically
    """
    
    # Define comprehensive complaint categories
    CATEGORIES = {
        'cleanliness': {
            'name': 'Cleanliness & Hygiene',
            'keywords': ['dirty', 'clean', 'toilet', 'bathroom', 'washroom', 'garbage', 'trash', 'smell', 'odor', 'hygiene', 'soap', 'tissue', 'dustbin'],
            'staff_roles': ['housekeeping', 'sanitation', 'maintenance'],
            'priority': 'Medium',
            'expected_resolution': '2-4 hours'
        },
        'catering': {
            'name': 'Food & Catering',
            'keywords': ['food', 'meal', 'snack', 'water', 'tea', 'coffee', 'pantry', 'kitchen', 'stale', 'expired', 'taste', 'quality', 'vendor'],
            'staff_roles': ['catering', 'pantry_manager', 'food_safety'],
            'priority': 'High',
            'expected_resolution': '1-2 hours'
        },
        'staff_behavior': {
            'name': 'Staff Behavior',
            'keywords': ['rude', 'behavior', 'attitude', 'misbehave', 'unprofessional', 'staff', 'conductor', 'tte', 'guard', 'officer'],
            'staff_roles': ['hr', 'supervisor', 'station_manager'],
            'priority': 'High',
            'expected_resolution': '24 hours'
        },
        'booking_ticketing': {
            'name': 'Booking & Ticketing',
            'keywords': ['ticket', 'booking', 'reservation', 'pnr', 'refund', 'cancellation', 'tatkal', 'waitlist', 'confirm', 'payment'],
            'staff_roles': ['ticketing', 'reservation_clerk', 'customer_service'],
            'priority': 'Medium',
            'expected_resolution': '2-6 hours'
        },
        'electrical': {
            'name': 'Electrical Issues',
            'keywords': ['light', 'fan', 'ac', 'air conditioning', 'socket', 'charging', 'electrical', 'power', 'switch', 'bulb'],
            'staff_roles': ['electrician', 'maintenance', 'technical'],
            'priority': 'Medium',
            'expected_resolution': '1-3 hours'
        },
        'mechanical': {
            'name': 'Mechanical Issues',
            'keywords': ['door', 'window', 'seat', 'berth', 'chain', 'lock', 'broken', 'damaged', 'repair', 'maintenance'],
            'staff_roles': ['mechanic', 'maintenance', 'technical'],
            'priority': 'Medium',
            'expected_resolution': '2-4 hours'
        },
        'security': {
            'name': 'Security & Safety',
            'keywords': ['theft', 'robbery', 'safety', 'security', 'lost', 'stolen', 'harassment', 'violence', 'emergency'],
            'staff_roles': ['security', 'rpf', 'station_manager'],
            'priority': 'Critical',
            'expected_resolution': 'Immediate'
        },
        'medical': {
            'name': 'Medical Emergency',
            'keywords': ['medical', 'health', 'emergency', 'doctor', 'medicine', 'first aid', 'hospital', 'sick', 'injury'],
            'staff_roles': ['medical', 'paramedic', 'station_manager'],
            'priority': 'Critical',
            'expected_resolution': 'Immediate'
        },
        'delay_cancellation': {
            'name': 'Delay & Cancellation',
            'keywords': ['delay', 'late', 'cancel', 'schedule', 'time', 'running', 'arrival', 'departure'],
            'staff_roles': ['station_manager', 'traffic_controller', 'customer_service'],
            'priority': 'Low',
            'expected_resolution': '6-12 hours'
        },
        'luggage': {
            'name': 'Luggage Issues',
            'keywords': ['luggage', 'baggage', 'suitcase', 'bag', 'lost', 'missing', 'cloak room', 'storage'],
            'staff_roles': ['luggage_clerk', 'security', 'customer_service'],
            'priority': 'Medium',
            'expected_resolution': '2-6 hours'
        },
        'noise': {
            'name': 'Noise & Disturbance',
            'keywords': ['noise', 'loud', 'music', 'disturb', 'quiet', 'sleep', 'sound', 'volume'],
            'staff_roles': ['conductor', 'tte', 'security'],
            'priority': 'Low',
            'expected_resolution': '30 minutes'
        },
        'general': {
            'name': 'General Issues',
            'keywords': ['general', 'other', 'miscellaneous', 'suggestion', 'feedback'],
            'staff_roles': ['customer_service', 'general_support'],
            'priority': 'Low',
            'expected_resolution': '24-48 hours'
        }
    }
    
    def __init__(self):
        self.model = None
        self.vectorizer = None
        self.pipeline = None
        self.model_path = os.path.join(settings.BASE_DIR, 'ai_models', 'models')
        self.is_trained = False
        
        # Create models directory if it doesn't exist
        os.makedirs(self.model_path, exist_ok=True)
        
        # Try to load existing model
        self.load_model()
    
    def preprocess_text(self, text: str) -> str:
        """
        Clean and preprocess complaint text for better categorization
        """
        if not text:
            return ""
            
        # Convert to lowercase
        text = text.lower()
        
        # Remove special characters but keep spaces
        text = re.sub(r'[^a-zA-Z0-9\s]', ' ', text)
        
        # Remove extra whitespaces
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text
    
    def generate_training_data(self) -> pd.DataFrame:
        """
        Generate synthetic training data for the model
        This would be replaced with real historical complaint data
        """
        training_data = []
        
        # Sample complaints for each category
        sample_complaints = {
            'cleanliness': [
                "The toilet is very dirty and smells bad",
                "No soap in the bathroom, very unhygienic",
                "Garbage overflowing from dustbin in coach",
                "Washroom floor is wet and slippery",
                "No tissue paper available in toilet",
                "Seats are dirty and need cleaning",
                "Bad odor coming from toilet area",
                "Toilet door lock is broken and dirty"
            ],
            'catering': [
                "Food quality is very poor and stale",
                "No water available in pantry car",
                "Tea is cold and tastes bad",
                "Food is overpriced and not fresh",
                "Vendor selling expired snacks",
                "Pantry car staff is rude",
                "No vegetarian food available",
                "Food poisoning from train meal"
            ],
            'staff_behavior': [
                "TTE was very rude and unprofessional",
                "Conductor misbehaved with passengers",
                "Station staff was not helpful",
                "Guard was sleeping during duty",
                "Staff demanded bribe for service",
                "Unprofessional behavior by ticket checker",
                "Railway officer was arrogant",
                "Cleaning staff was rude"
            ],
            'booking_ticketing': [
                "Unable to book ticket online",
                "PNR not confirmed despite payment",
                "Refund not processed for cancelled ticket",
                "Tatkal booking failed multiple times",
                "Wrong fare charged for ticket",
                "Waitlist not moving despite cancellations",
                "Payment deducted but ticket not booked",
                "Reservation chart shows wrong information"
            ],
            'electrical': [
                "AC not working in coach",
                "Lights are not working properly",
                "Charging socket is not functional",
                "Fan making loud noise",
                "Power failure in entire coach",
                "Light switch is broken",
                "No electrical supply to berth",
                "Bulb is flickering continuously"
            ],
            'mechanical': [
                "Seat is broken and uncomfortable",
                "Window cannot be opened or closed",
                "Door lock is not working",
                "Berth chain is broken",
                "Table is damaged and wobbly",
                "Footrest is not working",
                "Seat back is torn",
                "Window glass is cracked"
            ],
            'security': [
                "Theft of mobile phone from berth",
                "Suspicious person in coach",
                "Felt unsafe during journey",
                "Luggage stolen from overhead rack",
                "Harassment by co-passenger",
                "Need security assistance",
                "Unauthorized person in reserved coach",
                "Violence between passengers"
            ],
            'medical': [
                "Passenger needs medical attention",
                "Heart attack case in coach",
                "Need doctor urgently",
                "First aid required for injury",
                "Food poisoning medical emergency",
                "Diabetic passenger needs help",
                "Accident case needs immediate care",
                "Pregnancy related medical issue"
            ],
            'delay_cancellation': [
                "Train is running 3 hours late",
                "Train got cancelled suddenly",
                "No information about delay",
                "Schedule is not being followed",
                "Arrival time keeps changing",
                "Train stopped for long time",
                "Departure delayed without notice",
                "Connection train missed due to delay"
            ],
            'luggage': [
                "Lost my suitcase during journey",
                "Luggage not loaded in train",
                "Cloak room receipt lost",
                "Baggage damaged during transport",
                "Unable to find my bag",
                "Luggage space not available",
                "Heavy luggage causing problem",
                "Luggage fell from overhead rack"
            ],
            'noise': [
                "Too much noise in coach",
                "Passengers playing loud music",
                "Cannot sleep due to disturbance",
                "Group making noise all night",
                "Loud conversations disturbing others",
                "Children crying continuously",
                "Mobile phone on high volume",
                "Snoring passenger causing disturbance"
            ],
            'general': [
                "General feedback about journey",
                "Suggestion for improvement",
                "Query about train services",
                "Information needed about facilities",
                "Compliment for good service",
                "Miscellaneous complaint",
                "Request for additional amenities",
                "General inquiry about policies"
            ]
        }
        
        # Create training dataset
        for category, complaints in sample_complaints.items():
            for complaint in complaints:
                training_data.append({
                    'description': complaint,
                    'category': category,
                    'processed_text': self.preprocess_text(complaint)
                })
        
        return pd.DataFrame(training_data)
    
    def train_model(self, retrain: bool = False) -> Dict:
        """
        Train the complaint categorization model
        """
        try:
            if self.is_trained and not retrain:
                logger.info("Model already trained. Use retrain=True to force retrain.")
                return {"status": "already_trained", "accuracy": "N/A"}
            
            logger.info("Starting model training...")
            
            # Generate training data
            df = self.generate_training_data()
            
            if df.empty:
                raise ValueError("No training data available")
            
            # Prepare features and labels
            X = df['processed_text'].values
            y = df['category'].values
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42, stratify=y
            )
            
            # Create pipeline with TF-IDF and multiple classifiers
            classifiers = {
                'naive_bayes': MultinomialNB(),
                'logistic_regression': LogisticRegression(max_iter=1000, random_state=42),
                'random_forest': RandomForestClassifier(n_estimators=100, random_state=42)
            }
            
            best_accuracy = 0
            best_classifier = None
            best_classifier_name = ""
            
            # Test different classifiers
            for name, classifier in classifiers.items():
                pipeline = Pipeline([
                    ('tfidf', TfidfVectorizer(
                        max_features=5000,
                        stop_words='english',
                        ngram_range=(1, 2),
                        min_df=1,
                        max_df=0.95
                    )),
                    ('classifier', classifier)
                ])
                
                # Cross-validation
                cv_scores = cross_val_score(pipeline, X_train, y_train, cv=5)
                avg_accuracy = cv_scores.mean()
                
                logger.info(f"{name} CV accuracy: {avg_accuracy:.3f}")
                
                if avg_accuracy > best_accuracy:
                    best_accuracy = avg_accuracy
                    best_classifier = pipeline
                    best_classifier_name = name
            
            # Train best classifier on full training set
            best_classifier.fit(X_train, y_train)
            
            # Evaluate on test set
            test_accuracy = best_classifier.score(X_test, y_test)
            y_pred = best_classifier.predict(X_test)
            
            # Generate classification report
            report = classification_report(y_test, y_pred, output_dict=True)
            
            # Save model
            self.pipeline = best_classifier
            self.model = best_classifier.named_steps['classifier']
            self.vectorizer = best_classifier.named_steps['tfidf']
            self.is_trained = True
            
            self.save_model()
            
            logger.info(f"Model training completed. Best classifier: {best_classifier_name}")
            logger.info(f"Test accuracy: {test_accuracy:.3f}")
            
            return {
                "status": "success",
                "best_classifier": best_classifier_name,
                "cv_accuracy": best_accuracy,
                "test_accuracy": test_accuracy,
                "classification_report": report,
                "total_samples": len(df),
                "categories": list(self.CATEGORIES.keys())
            }
            
        except Exception as e:
            logger.error(f"Error during model training: {str(e)}")
            return {"status": "error", "message": str(e)}
    
    def predict_category(self, complaint_text: str) -> Dict:
        """
        Predict the category of a complaint based on its description
        """
        try:
            if not self.is_trained or self.pipeline is None:
                # Try to train model if not already trained
                training_result = self.train_model()
                if training_result["status"] != "success":
                    return {
                        "category": "general",
                        "confidence": 0.5,
                        "error": "Model not trained and auto-training failed"
                    }
            
            # Preprocess input text
            processed_text = self.preprocess_text(complaint_text)
            
            if not processed_text:
                return {
                    "category": "general",
                    "confidence": 0.5,
                    "error": "Empty or invalid complaint text"
                }
            
            # Get prediction probabilities
            probabilities = self.pipeline.predict_proba([processed_text])[0]
            classes = self.pipeline.classes_
            
            # Get best prediction
            best_idx = np.argmax(probabilities)
            predicted_category = classes[best_idx]
            confidence = probabilities[best_idx]
            
            # Get top 3 predictions
            top_indices = np.argsort(probabilities)[-3:][::-1]
            top_predictions = [
                {
                    "category": classes[idx],
                    "confidence": float(probabilities[idx]),
                    "category_info": self.CATEGORIES.get(classes[idx], {})
                }
                for idx in top_indices
            ]
            
            return {
                "category": predicted_category,
                "confidence": float(confidence),
                "category_info": self.CATEGORIES.get(predicted_category, {}),
                "top_predictions": top_predictions,
                "processed_text": processed_text
            }
            
        except Exception as e:
            logger.error(f"Error during prediction: {str(e)}")
            return {
                "category": "general",
                "confidence": 0.5,
                "error": str(e)
            }
    
    def get_staff_assignment(self, category: str, location: str = None) -> Dict:
        """
        Get appropriate staff assignment based on complaint category
        """
        try:
            from complaints.models import Staff
            
            category_info = self.CATEGORIES.get(category, self.CATEGORIES['general'])
            required_roles = category_info.get('staff_roles', ['customer_service'])
            
            # Query staff based on roles and availability
            staff_query = Staff.objects.filter(
                role__in=required_roles,
                status='active'
            ).order_by('active_tickets', '-rating')
            
            # Filter by location if provided
            if location:
                location_staff = staff_query.filter(location__icontains=location)
                if location_staff.exists():
                    staff_query = location_staff
            
            # Get best available staff member
            assigned_staff = staff_query.first()
            
            if assigned_staff:
                # Update active tickets count
                assigned_staff.active_tickets += 1
                assigned_staff.save()
                
                return {
                    "staff_id": assigned_staff.id,
                    "staff_name": assigned_staff.name,
                    "staff_role": assigned_staff.role,
                    "staff_email": assigned_staff.email,
                    "staff_phone": assigned_staff.phone,
                    "department": assigned_staff.department,
                    "priority": category_info.get('priority', 'Medium'),
                    "expected_resolution": category_info.get('expected_resolution', '24 hours')
                }
            else:
                return {
                    "staff_id": None,
                    "staff_name": "Unassigned",
                    "staff_role": "customer_service",
                    "priority": category_info.get('priority', 'Medium'),
                    "expected_resolution": category_info.get('expected_resolution', '24 hours'),
                    "message": "No available staff found for this category"
                }
                
        except Exception as e:
            logger.error(f"Error in staff assignment: {str(e)}")
            return {
                "staff_id": None,
                "staff_name": "Unassigned",
                "staff_role": "customer_service",
                "priority": "Medium",
                "expected_resolution": "24 hours",
                "error": str(e)
            }
    
    def save_model(self):
        """Save the trained model to disk"""
        try:
            model_file = os.path.join(self.model_path, 'complaint_categorizer.pkl')
            with open(model_file, 'wb') as f:
                pickle.dump({
                    'pipeline': self.pipeline,
                    'model': self.model,
                    'vectorizer': self.vectorizer,
                    'categories': self.CATEGORIES,
                    'is_trained': self.is_trained
                }, f)
            logger.info(f"Model saved to {model_file}")
        except Exception as e:
            logger.error(f"Error saving model: {str(e)}")
    
    def load_model(self):
        """Load the trained model from disk"""
        try:
            model_file = os.path.join(self.model_path, 'complaint_categorizer.pkl')
            if os.path.exists(model_file):
                with open(model_file, 'rb') as f:
                    data = pickle.load(f)
                    self.pipeline = data.get('pipeline')
                    self.model = data.get('model')
                    self.vectorizer = data.get('vectorizer')
                    self.is_trained = data.get('is_trained', False)
                logger.info("Model loaded successfully")
            else:
                logger.info("No saved model found. Model will be trained on first use.")
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            self.is_trained = False
    
    def get_model_info(self) -> Dict:
        """Get information about the current model"""
        return {
            "is_trained": self.is_trained,
            "categories": list(self.CATEGORIES.keys()),
            "total_categories": len(self.CATEGORIES),
            "model_type": type(self.model).__name__ if self.model else None,
            "vectorizer_type": type(self.vectorizer).__name__ if self.vectorizer else None
        }

# Global instance
complaint_categorizer = ComplaintCategorizer()