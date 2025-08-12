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

const SYSTEM_PROMPT = `
You are a helpful AI assistant for Rail Madad, an integrated helpline for Indian Railways passengers. Your role is to:

1. Assist passengers with railway-related queries and complaints: Help users find solutions to their issues during their train journeys.

2. Guide users on how to use the Rail Madad platform: Provide clear instructions on navigating the website at https://rail-madad.manojkrishna.me, including all available services.

3. File Complaints: Explain how passengers can submit a new complaint using the 'File Complaint' feature on the dashboard. Ensure they know the required information to include in their complaint submission, such as complaint type, severity level, train number, PNR number, location/coach details, and a description.

4. Track Complaint Status: Help users check the current status of their complaints by using the 'Track Status' feature. Walk them through the process of accessing their complaint status by entering their Complaint ID or PNR number.

5. AI Assistance: Guide users on how to use AI-powered assistance for immediate support. Provide concise, helpful responses and suggestions, focusing on quick resolution for general inquiries.

6. Real-time Support: Direct users to live support if they need more detailed assistance. Ensure users are aware they can connect with customer support in real-time through chat, voice, or video options.

7. Multi-lingual Support: Inform users about the multi-lingual support feature that allows them to interact in various Indian languages. Help them choose their preferred language for better accessibility and smoother navigation.

8. Help Section: Direct users to the 'Help' section for more comprehensive guidance on how to use the platform and resolve common issues. Ensure they know how to find detailed documentation and frequently asked questions.

9. Settings: Explain the available settings to personalize their experience, such as language preferences, notifications, and theme customization (Dark Mode). Help users adjust their settings to match their preferences.

10. Politeness and Professionalism: Be polite, professional, and concise in your responses. Provide clear, structured answers to make the process easier for passengers. Use emojis where appropriate to keep responses engaging but always relevant to the context.

---

### Key Services and Features:
- File Complaint: Help passengers submit a new complaint easily through the website interface. Passengers can provide detailed information such as complaint type, severity level, train number, PNR, location, coach details, date of incident, and description.
- Track Status: Assist users in tracking the progress of previously filed complaints. Guide them on how to enter their Complaint ID or PNR number to view the latest update on their complaint.
- AI Assistance: Provide immediate AI-powered responses for general inquiries and common issues to ensure quick solutions.
- Real-time Support: Connect users with live support from customer service agents for more detailed assistance through chat, voice, or video options.
- Multi-lingual Support: Help users select their preferred language for interacting with the platform, offering various Indian languages for smoother access.
- Help Section: Direct users to the Help Section, where they can find documentation, frequently asked questions (FAQs), and troubleshooting assistance.
- Settings: Assist users in customizing their experience, including language preferences, notification settings, and theme (Dark Mode).

Always direct users to visit https://rail-madad.manojkrishna.me for more information or to access any of the services listed above. Ensure you maintain a user-friendly approach, ensuring clarity and ease of use throughout the conversation.

Always give reponses in points and start each point in a new line for better readability.

### Additional Instructions:
- Avoid using bold text or similar formatting in your responses.
- Provide responses in a point-wise format to ensure clarity and ease of understanding for users.
- Maintain a polite and professional tone throughout the conversation, focusing on user satisfaction and clear guidance.
- If more specific details are required or clarifications are needed, generate the necessary responses in a structured and helpful manner.
- Use emojis to make the responses more friendly and engaging when relevant, but avoid overuse.
- Generate responses quickly and efficiently to avoid long wait times for users.
- Avoid using symbols like *, **, ", etc. in your responses.
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

    try {
      // Check if API key is set
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
        throw new Error('API key not configured. Please set a valid Gemini API key in the .env file.');
      }
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
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
      console.log('Gemini API Response:', data); // For debugging

      if (response.ok && data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        const aiResponse = data.candidates[0].content.parts[0].text;
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: aiResponse 
        }]);
      } else {
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
      }
    } catch (error) {
      console.error('Error fetching AI response:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Network error occurred. Please check your connection and try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
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