import { Clock, Search, MessageSquare } from 'lucide-react';
import { useEffect, useState } from 'react';
import apiClient from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import { getAuth } from 'firebase/auth';
import { useLocation, useNavigate } from 'react-router-dom';

interface ComplaintStatus {
  id: string;
  rawId: number;
  pnr: string;
  status: string;
  lastUpdated: string;
  description: string;
  assignedTo: string;
  staffId?: number;
  resolvedAt?: string;
  hasFeedback?: boolean;
}

const TrackStatus = () => {
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [complaints, setComplaints] = useState<ComplaintStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true);
        
        // Get Firebase auth token for API calls
        const auth = getAuth();
        const currentUser = auth.currentUser;
        
        if (!currentUser) {
          setError('Please log in to view your complaints');
          setLoading(false);
          return;
        }
        
        // Get the Firebase ID token
        const token = await currentUser.getIdToken();
        
        // Make API request with authorization header
        const response = await apiClient.get('/api/complaints/user/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const formatted = response.data.map((item: any) => ({
          id: `CMP${item.id.toString().padStart(3, '0')}`,
          rawId: item.id,
          pnr: item.pnr_number || 'N/A',
          status: item.status === 'Closed' ? 'Resolved' : item.status,
          lastUpdated: item.date_of_incident,
          description: item.description,
          assignedTo: item.staff || 'Unassigned',
          staffId: item.staff_id,
          resolvedAt: item.resolved_at,
          hasFeedback: item.has_feedback || false,
        }));

        setComplaints(formatted);
        setLoading(false);
        
      } catch (error) {
        console.error('Failed to fetch complaints:', error);
        setError('Failed to load complaints. Please try again later.');
        setLoading(false);
      }
    };

    fetchComplaints();

    // Check if we came from a search result
    if (location.state?.searchComplaintId) {
      const complaintId = location.state.searchComplaintId;
      setSearchQuery(`CMP${complaintId.toString().padStart(3, '0')}`);
    }
  }, [location.state]);

  const filteredComplaints = complaints.filter((complaint) =>
    complaint.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    complaint.pnr.toLowerCase().includes(searchQuery.toLowerCase()) ||
    complaint.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div
        className={`${
          theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'
        } rounded-lg shadow-lg p-6`}
      >
        <div className="flex items-center gap-3 mb-8">
          <Clock className="h-8 w-8 text-indigo-400" />
          <h1 className="text-2xl font-semibold">Track Complaint Status</h1>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
              Loading your complaints...
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by Complaint ID or PNR number..."
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-6">
              {filteredComplaints.length > 0 ? (
                filteredComplaints.map((complaint) => (
                  <div
                    key={complaint.id}
                    className={`${
                      theme === 'dark' ? 'border-gray-700 bg-gray-700' : 'border'
                    } rounded-lg p-6`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">
                          Complaint ID: {complaint.id}
                        </h3>
                        <p
                          className={
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                          }
                        >
                          PNR: {complaint.pnr}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          complaint.status === 'Resolved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {complaint.status}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <p
                        className={
                          theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                        }
                      >
                        <span className="font-medium">Description:</span>{' '}
                        {complaint.description}
                      </p>
                      <p
                        className={
                          theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                        }
                      >
                        <span className="font-medium">Assigned To:</span>{' '}
                        {complaint.assignedTo}
                      </p>
                      <p
                        className={
                          theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                        }
                      >
                        <span className="font-medium">Last Updated:</span>{' '}
                        {complaint.lastUpdated}
                      </p>
                      
                      {/* Show feedback button for resolved complaints */}
                      {complaint.status === 'Resolved' && !complaint.hasFeedback && (
                        <div className="mt-4 pt-4 border-t border-gray-600">
                          <button
                            onClick={() => navigate(`/user-dashboard/feedback-form/${complaint.rawId}`, { 
                              state: { 
                                complaintId: complaint.rawId,
                                staffId: complaint.staffId,
                                staffName: complaint.assignedTo
                              } 
                            })}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                          >
                            <MessageSquare className="h-4 w-4" />
                            Give Feedback
                          </button>
                          <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            Share your experience and rate the resolution
                          </p>
                        </div>
                      )}
                      
                      {complaint.hasFeedback && (
                        <div className="mt-4 pt-4 border-t border-gray-600">
                          <p className={`text-sm ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                            ✓ Feedback submitted
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p
                    className={
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }
                  >
                    You haven't filed any complaints yet.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TrackStatus;