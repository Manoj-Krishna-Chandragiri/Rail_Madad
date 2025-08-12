"""
Test script for sentiment analysis module
"""
import sys
import os

# Add the project's root directory to the path to import Django modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

import django
django.setup()

from ai_models.sentiment_analyzer import analyze_sentiment

# Test with some sample feedback messages
test_messages = [
    "The service was excellent and the staff was very helpful",
    "The train was delayed by 2 hours and no information was provided",
    "Average experience, nothing special to mention",
    "I am very disappointed with the service and will not recommend to others",
    "The railway staff quickly resolved my issue and were very polite"
]

print("Testing sentiment analysis on sample feedback messages:\n")

for message in test_messages:
    result = analyze_sentiment(message)
    print(f"Message: {message}")
    print(f"Sentiment: {result['sentiment']}")
    print(f"Confidence: {result['confidence']:.4f}")
    print("-" * 80)

print("\nSentiment analysis test completed!")
