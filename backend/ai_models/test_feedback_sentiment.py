"""
Test script for feedback sentiment analysis implementation
"""
import sys
import os
import random
import json
from datetime import datetime, timedelta

# Add the project's root directory to the path to import Django modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

import django
django.setup()

from complaints.models import Feedback
from ai_models.sentiment_analyzer import analyze_sentiment

# Sample feedback messages with different sentiments
sample_feedback = [
    {
        "message": "The train was very clean and comfortable. Staff was helpful and responsive.",
        "rating": 5,
        "expected_sentiment": "POSITIVE"
    },
    {
        "message": "Average experience, nothing special to mention. The facilities were okay.",
        "rating": 3,
        "expected_sentiment": "NEUTRAL"
    },
    {
        "message": "Terrible experience! The train was delayed by 3 hours and staff was rude.",
        "rating": 1,
        "expected_sentiment": "NEGATIVE"
    },
    {
        "message": "The online booking system was easy to use and I got my ticket quickly.",
        "rating": 4,
        "expected_sentiment": "POSITIVE"
    },
    {
        "message": "Poor cleanliness in the compartment. Food quality was below average.",
        "rating": 2, 
        "expected_sentiment": "NEGATIVE"
    }
]

def create_test_feedback():
    """Create test feedback records with sentiment analysis"""
    print("Creating test feedback records...\n")
    
    # Categories and subcategories for test data
    categories = ["Ticketing", "Cleanliness", "Staff Behavior", "Food Services", "Security"]
    subcategories = ["Online Booking", "Coach Cleanliness", "Helpfulness", "Food Quality", "Safety"]
    
    # Sample user data
    names = ["John Doe", "Jane Smith", "Mike Johnson", "Sarah Williams", "Robert Brown"]
    emails = ["john@example.com", "jane@example.com", "mike@example.com", "sarah@example.com", "robert@example.com"]
    
    # Delete existing test feedback records
    Feedback.objects.filter(email__in=emails).delete()
    
    # Create feedback records with different dates
    for i, feedback in enumerate(sample_feedback):
        # Analyze sentiment
        sentiment_result = analyze_sentiment(feedback["message"])
        
        # Create a feedback record with random dates in the last 30 days
        days_ago = random.randint(0, 30)
        submission_date = datetime.now() - timedelta(days=days_ago)
        
        # Create the feedback record
        fb = Feedback.objects.create(
            complaint_id=f"TEST{i+1:03d}",
            category=random.choice(categories),
            subcategory=random.choice(subcategories),
            feedback_message=feedback["message"],
            rating=feedback["rating"],
            name=names[i % len(names)],
            email=emails[i % len(emails)],
            submitted_at=submission_date,
            sentiment=sentiment_result["sentiment"],
            sentiment_confidence=sentiment_result["confidence"]
        )
        
        print(f"Created feedback ID {fb.id}:")
        print(f"  Message: {fb.feedback_message[:50]}...")
        print(f"  Rating: {fb.rating}")
        print(f"  Sentiment: {fb.sentiment}")
        print(f"  Confidence: {fb.sentiment_confidence:.4f}")
        print(f"  Expected: {feedback['expected_sentiment']}")
        print("-" * 80)
    
    print(f"\nCreated {len(sample_feedback)} test feedback records")

def get_sentiment_stats():
    """Get sentiment statistics for all feedback"""
    total = Feedback.objects.count()
    positive = Feedback.objects.filter(sentiment="POSITIVE").count()
    negative = Feedback.objects.filter(sentiment="NEGATIVE").count()
    neutral = Feedback.objects.filter(sentiment="NEUTRAL").count()
    
    print("\nSentiment Statistics:")
    print(f"Total Feedback: {total}")
    print(f"Positive: {positive} ({positive/total*100:.1f}%)")
    print(f"Negative: {negative} ({negative/total*100:.1f}%)")
    print(f"Neutral: {neutral} ({neutral/total*100:.1f}%)")

if __name__ == "__main__":
    print("=" * 80)
    print("Feedback Sentiment Analysis Test")
    print("=" * 80)
    
    # Test the sentiment analyzer
    print("Testing sentiment analyzer...")
    for feedback in sample_feedback:
        result = analyze_sentiment(feedback["message"])
        print(f"Message: {feedback['message'][:50]}...")
        print(f"Sentiment: {result['sentiment']}")
        print(f"Confidence: {result['confidence']:.4f}")
        print(f"Expected: {feedback['expected_sentiment']}")
        print("-" * 80)
    
    # Create test feedback records
    create_test_feedback()
    
    # Get sentiment statistics
    get_sentiment_stats()
    
    print("\nTest completed successfully!")
