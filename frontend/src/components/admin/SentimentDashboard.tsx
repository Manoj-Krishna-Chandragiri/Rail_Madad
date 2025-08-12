import React, { useEffect, useState } from 'react';
import apiClient from '../../utils/axios-config';
import { Pie, Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Box, Card, CardContent, Container, Grid, Paper, Typography, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { getAuth } from 'firebase/auth';
import '../../config/firebase'; // Ensure Firebase is initialized

// Register ChartJS components
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const SentimentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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
  
  const [stats, setStats] = useState<SentimentStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const auth = getAuth();
        const user = auth.currentUser;
        
        if (!user) {
          setError('Authentication required');
          return;
        }
        
        // Get a fresh token
        const token = await user.getIdToken(true);
        
        const response = await apiClient.get('/api/complaints/feedback/sentiment-stats/', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setStats(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching sentiment stats:', err);
        setError('Failed to load sentiment analysis data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="error">{error}</Typography>
      </Box>
    );
  }

  if (!stats) {
    return <Typography variant="body1">No sentiment data available.</Typography>;
  }

  // Prepare data for sentiment distribution pie chart
  const sentimentPieData = {
    labels: ['Positive', 'Negative', 'Neutral'],
    datasets: [
      {
        data: [
          stats.sentiment_distribution.positive,
          stats.sentiment_distribution.negative,
          stats.sentiment_distribution.neutral,
        ],
        backgroundColor: ['#4CAF50', '#F44336', '#FFC107'],
        hoverBackgroundColor: ['#388E3C', '#D32F2F', '#FFB300'],
      },
    ],
  };

  // Prepare data for category sentiment bar chart
  const categorySentimentData = {
    labels: stats.category_sentiment.map(item => item.category),
    datasets: [
      {
        label: 'Positive Sentiment %',
        data: stats.category_sentiment.map(item => item.positive_percent),
        backgroundColor: '#4CAF50',
      },
      {
        label: 'Average Rating',
        data: stats.category_sentiment.map(item => item.avg_rating),
        backgroundColor: '#2196F3',
      },
    ],
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Feedback Sentiment Analysis Dashboard
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: '#E8F5E9'
            }}
          >
            <Typography variant="h6" color="textSecondary">Total Feedback</Typography>
            <Typography variant="h3">{stats.total_feedback}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: '#E3F2FD'
            }}
          >
            <Typography variant="h6" color="textSecondary">Average Rating</Typography>
            <Typography variant="h3">{stats.avg_rating}/5</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: '#E8F5E9'
            }}
          >
            <Typography variant="h6" color="textSecondary">Positive Feedback</Typography>
            <Typography variant="h3">{stats.sentiment_distribution.positive_percent}%</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: '#FFEBEE'
            }}
          >
            <Typography variant="h6" color="textSecondary">Negative Feedback</Typography>
            <Typography variant="h3">{stats.sentiment_distribution.negative_percent}%</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column',
              height: 300,
            }}
          >
            <Typography variant="h6" gutterBottom>Sentiment Distribution</Typography>
            <Box sx={{ height: '100%', display: 'flex', justifyContent: 'center' }}>
              <Pie data={sentimentPieData} options={{ maintainAspectRatio: false }} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column',
              height: 300,
            }}
          >
            <Typography variant="h6" gutterBottom>Category Sentiment</Typography>
            <Box sx={{ height: '100%' }}>
              <Bar 
                data={categorySentimentData} 
                options={{ 
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                    }
                  }
                }} 
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Feedback Table */}
      <Paper elevation={3} sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Recent Feedback</Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Feedback</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell>Sentiment</TableCell>
                <TableCell>Confidence</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stats.recent_feedback.map((feedback, index) => (
                <TableRow key={index} sx={{ 
                  bgcolor: 
                    feedback.sentiment === 'POSITIVE' ? '#E8F5E9' : 
                    feedback.sentiment === 'NEGATIVE' ? '#FFEBEE' : 
                    '#FFF9C4'
                }}>
                  <TableCell>
                    {feedback.feedback_message.length > 50
                      ? `${feedback.feedback_message.substring(0, 50)}...`
                      : feedback.feedback_message}
                  </TableCell>
                  <TableCell>{feedback.rating}/5</TableCell>
                  <TableCell>{feedback.sentiment}</TableCell>
                  <TableCell>{(feedback.sentiment_confidence * 100).toFixed(1)}%</TableCell>
                  <TableCell>
                    {new Date(feedback.submitted_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default SentimentDashboard;
