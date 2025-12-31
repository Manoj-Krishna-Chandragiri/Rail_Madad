import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Star, Mic } from 'lucide-react';
import { feedbackService } from '../services/feedbackService';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../utils/api';
 
interface Complaint {
  id: string | number;
  title?: string;
  type?: string;
  description?: string;
  status?: string;
}

interface LocationState {
  complaintId?: number;
  staffId?: number;
  staffName?: string;
}
 
// Map complaint types to categories and subcategories
const complaintTypeMapping: { [key: string]: { category: string; subcategory: string } } = {
  // AI classification types
  'coach-cleanliness': { category: 'cleanliness', subcategory: 'Unclean Coaches' },
  'coach-maintenance': { category: 'facilities', subcategory: 'Broken Seats/Berths' },
  'catering': { category: 'food', subcategory: 'Poor Food Quality' },
  'electrical': { category: 'facilities', subcategory: 'Electrical Issues' },
  'security': { category: 'security', subcategory: 'Safety Concerns' },
  'staff-behaviour': { category: 'staff', subcategory: 'Rude Behavior' },
  'ticketing': { category: 'facilities', subcategory: 'Booking Issue' },
  'punctuality': { category: 'facilities', subcategory: 'Schedule Issue' },
  'amenities': { category: 'facilities', subcategory: 'Water Issues' },
  'infrastructure': { category: 'facilities', subcategory: 'Electrical Issues' },
  'miscellaneous': { category: 'facilities', subcategory: 'Other' },
  // Legacy types
  'Train_Cleanliness': { category: 'cleanliness', subcategory: 'Unclean Coaches' },
  'Safety_Security': { category: 'security', subcategory: 'Safety Concerns' },
  'Ticketing': { category: 'facilities', subcategory: 'Booking Issue' },
  'Staff_Behavior': { category: 'staff', subcategory: 'Rude Behavior' },
  'Schedule_Delay': { category: 'facilities', subcategory: 'Schedule Issue' },
};

// Default mapping for common complaint titles (fallback)
const titleToCategoryMap: { [key: string]: { category: string; subcategory: string } } = {
  'delay': { category: 'facilities', subcategory: 'Schedule Issue' },
  'clean-toilet': { category: 'cleanliness', subcategory: 'Unclean Toilets' },
  'clean-coach': { category: 'cleanliness', subcategory: 'Unclean Coaches' },
  'coach-cleanliness': { category: 'cleanliness', subcategory: 'Unclean Coaches' },
  'ac': { category: 'facilities', subcategory: 'AC Not Working' },
  'food': { category: 'food', subcategory: 'Poor Food Quality' },
  'catering': { category: 'food', subcategory: 'Poor Food Quality' },
  'bedroll': { category: 'facilities', subcategory: 'Broken Seats/Berths' },
  'water': { category: 'facilities', subcategory: 'Water Issues' },
  'electrical': { category: 'facilities', subcategory: 'Electrical Issues' },
  'staff': { category: 'staff', subcategory: 'Rude Behavior' },
  'staff-behaviour': { category: 'staff', subcategory: 'Rude Behavior' },
  'security': { category: 'security', subcategory: 'Safety Concerns' },
  'reservation': { category: 'facilities', subcategory: 'Booking Issue' },
  'ticketing': { category: 'facilities', subcategory: 'Booking Issue' },
  'overcharging': { category: 'food', subcategory: 'Overcharging' },
  'medical': { category: 'security', subcategory: 'Emergency' },
  'pnr': { category: 'facilities', subcategory: 'Booking Issue' },
  'punctuality': { category: 'facilities', subcategory: 'Schedule Issue' },
  'amenities': { category: 'facilities', subcategory: 'Water Issues' },
  'infrastructure': { category: 'facilities', subcategory: 'Electrical Issues' },
  'miscellaneous': { category: 'facilities', subcategory: 'Other' },
};
 
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
    'Schedule Issue',
    'Booking Issue',
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
    'Emergency',
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
  const { complaintId: urlComplaintId } = useParams<{ complaintId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  
  const [loading, setLoading] = useState(false);
  const [loadingComplaint, setLoadingComplaint] = useState(false);
  const [error, setError] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [feedback, setFeedback] = useState({
    rating: 0,
    message: ''
  });
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedComplaintId, setSelectedComplaintId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [complaintType, setComplaintType] = useState('');
  const [complaintDescription, setComplaintDescription] = useState('');
  const [isAutoPopulated, setIsAutoPopulated] = useState(false);
  
  // Track complaint and staff from navigation state OR URL params
  const linkedComplaintId = state?.complaintId || (urlComplaintId ? parseInt(urlComplaintId, 10) : undefined);
  const linkedStaffId = state?.staffId;
  const linkedStaffName = state?.staffName;
  
  // Debug logging
  useEffect(() => {
    console.log('📋 FeedbackForm Debug Info:');
    console.log('  urlComplaintId:', urlComplaintId);
    console.log('  state:', state);
    console.log('  linkedComplaintId:', linkedComplaintId);
    console.log('  linkedStaffId:', linkedStaffId);
    console.log('  linkedStaffName:', linkedStaffName);
  }, [urlComplaintId, state, linkedComplaintId, linkedStaffId, linkedStaffName]);
  
  // Get user details from localStorage (fallback)
  const userEmail = localStorage.getItem('userEmail') || '';
  const [userName, setUserName] = useState(localStorage.getItem('userName') || userEmail || 'Anonymous');
 
  // Fetch actual complaint data if coming from resolved complaint
  useEffect(() => {
    if (linkedComplaintId) {
      setLoadingComplaint(true);
      apiClient.get(`/api/complaints/${linkedComplaintId}/`)
        .then((response: { data: Complaint }) => {
          const complaintData = response.data;
          const complaintType = complaintData.type || '';
          setComplaintType(complaintType);
          setComplaintDescription(complaintData.description || '');
          
          // Set passenger name from complaint data
          if ((complaintData as any).passenger_name) {
            setUserName((complaintData as any).passenger_name);
          }
          
          // Auto-populate category based on complaint type
          // Try exact match first, then lowercase, then title case
          let mapping = complaintTypeMapping[complaintType];
          
          if (!mapping && complaintType) {
            // Try lowercase match
            mapping = complaintTypeMapping[complaintType.toLowerCase()];
          }
          
          if (!mapping && complaintType) {
            // Try title case match
            const titleCase = complaintType
              .split('-')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
              .join('-');
            mapping = complaintTypeMapping[titleCase];
          }
          
          // Fallback to titleToCategoryMap if still not found
          if (!mapping) {
            mapping = titleToCategoryMap[complaintType.toLowerCase()] || 
                     titleToCategoryMap[complaintType] ||
                     { category: '', subcategory: '' };
          }
          
          console.log('📊 Auto-populating complaint:', {
            type: complaintType,
            mapping,
            selectedCategory: mapping.category,
            selectedSubcategory: mapping.subcategory
          });

          if (mapping && mapping.category) {
            setSelectedCategory(mapping.category);
            setSelectedSubcategory(mapping.subcategory);
            setIsAutoPopulated(true);
          } else {
            console.warn('⚠️ No mapping found for complaint type:', complaintType);
          }
        })
        .catch((err: Error) => {
          console.warn('Could not fetch complaint details:', err);
          // Fall back to manual selection
        })
        .finally(() => setLoadingComplaint(false));
    }
  }, [linkedComplaintId]);

  // Initialize with default complaints
  useEffect(() => {
    setComplaints(defaultComplaints);
    if (defaultComplaints.length > 0 && !selectedComplaintId) {
      setSelectedComplaintId(String(defaultComplaints[0].id));
    }
  }, []);
 
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFeedback(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setFeedback(prev => ({
          ...prev,
          message: prev.message + ' ' + transcript
        }));
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognition.start();
    } else {
      alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
    }
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
 
    // Validation: check all required fields are filled
    if (!feedback.rating || !feedback.message) {
      setError('Please fill in all required fields (Rating and Feedback)');
      setLoading(false);
      return;
    }

    // For auto-populated forms, category/subcategory must be set
    // For manual forms, they must also be selected
    if (!selectedCategory || !selectedSubcategory) {
      console.log('⚠️ Validation failed:', {
        selectedCategory,
        selectedSubcategory,
        feedback
      });
      setError('Please ensure complaint category is properly selected');
      setLoading(false);
      return;
    }

    console.log('✅ Form validation passed, submitting with:', {
      linkedComplaintId,
      selectedCategory,
      selectedSubcategory,
      rating: feedback.rating,
      messageLength: feedback.message.length
    });
 
    try {
      const feedbackData = {
        complaint_id: linkedComplaintId ? linkedComplaintId.toString() : selectedComplaintId,
        category: selectedCategory,
        subcategory: selectedSubcategory,
        feedback_message: feedback.message,
        rating: feedback.rating,
        name: userName,
        email: userEmail,
        staff_id: linkedStaffId  // Include staff ID for performance tracking
      };
 
      await feedbackService.submitFeedback(feedbackData);
      alert('Feedback submitted successfully! Thank you for your input.');
      navigate('/user-dashboard/track-status', { state: { refreshTimestamp: Date.now() } });
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
        
        {/* Show complaint context if coming from resolved complaint */}
        {linkedComplaintId && linkedStaffName && (
          <div className={`mb-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-indigo-900/30 border border-indigo-700' : 'bg-indigo-50 border border-indigo-200'}`}>
            <h3 className="font-semibold text-lg mb-3">📋 Feedback for Resolved Complaint</h3>
            <div className="space-y-2">
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                <span className="font-medium">Complaint ID:</span> <span className="font-mono bg-indigo-100 dark:bg-indigo-900 px-2 py-1 rounded">CMP{linkedComplaintId.toString().padStart(3, '0')}</span>
              </p>
              {complaintType && (
                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                  <span className="font-medium">Complaint Type:</span> {complaintType}
                </p>
              )}
              {selectedCategory && (
                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                  <span className="font-medium">Category:</span> <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 px-2 py-1 rounded text-sm">{complaintCategories.find(c => c.id === selectedCategory)?.title}</span>
                </p>
              )}
              {selectedSubcategory && (
                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                  <span className="font-medium">Issue:</span> <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 px-2 py-1 rounded text-sm">{selectedSubcategory}</span>
                </p>
              )}
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                <span className="font-medium">Resolved by:</span> <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 px-2 py-1 rounded text-sm">👤 {linkedStaffName}</span>
              </p>
            </div>
            {isAutoPopulated && (
              <p className={`text-sm mt-3 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                ✅ Complaint category automatically populated from database
              </p>
            )}
            <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Please rate your experience and provide feedback on how well this issue was resolved
            </p>
          </div>
        )}
       
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
 
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Only show complaint type selector if not coming from resolved complaint */}
          {!linkedComplaintId ? (
            <>
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
                    Complaint Category *
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
                      Specific Issue *
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
            </>
          ) : (
            // When coming from resolved complaint, show simplified message
            <div className={`p-4 rounded-lg border-2 border-green-400 ${theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50'}`}>
              <p className={theme === 'dark' ? 'text-green-400' : 'text-green-700'}>
                <span className="font-semibold">✅ Complaint Details Auto-Populated</span><br/>
                The complaint category and issue type from your resolved complaint have been automatically filled in
              </p>
            </div>
          )}
 
          <div>
            <label className="block mb-2 text-sm font-medium">Rate Your Experience *</label>
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
                {feedback.rating ? `${feedback.rating}/5` : 'Required'}
              </span>
            </div>
          </div>
 
          <div>
            <label htmlFor="message" className="block mb-2 text-sm font-medium">Your Feedback *</label>
            <div className="relative">
              <textarea
                id="message"
                name="message"
                rows={5}
                value={feedback.message}
                onChange={handleChange}
                placeholder="Please share your experience and suggestions..."
                className={`w-full p-3 pr-12 rounded-lg border ${inputClass}`}
                required
              />
              <button
                type="button"
                onClick={handleVoiceInput}
                className={`absolute right-2 bottom-2 p-2 rounded-full transition-colors ${
                  isRecording
                    ? 'bg-red-500 text-white animate-pulse'
                    : theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
                title={isRecording ? 'Recording...' : 'Voice Input'}
                aria-label={isRecording ? 'Recording voice input' : 'Start voice input'}
              >
                <Mic className="h-5 w-5" />
              </button>
            </div>
          </div>
 
          <div className="text-center">
            <button
              type="submit"
              disabled={loading || loadingComplaint}
              className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
                theme === 'dark'
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-indigo-500 hover:bg-indigo-600 text-white'
              } ${(loading || loadingComplaint) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Submitting...' : loadingComplaint ? 'Loading complaint...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
 
export default FeedbackForm;