"""
Sentiment Analysis Module for Rail Madad feedback system.
Uses transformers models to analyze sentiment in user feedback.
"""
import os
import sys
import logging

logger = logging.getLogger(__name__)

# Define functions that will be used even if the transformers package is not available
def summarize_text(text, max_length=512):
    """Summarize long text for more efficient processing."""
    try:
        # Only import if summarizer is available
        if hasattr(summarize_text, 'summarizer'):
            summary = summarize_text.summarizer(text, max_length=150, min_length=50, do_sample=False)
            return summary[0]['summary_text']
    except Exception as e:
        logger.error(f"Error in summarizing text: {str(e)}")
    return text

def analyze_sentiment(text):
    """Analyze sentiment of the provided text.
    
    Returns:
        dict: Contains sentiment label ('POSITIVE' or 'NEGATIVE') and confidence score
    """
    try:
        # Only import if sentiment_analysis is available
        if hasattr(analyze_sentiment, 'sentiment_analysis'):
            # Summarize long text first
            summarized_text = summarize_text(text)
            
            # Get sentiment prediction
            prediction = analyze_sentiment.sentiment_analysis(summarized_text)[0]
            
            return {
                'sentiment': prediction['label'],
                'confidence': prediction['score']
            }
    except Exception as e:
        logger.error(f"Error in analyzing sentiment: {str(e)}")
    
    # Fallback to a simple rule-based sentiment analysis
    positive_words = ['good', 'great', 'excellent', 'helpful', 'satisfied', 'resolved', 'quick', 'polite']
    negative_words = ['bad', 'poor', 'terrible', 'unhelpful', 'delayed', 'disappointed', 'slow', 'rude']
    
    text_lower = text.lower()
    positive_count = sum(1 for word in positive_words if word in text_lower)
    negative_count = sum(1 for word in negative_words if word in text_lower)
    
    if positive_count > negative_count:
        return {'sentiment': 'POSITIVE', 'confidence': 0.7}
    elif negative_count > positive_count:
        return {'sentiment': 'NEGATIVE', 'confidence': 0.7}
    else:
        return {'sentiment': 'NEUTRAL', 'confidence': 0.5}

def map_rating_to_sentiment(rating):
    """Maps a numerical rating to a sentiment label."""
    if rating in [1, 2]:
        return 'NEGATIVE'
    elif rating in [4, 5]:
        return 'POSITIVE'
    else:
        return 'NEUTRAL'

# Try to initialize transformers if available
try:
    from transformers import pipeline
    
    # Initialize the sentiment analysis pipeline
    analyze_sentiment.sentiment_analysis = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")
    
    # Initialize the summarizer
    summarize_text.summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
    
    logger.info("Transformer models loaded successfully.")
except Exception as e:
    logger.warning(f"Could not load transformer models: {str(e)}. Using fallback sentiment analysis.")
