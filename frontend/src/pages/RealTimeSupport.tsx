import { 
  Headphones, 
  MessageSquare, 
  Phone, 
  Video, 
  Clock, 
  Users, 
  ChevronDown as ChevronDownIcon,
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

const RealTimeSupport = () => {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [supportType, setSupportType] = useState<'chat' | 'voice' | 'video'>('chat');
  const [agents, setAgents] = useState<SupportAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { theme } = useTheme();
  const [displayAgentCount, setDisplayAgentCount] = useState<number>(4);

  const isDark = theme === 'dark';

  // Fetch sessions data from complaints API - for statistics only
  const fetchSessionsData = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/complaints/`);
      console.log('Complaints API Response:', response.data);
      
      // Just count active/in-progress complaints for statistics
      const activeComplaints = response.data.filter((complaint: any) => 
        complaint.status === 'In Progress' || complaint.status === 'Open'
      );
      console.log('Active complaints count:', activeComplaints.length);
      
    } catch (err) {
      console.error('Error fetching sessions data:', err);
    }
  };

  // Fetch staff data from backend
  const fetchStaffData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/complaints/staff/`);
      console.log('API Response:', response.data);
      
      // Transform data to match SupportAgent interface
      const supportAgents = response.data.map((staff: any) => {
        console.log('Staff data from API:', staff);
        
        // Parse expertise
        let expertise = [];
        if (typeof staff.expertise === 'string') {
          try {
            expertise = JSON.parse(staff.expertise);
          } catch (e) {
            expertise = staff.expertise.split(',').map((s: string) => s.trim());
          }
        } else if (Array.isArray(staff.expertise)) {
          expertise = staff.expertise;
        }
        
        // Parse communication preferences
        let communication_preferences = ['Chat']; // Default fallback
        if (typeof staff.communication_preferences === 'string') {
          try {
            communication_preferences = JSON.parse(staff.communication_preferences);
          } catch (e) {
            communication_preferences = staff.communication_preferences.split(',').map((s: string) => s.trim());
          }
        } else if (Array.isArray(staff.communication_preferences)) {
          communication_preferences = staff.communication_preferences;
        }
        
        console.log('Parsed communication preferences:', communication_preferences);
        
        return {
          id: staff.id.toString(),
          name: staff.name,
          email: staff.email,
          phone: staff.phone,
          status: staff.status,
          activeChats: staff.active_tickets || 0,
          expertise: expertise,
          rating: staff.rating || 4.0,
          communication_preferences: communication_preferences,
        };
      });
      
      setAgents(supportAgents);
      console.log('Final agents data:', supportAgents);
      setError(''); // Clear error on success
      
    } catch (err) {
      console.error('Error fetching staff data:', err);
      
      // Set fallback agent list with all communication preferences
      setAgents([
        {
          id: '1',
          name: 'Priya Singh',
          email: 'priya.singh@railmadad.in',
          phone: '+919876543210',
          status: 'active',
          activeChats: 2,
          expertise: ['Technical Support', 'Booking Assistance'],
          rating: 4.8,
          communication_preferences: ['Chat', 'Voice', 'Video'],
        },
        {
          id: '2',
          name: 'Rahul Kumar',
          email: 'rahul.kumar@railmadad.in',
          phone: '+919876543211',
          status: 'active',
          activeChats: 1,
          expertise: ['Refunds', 'General Queries'],
          rating: 4.5,
          communication_preferences: ['Chat', 'Voice'],
        },
        {
          id: '3',
          name: 'Anita Patel',
          email: 'anita.patel@railmadad.in',
          phone: '+919876543212',
          status: 'active',
          activeChats: 3,
          expertise: ['Technical Support', 'Security Issues'],
          rating: 4.9,
          communication_preferences: ['Chat', 'Video'],
        },
        {
          id: '4',
          name: 'Rajesh Singh',
          email: 'rajesh.singh@railmadad.in',
          phone: '+919876543213',
          status: 'active',
          activeChats: 0,
          expertise: ['Food Services', 'Cleanliness'],
          rating: 4.6,
          communication_preferences: ['Chat', 'Voice', 'Video'],
        },
        {
          id: '5',
          name: 'Meera Reddy',
          email: 'meera.reddy@railmadad.in',
          phone: '+919876543214',
          status: 'active',
          activeChats: 2,
          expertise: ['Customer Support', 'Accessibility'],
          rating: 4.7,
          communication_preferences: ['Chat', 'Voice'],
        }
      ]);
      
      setError('Unable to connect to server. Showing available staff.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
    fetchSessionsData();
  }, []);

  // Calculate statistics based on real data
  const activeAgentsCount = agents.filter(a => a.status === 'active').length;

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
        // Scroll to agents section since we show agents instead of sessions
        window.scrollTo({
          top: document.getElementById('available-agents')?.offsetTop || 0,
          behavior: 'smooth'
        });
        break;
      case 'agents':
        if (agents.length > 0) {
          setSelectedAgent(agents[0].id);
          window.scrollTo({
            top: document.getElementById('agent-selection')?.offsetTop || 0,
            behavior: 'smooth'
          });
        }
        break;
      case 'wait-time':
        // Scroll to agents section
        window.scrollTo({
          top: document.getElementById('available-agents')?.offsetTop || 0,
          behavior: 'smooth'
        });
        break;
    }
  };

  // Handle direct communication with staff
  const handleContactStaff = (agent: SupportAgent, type: string) => {
    if (type === 'Chat' && agent.email) {
      window.location.href = `mailto:${agent.email}?subject=Rail Madad Support Request`;
    } else if (type === 'Voice' && agent.phone) {
      const cleanPhone = agent.phone.replace(/[^\d+]/g, '');
      window.location.href = `tel:${cleanPhone}`;
    } else if (type === 'Video' && agent.phone) {
      const cleanPhone = agent.phone.replace(/[^\d+]/g, '');
      const whatsappNumber = cleanPhone.startsWith('+') ? cleanPhone.substring(1) : cleanPhone;
      window.open(`https://wa.me/${whatsappNumber}?text=Hello%2C%20I'm%20contacting%20you%20from%20Rail%20Madad%20for%20support.%20Can%20we%20start%20a%20video%20call%3F`, '_blank');
    }
  };

  // Filter agents based on selected support type - show all active agents
  const filteredAgents = agents.filter(agent => agent.status === 'active');

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
                <h3 className="text-lg font-semibold mb-2">Available Agents</h3>
                <div className={`text-3xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                  {loading ? '...' : activeAgentsCount}
                </div>
                <div className="mt-1 text-sm opacity-70">
                  Available for chat
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
                  {loading ? '...' : activeAgentsCount}
                </div>
                <div className="mt-1 text-sm opacity-70">
                  Ready to help
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
                  &lt; 2min
                </div>
                <div className="mt-1 text-sm opacity-70">
                  Average response time
                </div>
              </div>
              <Clock className={`h-6 w-6 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div id="available-agents" className="lg:col-span-2">
            <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-6`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Available Support Agents</h2>
              </div>

              {loading ? (
                <div className="py-8 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : filteredAgents.length > 0 ? (
                <div className="space-y-4">
                  {filteredAgents.map((agent) => (
                    <div
                      key={agent.id}
                      className={`p-6 rounded-lg border ${
                        isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-medium">{agent.name}</h3>
                          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                            {agent.expertise.length > 0 
                              ? agent.expertise.join(', ') 
                              : 'General Support'}
                          </div>
                          <div className={`flex items-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-2`}>
                            <span className="mr-6">Rating: {agent.rating}/5.0</span>
                            <span>Active Chats: {agent.activeChats || 0}</span>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 text-sm rounded-full ${getAgentStatusClass(agent.status)}`}
                        >
                          {getAgentDisplayStatus(agent.status)}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-3">
                        {agent.communication_preferences?.map(pref => (
                          <button 
                            key={pref}
                            className={`flex items-center gap-2 text-sm px-4 py-2 rounded-lg cursor-pointer transition-colors ${
                              pref === 'Chat' 
                                ? isDark ? 'bg-blue-900/50 text-blue-300 hover:bg-blue-800/50' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                : pref === 'Voice'
                                  ? isDark ? 'bg-green-900/50 text-green-300 hover:bg-green-800/50' : 'bg-green-100 text-green-700 hover:bg-green-200'
                                  : isDark ? 'bg-purple-900/50 text-purple-300 hover:bg-purple-800/50' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                            }`}
                            onClick={() => handleContactStaff(agent, pref)}
                          >
                            {pref === 'Chat' && <MessageSquare className="h-4 w-4" />}
                            {pref === 'Voice' && <Phone className="h-4 w-4" />}
                            {pref === 'Video' && <Video className="h-4 w-4" />}
                            Contact via {pref}
                            {pref === 'Video' && <span className="ml-1 opacity-70 text-xs">(WhatsApp)</span>}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`flex flex-col items-center justify-center p-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <AlertCircle className="h-10 w-10 mb-2 opacity-50" />
                  <p>No agents available at the moment</p>
                  <p className="mt-2 text-sm">Please check back later or try again.</p>
                  {error && (
                    <button 
                      onClick={() => {
                        setError('');
                        fetchStaffData();
                      }}
                      className="mt-4 text-indigo-500 hover:text-indigo-600 text-sm underline"
                    >
                      Retry Loading
                    </button>
                  )}
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
                  <div className="flex gap-4">
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
                    <div className={`p-3 rounded-lg mb-4 ${isDark ? 'bg-red-900/30 border border-red-700' : 'bg-red-100 border border-red-300'}`}>
                      <div className="flex items-center">
                        <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                        <div>
                          <p className="text-red-600 font-medium">Connection Error</p>
                          <p className="text-red-500 text-sm mt-1">{error}</p>
                          <button 
                            onClick={() => {
                              setError('');
                              fetchStaffData();
                            }}
                            className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
                          >
                            Retry Loading
                          </button>
                        </div>
                      </div>
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
                                
                                <div className="flex flex-wrap gap-1">
                                  {agent.communication_preferences?.map(pref => (
                                    <div 
                                      key={pref}
                                      className={`flex items-center gap-1 text-xs px-2 py-1 rounded cursor-pointer transition-colors whitespace-nowrap ${
                                        pref === 'Chat' 
                                          ? isDark ? 'bg-blue-900/50 text-blue-300 hover:bg-blue-800/50' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                          : pref === 'Voice'
                                            ? isDark ? 'bg-green-900/50 text-green-300 hover:bg-green-800/50' : 'bg-green-100 text-green-700 hover:bg-green-200'
                                            : isDark ? 'bg-purple-900/50 text-purple-300 hover:bg-purple-800/50' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                      }`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleContactStaff(agent, pref);
                                      }}
                                    >
                                      {pref === 'Chat' && <MessageSquare className="h-3 w-3" />}
                                      {pref === 'Voice' && <Phone className="h-3 w-3" />}
                                      {pref === 'Video' && <Video className="h-3 w-3" />}
                                      {pref}
                                      {pref === 'Video' && <span className="ml-1 opacity-70 text-xs">(WA)</span>}
                                    </div>
                                  ))}
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
                            No agents available at the moment.
                          </p>
                          <p className="mt-2 text-sm text-indigo-500">
                            Please check back later.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => {
                    if (selectedAgent) {
                      const agent = filteredAgents.find(a => a.id === selectedAgent);
                      if (agent) {
                        const supportTypeCap = supportType.charAt(0).toUpperCase() + supportType.slice(1);
                        handleContactStaff(agent, supportTypeCap);
                      }
                    } else {
                      alert(`Starting ${supportType} session with the next available agent...`);
                    }
                  }}
                  className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                  disabled={filteredAgents.length === 0}
                >
                  {selectedAgent 
                    ? `Start ${supportType.charAt(0).toUpperCase() + supportType.slice(1)} Session`
                    : `Start ${supportType.charAt(0).toUpperCase() + supportType.slice(1)} Session (Next Available)`
                  }
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
