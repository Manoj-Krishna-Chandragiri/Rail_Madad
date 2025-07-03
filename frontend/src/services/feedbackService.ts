import apiClient from '../utils/api'; // ✅ Use the centralized API client
 
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
      // ✅ Use apiClient instead of hard-coded axios instance
      const response = await apiClient.post('/complaints/feedback/', {
        complaint_id: data.complaint_id,
        category: data.category || '',
        subcategory: data.subcategory || '',
        feedback_message: data.feedback_message,
        rating: data.rating,
        name: data.name || '',
        email: data.email || ''
      });
      return response.data;
    } catch (error: any) {
      console.error('Submission error details:', error);
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
      // ✅ Use apiClient instead of hard-coded axios instance
      const response = await apiClient.get(`/complaints/feedback/?complaint_id=${complaintId}`);
      return response.data;
    } catch (error: any) {
      console.error('Fetching error:', error);
      throw new Error('Failed to fetch feedback');
    }
  }
};
