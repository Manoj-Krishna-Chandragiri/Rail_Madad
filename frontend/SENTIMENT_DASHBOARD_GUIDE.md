# Sentiment Analysis Dashboard Documentation

## Overview

The Sentiment Analysis Dashboard provides a comprehensive view of feedback sentiment trends across the Rail Madad platform. This dashboard visualizes sentiment data to help administrators identify patterns, monitor customer satisfaction, and make data-driven decisions to improve service quality.

## Features

1. **Summary Cards**
   - Total Feedback Count
   - Average Rating
   - Positive Feedback Percentage
   - Negative Feedback Percentage

2. **Sentiment Distribution**
   - Visual breakdown of positive, negative, and neutral sentiment
   - Percentage distribution with progress bars

3. **Category Sentiment Analysis**
   - Bar chart showing sentiment across different complaint categories
   - Average ratings by category
   - Category-wise performance indicators

4. **Recent Feedback Table**
   - Latest feedback with sentiment classification
   - Rating and confidence scores
   - Color-coded by sentiment type

## How to Use

### Accessing the Dashboard

1. Log in with your admin credentials
2. Navigate to the admin dashboard
3. Click on "Sentiment Analysis" in the sidebar menu

### Interpreting the Data

#### Sentiment Distribution Chart
The pie chart shows the proportion of positive, negative, and neutral feedback. A healthy distribution typically shows a majority of positive feedback.

#### Category Performance
This chart helps identify which service categories are performing well and which need improvement. Categories with:
- High positive percentage (>70%): Performing well
- Medium positive percentage (40-70%): Acceptable but room for improvement
- Low positive percentage (<40%): Requires immediate attention

#### Recent Feedback
Review the most recent feedback to spot emerging issues or confirm improvements. Feedback is color-coded:
- Green: Positive sentiment
- Yellow: Neutral sentiment
- Red: Negative sentiment

## Technical Implementation

The sentiment analysis system uses a machine learning model based on the Transformers library to analyze feedback text. If the advanced model is unavailable, a fallback mechanism using keyword matching is employed.

### Backend API Endpoints

- `GET /api/complaints/feedback/sentiment-stats/`: Retrieves aggregated sentiment statistics
- `POST /api/complaints/submit-feedback/`: Submits and analyzes new feedback

### Data Structure

The sentiment data includes:
- Sentiment classification (POSITIVE, NEGATIVE, NEUTRAL)
- Confidence score (0-1)
- Original rating (1-5)
- Feedback text
- Category information
- Submission timestamp

## Best Practices

1. **Regular Monitoring**: Check the dashboard weekly to track sentiment trends
2. **Category Focus**: Pay special attention to categories with consistently negative sentiment
3. **Feedback Quality**: Encourage detailed feedback to improve sentiment analysis accuracy
4. **Action Items**: Create action plans based on sentiment insights
5. **Cross-Reference**: Compare sentiment data with actual complaint resolution metrics

## Troubleshooting

- **No Data Appears**: Ensure feedback collection is properly configured
- **Inaccurate Sentiment**: Review and update the sentiment model periodically
- **Dashboard Loading Slowly**: Check network connection and server performance

---

For technical support or to suggest improvements to the sentiment analysis system, please contact the development team.
