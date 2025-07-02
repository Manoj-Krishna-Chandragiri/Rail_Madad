import { 
  Headphones, 
  MessageSquare, 
  Phone, 
  Video, 
  Clock, 
  Users, 
  ChevronDown as ChevronDownIcon,
  Filter,
  AlertCircle
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';

interface SupportAgent {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'on-leave';
  activeChats?: number;
  expertise: string[];
  rating: number;
  email: string;
  phone: string;
  communication_preferences?: string[];
}

interface ChatSession {
  id: string;
  user: string;
  agent: string;
  status: 'Active' | 'Waiting' | 'Completed';
  duration: string;
  type: 'Chat' | 'Voice' | 'Video';
  issue: string;
}

const RealTimeSupport = () => {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [supportType, setSupportType] = useState<'chat' | 'voice' | 'video'>('chat');
  const [agents, setAgents] = useState<SupportAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { theme } = useTheme();
  const [displayAgentCount, setDisplayAgentCount] = useState<number>(4);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showFilterOptions, setShowFilterOptions] = useState(false);

  const isDark = theme === 'dark';

  // Fetch staff data from backend
  useEffect(() => {
    const fetchStaffData = async () => {
      setLoading(true);
      try {
        // Check your frontend axios configuration
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
        
        // Make sure all API calls use this base URL
        const response = await axios.get(`${API_BASE_URL}/api/complaints/staff/`);
        
        // Transform data to match SupportAgent interface
        const supportAgents = response.data.map((staff: any) => ({
          id: staff.id.toString(),
          name: staff.name,
          email: staff.email,
          phone: staff.phone,
          status: staff.status,
          activeChats: staff.active_tickets || 0,
          expertise: typeof staff.expertise === 'string' 
            ? JSON.parse(staff.expertise || '[]') 
            : (staff.expertise || []),
          rating: staff.rating || 4.0,
          communication_preferences: typeof staff.communication_preferences === 'string' 
            ? JSON.parse(staff.communication_preferences || '["Chat"]') 
            : (staff.communication_preferences || ['Chat']),
        }));
        
        setAgents(supportAgents);
        
        // Create active sessions based on available agents
        if (supportAgents.length > 0) {
          createActiveSessions(supportAgents);
        }
      } catch (err) {
        console.error('Error fetching staff data:', err);
        setError('Failed to load support agents. Please try again later.');
        
        // Set a fallback agent list if the API fails
        setAgents([
          {
            id: '1',
            name: 'Priya Singh',
            email: 'priya.singh@railmadad.in',
            phone: '+919876543210', // Format without spaces for WhatsApp
            status: 'active',
            activeChats: 2,
            expertise: ['Technical', 'Booking'],
            rating: 4.8,
            communication_preferences: ['Chat', 'Voice', 'Video'],
          },
          {
            id: '2',
            name: 'Rahul Kumar',
            email: 'rahul.kumar@railmadad.in',
            phone: '+919876543211', // Format without spaces for WhatsApp
            status: 'active',
            activeChats: 1,
            expertise: ['Refunds', 'General'],
            rating: 4.5,
            communication_preferences: ['Chat', 'Voice'],
          },
          {
            id: '3',
            name: 'Anita Patel',
            email: 'anita.patel@railmadad.in',
            phone: '+919876543212', // Format without spaces for WhatsApp
            status: 'active',
            activeChats: 3,
            expertise: ['Technical', 'Security'],
            rating: 4.9,
            communication_preferences: ['Chat', 'Video'],
          }
        ]);
        createActiveSessions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStaffData();
  }, []);

  // Function to create realistic sessions based on available agents
  const createActiveSessions = (availableAgents: SupportAgent[]) => {
    const activeAgents = availableAgents.filter(a => a.status === 'active');
    
    // If no agents are available, use defaults
    if (activeAgents.length === 0) {
      setActiveSessions([
        {
          id: '1',
          user: 'Amit Shah',
          agent: 'Priya Singh',
          status: 'Active',
          duration: '15:30',
          type: 'Chat',
          issue: 'Booking Assistance'
        },
        {
          id: '2',
          user: 'Meera Reddy',
          agent: 'Rahul Kumar',
          status: 'Waiting',
          duration: '00:45',
          type: 'Voice',
          issue: 'Refund Status'
        },
        // Add the specific sessions requested
        {
          id: '3',
          user: 'Rajesh Singh',
          agent: 'Akash',
          status: 'Waiting',
          duration: '30:45',
          type: 'Chat',
          issue: 'PNR Confirmation Query'
        },
        {
          id: '4',
          user: 'Arun Kumar',
          agent: 'Dinesh',
          status: 'Waiting',
          duration: '21:30',
          type: 'Video',
          issue: 'Refund Delay'
        }
      ]);
      return;
    }
    
    // Create sessions with real agents from database
    const sessions: ChatSession[] = [];
    
    // First add the 4 specific sessions requested
    if (activeAgents.length >= 1) {
      sessions.push({
        id: '1',
        user: 'Amit Shah',
        agent: activeAgents[0].name,
        status: 'Active',
        duration: '15:30',
        type: 'Chat',
        issue: 'Booking Assistance'
      });
    }
    
    if (activeAgents.length >= 2) {
      sessions.push({
        id: '2',
        user: 'Meera Reddy',
        agent: activeAgents[1].name,
        status: 'Waiting',
        duration: '00:45',
        type: 'Voice',
        issue: 'Refund Status'
      });
    }
    
    // Add Rajesh Singh and Arun Kumar sessions with available agents
    if (activeAgents.length >= 3) {
      sessions.push({
        id: '3',
        user: 'Rajesh Singh',
        agent: activeAgents[2].name,
        status: 'Waiting',
        duration: '30:45',
        type: 'Chat',
        issue: 'PNR Confirmation Query'
      });
    }
    
    if (activeAgents.length >= 4) {
      sessions.push({
        id: '4',
        user: 'Arun Kumar',
        agent: activeAgents[3].name,
        status: 'Waiting',
        duration: '21:30',
        type: 'Video',
        issue: 'Refund Delay'
      });
    }
    
    setActiveSessions(sessions);
  };

  // Active sessions state - updated to use fetched staff and include more sessions
  const [activeSessions, setActiveSessions] = useState<ChatSession[]>([
    {
      id: '1',
      user: 'Amit Shah',
      agent: 'Priya Singh',
      status: 'Active',
      duration: '15:30',
      type: 'Chat',
      issue: 'Booking Assistance'
    },
    {
      id: '2',
      user: 'Meera Reddy',
      agent: 'Rahul Kumar',
      status: 'Waiting',
      duration: '00:45',
      type: 'Voice',
      issue: 'Refund Status'
    }
  ]);

  // Update sessions when staff data is loaded
  useEffect(() => {
    if (agents.length > 0) {
      // Create additional sessions with actual staff members
      const availableAgents = agents.filter(a => a.status === 'active');
      if (availableAgents.length > 0) {
        const newSessions: ChatSession[] = [
          // Keep existing sessions
          ...activeSessions,
        ];

        // Add new sessions based on available agents (if we have any new ones)
        if (availableAgents.length > 2 && activeSessions.length < 4) {
          const users = [
            'Vikram Sharma', 'Sunita Patel', 'Arun Kumar', 
            'Deepa Mehta', 'Rajesh Singh', 'Kavita Gupta'
          ];
          
          const issues = [
            'PNR Confirmation Query', 'Refund Delay', 'Cleanliness Issue',
            'Food Quality Complaint', 'AC Not Working', 'Security Concern'
          ];
          
          // Add 1-2 more sessions with randomly selected new agents
          for (let i = 0; i < Math.min(2, availableAgents.length - 2); i++) {
            if (i + 2 < availableAgents.length) { // Ensure we have enough agents
              const randomUserIndex = Math.floor(Math.random() * users.length);
              const randomIssueIndex = Math.floor(Math.random() * issues.length);
              const sessionType = ['Chat', 'Voice', 'Video'][Math.floor(Math.random() * 3)] as 'Chat' | 'Voice' | 'Video';
              
              // Create random duration (1-30 mins)
              const mins = Math.floor(Math.random() * 30) + 1;
              const secs = Math.floor(Math.random() * 60);
              const duration = `${mins}:${secs.toString().padStart(2, '0')}`;
              
              newSessions.push({
                id: (activeSessions.length + i + 1).toString(),
                user: users[randomUserIndex],
                agent: availableAgents[i + 2].name,
                status: Math.random() > 0.3 ? 'Active' : 'Waiting',
                duration: duration,
                type: sessionType,
                issue: issues[randomIssueIndex]
              });
            }
          }
          
          setActiveSessions(newSessions);
        }
      }
    }
  }, [agents]);

  // Calculate statistics based on real data
  const activeAgentsCount = agents.filter(a => a.status === 'active').length;
  const totalActiveSessions = activeSessions.length;
  const averageWaitTime = activeSessions.filter(s => s.status === 'Waiting')
    .reduce((acc, session) => {
      // Convert duration (mm:ss) to seconds
      const [mins, secs] = session.duration.split(':').map(Number);
      return acc + (mins * 60 + secs);
    }, 0);
  
  // Format average wait time
  const formatAverageWaitTime = () => {
    if (activeSessions.filter(s => s.status === 'Waiting').length === 0) 
      return '0:00';
    
    const avgSeconds = Math.floor(averageWaitTime / activeSessions.filter(s => s.status === 'Waiting').length);
    const minutes = Math.floor(avgSeconds / 60);
    const seconds = avgSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Get display status for agent
  const getAgentDisplayStatus = (status: string) => {
    switch(status) {
      case 'active': return 'Available';
      case 'inactive': return 'Busy';
      case 'on-leave': return 'Offline';
      default: return 'Unknown';
    }
  };

  // Get status class for agent
  const getAgentStatusClass = (status: string) => {
    switch(status) {
      case 'active':
        return isDark ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800';
      case 'inactive':
        return isDark ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-800';
      case 'on-leave':
        return isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800';
      default:
        return isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800';
    }
  };

  const loadMoreAgents = () => {
    setDisplayAgentCount(prevCount => prevCount + 2);
  };

  // Card click handlers
  const handleCardClick = (cardType: string) => {
    switch(cardType) {
      case 'sessions':
        // Show active sessions
        setStatusFilter('Active');
        setShowFilterOptions(true);
        break;
      case 'agents':
        // Show agent information
        if (agents.length > 0) {
          setSelectedAgent(agents[0].id);
          window.scrollTo({
            top: document.getElementById('agent-selection')?.offsetTop || 0,
            behavior: 'smooth'
          });
        }
        break;
      case 'wait-time':
        // Show waiting sessions
        setStatusFilter('Waiting');
        setShowFilterOptions(true);
        break;
    }
  };

  // Handle direct communication with staff - update to use WhatsApp for video
  const handleContactStaff = (agent: SupportAgent, type: string) => {
    if (type === 'Chat' && agent.email) {
      window.location.href = `mailto:${agent.email}?subject=Rail Madad Support Request`;
    } else if (type === 'Voice' && agent.phone) {
      // Clean the phone number - remove spaces, hyphens, etc.
      const cleanPhone = agent.phone.replace(/[^\d+]/g, '');
      window.location.href = `tel:${cleanPhone}`;
    } else if (type === 'Video' && agent.phone) {
      // Format phone for WhatsApp - remove spaces, hyphens, etc.
      const cleanPhone = agent.phone.replace(/[^\d+]/g, '');
      // Remove the + sign if present and use international format
      const whatsappNumber = cleanPhone.startsWith('+') ? cleanPhone.substring(1) : cleanPhone;
      window.open(`https://wa.me/${whatsappNumber}?text=Hello%2C%20I'm%20contacting%20you%20from%20Rail%20Madad%20for%20support.%20Can%20we%20start%20a%20video%20call%3F`, '_blank');
    }
  };

  // Filter agents based on selected support type
  const filteredAgents = agents.filter(agent => {
    if (supportType === 'chat' && (!agent.communication_preferences || !agent.communication_preferences.includes('Chat'))) {
      return false;
    }
    if (supportType === 'voice' && (!agent.communication_preferences || !agent.communication_preferences.includes('Voice'))) {
      return false;
    }
    if (supportType === 'video' && (!agent.communication_preferences || !agent.communication_preferences.includes('Video'))) {
      return false;
    }
    return agent.status === 'active';
  });

  // Filter sessions based on selected filters
  const filteredSessions = activeSessions.filter(session => {
    if (statusFilter !== 'all' && session.status !== statusFilter) return false;
    if (typeFilter !== 'all' && session.type !== typeFilter) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className={`${isDark ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-lg p-6`}>
        <div className="flex items-center gap-3 mb-8">
          <Headphones className={`h-8 w-8 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
          <h1 className="text-2xl font-semibold">Real-Time Support Center</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div 
            onClick={() => handleCardClick('sessions')}
            className={`${isDark ? 'bg-blue-900' : 'bg-blue-50'} p-6 rounded-lg transform transition-all hover:scale-105 cursor-pointer active:scale-95 shadow-sm hover:shadow`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold mb-2">Active Sessions</h3>
                <div className={`text-3xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                  {activeSessions.filter(s => s.status === 'Active').length}
                </div>
                <div className="mt-1 text-sm opacity-70">
                  Click to view details
                </div>
              </div>
              <MessageSquare className={`h-6 w-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
          </div>

          <div 
            onClick={() => handleCardClick('agents')}
            className={`${isDark ? 'bg-green-900' : 'bg-green-50'} p-6 rounded-lg transform transition-all hover:scale-105 cursor-pointer active:scale-95 shadow-sm hover:shadow`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold mb-2">Available Agents</h3>
                <div className={`text-3xl font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                  {activeAgentsCount}
                </div>
                <div className="mt-1 text-sm opacity-70">
                  Click to select an agent
                </div>
              </div>
              <Users className={`h-6 w-6 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
            </div>
          </div>

          <div 
            onClick={() => handleCardClick('wait-time')}
            className={`${isDark ? 'bg-yellow-900' : 'bg-yellow-50'} p-6 rounded-lg transform transition-all hover:scale-105 cursor-pointer active:scale-95 shadow-sm hover:shadow`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold mb-2">Avg. Wait Time</h3>
                <div className={`text-3xl font-bold ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                  {formatAverageWaitTime()}
                </div>
                <div className="mt-1 text-sm opacity-70">
                  Click to see waiting queue
                </div>
              </div>
              <Clock className={`h-6 w-6 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-6`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Active Support Sessions</h2>
                
                {showFilterOptions && (
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className={`rounded-l-md border text-sm ${
                          isDark 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-700'
                        } px-3 py-1`}
                      >
                        <option value="all">All Status</option>
                        <option value="Active">Active</option>
                        <option value="Waiting">Waiting</option>
                      </select>
                      <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className={`rounded-r-md border-y border-r text-sm ${
                          isDark 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-700'
                        } px-3 py-1`}
                      >
                        <option value="all">All Types</option>
                        <option value="Chat">Chat</option>
                        <option value="Voice">Voice</option>
                        <option value="Video">Video</option>
                      </select>
                    </div>
                    <button 
                      className={`rounded-md p-1 ${
                        isDark 
                          ? 'bg-gray-700 hover:bg-gray-600' 
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                      onClick={() => setShowFilterOptions(!showFilterOptions)}
                    >
                      <Filter className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {filteredSessions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <tr>
                        <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase`}>User</th>
                        <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase`}>Agent</th>
                        <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase`}>Status</th>
                        <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase`}>Duration</th>
                        <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase`}>Type</th>
                        <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase`}>Issue</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                      {filteredSessions.map((session) => (
                        <tr key={session.id} className={isDark ? 'hover:bg-gray-750' : 'hover:bg-gray-50'}>
                          <td className="px-6 py-4">{session.user}</td>
                          <td className="px-6 py-4">{session.agent}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                session.status === 'Active'
                                  ? isDark ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800'
                                  : isDark ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {session.status === 'Active' && <span className="mr-1 inline-block h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>}
                              {session.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {session.status === 'Active' && <span className="animate-pulse">{session.duration}</span>}
                            {session.status !== 'Active' && session.duration}
                          </td>
                          <td className="px-6 py-4">
                            <div 
                              className="flex items-center cursor-pointer hover:underline"
                              onClick={() => {
                                const agent = agents.find(a => a.name === session.agent);
                                if (agent) {
                                  if (session.type === 'Chat') {
                                    handleContactStaff(agent, 'Chat');
                                  } else if (session.type === 'Voice') {
                                    handleContactStaff(agent, 'Voice');
                                  } else if (session.type === 'Video') {
                                    handleContactStaff(agent, 'Video');
                                  }
                                }
                              }}
                            >
                              {session.type === 'Chat' && <MessageSquare className={`h-5 w-5 ${isDark ? 'text-blue-400' : 'text-blue-500'} mr-2`} />}
                              {session.type === 'Voice' && <Phone className={`h-5 w-5 ${isDark ? 'text-green-400' : 'text-green-500'} mr-2`} />}
                              {session.type === 'Video' && <Video className={`h-5 w-5 ${isDark ? 'text-purple-400' : 'text-purple-500'} mr-2`} />}
                              {session.type}
                              {session.type === 'Video' && <span className="ml-1 text-xs opacity-70">(WhatsApp)</span>}
                            </div>
                          </td>
                          <td className="px-6 py-4">{session.issue}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className={`flex flex-col items-center justify-center p-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <AlertCircle className="h-10 w-10 mb-2 opacity-50" />
                  <p>No sessions match the selected filters</p>
                  <button 
                    onClick={() => {
                      setStatusFilter('all');
                      setTypeFilter('all');
                    }}
                    className="mt-4 text-indigo-500 hover:text-indigo-600 text-sm"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <div id="agent-selection" className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-6`}>
              <h2 className="text-xl font-semibold mb-6">Start New Session</h2>
              <div className="space-y-6">
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'} mb-2`}>
                    Support Type
                  </label>
                  <div className="flex gap-4"> {/* Changed from grid to flex */}
                    {['chat', 'voice', 'video'].map((type) => (
                      <button
                        key={type}
                        className={`flex flex-col items-center p-4 rounded-lg border flex-1 ${
                          supportType === type
                            ? isDark ? 'border-indigo-500 bg-indigo-900' : 'border-indigo-500 bg-indigo-50'
                            : isDark ? 'border-gray-700 hover:border-indigo-500' : 'border-gray-200 hover:border-indigo-500'
                        }`}
                        onClick={() => setSupportType(type as 'chat' | 'voice' | 'video')}
                      >
                        {type === 'chat' && <MessageSquare className="h-6 w-6 mb-2" />}
                        {type === 'voice' && <Phone className="h-6 w-6 mb-2" />}
                        {type === 'video' && <Video className="h-6 w-6 mb-2" />}
                        <span className="capitalize">{type}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'} mb-2`}>
                    Select Agent (Optional)
                  </label>
                  
                  {loading ? (
                    <div className="py-4 flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                  ) : error ? (
                    <div className={`p-3 text-red-500 ${isDark ? 'bg-red-900/30' : 'bg-red-100'} rounded-lg`}>
                      {error}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredAgents.length > 0 ? (
                        <>
                          {filteredAgents.slice(0, displayAgentCount).map((agent) => (
                            <div
                              key={agent.id}
                              className={`p-4 rounded-lg border cursor-pointer ${
                                selectedAgent === agent.id
                                  ? isDark ? 'border-indigo-500 bg-indigo-900' : 'border-indigo-500 bg-indigo-50'
                                  : isDark ? 'border-gray-700 hover:border-indigo-500' : 'border-gray-200 hover:border-indigo-500'
                              }`}
                              onClick={() => setSelectedAgent(agent.id)}
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <h3 className="font-medium">{agent.name}</h3>
                                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {agent.expertise.length > 0 
                                      ? agent.expertise.join(', ') 
                                      : 'General Support'}
                                  </div>
                                </div>
                                <span
                                  className={`px-2 py-1 text-xs rounded-full ${getAgentStatusClass(agent.status)}`}
                                >
                                  {getAgentDisplayStatus(agent.status)}
                                </span>
                              </div>
                              
                              <div className={`mt-2 flex items-center justify-between`}>
                                <div className={`flex items-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                  <span className="mr-4">Rating: {agent.rating}/5.0</span>
                                  <span>Active Chats: {agent.activeChats || 0}</span>
                                </div>
                                
                                <div className="flex gap-2">
                                  {agent.communication_preferences?.map(pref => {
                                    if (pref === supportType.charAt(0).toUpperCase() + supportType.slice(1)) {
                                      return (
                                        <div 
                                          key={pref}
                                          className={`flex items-center gap-1 text-xs px-2 py-1 rounded cursor-pointer ${
                                            pref === 'Chat' 
                                              ? isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700'
                                              : pref === 'Voice'
                                                ? isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700'
                                                : isDark ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700'
                                          }`}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleContactStaff(agent, pref);
                                          }}
                                        >
                                          Contact via {pref}
                                          {pref === 'Video' && <span className="ml-1 opacity-70">(WhatsApp)</span>}
                                        </div>
                                      );
                                    }
                                    return null;
                                  })}
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          {filteredAgents.length > displayAgentCount && (
                            <button
                              onClick={loadMoreAgents}
                              className={`w-full p-3 text-center ${
                                isDark 
                                  ? 'bg-gray-700 hover:bg-gray-600 text-white border border-gray-600' 
                                  : 'bg-gray-50 hover:bg-gray-100 text-gray-800 border border-gray-200'
                              } rounded-lg flex items-center justify-center gap-2`}
                            >
                              <ChevronDownIcon className="h-5 w-5" />
                              Load More Agents
                            </button>
                          )}
                        </>
                      ) : (
                        <div className="text-center py-4">
                          <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            No agents available for {supportType.charAt(0).toUpperCase() + supportType.slice(1)} support at the moment.
                          </p>
                          <p className="mt-2 text-sm text-indigo-500">
                            Please try another support method or check back later.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <button className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700">
                  Start Session
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse {
          animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .bg-gray-750 {
          background-color: #232836;
        }
      `}</style>
    </div>
  );
};

export default RealTimeSupport;