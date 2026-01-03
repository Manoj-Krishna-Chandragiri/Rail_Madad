import { FileUp, Camera, Mic, MicOff, Video, Music, X, Loader } from 'lucide-react';
import { useState, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import axios from "axios";
import { getValidToken } from '../utils/firebase-auth';

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

const FileComplaintMultimedia = () => {
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
  const [videos, setVideos] = useState<File[]>([]);
  const [audioFiles, setAudioFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const [isRecording, setIsRecording] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validate that either description or multimedia files are provided
      const hasMultimedia = photos.length > 0 || videos.length > 0 || audioFiles.length > 0;
      const hasDescription = formData.description.trim().length > 0;
      
      if (!hasMultimedia && !hasDescription) {
        alert("Please provide either a description or upload multimedia files (photos, videos, or audio).");
        setIsSubmitting(false);
        return;
      }
      
      const token = await getValidToken();
      
      if (!token) {
        alert("Please sign in again to submit your complaint.");
        setIsSubmitting(false);
        return;
      }
      
      const formDataToSend = new FormData();
      
      // Add form fields
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value?.toString() || '');
      });
      
      // Add photos
      photos.forEach((photo) => {
        formDataToSend.append('photos', photo, photo.name);
      });
      
      // Add videos
      videos.forEach((video) => {
        formDataToSend.append('videos', video, video.name);
      });
      
      // Add audio files
      audioFiles.forEach((audio) => {
        formDataToSend.append('audio_files', audio, audio.name);
      });

      console.log("📤 Submitting multimedia complaint...");
      console.log(`   Photos: ${photos.length}, Videos: ${videos.length}, Audio: ${audioFiles.length}`);

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/complaints/file/multimedia/`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "Authorization": `Bearer ${token}`
          }
        }
      );
      
      console.log("✅ Complaint submitted:", response.data);
      
      // Show AI analysis if available
      if (response.data.ai_analysis) {
        setAiAnalysis(response.data.ai_analysis);
        alert(`Complaint submitted successfully!\n\nAI Analysis:\nCategory: ${response.data.ai_analysis.category}\nSeverity: ${response.data.ai_analysis.severity}\nConfidence: ${(response.data.ai_analysis.confidence * 100).toFixed(1)}%`);
      } else {
        alert("Complaint submitted successfully!");
      }
      
      // Clear form
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
      setVideos([]);
      setAudioFiles([]);
      setAiAnalysis(null);
      
    } catch (error: any) {
      console.error("❌ Error submitting:", error.response?.data || error);
      
      if (error.response?.status === 401) {
        alert("Your session has expired. Please sign in again.");
      } else {
        alert(`Failed to submit complaint: ${error.response?.data?.error || error.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newPhotos = Array.from(e.target.files);
      setPhotos(prev => [...prev, ...newPhotos]);
      console.log(`📷 ${newPhotos.length} photo(s) added`);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newVideos = Array.from(e.target.files);
      setVideos(prev => [...prev, ...newVideos]);
      console.log(`🎥 ${newVideos.length} video(s) added`);
    }
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newAudioFiles = Array.from(e.target.files);
      setAudioFiles(prev => [...prev, ...newAudioFiles]);
      console.log(`🎵 ${newAudioFiles.length} audio file(s) added`);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = (index: number) => {
    setVideos(prev => prev.filter((_, i) => i !== index));
  };

  const removeAudio = (index: number) => {
    setAudioFiles(prev => prev.filter((_, i) => i !== index));
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

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className={`${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-lg p-6`}>
        <div className="flex items-center gap-3 mb-6">
          <FileUp className={`h-8 w-8 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`} />
          <div>
            <h1 className="text-2xl font-semibold">File a New Complaint</h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Upload photos, videos, or audio. AI will analyze and categorize automatically.
            </p>
          </div>
        </div>

        {aiAnalysis && (
          <div className={`mb-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-indigo-900/30 border border-indigo-700' : 'bg-indigo-50 border border-indigo-200'}`}>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              🤖 AI Analysis Results
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><strong>Category:</strong> {aiAnalysis.category}</div>
              <div><strong>Severity:</strong> {aiAnalysis.severity}</div>
              <div><strong>Urgency:</strong> {aiAnalysis.urgency}</div>
              <div><strong>Confidence:</strong> {(aiAnalysis.confidence * 100).toFixed(1)}%</div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
              Complaint Category
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500
                ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            >
              <option value="">Select Category (AI will auto-detect if left empty)</option>
              <option value="coach-cleanliness">Coach Cleanliness</option>
              <option value="catering">Catering & Vending Services</option>
              <option value="staff-behaviour">Staff Behaviour</option>
              <option value="electrical">Electrical Equipment</option>
              <option value="security">Security</option>
              <option value="medical-assistance">Medical Assistance</option>
              <option value="divyangjan-facilities">Divyangjan Facilities</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Rest of form fields... */}
          <div>
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
              Train Number
            </label>
            <input
              type="text"
              name="train_number"
              value={formData.train_number}
              onChange={handleChange}
              placeholder="e.g., 12345"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500
                ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'}`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
              PNR Number
            </label>
            <input
              type="text"
              name="pnr_number"
              value={formData.pnr_number}
              onChange={handleChange}
              placeholder="10-digit PNR"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500
                ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'}`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Station name or location"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500
                ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'}`}
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
              max={new Date().toISOString().split('T')[0]}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500
                ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
              Complaint Description (Optional if uploading media)
            </label>
            <div className="relative">
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="AI will extract description from your photos/videos/audio if left empty"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 min-h-[100px]
                  ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'}`}
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

          {/* Multimedia Upload Section */}
          <div className="space-y-4">
            <h3 className="font-medium">Upload Media Files</h3>
            
            {/* Photos */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Photos ({photos.length})
                </label>
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm
                    ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  <Camera className="h-4 w-4" />
                  Add Photos
                </button>
              </div>
              <input
                type="file"
                ref={photoInputRef}
                onChange={handlePhotoUpload}
                accept="image/*"
                multiple
                className="hidden"
              />
              {photos.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {formatFileSize(photo.size)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Videos */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Videos ({videos.length})
                </label>
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm
                    ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  <Video className="h-4 w-4" />
                  Add Videos
                </button>
              </div>
              <input
                type="file"
                ref={videoInputRef}
                onChange={handleVideoUpload}
                accept="video/*"
                multiple
                className="hidden"
              />
              {videos.length > 0 && (
                <div className="space-y-2">
                  {videos.map((video, index) => (
                    <div key={index} className={`flex items-center justify-between p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4" />
                        <span className="text-sm">{video.name}</span>
                        <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {formatFileSize(video.size)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeVideo(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Audio */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Audio Files ({audioFiles.length})
                </label>
                <button
                  type="button"
                  onClick={() => audioInputRef.current?.click()}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm
                    ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  <Music className="h-4 w-4" />
                  Add Audio
                </button>
              </div>
              <input
                type="file"
                ref={audioInputRef}
                onChange={handleAudioUpload}
                accept="audio/*"
                multiple
                className="hidden"
              />
              {audioFiles.length > 0 && (
                <div className="space-y-2">
                  {audioFiles.map((audio, index) => (
                    <div key={index} className={`flex items-center justify-between p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <div className="flex items-center gap-2">
                        <Music className="h-4 w-4" />
                        <span className="text-sm">{audio.name}</span>
                        <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {formatFileSize(audio.size)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAudio(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors
                ${isSubmitting 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700'
                } text-white`}
            >
              {isSubmitting ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  Processing with AI...
                </>
              ) : (
                <>
                  <FileUp className="h-5 w-5" />
                  Submit Complaint
                </>
              )}
            </button>
          </div>

          {(photos.length > 0 || videos.length > 0 || audioFiles.length > 0) && (
            <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-center`}>
              💡 AI will analyze your media to extract complaint details automatically
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default FileComplaintMultimedia;
