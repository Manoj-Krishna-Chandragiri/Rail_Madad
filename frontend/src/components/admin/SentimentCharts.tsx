import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

interface SentimentDistribution {
  positive: number;
  negative: number;
  neutral: number;
  positive_percent: number;
  negative_percent: number;
  neutral_percent: number;
}

interface CategorySentiment {
  category: string;
  total: number;
  positive_percent: number;
  avg_rating: number;
}

export const SentimentPieChart: React.FC<{ distribution: SentimentDistribution; isDark: boolean }> = ({ distribution, isDark }) => {
  const data = {
    labels: ['Positive', 'Negative', 'Neutral'],
    datasets: [
      {
        data: [distribution.positive, distribution.negative, distribution.neutral],
        backgroundColor: [
          'rgba(75, 192, 120, 0.8)',
          'rgba(255, 99, 132, 0.8)',
          'rgba(255, 205, 86, 0.8)',
        ],
        borderColor: [
          'rgb(75, 192, 120)',
          'rgb(255, 99, 132)',
          'rgb(255, 205, 86)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: isDark ? 'rgb(229, 231, 235)' : 'rgb(55, 65, 81)',
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
  };

  return <Pie data={data} options={options} />;
};

export const CategoryBarChart: React.FC<{ categories: CategorySentiment[]; isDark: boolean }> = ({ categories, isDark }) => {
  const sortedCategories = [...categories].sort((a, b) => b.positive_percent - a.positive_percent);
  
  const data = {
    labels: sortedCategories.map(cat => cat.category),
    datasets: [
      {
        label: 'Positive Sentiment (%)',
        data: sortedCategories.map(cat => cat.positive_percent),
        backgroundColor: 'rgba(75, 192, 120, 0.8)',
        borderColor: 'rgb(75, 192, 120)',
        borderWidth: 1,
      },
      {
        label: 'Average Rating',
        data: sortedCategories.map(cat => cat.avg_rating * 20), // Scale to 0-100 for visibility (5 * 20 = 100)
        backgroundColor: 'rgba(54, 162, 235, 0.8)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          color: isDark ? 'rgb(229, 231, 235)' : 'rgb(55, 65, 81)',
        },
        grid: {
          color: isDark ? 'rgba(229, 231, 235, 0.1)' : 'rgba(55, 65, 81, 0.1)',
        },
      },
      x: {
        ticks: {
          color: isDark ? 'rgb(229, 231, 235)' : 'rgb(55, 65, 81)',
        },
        grid: {
          color: isDark ? 'rgba(229, 231, 235, 0.1)' : 'rgba(55, 65, 81, 0.1)',
        },
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: isDark ? 'rgb(229, 231, 235)' : 'rgb(55, 65, 81)',
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.raw || 0;
            // Convert scaled rating back to 0-5 scale
            if (label.includes('Rating')) {
              return `${label}: ${(value / 20).toFixed(1)}/5`;
            }
            return `${label}: ${value}%`;
          }
        }
      }
    },
  };

  return <Bar data={data} options={options} />;
};

export const TimeSeriesChart: React.FC<{ 
  data: { date: string; positive: number; negative: number; neutral: number }[]; 
  isDark: boolean 
}> = ({ data, isDark }) => {
  const chartData = {
    labels: data.map(item => item.date),
    datasets: [
      {
        label: 'Positive',
        data: data.map(item => item.positive),
        backgroundColor: 'rgba(75, 192, 120, 0.8)',
        borderColor: 'rgb(75, 192, 120)',
        borderWidth: 1,
      },
      {
        label: 'Negative',
        data: data.map(item => item.negative),
        backgroundColor: 'rgba(255, 99, 132, 0.8)',
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 1,
      },
      {
        label: 'Neutral',
        data: data.map(item => item.neutral),
        backgroundColor: 'rgba(255, 205, 86, 0.8)',
        borderColor: 'rgb(255, 205, 86)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: isDark ? 'rgb(229, 231, 235)' : 'rgb(55, 65, 81)',
        },
        grid: {
          color: isDark ? 'rgba(229, 231, 235, 0.1)' : 'rgba(55, 65, 81, 0.1)',
        },
      },
      x: {
        ticks: {
          color: isDark ? 'rgb(229, 231, 235)' : 'rgb(55, 65, 81)',
        },
        grid: {
          color: isDark ? 'rgba(229, 231, 235, 0.1)' : 'rgba(55, 65, 81, 0.1)',
        },
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: isDark ? 'rgb(229, 231, 235)' : 'rgb(55, 65, 81)',
          font: {
            size: 12,
          },
        },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};
