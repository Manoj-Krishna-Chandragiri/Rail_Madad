import { Bot, MessageCircle, Loader, Mic, MicOff } from 'lucide-react';
import { useState, useRef, useEffect, type ReactNode } from 'react';
import { useTheme } from '../context/ThemeContext';
import AudioTranscription from '../components/AudioTranscription';

// ─── Markdown-like message formatter ──────────────────────────────────────────
function inlineFormat(text: string): ReactNode[] {
  // Handle **bold**, [link](url) inside a text fragment
  const parts: ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*|\[([^\]]+)\]\((https?:\/\/[^\)]+)\))/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    if (match[2]) {
      // **bold**
      parts.push(<strong key={key++} className="font-semibold">{match[2]}</strong>);
    } else if (match[3] && match[4]) {
      // [label](url)
      parts.push(
        <a key={key++} href={match[4]} target="_blank" rel="noopener noreferrer"
          className="text-indigo-500 underline underline-offset-2 break-all hover:text-indigo-700">
          {match[3]}
        </a>
      );
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

function FormattedMessage({ content, isDark }: { content: string; isDark: boolean }) {
  const lines = content.split('\n');
  const nodes: ReactNode[] = [];
  let bulletItems: ReactNode[] = [];
  let numberedItems: ReactNode[] = [];
  let key = 0;

  const flushBullets = () => {
    if (bulletItems.length) {
      nodes.push(
        <ul key={key++} className="list-disc list-outside pl-5 space-y-1 my-2">
          {bulletItems}
        </ul>
      );
      bulletItems = [];
    }
  };
  const flushNumbered = () => {
    if (numberedItems.length) {
      nodes.push(
        <ol key={key++} className="list-decimal list-outside pl-5 space-y-1 my-2">
          {numberedItems}
        </ol>
      );
      numberedItems = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();

    // Heading: ### or ##
    if (/^#{2,3}\s+/.test(line)) {
      flushBullets(); flushNumbered();
      const text = line.replace(/^#{2,3}\s+/, '');
      nodes.push(
        <p key={key++} className="font-bold text-base mt-3 mb-1">
          {inlineFormat(text)}
        </p>
      );
      continue;
    }

    // Bullet: * item  or  - item
    const bulletMatch = line.match(/^[\*\-]\s+(.*)/);
    if (bulletMatch) {
      flushNumbered();
      bulletItems.push(
        <li key={key++} className="leading-relaxed">
          {inlineFormat(bulletMatch[1])}
        </li>
      );
      continue;
    }

    // Numbered list: 1. item
    const numMatch = line.match(/^\d+\.\s+(.*)/);
    if (numMatch) {
      flushBullets();
      numberedItems.push(
        <li key={key++} className="leading-relaxed">
          {inlineFormat(numMatch[1])}
        </li>
      );
      continue;
    }

    // Empty line — flush lists, add spacing
    if (line.trim() === '') {
      flushBullets(); flushNumbered();
      nodes.push(<div key={key++} className="h-2" />);
      continue;
    }

    // Plain paragraph
    flushBullets(); flushNumbered();
    nodes.push(
      <p key={key++} className="leading-relaxed">
        {inlineFormat(line)}
      </p>
    );
  }

  flushBullets();
  flushNumbered();

  return (
    <div className={`text-sm sm:text-base space-y-0.5 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
      {nodes}
    </div>
  );
}
// ──────────────────────────────────────────────────────────────────────────────

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

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

    const userMessage = message.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setMessage('');
    setIsLoading(true);

    const apiBase = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '';

    try {
      const response = await fetch(`${apiBase}/api/complaints/ai/chat/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();

      if (response.ok && data.response) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      } else if (response.status === 429 || data.type === 'rate_limit') {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'I apologize, but the AI service is temporarily rate-limited. Please try again in a few minutes.'
        }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.error || 'An error occurred while processing your request. Please try again.'
        }]);
      }
    } catch (error) {
      console.error('Error fetching AI response:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Network error occurred. Please check your connection and try again.'
      }]);
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
                className={`max-w-[85%] sm:max-w-[80%] rounded-lg p-3 sm:p-4 ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white text-sm sm:text-base'
                    : theme === 'dark'
                    ? 'bg-gray-800 border border-gray-700'
                    : 'bg-white border border-gray-200 shadow-sm'
                }`}
              >
                {msg.role === 'user' ? (
                  msg.content
                ) : (
                  <FormattedMessage content={msg.content} isDark={theme === 'dark'} />
                )}
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