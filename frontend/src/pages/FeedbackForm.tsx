import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Star } from 'lucide-react';
import { feedbackService } from '../services/feedbackService';
import { useParams, useNavigate } from 'react-router-dom';
 
interface Complaint {
  id: string;
  title: string;
}
 
// Add predefined complaint categories
const complaintCategories = [
  { id: 'cleanliness', title: 'Cleanliness Issues', subcategories: [
    'Unclean Toilets',
    'Unclean Coaches',
    'Unclean Bedrolls',
    'Garbage/Waste',
  ]},
  { id: 'food', title: 'Food & Catering', subcategories: [
    'Poor Food Quality',
    'Overcharging',
    'Staff Behavior',
    'Hygiene Issues',
  ]},
  { id: 'facilities', title: 'Onboard Facilities', subcategories: [
    'AC Not Working',
    'Electrical Issues',
    'Water Issues',
    'Broken Seats/Berths',
  ]},
  { id: 'staff', title: 'Staff Related', subcategories: [
    'Rude Behavior',
    'Not Available',
    'Not Helpful',
    'Corruption',
  ]},
  { id: 'security', title: 'Security Issues', subcategories: [
    'Theft',
    'Harassment',
    'Unauthorized Vendors',
    'Safety Concerns',
  ]},
];
 
// Add default complaints list
const defaultComplaints: Complaint[] = [
  { id: 'delay', title: 'Train Delay/Late Running' },
  { id: 'clean-toilet', title: 'Toilet Cleanliness Issue' },
  { id: 'clean-coach', title: 'Coach Cleanliness Issue' },
  { id: 'ac', title: 'AC Not Working/Temperature Issue' },
  { id: 'food', title: 'Food Quality/Service Issue' },
  { id: 'bedroll', title: 'Bedroll/Linen Issue' },
  { id: 'water', title: 'Water Not Available' },
  { id: 'electrical', title: 'Electrical Equipment Issue' },
  { id: 'staff', title: 'Staff Behavior Issue' },
  { id: 'security', title: 'Security Concern' },
  { id: 'reservation', title: 'Reservation/Booking Issue' },
  { id: 'overcharging', title: 'Overcharging by Vendor' },
  { id: 'medical', title: 'Medical Emergency' },
  { id: 'pnr', title: 'PNR/Ticket Related Issue' },
  { id: 'other', title: 'Other Issue' }
];
 
const FeedbackForm = () => {
  const { theme } = useTheme();
  const { complaintId } = useParams<{ complaintId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState({
    name: '',
    email: '',
    rating: 0,
    message: ''
  });
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedComplaintId, setSelectedComplaintId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
 
  useEffect(() => {
    // Initialize with default complaints instead of fetching
    setComplaints(defaultComplaints);
    if (defaultComplaints.length > 0) {
      setSelectedComplaintId(defaultComplaints[0].id);
    }
  }, []);
 
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFeedback(prev => ({
      ...prev,
      [name]: value
    }));
  };
 
  const handleStarClick = (rating: number) => {
    setFeedback(prev => ({
      ...prev,
      rating
    }));
  };
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
 
    if (!selectedComplaintId || !selectedCategory || !selectedSubcategory) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }
 
    try {
      const complaintInfo = complaints.find(c => c.id === selectedComplaintId);
      const feedbackData = {
        complaint_id: selectedComplaintId,
        category: selectedCategory,
        subcategory: selectedSubcategory,
        feedback_message: `Complaint: ${complaintInfo?.title}\n${feedback.message}`,
        rating: feedback.rating,
        name: feedback.name,
        email: feedback.email
      };
 
      await feedbackService.submitFeedback(feedbackData);
      alert('Feedback submitted successfully!');
      navigate('/');
    } catch (err: any) {
      console.error('Submission error:', err);
      setError(err.message || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };
 
  const inputClass = theme === 'dark'
    ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-500 focus:border-indigo-500'
    : 'bg-white border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500';
 
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className={`${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-lg p-6`}>
        <h1 className="text-3xl font-bold text-center mb-8">Feedback Form</h1>
       
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
 
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="complaint" className="block mb-2 text-sm font-medium">
              Select Complaint Type *
            </label>
            <select
              id="complaint"
              value={selectedComplaintId}
              onChange={(e) => setSelectedComplaintId(e.target.value)}
              className={`w-full p-3 rounded-lg border ${inputClass}`}
              required
            >
              <option value="">-- Select Complaint Type --</option>
              {defaultComplaints.map((complaint) => (
                <option key={complaint.id} value={complaint.id}>
                  {complaint.title}
                </option>
              ))}
            </select>
          </div>
 
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="category" className="block mb-2 text-sm font-medium">
                Complaint Category
              </label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedSubcategory('');
                }}
                className={`w-full p-3 rounded-lg border ${inputClass}`}
                required
              >
                <option value="">Select Category</option>
                {complaintCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.title}
                  </option>
                ))}
              </select>
            </div>
 
            {selectedCategory && (
              <div>
                <label htmlFor="subcategory" className="block mb-2 text-sm font-medium">
                  Specific Issue
                </label>
                <select
                  id="subcategory"
                  value={selectedSubcategory}
                  onChange={(e) => setSelectedSubcategory(e.target.value)}
                  className={`w-full p-3 rounded-lg border ${inputClass}`}
                  required
                >
                  <option value="">Select Specific Issue</option>
                  {complaintCategories
                    .find(cat => cat.id === selectedCategory)
                    ?.subcategories.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                  ))}
                </select>
              </div>
            )}
          </div>
 
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block mb-2 text-sm font-medium">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={feedback.name}
                onChange={handleChange}
                className={`w-full p-3 rounded-lg border ${inputClass}`}
                required
              />
            </div>
 
            <div>
              <label htmlFor="email" className="block mb-2 text-sm font-medium">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={feedback.email}
                onChange={handleChange}
                className={`w-full p-3 rounded-lg border ${inputClass}`}
                required
              />
            </div>
          </div>
 
          <div>
            <label className="block mb-2 text-sm font-medium">Rate Your Experience</label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleStarClick(star)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= feedback.rating
                        ? 'text-yellow-500 fill-current'
                        : (theme === 'dark' ? 'text-gray-600' : 'text-gray-300')
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm">
                {feedback.rating ? `${feedback.rating}/5` : ''}
              </span>
            </div>
          </div>
 
          <div>
            <label htmlFor="message" className="block mb-2 text-sm font-medium">Your Feedback</label>
            <textarea
              id="message"
              name="message"
              rows={5}
              value={feedback.message}
              onChange={handleChange}
              className={`w-full p-3 rounded-lg border ${inputClass}`}
              required
            />
          </div>
 
          <div className="text-center">
            <button
              type="submit"
              disabled={loading}
              className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
                theme === 'dark'
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-indigo-500 hover:bg-indigo-600 text-white'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
 
export default FeedbackForm;