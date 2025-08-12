# Feedback Sentiment Analysis Integration

This document describes the integration of sentiment analysis capabilities for user feedback in the Rail Madad application.

## Overview

The feedback sentiment analysis feature analyzes the sentiment of user feedback messages to classify them as positive, negative, or neutral. This helps the administrators understand the overall sentiment of user feedback and identify trends.

## Components

1. **Sentiment Analyzer Module** (`ai_models/sentiment_analyzer.py`):
   - Main module for sentiment analysis
   - Provides functions for analyzing text sentiment
   - Uses transformers models when available, with a fallback to rule-based analysis

2. **Feedback Model** (`complaints/models.py`):
   - Extended with sentiment analysis fields:
     - `sentiment`: Stores the sentiment classification (POSITIVE, NEGATIVE, NEUTRAL)
     - `sentiment_confidence`: Stores the confidence score of the sentiment classification

3. **Feedback Views** (`complaints/views.py`):
   - Modified to perform sentiment analysis on incoming feedback
   - Added a new endpoint for sentiment statistics

4. **Testing Scripts**:
   - `ai_models/test_sentiment.py`: Tests the sentiment analyzer module
   - `ai_models/test_feedback_sentiment.py`: Tests the complete feedback sentiment analysis integration

## How It Works

1. **When a user submits feedback**:
   - The feedback message is analyzed for sentiment
   - The sentiment and confidence score are stored with the feedback
   - If no message is provided or sentiment analysis fails, sentiment is determined based on the rating

2. **Sentiment Analysis Method**:
   - Primary method: Uses the transformers library with pre-trained models
   - Fallback method: Rule-based analysis using keyword matching

3. **Sentiment Statistics API**:
   - Provides aggregated statistics about feedback sentiment
   - Shows sentiment distribution across different categories
   - Includes average ratings and recent feedback with sentiment

## API Endpoints

### Submit Feedback
- **URL**: `/api/complaints/feedback/`
- **Method**: POST
- **Description**: Submit user feedback with automatic sentiment analysis
- **Request Body**:
  ```json
  {
    "complaint_id": "12345",
    "category": "Cleanliness",
    "subcategory": "Coach Cleanliness",
    "feedback_message": "The train was very clean and comfortable.",
    "rating": 5,
    "name": "John Doe",
    "email": "john@example.com"
  }
  ```
- **Response**: 
  ```json
  {
    "message": "Feedback submitted successfully"
  }
  ```

### Get Feedback for a Complaint
- **URL**: `/api/complaints/feedback/view/?complaint_id=12345`
- **Method**: GET
- **Description**: Get all feedback for a specific complaint
- **Response**: List of feedback objects including sentiment data

### Get Sentiment Statistics
- **URL**: `/api/complaints/feedback/sentiment-stats/`
- **Method**: GET
- **Description**: Get sentiment statistics and analysis for all feedback
- **Response**:
  ```json
  {
    "total_feedback": 100,
    "sentiment_distribution": {
      "positive": 65,
      "negative": 25,
      "neutral": 10,
      "positive_percent": 65.0,
      "negative_percent": 25.0,
      "neutral_percent": 10.0
    },
    "avg_rating": 3.8,
    "category_sentiment": [...],
    "recent_feedback": [...]
  }
  ```

## Dependencies

- **transformers**: For advanced sentiment analysis using pre-trained models
- **torch**: Required for transformers models
- **Django**: For web application framework

## Fallback Mechanism

If the transformers library is not available or fails to load, the system falls back to a simpler rule-based sentiment analysis:

1. It checks for positive and negative keywords in the text
2. Counts occurrences of each type of keyword
3. Determines sentiment based on which type has more occurrences
4. Uses the rating as a secondary method for determining sentiment

## Future Improvements

1. **Custom Model Training**: Train a sentiment analysis model specific to railway feedback
2. **Multi-language Support**: Add support for analyzing feedback in multiple Indian languages
3. **Temporal Analysis**: Track sentiment changes over time
4. **Topic Extraction**: Identify specific topics/issues mentioned in feedback
5. **Integration with Complaint Classification**: Use sentiment to prioritize complaints
