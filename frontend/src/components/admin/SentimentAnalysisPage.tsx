// This component is deprecated. Use frontend/src/pages/SentimentAnalysisPage.tsx instead.
// This file is kept for backward compatibility.
import React from 'react';
import SentimentDashboard from './SentimentDashboard';

const SentimentAnalysisPage = () => {
  console.warn('Using deprecated SentimentAnalysisPage component. Please update your imports to use the version in pages directory.');
  
  return <SentimentDashboard />;
};

export default SentimentAnalysisPage;
