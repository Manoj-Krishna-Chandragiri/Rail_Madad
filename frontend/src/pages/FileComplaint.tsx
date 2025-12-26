import { FileUp, Camera, Mic, MicOff } from 'lucide-react';
import { useState, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import axios from "axios";
import { getValidToken } from '../utils/firebase-auth';

interface ComplaintFormData {
  type: string;
  description: string;
  location: string;
  train_number: string;  // Changed from trainNumber
  pnr_number: string;    // Changed from pnrNumber
  date_of_incident: string;
  // AI will auto-assign these fields
  ai_category?: string;
  ai_staff?: string;
  ai_priority?: string;
  ai_severity?: string;
}

const FileComplaint = () => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState<ComplaintFormData>({
    type: '',
    description: '',
    location: '',
    train_number: '',  // Changed from trainNumber
    pnr_number: '',    // Changed from pnrNumber
    date_of_incident: '' // Add dateOfIncident to formData
  });

  const [photos, setPhotos] = useState<File[]>([]);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isClassifying, setIsClassifying] = useState(false);
  const [aiPrediction, setAiPrediction] = useState<any>(null);
  // Remove attachments state and fileInputRef

  const generateRandomString = (length: number): string => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array)
      .map(byte => chars[byte % chars.length])
      .join('');
  };

  // AI Classification function
  const classifyComplaint = async (description: string) => {
    if (!description || description.length < 10) {
      return null;
    }

    setIsClassifying(true);
    try {
      const token = await getValidToken();
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/complaints/ai/classify/`,
        { description },
        {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setAiPrediction(response.data);
        setFormData(prev => ({
          ...prev,
          ai_category: response.data.category,
          ai_staff: response.data.staff_assignment,
          ai_priority: response.data.priority,
          ai_severity: response.data.severity
        }));
        return response.data;
      }
    } catch (error) {
      console.error('AI Classification error:', error);
    } finally {
      setIsClassifying(false);
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Get a fresh, valid token
      const token = await getValidToken();
      
      if (!token) {
        alert("Please sign in again to submit your complaint.");
        return;
      }
      
      const formDataToSend = new FormData();
      
      // Ensure all required fields are included
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

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/complaints/file/`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "Authorization": `Bearer ${token}`
          }
        }
      );
      console.log("Complaint submitted:", response.data);
      alert("Complaint submitted successfully!");
      
      // Clear form after successful submission
      setFormData({
        type: '',
        description: '',
        location: '',
        train_number: '',  // Changed from trainNumber
        pnr_number: '',    // Changed from pnrNumber
        date_of_incident: ''
      });
      setPhotos([]);
      setAiPrediction(null);
    } catch (error: any) {
      console.error("Error submitting:", error.response?.data || error);
      
      if (error.response?.status === 401) {
        alert("Your session has expired. Please sign in again.");
      } else {
        alert(`Failed to submit complaint: ${error.response?.data?.error || error.message}`);
      }
    }
  };
  


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));
};


  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPhotos(prev => [...prev, ...Array.from(e.target.files || [])]);
    }
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
        setFormData(prev => ({
          ...prev,
          description: prev.description + ' ' + transcript
        }));
      };

      recognition.start();
    }
  };

  // Remove handleFileUpload function

  return (
    <div className="max-w-4xl mx-auto">
      <div className={`${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-lg p-6`}>
        <div className="flex items-center gap-3 mb-6">
          <FileUp className={`h-8 w-8 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`} />
          <h1 className="text-2xl font-semibold">File a New Complaint</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
              Complaint Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 
                ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              required
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

          <div>
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
              Train Number
            </label>
            <input
              type="text"
              name="train_number"  // Changed from trainNumber
              value={formData.train_number}  // Changed from trainNumber
              onChange={handleChange}
              placeholder="Enter train number"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 
                ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'}`}
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
              PNR Number
            </label>
            <input
              type="text"
              name="pnr_number"   // Changed from pnrNumber
              value={formData.pnr_number}   // Changed from pnrNumber
              onChange={handleChange}
              placeholder="Enter PNR number"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 
                ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'}`}
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
              Location/Coach Details
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Enter location or coach details"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 
                ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'}`}
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
              Date of Incident
            </label>
            <input
              type="date"
              name="date_of_incident"
              value={formData.date_of_incident}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 
                ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
              Complaint Description
            </label>
            <div className="relative">
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                onBlur={(e) => {
                  if (e.target.value.length >= 10) {
                    classifyComplaint(e.target.value);
                  }
                }}
                placeholder="Describe your complaint in detail..."
                rows={5}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 
                  ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'}`}
                required
              />
              <button
                type="button"
                onClick={handleVoiceInput}
                className={`absolute right-3 top-3 p-2 rounded-lg ${
                  isRecording 
                    ? 'bg-red-500 animate-pulse' 
                    : theme === 'dark' 
                      ? 'bg-gray-600 hover:bg-gray-500' 
                      : 'bg-gray-200 hover:bg-gray-300'
                }`}
                aria-label="Voice input"
              >
                {isRecording ? <MicOff className="h-5 w-5 text-white" /> : <Mic className="h-5 w-5 text-gray-700" />}
              </button>
            </div>
            
            {/* AI Classification Results */}
            {isClassifying && (
              <div className={`mt-2 p-3 rounded-lg ${theme === 'dark' ? 'bg-blue-900' : 'bg-blue-50'}`}>
                <p className={`text-sm ${theme === 'dark' ? 'text-blue-200' : 'text-blue-700'}`}>
                  🤖 AI is analyzing your complaint...
                </p>
              </div>
            )}
            
            {aiPrediction && aiPrediction.success && (
              <div className={`mt-2 p-4 rounded-lg ${theme === 'dark' ? 'bg-green-900' : 'bg-green-50'} border ${theme === 'dark' ? 'border-green-700' : 'border-green-200'}`}>
                <p className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-green-200' : 'text-green-800'}`}>
                  ✓ AI Classification Results:
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Category:</span>
                    <span className={`ml-2 ${theme === 'dark' ? 'text-green-300' : 'text-green-700'}`}>{aiPrediction.category}</span>
                  </div>
                  <div>
                    <span className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Staff:</span>
                    <span className={`ml-2 ${theme === 'dark' ? 'text-green-300' : 'text-green-700'}`}>{aiPrediction.staff_assignment}</span>
                  </div>
                  <div>
                    <span className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Priority:</span>
                    <span className={`ml-2 px-2 py-0.5 rounded text-xs font-semibold ${
                      aiPrediction.priority === 'Critical' ? 'bg-red-200 text-red-800' :
                      aiPrediction.priority === 'High' ? 'bg-orange-200 text-orange-800' :
                      aiPrediction.priority === 'Medium' ? 'bg-yellow-200 text-yellow-800' :
                      'bg-green-200 text-green-800'
                    }`}>
                      {aiPrediction.priority}
                    </span>
                  </div>
                  <div>
                    <span className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Severity:</span>
                    <span className={`ml-2 px-2 py-0.5 rounded text-xs font-semibold ${
                      aiPrediction.severity === 'Critical' ? 'bg-red-200 text-red-800' :
                      aiPrediction.severity === 'High' ? 'bg-orange-200 text-orange-800' :
                      aiPrediction.severity === 'Medium' ? 'bg-yellow-200 text-yellow-800' :
                      'bg-green-200 text-green-800'
                    }`}>
                      {aiPrediction.severity}
                    </span>
                  </div>
                </div>
                <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Classification confidence: {Math.min(
                    aiPrediction.confidence_scores?.category || 0,
                    aiPrediction.confidence_scores?.staff || 0
                  ).toFixed(0)}%
                </p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <label className={`block font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
              Complaint Description *
            </label>
            <div className="relative">
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your complaint in detail"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 min-h-[100px]
                  ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'}`}
                required
              />
              <button
                type="button"
                onClick={handleVoiceInput}
                className={`absolute right-2 bottom-2 p-2 rounded-full ${
                  isRecording 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : theme === 'dark' ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'
                }`}
                title={isRecording ? "Stop Recording" : "Start Voice Input"}
              >
                {isRecording ? <MicOff className="h-5 w-5 text-white" /> : <Mic className="h-5 w-5 text-gray-700" />}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Uploaded Photos</h3>
              <div className="flex flex-wrap gap-4">
                {photos.map((photo, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(photo)}
                      alt={`Photo ${index + 1}`}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setPhotos(prev => prev.filter((_, i) => i !== index))}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Remove the Uploaded Files section */}
          </div>

          <div className="flex gap-4">
            <input
              type="file"
              ref={photoInputRef}
              onChange={handlePhotoUpload}
              accept="image/*"
              multiple
              className="hidden"
            />
            {/* Remove file input element */}
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg
                ${theme === 'dark' ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'}`}
            >
              <Camera className="h-5 w-5" />
              Add Photo
            </button>
            {/* Remove Attach File button */}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
            >
              Submit Complaint
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FileComplaint;