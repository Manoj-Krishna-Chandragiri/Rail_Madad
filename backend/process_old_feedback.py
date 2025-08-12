#!/usr/bin/env python
"""
Script to process older feedback entries that don't have sentiment analysis.
This script will:
1. Find all feedback entries without sentiment data
2. Apply sentiment analysis to them
3. Update the database with the sentiment results

Additionally, it will:
4. Correct sentiment for high-rated feedback (4-5 stars) to ensure they're marked as POSITIVE
5. Correct sentiment for low-rated feedback (1-2 stars) to ensure they're marked as NEGATIVE
"""
import os
import sys
import django
import logging
from django.db.models import Q

# Set up Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('sentiment_processing.log')
    ]
)
logger = logging.getLogger(__name__)

# Import models and sentiment analysis
from complaints.models import Feedback
from ai_models.sentiment_analyzer import analyze_sentiment, map_rating_to_sentiment

def process_feedback():
    """Process all feedback entries without sentiment data."""
    # Find all feedback entries without sentiment data
    unprocessed_feedback = Feedback.objects.filter(
        Q(sentiment__isnull=True) | Q(sentiment='')
    )
    
    total = unprocessed_feedback.count()
    logger.info(f"Found {total} feedback entries without sentiment data")
    
    # Process each feedback entry
    for i, feedback in enumerate(unprocessed_feedback, 1):
        try:
            logger.info(f"Processing feedback {i}/{total} (ID: {feedback.id})")
            
            # First check if the rating is high (4 or 5) - in which case we always set to POSITIVE
            if feedback.rating in [4, 5]:
                sentiment = 'POSITIVE'
                sentiment_confidence = 0.8
                logger.info(f"High rating detected ({feedback.rating}/5) - setting sentiment to POSITIVE")
            # Or if rating is low (1 or 2) - in which case we always set to NEGATIVE
            elif feedback.rating in [1, 2]:
                sentiment = 'NEGATIVE'
                sentiment_confidence = 0.8
                logger.info(f"Low rating detected ({feedback.rating}/5) - setting sentiment to NEGATIVE")
            # Otherwise, try text analysis if available
            elif feedback.feedback_message:
                try:
                    result = analyze_sentiment(feedback.feedback_message)
                    sentiment = result['sentiment']
                    sentiment_confidence = result['confidence']
                    logger.info(f"Analyzed sentiment from text: {sentiment} with confidence {sentiment_confidence}")
                except Exception as e:
                    logger.error(f"Error in sentiment analysis: {str(e)}")
                    # Fallback to rating-based sentiment
                    sentiment = map_rating_to_sentiment(feedback.rating)
                    sentiment_confidence = 0.7
                    logger.info(f"Fallback to rating-based sentiment: {sentiment}")
            else:
                # If no message and rating is 3, use NEUTRAL
                sentiment = 'NEUTRAL'
                sentiment_confidence = 0.6
                logger.info(f"Medium rating detected (3/5) - setting sentiment to NEUTRAL")
            
            # Update the feedback entry
            feedback.sentiment = sentiment
            feedback.sentiment_confidence = sentiment_confidence
            feedback.save()
            
        except Exception as e:
            logger.error(f"Error processing feedback ID {feedback.id}: {str(e)}")
    
    logger.info(f"Completed processing {total} feedback entries")

def correct_high_rated_feedback():
    """Correct sentiment for high-rated feedback (4-5 stars) to ensure they're marked as POSITIVE."""
    high_rated_feedback = Feedback.objects.filter(
        rating__in=[4, 5], 
        sentiment__in=['NEUTRAL', 'NEGATIVE']
    )
    
    total = high_rated_feedback.count()
    logger.info(f"Found {total} high-rated feedback entries with incorrect sentiment")
    
    for i, feedback in enumerate(high_rated_feedback, 1):
        try:
            logger.info(f"Correcting high-rated feedback {i}/{total} (ID: {feedback.id}, Rating: {feedback.rating}/5, Current Sentiment: {feedback.sentiment})")
            feedback.sentiment = 'POSITIVE'
            feedback.sentiment_confidence = 0.8
            feedback.save()
        except Exception as e:
            logger.error(f"Error correcting high-rated feedback ID {feedback.id}: {str(e)}")
    
    logger.info(f"Completed correcting {total} high-rated feedback entries")

def correct_low_rated_feedback():
    """Correct sentiment for low-rated feedback (1-2 stars) to ensure they're marked as NEGATIVE."""
    low_rated_feedback = Feedback.objects.filter(
        rating__in=[1, 2], 
        sentiment__in=['NEUTRAL', 'POSITIVE']
    )
    
    total = low_rated_feedback.count()
    logger.info(f"Found {total} low-rated feedback entries with incorrect sentiment")
    
    for i, feedback in enumerate(low_rated_feedback, 1):
        try:
            logger.info(f"Correcting low-rated feedback {i}/{total} (ID: {feedback.id}, Rating: {feedback.rating}/5, Current Sentiment: {feedback.sentiment})")
            feedback.sentiment = 'NEGATIVE'
            feedback.sentiment_confidence = 0.8
            feedback.save()
        except Exception as e:
            logger.error(f"Error correcting low-rated feedback ID {feedback.id}: {str(e)}")
    
    logger.info(f"Completed correcting {total} low-rated feedback entries")

if __name__ == "__main__":
    try:
        logger.info("Starting to process feedback entries")
        
        # Process unprocessed feedback
        process_feedback()
        
        # Correct high-rated feedback
        correct_high_rated_feedback()
        
        # Correct low-rated feedback
        correct_low_rated_feedback()
        
        logger.info("Finished processing feedback entries")
    except Exception as e:
        logger.error(f"Error in main execution: {str(e)}")
        sys.exit(1)
