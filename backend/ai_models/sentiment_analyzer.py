"""
Sentiment Analysis Module for Rail Madad feedback system.
Uses simple rule-based analysis for fast feedback processing.
"""
import os
import sys
import logging

logger = logging.getLogger(__name__)

# Simple, fast sentiment analysis without network calls
def analyze_sentiment(text):
    """Analyze sentiment of the provided text using simple rule-based approach.
    
    This is optimized for speed and doesn't require downloading large models.
    
    Returns:
        dict: Contains sentiment label ('POSITIVE' or 'NEGATIVE') and confidence score
    """
    # Fast rule-based sentiment analysis
    positive_words = [
        'good', 'great', 'excellent', 'helpful', 'satisfied', 'resolved', 'quick', 
        'polite', 'professional', 'efficient', 'outstanding', 'amazing', 'perfect',
        'wonderful', 'fantastic', 'impressive', 'brilliant', 'smooth', 'easy', 'fast'
    ]
    negative_words = [
        'bad', 'poor', 'terrible', 'unhelpful', 'delayed', 'disappointed', 'slow', 
        'rude', 'unprofessional', 'inefficient', 'awful', 'horrible', 'useless',
        'frustrating', 'confusing', 'complicated', 'broken', 'failure', 'waste'
    ]
    
    text_lower = text.lower()
    positive_count = sum(1 for word in positive_words if word in text_lower)
    negative_count = sum(1 for word in negative_words if word in text_lower)
    
    if positive_count > negative_count:
        return {'sentiment': 'POSITIVE', 'confidence': 0.8}
    elif negative_count > positive_count:
        return {'sentiment': 'NEGATIVE', 'confidence': 0.8}
    else:
        return {'sentiment': 'NEUTRAL', 'confidence': 0.6}

def map_rating_to_sentiment(rating):
    """Maps a numerical rating to a sentiment label."""
    if rating in [1, 2]:
        return 'NEGATIVE'
    elif rating in [4, 5]:
        return 'POSITIVE'
    else:
        return 'NEUTRAL'
