import { FileUp, Camera, Brain, Sparkles, CheckCircle, Mic, MicOff } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import axios from "axios";
import { getValidToken } from '../utils/firebase-auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';

interface ComplaintFormData {
  type: string;
  description: string;
  location: string;
  train_number: string;
  pnr_number: string;
  severity: string;
  priority: string;
  date_of_incident: string;
}

interface AISuggestion {
  category: string;
  confidence: number;
  reasoning: string;
}

const FileComplaintWithAI = () => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState<ComplaintFormData>({
    type: '',
    description: '',
    location: '',
    train_number: '',
    pnr_number: '',
    severity: 'Medium',
    priority: 'Medium',
    date_of_incident: ''
  });

  const [photos, setPhotos] = useState<File[]>([]);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [aiSuggestion, setAISuggestion] = useState<AISuggestion | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAISuggestion, setShowAISuggestion] = useState(false);
  const [useAISuggestion, setUseAISuggestion] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // Map AI categories to form categories
  const categoryMapping: { [key: string]: string } = {
    'cleanliness': 'coach-cleanliness',
    'catering': 'catering',
    'staff_behavior': 'staff-behaviour',
    'booking_ticketing': 'ticketing',
    'electrical': 'electrical',
    'mechanical': 'coach-maintenance',
    'security': 'security',
    'medical': 'medical',
    'delay_cancellation': 'punctuality',
    'luggage': 'amenities',
    'noise': 'passenger-behaviour',
    'general': 'miscellaneous'
  };

  // Debounced AI analysis
  useEffect(() => {
    if (formData.description.length > 20) {
      const timeoutId = setTimeout(() => {
        analyzeComplaintWithAI();
      }, 2000); // Wait 2 seconds after user stops typing

      return () => clearTimeout(timeoutId);
    } else {
      setAISuggestion(null);
      setShowAISuggestion(false);
    }
  }, [formData.description]);

  const analyzeComplaintWithAI = async () => {
    if (!formData.description.trim()) return;

    setIsAnalyzing(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/complaints/ai/categorize/`, {
        description: formData.description
      });

      if (response.data.success) {
        const suggestion: AISuggestion = {
          category: response.data.category,
          confidence: response.data.confidence,
          reasoning: response.data.reasoning || `AI detected this as a ${response.data.category.replace('_', ' ')} related complaint`
        };
        
        setAISuggestion(suggestion);
        setShowAISuggestion(true);
      }
    } catch (error) {
      console.error('AI categorization failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUseSuggestion = () => {
    if (aiSuggestion) {
      const mappedCategory = categoryMapping[aiSuggestion.category] || 'miscellaneous';
      setFormData(prev => ({ ...prev, type: mappedCategory }));
      setUseAISuggestion(true);
      setShowAISuggestion(false);
    }
  };

  const generateRandomString = (length: number): string => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array)
      .map(byte => chars[byte % chars.length])
      .join('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = await getValidToken();
      
      if (!token) {
        alert("Please sign in again to submit your complaint.");
        return;
      }
      
      const formDataToSend = new FormData();
      
      // Check if we should use AI smart submission
      if (useAISuggestion && aiSuggestion) {
        // Use the AI-powered smart complaint submission endpoint
        const smartComplaintData = {
          description: formData.description,
          location: formData.location,
          train_number: formData.train_number,
          pnr_number: formData.pnr_number,
          severity: formData.severity,
          priority: formData.priority,
          date_of_incident: formData.date_of_incident,
          ai_category: aiSuggestion.category,
          ai_confidence: aiSuggestion.confidence
        };

        const response = await axios.post(
          `${API_BASE_URL}/api/complaints/ai/create-smart/`,
          smartComplaintData,
          {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            }
          }
        );

        if (response.data.success) {
          alert(`Complaint submitted successfully with AI categorization!\nCategory: ${aiSuggestion.category.replace('_', ' ')}\nAssigned to: ${response.data.assigned_staff || 'Appropriate staff'}`);
        }
      } else {
        // Use traditional submission
        Object.entries(formData).forEach(([key, value]) => {
          formDataToSend.append(key, value?.toString() || '');
        });
        
        if (photos.length > 0) {
          const photo = photos[0];
          const extension = photo.name.split('.').pop() || 'png';
          const uniqueId = generateRandomString(32);
          const fileName = `${uniqueId}.${extension}`;
          formDataToSend.append('photos', photo, fileName);
        }

        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/complaints/file/`,
          formDataToSend,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              "Authorization": `Bearer ${token}`
            }
          }
        );
        alert("Complaint submitted successfully!");
      }
      
      // Clear form after successful submission
      setFormData({
        type: '',
        description: '',
        location: '',
        train_number: '',
        pnr_number: '',
        severity: 'Medium',
        priority: 'Medium',
        date_of_incident: ''
      });
      setPhotos([]);
      setAISuggestion(null);
      setShowAISuggestion(false);
      setUseAISuggestion(false);
      
    } catch (error: any) {
      console.error("Error submitting:", error.response?.data || error);
      
      if (error.response?.status === 401) {
        alert("Session expired. Please log in again.");
      } else {
        alert(error.response?.data?.error || "Failed to submit complaint. Please try again.");
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Reset AI suggestion if user manually changes category
    if (name === 'type' && value !== '') {
      setUseAISuggestion(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPhotos(prev => [...prev, ...files]);
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsRecording(true);
      recognition.onend = () => setIsRecording(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setFormData(prev => ({
          ...prev,
          description: `${prev.description} ${transcript}`.trim()
        }));
      };

      recognition.start();
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <FileUp className="h-8 w-8 text-blue-600" />
            File a Complaint
            <Sparkles className="h-6 w-6 text-yellow-500" />
          </h1>
          <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Submit your railway complaint with AI-powered smart categorization
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Description with AI Analysis */}
          <div className={`p-6 rounded-lg shadow-sm ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <label className="block text-sm font-medium mb-2">
              Complaint Description *
            </label>
            <div className="relative">
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Describe your complaint in detail... (AI will analyze and suggest category)"
              />
              <button
                type="button"
                onClick={handleVoiceInput}
                className={`absolute right-2 bottom-2 p-2 rounded-full ${
                  isRecording 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : isDark 
                      ? 'bg-gray-600 hover:bg-gray-700' 
                      : 'bg-gray-200 hover:bg-gray-300'
                }`}
                title={isRecording ? 'Stop Recording' : 'Start Voice Input'}
              >
                {isRecording ? <MicOff className="h-5 w-5 text-white" /> : <Mic className="h-5 w-5 text-gray-700" />}
              </button>
              
              {/* AI Analysis Indicator */}
              {(isAnalyzing || aiSuggestion) && (
                <div className="absolute top-2 right-2">
                  {isAnalyzing ? (
                    <div className="flex items-center gap-1 text-blue-600">
                      <Brain className="h-4 w-4 animate-pulse" />
                      <span className="text-xs">Analyzing...</span>
                    </div>
                  ) : aiSuggestion && (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-xs">AI Analysis Complete</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* AI Suggestion Card */}
            {showAISuggestion && aiSuggestion && (
              <div className={`mt-4 p-4 rounded-lg border-2 border-dashed ${isDark ? 'border-blue-700 bg-blue-900/20' : 'border-blue-300 bg-blue-50'}`}>
                <div className="flex items-start gap-3">
                  <Brain className="h-6 w-6 text-blue-600 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-600 mb-2">AI Category Suggestion</h4>
                    <p className={`text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      Based on your description, this appears to be a <strong>{aiSuggestion.category.replace('_', ' ')}</strong> related complaint.
                    </p>
                    <p className={`text-xs mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Confidence: {(aiSuggestion.confidence * 100).toFixed(1)}%
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleUseSuggestion}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        Use AI Suggestion
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAISuggestion(false)}
                        className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                          isDark 
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Category Selection */}
          <div className={`p-6 rounded-lg shadow-sm ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <label className="block text-sm font-medium mb-2">
              Complaint Category *
              {useAISuggestion && (
                <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  AI Selected
                </span>
              )}
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              required
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } ${useAISuggestion ? 'ring-2 ring-green-500' : ''}`}
            >
              <option value="">Select Type</option>
              <option value="coach-maintenance">Coach - Maintenance/Facilities</option>
              <option value="electrical">Electrical Equipment</option>
              <option value="medical">Medical Assistance</option>
              <option value="catering">Catering / Vending Services</option>
              <option value="passenger-behaviour">Passengers Behaviour</option>
              <option value="water">Water Availability</option>
              <option value="punctuality">Punctuality</option>
              <option value="security">Security</option>
              <option value="ticketing">Unreserved / Reserved Ticketing</option>
              <option value="coach-cleanliness">Coach - Cleanliness</option>
              <option value="staff-behaviour">Staff Behaviour</option>
              <option value="refund">Refund of Tickets</option>
              <option value="amenities">Passenger Amenities</option>
              <option value="bedroll">Bed Roll</option>
              <option value="corruption">Corruption / Bribery</option>
              <option value="miscellaneous">Miscellaneous</option>
            </select>
          </div>

          {/* Rest of the form - Location, Train Details, etc. */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-6 rounded-lg shadow-sm ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
              <label className="block text-sm font-medium mb-2">Location *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Station/Coach/Platform"
              />
            </div>

            <div className={`p-6 rounded-lg shadow-sm ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
              <label className="block text-sm font-medium mb-2">Train Number</label>
              <input
                type="text"
                name="train_number"
                value={formData.train_number}
                onChange={handleInputChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Enter train number"
              />
            </div>

            <div className={`p-6 rounded-lg shadow-sm ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
              <label className="block text-sm font-medium mb-2">PNR Number</label>
              <input
                type="text"
                name="pnr_number"
                value={formData.pnr_number}
                onChange={handleInputChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Enter PNR number"
              />
            </div>

            <div className={`p-6 rounded-lg shadow-sm ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
              <label className="block text-sm font-medium mb-2">Date of Incident</label>
              <input
                type="date"
                name="date_of_incident"
                value={formData.date_of_incident}
                onChange={handleInputChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
          </div>

          {/* Priority/Severity now decided by AI; hidden from passenger */}

          {/* Photo Upload */}
          <div className={`p-6 rounded-lg shadow-sm ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <label className="block text-sm font-medium mb-2">Upload Photos (Optional)</label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Camera className="h-4 w-4" />
                Add Photos
              </button>
              <input
                type="file"
                ref={photoInputRef}
                onChange={handlePhotoUpload}
                accept="image/*"
                multiple
                className="hidden"
              />
            </div>
            
            {photos.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {photos.map((photo, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(photo)}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => {
                setFormData({
                  type: '',
                  description: '',
                  location: '',
                  train_number: '',
                  pnr_number: '',
                  severity: 'Medium',
                  priority: 'Medium',
                  date_of_incident: ''
                });
                setPhotos([]);
                setAISuggestion(null);
                setShowAISuggestion(false);
                setUseAISuggestion(false);
              }}
              className={`px-6 py-3 rounded-lg border transition-colors ${
                isDark 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Clear Form
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              {useAISuggestion && <Brain className="h-4 w-4" />}
              Submit Complaint
              {useAISuggestion && <span className="text-xs">(AI Enhanced)</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FileComplaintWithAI;