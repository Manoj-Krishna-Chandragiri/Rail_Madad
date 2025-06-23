import { Brain, Search, Filter, BarChart2 } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

interface Complaint {
  id: string;
  text: string;
  category: string;
  confidence: number;
  timestamp: string;
  status: string;
}

const SmartClassification = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { theme } = useTheme();

  const complaints: Complaint[] = [
    {
      id: '1',
      text: 'AC not working in coach B4',
      category: 'Electrical Equipment',
      confidence: 0.95,
      timestamp: '2024-03-10 14:30',
      status: 'Classified'
    },
    {
      id: '2',
      text: 'Food quality is poor in Rajdhani Express',
      category: 'Catering / Vending Services',
      confidence: 0.88,
      timestamp: '2024-03-10 15:45',
      status: 'Pending Review'
    },
    {
      id: '3',
      text: 'Cleanliness issues in washroom',
      category: 'Coach - Cleanliness',
      confidence: 0.92,
      timestamp: '2024-03-10 16:20',
      status: 'Classified'
    }
  ];

  const categories = [
    'Coach - Maintenance/Facilities',
    'Electrical Equipment',
    'Medical Assistance',
    'Catering / Vending Services',
    'Passengers Behaviour',
    'Water Availability',
    'Punctuality',
    'Security',
    'Unreserved / Reserved Ticketing',
    'Coach - Cleanliness',
    'Staff Behaviour',
    'Refund of Tickets',
    'Passenger Amenities',
    'Bed Roll',
    'Corruption / Bribery',
    'Miscellaneous'
  ];

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || complaint.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className={`${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-lg p-6`}>
        <div className="flex items-center gap-3 mb-8">
          <Brain className="h-8 w-8 text-indigo-400" />
          <h1 className="text-2xl font-semibold">Smart Classification System</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-indigo-50'} p-6 rounded-lg`}>
            <h3 className="text-lg font-semibold mb-2">Classification Accuracy</h3>
            <div className="text-3xl font-bold text-indigo-400">92.5%</div>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Last 24 hours</p>
          </div>
          
          <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-green-50'} p-6 rounded-lg`}>
            <h3 className="text-lg font-semibold mb-2">Processed Complaints</h3>
            <div className="text-3xl font-bold text-green-400">1,234</div>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Today</p>
          </div>
          
          <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-yellow-50'} p-6 rounded-lg`}>
            <h3 className="text-lg font-semibold mb-2">Pending Review</h3>
            <div className="text-3xl font-bold text-yellow-400">45</div>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Requires attention</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search complaints..."
                className={`w-full pl-10 pr-4 py-2 border rounded-lg ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300'
                }`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select
              className={`px-4 py-2 border rounded-lg ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300'
              }`}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              <Filter className="h-5 w-5" />
              Advanced Filters
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>ID</th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Complaint Text</th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Category</th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Confidence</th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Timestamp</th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Status</th>
              </tr>
            </thead>
            <tbody className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {filteredComplaints.map((complaint) => (
                <tr key={complaint.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{complaint.id}</td>
                  <td className="px-6 py-4">{complaint.text}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      theme === 'dark' ? 'bg-indigo-900 text-indigo-200' : 'bg-indigo-100 text-indigo-800'
                    }`}>
                      {complaint.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                        {(complaint.confidence * 100).toFixed(1)}%
                      </span>
                      <div className={`ml-2 w-24 h-2 ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'} rounded-full`}>
                        <div
                          className="h-full bg-indigo-600 rounded-full"
                          style={{ width: `${complaint.confidence * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{complaint.timestamp}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        complaint.status === 'Classified'
                          ? theme === 'dark' ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
                          : theme === 'dark' ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {complaint.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8">
          <div className="flex items-center gap-3 mb-4">
            <BarChart2 className="h-6 w-6 text-indigo-400" />
            <h2 className="text-xl font-semibold">Classification Analytics</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className="text-lg font-semibold mb-4">Category Distribution</h3>
              <div className={`h-64 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg flex items-center justify-center`}>
                [Category Distribution Chart]
              </div>
            </div>
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className="text-lg font-semibold mb-4">Confidence Trends</h3>
              <div className={`h-64 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg flex items-center justify-center`}>
                [Confidence Trend Chart]
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartClassification;