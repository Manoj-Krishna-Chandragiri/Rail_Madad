import { useState, useRef, useEffect } from 'react';
import { 
  HelpCircle, 
  Book, 
  Phone, 
  Mail, 
  FileText, 
  BarChart2, 
  Bot, 
  Headphones, 
  Globe, 
  Settings, 
  User, 
  Shield,
  Search,
  ChevronDown,
  ExternalLink,
  MessageCircle,
  Download,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  FileVideo,
  BookOpen,
  Zap,
  X
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { documentationData, faqData } from '../data/documentationData';
import DocumentationModal from '../components/DocumentationModal';

const Help = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('relevance');
  const [faqPage, setFaqPage] = useState(1);
  const [docsPage, setDocsPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Add ref for contact information section
  const contactInfoRef = useRef<HTMLDivElement>(null);

  // Pagination settings
  const FAQS_PER_PAGE = 5;
  const DOCS_PER_PAGE = 6;

  // Reset pagination when search/filter changes
  useEffect(() => {
    setFaqPage(1);
    setDocsPage(1);
  }, [searchTerm, selectedCategory]);

  const iconMap: { [key: string]: any } = {
    FileText,
    BarChart2,
    Bot,
    Headphones,
    Globe,
    Settings,
    User,
    Shield
  };

  // Enhanced categories for better organization
  const categories = [
    { id: 'all', name: 'All Topics', icon: BookOpen },
    { id: 'getting-started', name: 'Getting Started', icon: PlayCircle },
    { id: 'complaints', name: 'Complaints', icon: AlertCircle },
    { id: 'support', name: 'Live Support', icon: Headphones },
    { id: 'features', name: 'Smart Features', icon: Zap },
    { id: 'account', name: 'Account & Security', icon: Shield },
    { id: 'mobile', name: 'Mobile Experience', icon: Globe }
  ];

  // Help resources with ratings and difficulty
  const helpResources = [
    {
      title: 'Video Tutorials',
      description: 'Step-by-step video guides for common tasks',
      icon: FileVideo,
      type: 'video',
      count: 12,
      rating: 4.8,
      onClick: () => navigate('/tutorials')
    },
    {
      title: 'PDF Guides',
      description: 'Downloadable comprehensive documentation',
      icon: Download,
      type: 'download',
      count: 8,
      rating: 4.6,
      onClick: () => window.open('/guides/rail-madad-guide.pdf', '_blank')
    },
    {
      title: 'Quick Tips',
      description: 'Instant solutions for common issues',
      icon: Zap,
      type: 'tips',
      count: 25,
      rating: 4.9,
      onClick: () => navigate('/quick-tips')
    },
    {
      title: 'Community Forum',
      description: 'Connect with other users and experts',
      icon: MessageCircle,
      type: 'community',
      count: 156,
      rating: 4.5,
      onClick: () => window.open('https://forum.railmadad.in', '_blank')
    }
  ];

  const openDocumentation = (doc: any) => {
    setSelectedDoc(doc);
    setIsModalOpen(true);
  };

  // Add function to handle contact support redirect
  const handleContactSupport = () => {
    // Scroll to contact information section
    contactInfoRef.current?.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    });
  };

  const handleQuickAction = (action: string) => {
    setIsLoading(true);
    
    // Simulate loading delay for better UX
    setTimeout(() => {
      switch (action) {
        case 'documentation':
          // Show all documentation - open the first one as example
          if (documentationData.length > 0) {
            openDocumentation(documentationData[0]);
          }
          break;
        case 'chat':
          navigate('/user-dashboard/real-time-support');
          break;
        case 'call':
          window.open('tel:139', '_self');
          break;
        case 'emergency':
          window.open('tel:182', '_self');
          break;
        default:
          break;
      }
      setIsLoading(false);
    }, 500);
  };

  // Enhanced filtering and sorting with pagination
  const filteredFaqs = faqData.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'alphabetical') {
      return a.question.localeCompare(b.question);
    }
    return 0; // relevance sorting (default order)
  });

  // Paginated FAQs
  const paginatedFaqs = filteredFaqs.slice(
    (faqPage - 1) * FAQS_PER_PAGE,
    faqPage * FAQS_PER_PAGE
  );

  const totalFaqPages = Math.ceil(filteredFaqs.length / FAQS_PER_PAGE);

  const filteredDocs = documentationData.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.id.includes(selectedCategory) || 
                           (selectedCategory === 'getting-started' && doc.id === 'getting-started') ||
                           (selectedCategory === 'complaints' && doc.id === 'filing-complaints') ||
                           (selectedCategory === 'support' && doc.id === 'live-support') ||
                           (selectedCategory === 'features' && doc.id === 'smart-features') ||
                           (selectedCategory === 'account' && (doc.id === 'account-settings' || doc.id === 'user-profile' || doc.id === 'security-privacy')) ||
                           (selectedCategory === 'mobile' && doc.id === 'mobile-app');
    return matchesSearch && matchesCategory;
  });

  // Paginated Docs
  const paginatedDocs = filteredDocs.slice(
    (docsPage - 1) * DOCS_PER_PAGE,
    docsPage * DOCS_PER_PAGE
  );

  const totalDocsPages = Math.ceil(filteredDocs.length / DOCS_PER_PAGE);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className={`${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-lg p-6`}>
        <div className="flex items-center gap-3 mb-8">
          <HelpCircle className="h-8 w-8 text-indigo-400" />
          <div>
            <h1 className="text-2xl font-semibold">Help & Support Center</h1>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
              Find answers, tutorials, and get support for all your Rail Madad needs
            </p>
          </div>
        </div>

        {/* Enhanced Search Bar */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search help topics, FAQs, guides..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300'
                }`}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  title="Clear search"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
            
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300'
                }`}
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300'
                }`}
              >
                <option value="relevance">Sort by Relevance</option>
                <option value="alphabetical">Sort A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Help Resources */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Star className="h-6 w-6 text-yellow-500" />
            Popular Resources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {helpResources.map((resource, index) => {
              const IconComponent = resource.icon;
              return (
                <div
                  key={index}
                  onClick={resource.onClick}
                  className={`${
                    theme === 'dark' ? 'border-gray-700 bg-gray-700 hover:bg-gray-650' : 'border hover:bg-gray-50'
                  } rounded-lg p-6 cursor-pointer transition-all hover:shadow-lg transform hover:scale-105`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${
                      resource.type === 'video' ? 'bg-red-100 text-red-600' :
                      resource.type === 'download' ? 'bg-blue-100 text-blue-600' :
                      resource.type === 'tips' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{resource.rating}</span>
                    </div>
                  </div>
                  <h3 className="font-semibold mb-2">{resource.title}</h3>
                  <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-sm mb-3`}>
                    {resource.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {resource.count} items
                    </span>
                    <ExternalLink className="h-4 w-4 text-indigo-400" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Enhanced Quick Actions */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div 
              onClick={() => handleQuickAction('documentation')}
              className={`${
                theme === 'dark' ? 'border-gray-700 bg-gray-700' : 'border bg-gradient-to-br from-blue-50 to-indigo-50'
              } rounded-lg p-6 hover:shadow-lg transition-all cursor-pointer transform hover:scale-105`}
            >
              <Book className="h-8 w-8 text-indigo-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Documentation</h3>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-4 text-sm`}>
                Comprehensive guides covering all Rail Madad features and functionalities.
              </p>
              <div className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300">
                <span className="text-sm">Browse Documentation</span>
                <ExternalLink className="h-4 w-4" />
              </div>
            </div>

            <div 
              onClick={() => handleQuickAction('chat')}
              className={`${
                theme === 'dark' ? 'border-gray-700 bg-gray-700' : 'border bg-gradient-to-br from-green-50 to-emerald-50'
              } rounded-lg p-6 hover:shadow-lg transition-all cursor-pointer transform hover:scale-105`}
            >
              <MessageCircle className="h-8 w-8 text-green-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Live Chat Support</h3>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-4 text-sm`}>
                Get instant help from our support team through real-time chat.
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-green-500 hover:text-green-400">
                  <span className="text-sm">Start Chat</span>
                  <ExternalLink className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-500">Online</span>
                </div>
              </div>
            </div>

            <div 
              onClick={() => handleQuickAction('call')}
              className={`${
                theme === 'dark' ? 'border-gray-700 bg-gray-700' : 'border bg-gradient-to-br from-orange-50 to-amber-50'
              } rounded-lg p-6 hover:shadow-lg transition-all cursor-pointer transform hover:scale-105`}
            >
              <Phone className="h-8 w-8 text-orange-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Call Support</h3>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-4 text-sm`}>
                Speak directly with our support representatives for complex issues.
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-orange-500 hover:text-orange-400">
                  <span className="text-sm">Call Now: 139</span>
                  <ExternalLink className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <span className="text-xs text-orange-500">24/7</span>
                </div>
              </div>
            </div>

            <div 
              onClick={() => handleQuickAction('emergency')}
              className={`${
                theme === 'dark' ? 'border-gray-700 bg-gray-700' : 'border bg-gradient-to-br from-red-50 to-pink-50'
              } rounded-lg p-6 hover:shadow-lg transition-all cursor-pointer transform hover:scale-105`}
            >
              <AlertCircle className="h-8 w-8 text-red-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Emergency Help</h3>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-4 text-sm`}>
                Immediate assistance for urgent safety and security concerns.
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-red-500 hover:text-red-400">
                  <span className="text-sm">Emergency: 182</span>
                  <ExternalLink className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-1">
                  <AlertCircle className="h-4 w-4 text-red-500 animate-pulse" />
                  <span className="text-xs text-red-500">SOS</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Documentation Topics */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Documentation Topics</h2>
            <div className="flex items-center gap-2 text-sm">
              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                {filteredDocs.length} of {documentationData.length} topics
              </span>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-indigo-500 hover:text-indigo-400"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedDocs.map((doc) => {
              const IconComponent = iconMap[doc.icon];
              const isNew = ['smart-features', 'security-privacy'].includes(doc.id);
              const isPopular = ['getting-started', 'filing-complaints', 'live-support'].includes(doc.id);
              
              return (
                <div
                  key={doc.id}
                  onClick={() => openDocumentation(doc)}
                  className={`${
                    theme === 'dark' ? 'border-gray-700 bg-gray-700 hover:bg-gray-650' : 'border hover:bg-gray-50'
                  } rounded-lg p-6 cursor-pointer transition-all hover:shadow-lg transform hover:scale-105 relative overflow-hidden`}
                >
                  {/* Badges */}
                  <div className="absolute top-3 right-3 flex gap-1">
                    {isNew && (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        New
                      </span>
                    )}
                    {isPopular && (
                      <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                        Popular
                      </span>
                    )}
                  </div>
                  
                  <IconComponent className="h-8 w-8 text-indigo-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2 pr-16">{doc.title}</h3>
                  <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-sm mb-4`}>
                    {doc.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-indigo-400 text-sm">
                      <span>Read More</span>
                      <ExternalLink className="h-4 w-4" />
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-400">
                        {doc.sections.length * 2} min read
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Documentation Pagination */}
          {totalDocsPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setDocsPage(Math.max(1, docsPage - 1))}
                disabled={docsPage === 1}
                className={`px-3 py-2 rounded-lg ${
                  docsPage === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                Previous
              </button>
              
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalDocsPages) }, (_, i) => {
                  const page = Math.max(1, Math.min(totalDocsPages - 4, docsPage - 2)) + i;
                  return (
                    <button
                      key={page}
                      onClick={() => setDocsPage(page)}
                      className={`px-3 py-2 rounded-lg ${
                        page === docsPage
                          ? 'bg-indigo-600 text-white'
                          : theme === 'dark'
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setDocsPage(Math.min(totalDocsPages, docsPage + 1))}
                disabled={docsPage === totalDocsPages}
                className={`px-3 py-2 rounded-lg ${
                  docsPage === totalDocsPages
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                Next
              </button>
            </div>
          )}

          {/* Show message if no docs found */}
          {filteredDocs.length === 0 && searchTerm && (
            <div className="text-center py-12">
              <BookOpen className={`h-16 w-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-lg mb-2`}>
                No documentation found for "{searchTerm}"
              </p>
              <p className={`${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} text-sm mb-4`}>
                Try adjusting your search terms or browse all categories
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Show All Documentation
              </button>
            </div>
          )}
        </div>

        {/* Enhanced FAQ Section */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Frequently Asked Questions</h2>
            <div className="flex items-center gap-2 text-sm">
              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                {filteredFaqs.length} of {faqData.length} questions
              </span>
            </div>
          </div>
          
          <div className="space-y-4">
            {paginatedFaqs.map((faq, index) => {
              const actualIndex = (faqPage - 1) * FAQS_PER_PAGE + index;
              const isExpanded = expandedFaq === actualIndex;
              return (
                <div
                  key={actualIndex}
                  className={`${
                    theme === 'dark' ? 'border-gray-700 bg-gray-700' : 'border'
                  } rounded-lg overflow-hidden transition-all ${
                    isExpanded ? 'ring-2 ring-indigo-500 border-indigo-500' : ''
                  }`}
                >
                  <button
                    onClick={() => setExpandedFaq(isExpanded ? null : actualIndex)}
                    className={`w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center justify-between group`}
                  >
                    <span className="font-medium pr-4 group-hover:text-indigo-500 transition-colors">
                      {faq.question}
                    </span>
                    <div className="flex items-center gap-2">
                      {actualIndex < 5 && (
                        <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full">
                          Popular
                        </span>
                      )}
                      <ChevronDown
                        className={`h-5 w-5 text-gray-400 transition-transform group-hover:text-indigo-500 ${
                          isExpanded ? 'transform rotate-180' : ''
                        }`}
                      />
                    </div>
                  </button>
                  {isExpanded && (
                    <div className={`px-4 pb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <div className="space-y-2">
                            {faq.answer.split('\n').map((paragraph, pIndex) => (
                              <p key={pIndex} className="leading-relaxed">
                                {paragraph}
                              </p>
                            ))}
                            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
                              <span className="text-sm text-gray-500">Was this helpful?</span>
                              <div className="flex gap-2">
                                <button className="text-green-500 hover:text-green-600 text-sm">
                                  👍 Yes
                                </button>
                                <button className="text-red-500 hover:text-red-600 text-sm">
                                  👎 No
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* FAQ Pagination */}
          {totalFaqPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setFaqPage(Math.max(1, faqPage - 1))}
                disabled={faqPage === 1}
                className={`px-3 py-2 rounded-lg ${
                  faqPage === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                Previous
              </button>
              
              <div className="flex gap-1">
                {Array.from({ length: totalFaqPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setFaqPage(page)}
                    className={`px-3 py-2 rounded-lg ${
                      page === faqPage
                        ? 'bg-indigo-600 text-white'
                        : theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setFaqPage(Math.min(totalFaqPages, faqPage + 1))}
                disabled={faqPage === totalFaqPages}
                className={`px-3 py-2 rounded-lg ${
                  faqPage === totalFaqPages
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                Next
              </button>
            </div>
          )}

          {/* Show message if no FAQs found */}
          {filteredFaqs.length === 0 && searchTerm && (
            <div className="text-center py-12">
              <HelpCircle className={`h-16 w-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-lg mb-2`}>
                No FAQs found for "{searchTerm}"
              </p>
              <p className={`${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} text-sm mb-4`}>
                Can't find what you're looking for? Try contacting our support team.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setSearchTerm('')}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Show All FAQs
                </button>
                <button
                  onClick={handleContactSupport}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Contact Support
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Contact Information */}
        <div 
          ref={contactInfoRef}
          className={`p-6 ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
          } rounded-lg`}
        >
          <div className="flex items-center gap-3 mb-6">
            <Phone className="h-6 w-6 text-indigo-400" />
            <h2 className="text-xl font-semibold">Contact Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full ${theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                <Phone className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="font-semibold">Railway Helpline</p>
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
                  139 (Toll Free - 24/7)
                </p>
                <button
                  onClick={() => window.open('tel:139', '_self')}
                  className="text-blue-500 hover:text-blue-400 text-xs mt-1"
                >
                  Call Now →
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full ${theme === 'dark' ? 'bg-red-900/30' : 'bg-red-100'}`}>
                <Phone className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="font-semibold">Security Helpline</p>
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
                  182 (Emergency)
                </p>
                <button
                  onClick={() => window.open('tel:182', '_self')}
                  className="text-red-500 hover:text-red-400 text-xs mt-1"
                >
                  Emergency Call →
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full ${theme === 'dark' ? 'bg-indigo-900/30' : 'bg-indigo-100'}`}>
                <Mail className="h-6 w-6 text-indigo-500" />
              </div>
              <div>
                <p className="font-semibold">Email Support</p>
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
                  support@railmadad.in
                </p>
                <button
                  onClick={() => window.open('mailto:support@railmadad.in', '_self')}
                  className="text-indigo-500 hover:text-indigo-400 text-xs mt-1"
                >
                  Send Email →
                </button>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-500" />
                Office Hours
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">General Support</span>
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                    24/7
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Administrative Office</span>
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                    10:00 AM - 6:00 PM
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Weekend Support</span>
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                    Limited Hours
                  </span>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-blue-500" />
                Quick Links
              </h3>
              <div className="space-y-2 text-sm">
                <button
                  onClick={() => navigate('/user-dashboard/file-complaint')}
                  className="block w-full text-left text-blue-500 hover:text-blue-400"
                >
                  File a Complaint →
                </button>
                <button
                  onClick={() => navigate('/user-dashboard/track-status')}
                  className="block w-full text-left text-blue-500 hover:text-blue-400"
                >
                  Track Complaint Status →
                </button>
                <button
                  onClick={() => navigate('/user-dashboard/real-time-support')}
                  className="block w-full text-left text-blue-500 hover:text-blue-400"
                >
                  Start Live Chat →
                </button>
                <button
                  onClick={() => navigate('/user-dashboard/feedback-form')}
                  className="block w-full text-left text-blue-500 hover:text-blue-400"
                >
                  Provide Feedback →
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="text-sm">
                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                  Need immediate assistance? Our support team is here to help you 24/7.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/user-dashboard/real-time-support')}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  Start Chat
                </button>
                <button
                  onClick={() => window.open('tel:139', '_self')}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Phone className="h-4 w-4" />
                  Call Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Documentation Modal */}
        <DocumentationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={selectedDoc?.title || ''}
          content={selectedDoc?.sections || []}
          onContactSupport={handleContactSupport}
        />
      </div>
    </div>
  );
};

export default Help;