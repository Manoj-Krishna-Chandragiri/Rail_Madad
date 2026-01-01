import { Bot, MessageCircle, Loader, Mic, MicOff } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import AudioTranscription from '../components/AudioTranscription';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Define Gemini API response interface
interface GeminiApiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: {
    message?: string;
    status?: string;
  };
}

// Model configuration with priority order
const MODELS = [
  { name: 'gemini-2.5-flash', priority: 1, rpm: 5, tpm: 250000, rpd: 20 },
  { name: 'gemini-3-flash', priority: 2, rpm: 5, tpm: 250000, rpd: 20 },
  { name: 'gemini-2.5-flash-lite', priority: 3, rpm: 10, tpm: 250000, rpd: 20 },
  { name: 'gemini-2.5-flash-native-audio-dialog', priority: 4, rpm: Infinity, tpm: 1000000, rpd: Infinity } // Unlimited fallback
];

const MODEL_RESET_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds

// Helper functions for model management
const getStoredModel = (): string => {
  const stored = localStorage.getItem('gemini_current_model');
  return stored || MODELS[0].name;
};

const setStoredModel = (modelName: string): void => {
  localStorage.setItem('gemini_current_model', modelName);
};

const getLastResetTime = (): number => {
  const stored = localStorage.getItem('gemini_last_reset');
  return stored ? parseInt(stored) : Date.now();
};

const setLastResetTime = (time: number): void => {
  localStorage.setItem('gemini_last_reset', time.toString());
};

// Check if we should reset to the primary model
const shouldResetToPrimary = (): boolean => {
  const lastReset = getLastResetTime();
  const now = Date.now();
  return (now - lastReset) >= MODEL_RESET_INTERVAL;
};

// Get the next available model in priority order
const getNextModel = (currentModel: string): string | null => {
  const currentIndex = MODELS.findIndex(m => m.name === currentModel);
  if (currentIndex === -1 || currentIndex === MODELS.length - 1) {
    return null; // No more models to try
  }
  return MODELS[currentIndex + 1].name;
};

const SYSTEM_PROMPT = `
You are a helpful AI assistant for Rail Madad, an integrated helpline system for Indian Railways passengers and staff. Your role is to assist both passengers and railway staff with their queries and guide them through the platform features.

### For Passengers:

1. File Complaints: Guide passengers to submit complaints using the 'File Complaint' feature on their dashboard. Required information includes:
   * Complaint type (cleanliness, medical assistance, security, staff behavior, facilities, etc.)
   * Severity level (Low, Medium, High, Critical)
   * Train number and PNR number
   * Location or coach details
   * Date and time of incident
   * Detailed description
   * Optional file attachments (photos/videos)

2. Track Complaint Status: Help users monitor their complaints through the 'Track Status' page by entering:
   * Complaint ID or PNR number
   * View real-time status updates (Submitted, Assigned, In Progress, Resolved, Closed)
   * Check assigned staff member details
   * View internal notes and updates from railway staff

3. Notifications: Explain the real-time notification system:
   * Receive instant notifications for complaint status changes
   * Get alerts when complaints are assigned to staff
   * Priority notifications for urgent updates
   * Notification badge in navbar shows unread count
   * Filter notifications by All/Unread/Priority tabs
   * Click on notifications to navigate directly to relevant complaints
   * Customize notification preferences in settings

4. Feedback System: Guide users on providing feedback after complaint resolution:
   * Rate the resolution quality (1-5 stars)
   * Provide detailed feedback comments
   * Help improve railway services through honest feedback
   * Note: Feedback can only be submitted once per complaint

5. AI Assistance: This AI chatbot provides:
   * Instant responses to railway-related queries
   * Step-by-step guidance on using platform features
   * Voice input support for hands-free interaction (click microphone icon)
   * Quick answers to common questions

6. Profile & Settings:
   * Update personal information and contact details
   * Enable/disable notification preferences
   * Switch between Light and Dark mode themes
   * Manage language preferences
   * View complaint history and statistics

### For Railway Staff:

1. Staff Dashboard: Access to dedicated staff interface with:
   * View all assigned complaints in one place
   * Filter complaints by status, priority, and type
   * Real-time updates on new assignments
   * Quick action buttons for status updates

2. Complaint Management:
   * Accept and acknowledge assigned complaints
   * Update complaint status through workflow stages
   * Add internal notes visible to other staff and admins
   * Mark complaints as resolved with resolution details
   * Close complaints after passenger feedback

3. Staff Notifications:
   * Receive alerts for new complaint assignments
   * Get notified when passengers provide feedback
   * Priority alerts for critical/high-severity complaints
   * Real-time notification polling (updates every 60 seconds)

4. Communication:
   * Add internal notes for coordination with other staff
   * Update passengers through status changes
   * Document resolution steps and actions taken

### Platform Features:

* Multi-lingual Support: Interface available in multiple Indian languages for better accessibility
* Real-time Updates: Automatic polling every 60 seconds keeps information current
* Responsive Design: Works seamlessly on mobile, tablet, and desktop devices
* Dark Mode: Eye-friendly dark theme option available in settings
* Secure Authentication: Firebase-based secure login system
* Role-based Access: Different interfaces for passengers, staff, and administrators

### Important Links:
* Website: https://rail-madad.manojkrishna.me
* File Complaint: Dashboard > File Complaint button
* Track Status: Navigation menu > Track Status
* Notifications: Click bell icon in navbar
* Settings: Click settings icon in navbar

### Response Guidelines:
* Always provide responses in point-wise format with each point on a new line
* Be polite, professional, and concise
* Use emojis sparingly to keep responses friendly
* Avoid formatting symbols like *, **, or quotation marks
* Focus on clarity and ease of understanding
* Guide users step-by-step for complex processes
* Encourage users to visit the website for hands-on experience

Remember: Your goal is to make the Rail Madad platform easy to use for everyone, whether they are passengers filing complaints or railway staff resolving them. Always prioritize user satisfaction and clear communication.
`;

const AIAssistance = () => {
  const { theme } = useTheme();
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: 'Hello! I\'m your Rail Madad assistant. How can I help you with your railway-related concerns today?' 
    }
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const { isRecording, toggleRecording } = AudioTranscription({
    onTranscriptionComplete: (text) => {
      setMessage(text);
    }
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message.trim()) return;

    setMessages(prev => [...prev, { role: 'user', content: message }]);
    setMessage('');
    setIsLoading(true);

    // Check if we should reset to primary model
    if (shouldResetToPrimary()) {
      setStoredModel(MODELS[0].name);
      setLastResetTime(Date.now());
    }

    let currentModel = getStoredModel();
    let attemptCount = 0;
    const maxAttempts = MODELS.length;

    while (attemptCount < maxAttempts) {
      try {
        // Check if API key is set
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
          throw new Error('API key not configured. Please set a valid Gemini API key in the .env file.');
        }
        
        console.log(`Attempting with model: ${currentModel} (attempt ${attemptCount + 1}/${maxAttempts})`);
        
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                role: "user",
                parts: [{
                  text: `${SYSTEM_PROMPT}\n\nUser: ${message}`
                }]
              }]
            })
          }
        );

        const data: GeminiApiResponse = await response.json();

        // Check for rate limit errors (429 or quota exceeded)
        if (response.status === 429 || data.error?.message?.includes('quota') || data.error?.message?.includes('rate limit')) {
          console.warn(`Rate limit hit for ${currentModel}, trying next model...`);
          
          const nextModel = getNextModel(currentModel);
          if (nextModel) {
            currentModel = nextModel;
            setStoredModel(currentModel);
            attemptCount++;
            continue; // Try with the next model
          } else {
            // No more models to try
            setMessages(prev => [...prev, { 
              role: 'assistant', 
              content: 'I apologize, but all AI models have reached their rate limits. Please try again in a few minutes. Rate limits reset every hour.' 
            }]);
            break;
          }
        }

        // Handle successful response
        if (response.ok && data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
          const aiResponse = data.candidates[0].content.parts[0].text;
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: aiResponse 
          }]);
          break; // Success, exit the retry loop
        } else {
          // Other API errors
          console.error('API Error Response:', data);
          let errorMessage = 'An error occurred while processing your request.';
          if (data.error) {
            errorMessage = `Error: ${data.error.message || data.error.status}`;
            
            // Show a more user-friendly message for API key errors
            if (data.error.message?.includes('API key')) {
              errorMessage = 'The AI service is currently unavailable. Please contact the administrator to check the API key configuration.';
            }
          }
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: errorMessage
          }]);
          break; // Exit on other errors
        }
      } catch (error) {
        console.error('Error fetching AI response:', error);
        
        // Try next model on network errors
        const nextModel = getNextModel(currentModel);
        if (nextModel && attemptCount < maxAttempts - 1) {
          console.warn(`Network error with ${currentModel}, trying next model...`);
          currentModel = nextModel;
          setStoredModel(currentModel);
          attemptCount++;
          continue;
        }
        
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'Network error occurred. Please check your connection and try again.' 
        }]);
        break;
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className={`${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6`}>
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <Bot className={`h-6 w-6 sm:h-8 sm:w-8 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'} flex-shrink-0`} />
          <h1 className="text-xl sm:text-2xl font-semibold">AI Assistant</h1>
        </div>

        <div className={`${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} rounded-lg p-3 sm:p-4 h-[400px] sm:h-[500px] overflow-y-auto mb-3 sm:mb-4`}>
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`mb-3 sm:mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[80%] rounded-lg p-3 sm:p-4 text-sm sm:text-base ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white'
                    : theme === 'dark'
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-white border border-gray-200'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className={`flex items-center gap-2 text-sm sm:text-base ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              <Loader className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
              <span>AI is thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
            className={`flex-1 px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base ${
              theme === 'dark' 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300'
            }`}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={toggleRecording}
              className={`p-2 rounded-lg ${
                isRecording 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-gray-600 hover:bg-gray-700'
              } text-white flex-shrink-0`}
              title={isRecording ? "Stop Recording" : "Start Recording"}
              disabled={isLoading}
            >
              {isRecording ? <MicOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Mic className="h-4 w-4 sm:h-5 sm:w-5" />}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`bg-indigo-600 text-white px-4 sm:px-6 py-2 rounded-lg flex items-center gap-2 text-sm sm:text-base
                ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'}`}
            >
              <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AIAssistance;