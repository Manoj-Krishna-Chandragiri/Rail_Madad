import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Send, 
  Headphones, 
  BarChart2, 
  FileText, 
  Globe, 
  Search, 
  Train, 
  Bell, 
  HelpCircle, 
  Info, 
  ChevronRight, 
  PhoneCall,
  Clock,
  Loader2
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import apiClient from '../utils/api';
import { getAuth } from 'firebase/auth';

interface SearchResult {
  id: string;
  complaint_id: number;
  pnr_number: string;
  train_number: string;
  type: string;
  description: string;
  status: string;
  severity: string;
  priority: string;
  date_of_incident: string;
  created_at: string;
  location: string;
}

const Home = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isDark = theme === 'dark';
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      setSearchError('Please enter a search term');
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setShowResults(false);

    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        setSearchError('Please log in to search your complaints');
        setIsSearching(false);
        return;
      }
      
      // Get the Firebase ID token
      const token = await currentUser.getIdToken();
      
      // Make API request with authorization header
      const response = await apiClient.get('/api/complaints/search/', {
        params: { q: searchQuery.trim() },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setSearchResults(response.data.complaints || []);
      setShowResults(true);
      
    } catch (error: any) {
      console.error('Search error:', error);
      if (error.response?.status === 401) {
        setSearchError('Please log in to search your complaints');
      } else {
        setSearchError(error.response?.data?.error || 'Failed to search complaints. Please try again.');
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleComplaintClick = (complaintId: number) => {
    navigate('/user-dashboard/track-status', { state: { searchComplaintId: complaintId } });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'closed':
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'in progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'open':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Quick links data for navigation
  const quickLinks = [
    { icon: <FileText className="h-5 w-5" />, text: "File Complaint", path: "/user-dashboard/file-complaint" },
    { icon: <BarChart2 className="h-5 w-5" />, text: "Track Status", path: "/user-dashboard/track-status" },
    { icon: <Headphones className="h-5 w-5" />, text: "Real-Time Support", path: "/user-dashboard/real-time-support" },
    { icon: <Globe className="h-5 w-5" />, text: "Change Language", path: "/user-dashboard/multi-lingual" },
    { icon: <Bell className="h-5 w-5" />, text: "Notifications", path: "/user-dashboard/settings" },
    { icon: <HelpCircle className="h-5 w-5" />, text: "Help & FAQs", path: "/user-dashboard/help" },
  ];

  // Common routes for rail travelers
  const commonRoutes = [
    { from: "New Delhi", to: "Mumbai", time: "16hrs 10mins", train: "Rajdhani Express" },
    { from: "Chennai", to: "Bangalore", time: "5hrs 30mins", train: "Shatabdi Express" },
    { from: "Kolkata", to: "Varanasi", time: "13hrs 45mins", train: "Vande Bharat" },
    { from: "Ahmedabad", to: "Jaipur", time: "10hrs 20mins", train: "Double Decker" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 pb-12">
      {/* Enhanced Hero Section with animated train */}
      <div className={`${isDark ? 'bg-gray-800' : 'bg-gradient-to-r from-indigo-50 to-blue-50'} rounded-xl shadow-lg p-8 mb-8 overflow-hidden relative`}>
        {/* Animated track at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-8 overflow-hidden">
          <div className="flex w-full">
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={i} className="flex-shrink-0">
                <div className={`h-2 w-8 ${isDark ? 'bg-gray-600' : 'bg-gray-400'} mx-4`}></div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="md:w-3/5">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">
              Your Journey, Our Commitment
            </h1>
            <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
              Rail Madad provides a seamless platform for all Indian Railways passenger assistance and complaint resolution.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link 
                to="/user-dashboard/file-complaint" 
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                <Send className="h-5 w-5" />
                File a Complaint
              </Link>
              <Link 
                to="/user-dashboard/track-status" 
                className={`px-6 py-3 rounded-lg transition-colors flex items-center gap-2 shadow-md hover:shadow-lg ${
                  isDark 
                    ? 'bg-gray-700 text-white hover:bg-gray-600' 
                    : 'bg-white text-gray-800 hover:bg-gray-100'
                }`}
              >
                <BarChart2 className="h-5 w-5" />
                Track Status
              </Link>
              <Link 
                to="/user-dashboard/real-time-support" 
                className={`px-6 py-3 rounded-lg transition-colors flex items-center gap-2 shadow-md hover:shadow-lg ${
                  isDark 
                    ? 'bg-blue-800 text-white hover:bg-blue-700' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                <Headphones className="h-5 w-5" />
                Get Support
              </Link>
            </div>
          </div>

          {/* Improved realistic train animation with landscape */}
          <div className="md:w-2/5 relative h-72 flex items-center justify-center overflow-hidden">
            <div className="scene relative w-full h-full">
              {/* Sky and landscape elements - night sky in dark mode */}
              <div className={`sky absolute top-0 w-full h-[250px] ${
                isDark 
                  ? 'bg-gradient-to-b from-gray-900 to-indigo-900' 
                  : 'bg-gradient-to-b from-blue-600 to-blue-300'
              }`}>
                {/* Sun in light mode, moon in dark mode */}
                <div className={`${
                  isDark 
                    ? 'moon absolute top-[40px] right-[80px] w-[40px] h-[40px] bg-gray-200 rounded-full shadow-gray-200/70 shadow-[0_0_20px_5px]' 
                    : 'sun absolute top-[50px] right-[100px] w-[50px] h-[50px] bg-yellow-400 rounded-full shadow-yellow-400/70 shadow-[0_0_30px_10px]'
                }`}></div>
                
                {/* Stars only visible in dark mode */}
                {isDark && (
                  <div className="stars">
                    <div className="star absolute top-[30px] left-[50px] w-[2px] h-[2px] bg-white rounded-full shadow-white shadow-[0_0_2px_1px] animate-twinkle-1"></div>
                    <div className="star absolute top-[70px] left-[150px] w-[1px] h-[1px] bg-white rounded-full shadow-white shadow-[0_0_2px_1px] animate-twinkle-2"></div>
                    <div className="star absolute top-[40px] left-[220px] w-[2px] h-[2px] bg-white rounded-full shadow-white shadow-[0_0_2px_1px] animate-twinkle-3"></div>
                    <div className="star absolute top-[20px] left-[350px] w-[1px] h-[1px] bg-white rounded-full shadow-white shadow-[0_0_2px_1px] animate-twinkle-1"></div>
                    <div className="star absolute top-[90px] left-[400px] w-[2px] h-[2px] bg-white rounded-full shadow-white shadow-[0_0_2px_1px] animate-twinkle-2"></div>
                    <div className="star absolute top-[50px] left-[500px] w-[1px] h-[1px] bg-white rounded-full shadow-white shadow-[0_0_2px_1px] animate-twinkle-3"></div>
                    <div className="star absolute top-[30px] right-[180px] w-[2px] h-[2px] bg-white rounded-full shadow-white shadow-[0_0_2px_1px] animate-twinkle-2"></div>
                    <div className="star absolute top-[60px] right-[220px] w-[1px] h-[1px] bg-white rounded-full shadow-white shadow-[0_0_2px_1px] animate-twinkle-1"></div>
                  </div>
                )}
                
                <div className="clouds">
                  <div className="cloud absolute top-[80px] left-[100px] w-[100px] h-[40px] bg-white/90 rounded-[50px] before:content-[''] before:absolute before:bg-white before:rounded-full before:w-[50px] before:h-[50px] before:top-[-20px] before:left-[15px] after:content-[''] after:absolute after:bg-white after:rounded-full after:w-[60px] after:h-[60px] after:top-[-25px] after:right-[15px]"></div>
                  <div className="cloud absolute top-[60px] left-[500px] w-[120px] h-[50px] bg-white/90 rounded-[50px] before:content-[''] before:absolute before:bg-white before:rounded-full before:w-[60px] before:h-[60px] before:top-[-25px] before:left-[20px] after:content-[''] after:absolute after:bg-white after:rounded-full after:w-[70px] after:h-[70px] after:top-[-30px] after:right-[20px]"></div>
                </div>
              </div>
              
              <div className={`mountains absolute bottom-[50px] w-full overflow-hidden ${isDark ? 'opacity-50' : ''}`}>
                <div className="mountain absolute bottom-0 left-[10%] border-solid border-[0_100px_150px_100px] border-t-transparent border-r-transparent border-b-slate-500 border-l-transparent"></div>
                <div className="mountain absolute bottom-0 left-[40%] border-solid border-[0_150px_200px_150px] border-t-transparent border-r-transparent border-b-slate-600 border-l-transparent"></div>
                <div className="mountain absolute bottom-0 left-[70%] border-solid border-[0_120px_180px_120px] border-t-transparent border-r-transparent border-b-slate-500 border-l-transparent"></div>
              </div>
              
              <div className={`landscape absolute bottom-0 w-full h-[50px] ${
                isDark ? 'bg-green-900' : 'bg-green-700'
              }`}></div>
              
              {/* Train animation continues unchanged */}
              <div className="train-container absolute bottom-[50px] w-full animate-train-move-ltr">
                <div className="train-engine absolute right-0 bottom-0 scale-x-[-1]">
                  <div className="engine-body relative w-[180px] h-[80px] bg-gradient-to-b from-blue-700 to-blue-800 rounded-md">
                    <div className="front-angle absolute left-0 top-0 w-[40px] h-[80px] bg-gradient-to-r from-blue-700 to-blue-800 rounded-l-md transform skew-x-[-20deg] origin-top-right"></div>
                    
                    <div className="cabin absolute left-[50px] top-[-20px] w-[80px] h-[30px] bg-gradient-to-b from-blue-700 to-blue-800 rounded-t-md"></div>
                    
                    {/* Add INDIAN RAILWAYS text to the engine - with counter-scaling to fix mirroring */}
                    <div className="railway-text absolute left-[40px] top-[25px] w-[120px] scale-x-[-1] z-10">
                      <span className="text-[10px] font-bold text-white bg-blue-900/70 px-2 py-1 rounded-sm whitespace-nowrap">INDIAN RAILWAYS</span>
                    </div>
                    
                    <div className="windows flex absolute left-[55px] top-[-15px]">
                      <div className="window mx-[5px] w-[15px] h-[12px] bg-blue-200 border-2 border-gray-700 rounded-t"></div>
                      <div className="window mx-[5px] w-[15px] h-[12px] bg-blue-200 border-2 border-gray-700 rounded-t"></div>
                      <div className="window mx-[5px] w-[15px] h-[12px] bg-blue-200 border-2 border-gray-700 rounded-t"></div>
                    </div>
                    
                    <div className="smokestack absolute left-[20px] top-[-30px] w-[15px] h-[30px] bg-gray-800 rounded-t-md">
                      <div className="smoke-particles absolute top-[-10px] left-[-5px]">
                        <div className="smoke-particle absolute w-[12px] h-[12px] bg-gray-300 rounded-full animate-smoke-1"></div>
                        <div className="smoke-particle absolute w-[16px] h-[16px] left-[5px] top-[-8px] bg-gray-300 rounded-full animate-smoke-2"></div>
                        <div className="smoke-particle absolute w-[20px] h-[20px] left-[10px] top-[-16px] bg-gray-300 rounded-full animate-smoke-3"></div>
                      </div>
                    </div>
                    
                    <div className="front-light absolute left-[5px] top-[30px] w-[12px] h-[12px] bg-yellow-400 rounded-full animate-glow">
                      <div className="light-beam absolute left-[-20px] top-[-5px] w-[30px] h-[22px] bg-gradient-to-r from-yellow-300/70 to-transparent rounded-full"></div>
                    </div>
                    
                    <div className="detail-line absolute left-[40px] top-[30px] w-[120px] h-[2px] bg-blue-500"></div>
                    <div className="detail-line absolute left-[40px] top-[50px] w-[120px] h-[2px] bg-blue-500"></div>
                    
                    <div className="wheels absolute bottom-[-15px] w-full flex justify-between">
                      <div className="wheel-assembly flex items-center">
                        <div className="wheel w-[30px] h-[30px] bg-gray-800 border-[3px] border-gray-600 rounded-full relative m-[5px] animate-wheel-turn-ltr">
                          {/* Add white lines to show wheel rotation */}
                          <div className="wheel-line absolute top-[50%] left-0 right-0 h-[2px] bg-white transform translate-y-[-50%]"></div>
                          <div className="wheel-line absolute top-0 bottom-0 left-[50%] w-[2px] bg-white transform translate-x-[-50%]"></div>
                          <div className="after:content-[''] after:absolute after:top-1/2 after:left-1/2 after:w-[15px] after:h-[15px] after:bg-gray-600 after:rounded-full after:-translate-x-1/2 after:-translate-y-1/2"></div>
                          <div className="before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:w-[24px] before:h-[24px] before:border-2 before:border-gray-500 before:rounded-full before:-translate-x-1/2 before:-translate-y-1/2"></div>
                        </div>
                        <div className="wheel w-[30px] h-[30px] bg-gray-800 border-[3px] border-gray-600 rounded-full relative m-[5px] animate-wheel-turn-ltr">
                          {/* Add white lines to show wheel rotation */}
                          <div className="wheel-line absolute top-[50%] left-0 right-0 h-[2px] bg-white transform translate-y-[-50%]"></div>
                          <div className="wheel-line absolute top-0 bottom-0 left-[50%] w-[2px] bg-white transform translate-x-[-50%]"></div>
                          <div className="after:content-[''] after:absolute after:top-1/2 after:left-1/2 after:w-[15px] after:h-[15px] after:bg-gray-600 after:rounded-full after:-translate-x-1/2 after:-translate-y-1/2"></div>
                          <div className="before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:w-[24px] before:h-[24px] before:border-2 before:border-gray-500 before:rounded-full before:-translate-x-1/2 before:-translate-y-1/2"></div>
                        </div>
                      </div>
                      <div className="wheel-assembly flex items-center">
                        <div className="wheel w-[30px] h-[30px] bg-gray-800 border-[3px] border-gray-600 rounded-full relative m-[5px] animate-wheel-turn-ltr">
                          {/* Add white lines to show wheel rotation */}
                          <div className="wheel-line absolute top-[50%] left-0 right-0 h-[2px] bg-white transform translate-y-[-50%]"></div>
                          <div className="wheel-line absolute top-0 bottom-0 left-[50%] w-[2px] bg-white transform translate-x-[-50%]"></div>
                          <div className="after:content-[''] after:absolute after:top-1/2 after:left-1/2 after:w-[15px] after:h-[15px] after:bg-gray-600 after:rounded-full after:-translate-x-1/2 after:-translate-y-1/2"></div>
                          <div className="before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:w-[24px] before:h-[24px] before:border-2 before:border-gray-500 before:rounded-full before:-translate-x-1/2 before:-translate-y-1/2"></div>
                        </div>
                        <div className="wheel w-[30px] h-[30px] bg-gray-800 border-[3px] border-gray-600 rounded-full relative m-[5px] animate-wheel-turn-ltr">
                          {/* Add white lines to show wheel rotation */}
                          <div className="wheel-line absolute top-[50%] left-0 right-0 h-[2px] bg-white transform translate-y-[-50%]"></div>
                          <div className="wheel-line absolute top-0 bottom-0 left-[50%] w-[2px] bg-white transform translate-x-[-50%]"></div>
                          <div className="after:content-[''] after:absolute after:top-1/2 after:left-1/2 after:w-[15px] after:h-[15px] after:bg-gray-600 after:rounded-full after:-translate-x-1/2 after:-translate-y-1/2"></div>
                          <div className="before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:w-[24px] before:h-[24px] before:border-2 before:border-gray-500 before:rounded-full before:-translate-x-1/2 before:-translate-y-1/2"></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Engine coupling - adjusted dimensions and added connector */}
                    <div className="coupling-system flex items-center absolute right-[-12px] top-[45px]">
                      <div className="coupling w-[16px] h-[6px] bg-gray-600 rounded-r"></div>
                      <div className="coupling-chain w-[6px] h-[2px] bg-gray-500 absolute right-[-6px]"></div>
                    </div>
                    <div className="coupling absolute right-[-5px] top-[45px] w-[20px] h-[6px] bg-gray-600"></div>
                    
                    {/* Connecting wire between engine and first coach */}
                    <div className="connecting-wire absolute right-[-30px] top-[45px] w-[20px] h-[2px] bg-gray-500 z-10"></div>

                    </div>
                </div>
                
                {/* Passenger coaches - Repositioned to follow the engine */}
                <div className="train-coach absolute right-[210px] bottom-0 scale-x-[-1]">
                  <div className="coach-body blue-coach relative w-[190px] h-[70px] bg-blue-600 rounded-md">
                    <div className="coach-roof absolute top-[-4px] left-0 right-0 h-[4px] bg-blue-700 rounded-t-md">
                      <div className="ac-unit absolute top-[-3px] left-[30px] w-[20px] h-[4px] bg-gray-700 rounded-[2px]"></div>
                      <div className="ac-unit absolute top-[-3px] left-[70px] w-[20px] h-[4px] bg-gray-700 rounded-[2px]"></div>
                      <div className="ac-unit absolute top-[-3px] right-[30px] w-[20px] h-[4px] bg-gray-700 rounded-[2px]"></div>
                    </div>
                    
                    <div className="coach-stripe absolute top-[10px] left-0 right-0 h-[2px] bg-yellow-400"></div>
                    
                    <div className="coach-windows flex justify-around absolute top-[20px] left-[15px] right-[15px]">
                      <div className="coach-window w-[20px] h-[20px] bg-blue-200 border-2 border-blue-700 rounded relative">
                        <div className="window-frame absolute top-1/2 left-0 w-full h-[1px] bg-black/20"></div>
                      </div>
                      <div className="coach-window w-[20px] h-[20px] bg-blue-200 border-2 border-blue-700 rounded relative">
                        <div className="window-frame absolute top-1/2 left-0 w-full h-[1px] bg-black/20"></div>
                      </div>
                      <div className="coach-window w-[20px] h-[20px] bg-blue-200 border-2 border-blue-700 rounded relative">
                        <div className="window-frame absolute top-1/2 left-0 w-full h-[1px] bg-black/20"></div>
                      </div>
                      <div className="coach-window w-[20px] h-[20px] bg-blue-200 border-2 border-blue-700 rounded relative">
                        <div className="window-frame absolute top-1/2 left-0 w-full h-[1px] bg-black/20"></div>
                      </div>
                      <div className="coach-window w-[20px] h-[20px] bg-blue-200 border-2 border-blue-700 rounded relative">
                        <div className="window-frame absolute top-1/2 left-0 w-full h-[1px] bg-black/20"></div>
                      </div>
                    </div>
                    
                    <div className="coach-door left-door absolute w-[15px] h-[35px] top-[15px] left-[15px] bg-blue-700 rounded">
                      <div className="door-window absolute top-[5px] left-[2px] right-[2px] h-[12px] bg-blue-200 rounded"></div>
                    </div>
                    <div className="coach-door right-door absolute w-[15px] h-[35px] top-[15px] right-[15px] bg-blue-700 rounded">
                      <div className="door-window absolute top-[5px] left-[2px] right-[2px] h-[12px] bg-blue-200 rounded"></div>
                    </div>
                    
                    <div className="coach-number absolute bottom-[5px] left-[10px] p-[2px_5px] text-[10px] text-white bg-blue-800 rounded scale-x-[-1]">AC-01</div>
                    
                    <div className="coach-wheels absolute bottom-[-12px] w-full flex justify-around px-[20px]">
                      <div className="coach-wheel w-[20px] h-[20px] bg-gray-800 border-2 border-gray-600 rounded-full animate-wheel-turn-ltr">
                        {/* Add white lines to coach wheels */}
                        <div className="wheel-line absolute top-[50%] left-0 right-0 h-[1px] bg-white transform translate-y-[-50%]"></div>
                        <div className="wheel-line absolute top-0 bottom-0 left-[50%] w-[1px] bg-white transform translate-x-[-50%]"></div>
                      </div>
                      <div className="coach-wheel w-[20px] h-[20px] bg-gray-800 border-2 border-gray-600 rounded-full animate-wheel-turn-ltr">
                        {/* Add white lines to coach wheels */}
                        <div className="wheel-line absolute top-[50%] left-0 right-0 h-[1px] bg-white transform translate-y-[-50%]"></div>
                        <div className="wheel-line absolute top-0 bottom-0 left-[50%] w-[1px] bg-white transform translate-x-[-50%]"></div>
                      </div>
                      <div className="coach-wheel w-[20px] h-[20px] bg-gray-800 border-2 border-gray-600 rounded-full animate-wheel-turn-ltr">
                        {/* Add white lines to coach wheels */}
                        <div className="wheel-line absolute top-[50%] left-0 right-0 h-[1px] bg-white transform translate-y-[-50%]"></div>
                        <div className="wheel-line absolute top-0 bottom-0 left-[50%] w-[1px] bg-white transform translate-x-[-50%]"></div>
                      </div>
                      <div className="coach-wheel w-[20px] h-[20px] bg-gray-800 border-2 border-gray-600 rounded-full animate-wheel-turn-ltr">
                        {/* Add white lines to coach wheels */}
                        <div className="wheel-line absolute top-[50%] left-0 right-0 h-[1px] bg-white transform translate-y-[-50%]"></div>
                        <div className="wheel-line absolute top-0 bottom-0 left-[50%] w-[1px] bg-white transform translate-x-[-50%]"></div>
                      </div>
                    </div>
                    
                    {/* Coach couplings - aligned with engine coupling */}
                    <div className="coupling-system flex items-center absolute left-[-12px] top-[35px]">
                      <div className="coupling-chain w-[6px] h-[2px] bg-gray-500 absolute left-[-6px]"></div>
                      <div className="coupling-front w-[16px] h-[6px] bg-gray-600 rounded-l"></div>
                    </div>
                    <div className="coupling-system flex items-center absolute right-[-12px] top-[35px]">
                      <div className="coupling-rear w-[16px] h-[6px] bg-gray-600 rounded-r"></div>
                      <div className="coupling-chain w-[6px] h-[2px] bg-gray-500 absolute right-[-6px]"></div>
                    </div>
                  </div>
                </div>
                
                <div className="train-coach absolute right-[430px] bottom-0 scale-x-[-1]">
                  <div className="coach-body red-coach relative w-[160px] h-[70px] bg-red-600 rounded-md">
                    <div className="coach-roof absolute top-[-4px] left-0 right-0 h-[4px] bg-red-700 rounded-t-md"></div>
                    <div className="coach-stripe absolute top-[10px] left-0 right-0 h-[2px] bg-yellow-400"></div>
                    
                    <div className="coach-windows flex justify-around absolute top-[20px] left-[15px] right-[15px]">
                      <div className="coach-window w-[20px] h-[20px] bg-blue-200 border-2 border-red-700 rounded relative">
                        <div className="window-frame absolute top-1/2 left-0 w-full h-[1px] bg-black/20"></div>
                      </div>
                      <div className="coach-window w-[20px] h-[20px] bg-blue-200 border-2 border-red-700 rounded relative">
                        <div className="window-frame absolute top-1/2 left-0 w-full h-[1px] bg-black/20"></div>
                      </div>
                      <div className="coach-window w-[20px] h-[20px] bg-blue-200 border-2 border-red-700 rounded relative">
                        <div className="window-frame absolute top-1/2 left-0 w-full h-[1px] bg-black/20"></div>
                      </div>
                      <div className="coach-window w-[20px] h-[20px] bg-blue-200 border-2 border-red-700 rounded relative">
                        <div className="window-frame absolute top-1/2 left-0 w-full h-[1px] bg-black/20"></div>
                      </div>
                      <div className="coach-window w-[20px] h-[20px] bg-blue-200 border-2 border-red-700 rounded relative">
                        <div className="window-frame absolute top-1/2 left-0 w-full h-[1px] bg-black/20"></div>
                      </div>
                    </div>
                    
                    <div className="coach-door left-door absolute w-[15px] h-[35px] top-[15px] left-[15px] bg-red-700 rounded">
                      <div className="door-window absolute top-[5px] left-[2px] right-[2px] h-[12px] bg-blue-200 rounded"></div>
                    </div>
                    <div className="coach-door right-door absolute w-[15px] h-[35px] top-[15px] right-[15px] bg-red-700 rounded">
                      <div className="door-window absolute top-[5px] left-[2px] right-[2px] h-[12px] bg-blue-200 rounded"></div>
                    </div>
                    
                    <div className="coach-number absolute bottom-[5px] left-[10px] p-[2px_5px] text-[10px] text-white bg-red-800 rounded scale-x-[-1]">S-04</div>
                    
                    <div className="coach-wheels absolute bottom-[-12px] w-full flex justify-around px-[20px]">
                      <div className="coach-wheel w-[20px] h-[20px] bg-gray-800 border-2 border-gray-600 rounded-full animate-wheel-turn-ltr">
                        {/* Add white lines to coach wheels */}
                        <div className="wheel-line absolute top-[50%] left-0 right-0 h-[1px] bg-white transform translate-y-[-50%]"></div>
                        <div className="wheel-line absolute top-0 bottom-0 left-[50%] w-[1px] bg-white transform translate-x-[-50%]"></div>
                      </div>
                      <div className="coach-wheel w-[20px] h-[20px] bg-gray-800 border-2 border-gray-600 rounded-full animate-wheel-turn-ltr">
                        {/* Add white lines to coach wheels */}
                        <div className="wheel-line absolute top-[50%] left-0 right-0 h-[1px] bg-white transform translate-y-[-50%]"></div>
                        <div className="wheel-line absolute top-0 bottom-0 left-[50%] w-[1px] bg-white transform translate-x-[-50%]"></div>
                      </div>
                      <div className="coach-wheel w-[20px] h-[20px] bg-gray-800 border-2 border-gray-600 rounded-full animate-wheel-turn-ltr">
                        {/* Add white lines to coach wheels */}
                        <div className="wheel-line absolute top-[50%] left-0 right-0 h-[1px] bg-white transform translate-y-[-50%]"></div>
                        <div className="wheel-line absolute top-0 bottom-0 left-[50%] w-[1px] bg-white transform translate-x-[-50%]"></div>
                      </div>
                      <div className="coach-wheel w-[20px] h-[20px] bg-gray-800 border-2 border-gray-600 rounded-full animate-wheel-turn-ltr">
                        {/* Add white lines to coach wheels */}
                        <div className="wheel-line absolute top-[50%] left-0 right-0 h-[1px] bg-white transform translate-y-[-50%]"></div>
                        <div className="wheel-line absolute top-0 bottom-0 left-[50%] w-[1px] bg-white transform translate-x-[-50%]"></div>
                      </div>
                    </div>
                    
                    {/* Coach couplings - aligned with other couplings */}
                    <div className="coupling-system flex items-center absolute left-[-12px] top-[35px]">
                      <div className="coupling-chain w-[6px] h-[2px] bg-gray-500 absolute left-[-6px]"></div>
                      <div className="coupling-front w-[16px] h-[6px] bg-gray-600 rounded-l"></div>
                    </div>
                    <div className="coupling-system flex items-center absolute right-[-12px] top-[35px]">
                      <div className="coupling-rear w-[16px] h-[6px] bg-gray-600 rounded-r"></div>
                      <div className="coupling-chain w-[6px] h-[2px] bg-gray-500 absolute right-[-6px]"></div>
                    </div>
                  </div>
                </div>
                
                <div className="train-coach absolute right-[610px] bottom-0 scale-x-[-1]">
                  <div className="coach-body green-coach relative w-[160px] h-[70px] bg-green-600 rounded-md">
                    <div className="coach-roof absolute top-[-4px] left-0 right-0 h-[4px] bg-green-700 rounded-t-md"></div>
                    <div className="coach-stripe absolute top-[10px] left-0 right-0 h-[2px] bg-yellow-400"></div>
                    
                    <div className="coach-windows flex justify-around absolute top-[20px] left-[15px] right-[15px]">
                      <div className="coach-window w-[20px] h-[20px] bg-blue-200 border-2 border-green-700 rounded relative">
                        <div className="window-frame absolute top-1/2 left-0 w-full h-[1px] bg-black/20"></div>
                      </div>
                      <div className="coach-window w-[20px] h-[20px] bg-blue-200 border-2 border-green-700 rounded relative">
                        <div className="window-frame absolute top-1/2 left-0 w-full h-[1px] bg-black/20"></div>
                      </div>
                      <div className="coach-window w-[20px] h-[20px] bg-blue-200 border-2 border-green-700 rounded relative">
                        <div className="window-frame absolute top-1/2 left-0 w-full h-[1px] bg-black/20"></div>
                      </div>
                      <div className="coach-window w-[20px] h-[20px] bg-blue-200 border-2 border-green-700 rounded relative">
                        <div className="window-frame absolute top-1/2 left-0 w-full h-[1px] bg-black/20"></div>
                      </div>
                      <div className="coach-window w-[20px] h-[20px] bg-blue-200 border-2 border-green-700 rounded relative">
                        <div className="window-frame absolute top-1/2 left-0 w-full h-[1px] bg-black/20"></div>
                      </div>
                    </div>
                    
                    <div className="coach-door left-door absolute w-[15px] h-[35px] top-[15px] left-[15px] bg-green-700 rounded">
                      <div className="door-window absolute top-[5px] left-[2px] right-[2px] h-[12px] bg-blue-200 rounded"></div>
                    </div>
                    <div className="coach-door right-door absolute w-[15px] h-[35px] top-[15px] right-[15px] bg-green-700 rounded">
                      <div className="door-window absolute top-[5px] left-[2px] right-[2px] h-[12px] bg-blue-200 rounded"></div>
                    </div>
                    
                    <div className="coach-number absolute bottom-[5px] left-[10px] p-[2px_5px] text-[10px] text-white bg-green-800 rounded scale-x-[-1]">GN-09</div>
                    
                    <div className="coach-wheels absolute bottom-[-12px] w-full flex justify-around px-[20px]">
                      <div className="coach-wheel w-[20px] h-[20px] bg-gray-800 border-2 border-gray-600 rounded-full animate-wheel-turn-ltr">
                        {/* Add white lines to coach wheels */}
                        <div className="wheel-line absolute top-[50%] left-0 right-0 h-[1px] bg-white transform translate-y-[-50%]"></div>
                        <div className="wheel-line absolute top-0 bottom-0 left-[50%] w-[1px] bg-white transform translate-x-[-50%]"></div>
                      </div>
                      <div className="coach-wheel w-[20px] h-[20px] bg-gray-800 border-2 border-gray-600 rounded-full animate-wheel-turn-ltr">
                        {/* Add white lines to coach wheels */}
                        <div className="wheel-line absolute top-[50%] left-0 right-0 h-[1px] bg-white transform translate-y-[-50%]"></div>
                        <div className="wheel-line absolute top-0 bottom-0 left-[50%] w-[1px] bg-white transform translate-x-[-50%]"></div>
                      </div>
                      <div className="coach-wheel w-[20px] h-[20px] bg-gray-800 border-2 border-gray-600 rounded-full animate-wheel-turn-ltr">
                        {/* Add white lines to coach wheels */}
                        <div className="wheel-line absolute top-[50%] left-0 right-0 h-[1px] bg-white transform translate-y-[-50%]"></div>
                        <div className="wheel-line absolute top-0 bottom-0 left-[50%] w-[1px] bg-white transform translate-x-[-50%]"></div>
                      </div>
                      <div className="coach-wheel w-[20px] h-[20px] bg-gray-800 border-2 border-gray-600 rounded-full animate-wheel-turn-ltr">
                        {/* Add white lines to coach wheels */}
                        <div className="wheel-line absolute top-[50%] left-0 right-0 h-[1px] bg-white transform translate-y-[-50%]"></div>
                        <div className="wheel-line absolute top-0 bottom-0 left-[50%] w-[1px] bg-white transform translate-x-[-50%]"></div>
                      </div>
                    </div>
                    
                    {/* Coach couplings - aligned with other couplings */}
                    <div className="coupling-system flex items-center absolute left-[-12px] top-[35px]">
                      <div className="coupling-chain w-[6px] h-[2px] bg-gray-500 absolute left-[-6px]"></div>
                      <div className="coupling-front w-[16px] h-[6px] bg-gray-600 rounded-l"></div>
                    </div>
                    <div className="coupling-system flex items-center absolute right-[-12px] top-[35px]">
                      <div className="coupling-rear w-[16px] h-[6px] bg-gray-600 rounded-r"></div>
                      <div className="coupling-chain w-[6px] h-[2px] bg-gray-500 absolute right-[-6px]"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Railway tracks */}
              <div className="tracks absolute bottom-[10px] w-full">
                <div className="sleepers flex justify-between w-full">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="sleeper w-[30px] h-[8px] bg-amber-900 rounded m-[0_20px] transform perspective-[100px] rotate-x-[45deg]"></div>
                  ))}
                </div>
                <div className="rails absolute bottom-[12px] w-full flex justify-between px-[50px]">
                  <div className="rail w-full h-[3px] bg-gray-500"></div>
                  <div className="rail w-full h-[3px] bg-gray-500"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Navigation Section */}
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 mb-8`}>
        <h2 className="text-xl font-semibold mb-5 flex items-center">
          <Train className="mr-2 h-5 w-5 text-indigo-600" /> Quick Navigation
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {quickLinks.map((link, index) => (
            <Link
              key={index}
              to={link.path}
              className={`flex flex-col items-center justify-center p-4 rounded-lg transition-transform hover:scale-105 ${
                isDark 
                  ? 'bg-gray-700 hover:bg-gray-600' 
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className={`p-3 rounded-full mb-2 ${isDark ? 'bg-gray-600' : 'bg-indigo-100'}`}>
                {React.cloneElement(link.icon, { className: 'h-6 w-6 text-indigo-600' })}
              </div>
              <span className="text-sm text-center">{link.text}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Enhanced Search Section with Results */}
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 mb-8`}>
        <div className="flex items-center mb-4">
          <Search className="h-5 w-5 text-indigo-600 mr-2" />
          <h2 className="text-xl font-semibold">Search Your Complaints</h2>
        </div>
        
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Enter PNR, complaint ID, or train number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'border-gray-200 focus:border-indigo-500'
              } focus:ring-2 focus:ring-indigo-200 transition-colors`}
              disabled={isSearching}
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSearching ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Search className="h-5 w-5" />
            )
            }
            <span>{isSearching ? 'Searching...' : 'Search'}</span>
          </button>
        </form>

        {/* Search Error */}
        {searchError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
            {searchError}
          </div>
        )}

        {/* Search Results */}
        {showResults && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">
                Search Results ({searchResults.length} found)
              </h3>
              <button
                onClick={() => setShowResults(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            
            {searchResults.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {searchResults.map((complaint) => (
                  <div
                    key={complaint.complaint_id}
                    onClick={() => handleComplaintClick(complaint.complaint_id)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 hover:bg-gray-650' 
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-lg">Complaint ID: {complaint.id}</h4>
                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          PNR: {complaint.pnr_number} | Train: {complaint.train_number}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                          {complaint.status}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(complaint.severity)}`}>
                          {complaint.severity}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                        <span className="font-medium">Type:</span> {complaint.type}
                      </p>
                      <p className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                        <span className="font-medium">Location:</span> {complaint.location}
                      </p>
                      <p className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                        <span className="font-medium">Description:</span> {
                          complaint.description.length > 150 
                            ? `${complaint.description.substring(0, 150)}...` 
                            : complaint.description
                        }
                      </p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        <span className="font-medium">Date:</span> {new Date(complaint.date_of_incident).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="mt-3 flex items-center text-indigo-600 text-sm">
                      <span>Click to view details</span>
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                  No complaints found matching "{searchQuery}"
                </p>
                <p className={`text-sm mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  Try searching with PNR number, complaint ID, or train number
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Features Section with improved styling */}
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-8 mb-8`}>
        <h2 className="text-2xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">
          How Rail Madad Can Help You
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className={`${isDark ? 'bg-gray-700 hover:bg-gray-650' : 'bg-indigo-50 hover:bg-indigo-100'} p-6 rounded-xl text-center transition-all hover:shadow-lg cursor-pointer transform hover:-translate-y-1`}>
            <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center mx-auto mb-4 shadow-md`}>
              <FileText className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">File Complaints</h3>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Easily submit your concerns about train services, staff, or amenities with quick resolution.
            </p>
          </div>

          <div className={`${isDark ? 'bg-gray-700 hover:bg-gray-650' : 'bg-indigo-50 hover:bg-indigo-100'} p-6 rounded-xl text-center transition-all hover:shadow-lg cursor-pointer transform hover:-translate-y-1`}>
            <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mx-auto mb-4 shadow-md`}>
              <BarChart2 className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Track Status</h3>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Monitor the progress of your complaints in real-time with detailed updates.
            </p>
          </div>

          <div className={`${isDark ? 'bg-gray-700 hover:bg-gray-650' : 'bg-indigo-50 hover:bg-indigo-100'} p-6 rounded-xl text-center transition-all hover:shadow-lg cursor-pointer transform hover:-translate-y-1`}>
            <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-md`}>
              <Headphones className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Real-time Support</h3>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Connect with support agents via chat, voice, or video for immediate assistance.
            </p>
          </div>

          <div className={`${isDark ? 'bg-gray-700 hover:bg-gray-650' : 'bg-indigo-50 hover:bg-indigo-100'} p-6 rounded-xl text-center transition-all hover:shadow-lg cursor-pointer transform hover:-translate-y-1`}>
            <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mx-auto mb-4 shadow-md`}>
              <Globe className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Multi-lingual</h3>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Access services in 10+ Indian languages for your convenience.
            </p>
          </div>
        </div>
      </div>

      {/* Popular Routes Section - New addition */}
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 mb-8`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold flex items-center">
            <Clock className="mr-2 h-5 w-5 text-indigo-600" /> Popular Train Routes
          </h2>
          <Link to="/routes" className="text-indigo-600 flex items-center text-sm hover:underline">
            View All Routes <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {commonRoutes.map((route, index) => (
            <div 
              key={index}
              className={`p-4 rounded-lg ${
                isDark 
                  ? 'bg-gray-700' 
                  : 'bg-gray-50'
              } hover:shadow-md transition-shadow`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{route.from}</span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
                <span className="font-medium">{route.to}</span>
              </div>
              <div className="flex items-center text-sm">
                <Train className="h-4 w-4 mr-1 text-indigo-500" />
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{route.train}</span>
              </div>
              <div className="mt-2 text-sm flex items-center">
                <Clock className="h-4 w-4 mr-1 text-green-500" />
                <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{route.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Contact Section - New addition */}
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
        <div className="flex items-center mb-4">
          <PhoneCall className="h-5 w-5 text-red-500 mr-2" />
          <h2 className="text-xl font-semibold">Emergency Contacts</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-red-900/30' : 'bg-red-50'} flex items-center`}>
            <div className="p-3 rounded-full bg-red-100 mr-3">
              <PhoneCall className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <h3 className="font-medium">Railway Helpline</h3>
              <p className="text-lg font-bold">139</p>
            </div>
          </div>
          
          <div className={`p-4 rounded-lg ${isDark ? 'bg-blue-900/30' : 'bg-blue-50'} flex items-center`}>
            <div className="p-3 rounded-full bg-blue-100 mr-3">
              <PhoneCall className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-medium">Security Helpline</h3>
              <p className="text-lg font-bold">182</p>
            </div>
          </div>
          
          <div className={`p-4 rounded-lg ${isDark ? 'bg-green-900/30' : 'bg-green-50'} flex items-center`}>
            <div className="p-3 rounded-full bg-green-100 mr-3">
              <PhoneCall className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <h3 className="font-medium">Medical Emergency</h3>
              <p className="text-lg font-bold">+91 11 2338 4787</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Enhanced CSS for animations with improved smoke effects */}
      <style>
  {`
  @keyframes train-move-ltr {
    0% { transform: translateX(-100%); } 
    100% { transform: translateX(100%); } 
  }

  @keyframes wheel-turn-ltr {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(-360deg); }
  }

  @keyframes smoke-1 {
    0% { opacity: 0.9; transform: translateY(0) scale(1); }
    100% { opacity: 0; transform: translateY(-50px) scale(1.5); }
  }

  @keyframes smoke-2 {
    0% { opacity: 0.7; transform: translateY(0) scale(0.8); }
    100% { opacity: 0; transform: translateY(-40px) scale(1.2); }
  }

  @keyframes smoke-3 {
    0% { opacity: 0.5; transform: translateY(0) scale(0.6); }
    100% { opacity: 0; transform: translateY(-30px) scale(1); }
  }

  @keyframes smoke-4 {
    0% { opacity: 0.8; transform: translateY(0) scale(0.7); }
    100% { opacity: 0; transform: translateY(-60px) scale(1.4); }
  }

  @keyframes smoke-5 {
    0% { opacity: 0.5; transform: translateY(0) scale(0.9); }
    100% { opacity: 0; transform: translateY(-70px) scale(1.5); }
  }

  @keyframes glow {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }

  @keyframes twinkle-1 {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 1; }
  }

  @keyframes twinkle-2 {
    0%, 100% { opacity: 0.5; }
    30% { opacity: 1; }
  }

  @keyframes twinkle-3 {
    0%, 100% { opacity: 0.7; }
    70% { opacity: 1; }
  }

  .animate-twinkle-1 {
    animation: twinkle-1 2s ease-in-out infinite;
  }

  .animate-twinkle-2 {
    animation: twinkle-2 2.5s ease-in-out infinite;
  }

  .animate-twinkle-3 {
    animation: twinkle-3 3s ease-in-out infinite;
  }

  .animate-train-move-ltr {
    animation: train-move-ltr 10s linear infinite;
  }

  .animate-wheel-turn-ltr {
    animation: wheel-turn-ltr 1s linear infinite;
  }

  .animate-smoke-1 {
    animation: smoke-1 0.8s ease-out infinite;
  }

  .animate-smoke-2 {
    animation: smoke-2 1s ease-out infinite 0.15s;
  }

  .animate-smoke-3 {
    animation: smoke-3 1.2s ease-out infinite 0.3s;
  }

  .animate-smoke-4 {
    animation: smoke-4 1.4s ease-out infinite 0.45s;
  }

  .animate-smoke-5 {
    animation: smoke-5 1.6s ease-out infinite 0.6s;
  }

  .animate-glow {
    animation: glow 1.5s ease-in-out infinite;
  }

  /* Mobile responsive improvements with faster speeds */
  @media (max-width: 768px) {
    .train-container {
      animation: train-move-ltr 8s linear infinite;
    }
    
    .scene {
      overflow-x: hidden;
    }
  }
  
  @media (max-width: 480px) {
    .train-container {
      animation: train-move-ltr 6s linear infinite;
    }
  }

  .bg-gray-650 {
    background-color: #2d3748;
  }
  `}
</style>

    </div>
  );
};

export default Home;