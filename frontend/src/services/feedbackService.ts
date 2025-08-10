import apiClient from '../utils/api';

interface FeedbackData {
  complaint_id: string;
  feedback_message: string;
  rating: number;
  category?: string;
  subcategory?: string;
  name?: string;
  email?: string;
}

export const feedbackService = {
  submitFeedback: async (data: FeedbackData) => {
    try {
      console.log('🔧 Submitting feedback:', data);
      
      // ✅ FIX: Add /api/ prefix to the URL
      const response = await apiClient.post('/api/complaints/feedback/', {
        complaint_id: data.complaint_id,
        category: data.category || '',
        subcategory: data.subcategory || '',
        feedback_message: data.feedback_message,
        rating: data.rating,
        name: data.name || '',
        email: data.email || ''
      });
      
      console.log('✅ Feedback submitted successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Submission error details:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      
      if (error.response?.data) {
        const data = error.response.data;
        const errorMessages = typeof data === 'object'
          ? Object.entries(data).map(([field, msg]) => `${field}: ${Array.isArray(msg) ? msg.join(', ') : msg}`).join('\n')
          : data;
        throw new Error(errorMessages || 'Failed to submit feedback');
      }
      throw new Error('Failed to submit feedback');
    }
  },

  getFeedback: async (complaintId: string) => {
    try {
      // ✅ FIX: Add /api/ prefix to the URL
      const response = await apiClient.get(`/api/complaints/feedback/?complaint_id=${complaintId}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Fetching error:', error);
      throw new Error('Failed to fetch feedback');
    }
  }
};
