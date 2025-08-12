# How to Add the Sentiment Analysis Dashboard to Your Frontend

This guide explains how to add the sentiment analysis dashboard to your existing React frontend.

## Files Created

1. `SentimentDashboard.tsx` - The main dashboard component with charts and statistics
2. `SentimentAnalysisPage.tsx` - A wrapper that includes the dashboard in your admin layout

## Required Dependencies

To use the dashboard, you'll need to install these packages:

```bash
npm install chart.js react-chartjs-2
# or 
yarn add chart.js react-chartjs-2
```

## Adding to Your Router

Add the sentiment dashboard to your existing routes. Depending on your router setup, this might look something like:

### React Router Example:

```tsx
import { Routes, Route } from 'react-router-dom';
import SentimentAnalysisPage from './components/admin/SentimentAnalysisPage';

// In your router configuration
<Routes>
  {/* Your existing routes */}
  <Route path="/admin/dashboard" element={<AdminDashboard />} />
  <Route path="/admin/complaints" element={<ComplaintsManagement />} />
  
  {/* Add the new sentiment analysis route */}
  <Route path="/admin/sentiment-analysis" element={<SentimentAnalysisPage />} />
</Routes>
```

## Adding to Navigation Menu

Add a link to the sentiment dashboard in your admin navigation menu:

```tsx
// In your admin navigation component
<MenuItem component={Link} to="/admin/sentiment-analysis">
  <ListItemIcon>
    <InsightsIcon />
  </ListItemIcon>
  <ListItemText primary="Sentiment Analysis" />
</MenuItem>
```

## Accessing the Dashboard

After adding the route, you can access the sentiment analysis dashboard at:

```
http://your-app-url/admin/sentiment-analysis
```

## Troubleshooting

If you encounter TypeScript errors, you may need to define interfaces for the sentiment stats data:

```typescript
interface SentimentStats {
  total_feedback: number;
  sentiment_distribution: {
    positive: number;
    negative: number;
    neutral: number;
    positive_percent: number;
    negative_percent: number;
    neutral_percent: number;
  };
  avg_rating: number;
  category_sentiment: Array<{
    category: string;
    total: number;
    positive_percent: number;
    avg_rating: number;
  }>;
  recent_feedback: Array<{
    id: number;
    feedback_message: string;
    rating: number;
    sentiment: string;
    sentiment_confidence: number;
    submitted_at: string;
  }>;
}
```
