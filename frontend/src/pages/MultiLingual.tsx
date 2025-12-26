import { Globe, ChevronDown } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useState, useEffect, useRef } from 'react';
import backendTranslationService from '../utils/backendTranslation';

const MultiLingual = () => {
  const { theme } = useTheme();
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [showDropdown, setShowDropdown] = useState(false);
  const [translationStatus, setTranslationStatus] = useState('idle');
  const [translatedElements, setTranslatedElements] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // List of supported languages
  const languages = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'hi', name: 'Hindi', native: 'हिंदी' },
    { code: 'bn', name: 'Bengali', native: 'বাংলা' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
    { code: 'mr', name: 'Marathi', native: 'मराठी' },
    { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
    { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
    { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
    { code: 'ur', name: 'Urdu', native: 'اردو' }
  ];

  // Handle clicking outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Load saved language preference
  useEffect(() => {
    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (savedLanguage && languages.find(lang => lang.code === savedLanguage)) {
      setSelectedLanguage(savedLanguage);
      if (savedLanguage !== 'en') {
        translatePage(savedLanguage);
      }
    }
  }, []);

  // Function to translate a single text element
  const translateText = async (text: string, targetLanguage: string) => {
    if (!text || targetLanguage === 'en') return text;
    
    try {
      const result = await backendTranslationService.translateText(text, targetLanguage);
      return result.translated_text;
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Return original text on error
    }
  };

  // Function to translate the entire page
  const translatePage = async (langCode: string) => {
    if (langCode === 'en') {
      // Reset to original English content
      setTranslatedElements({});
      setSelectedLanguage('en');
      localStorage.setItem('selectedLanguage', 'en');
      return;
    }

    setTranslationStatus('loading');
    setErrorMessage('');
    
    try {
      // Get all text elements on the page that need translation
      const textElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, button, a, li, label');
      const newTranslatedElements: Record<string, string> = {};
      
      // Store original text content if not already stored
      textElements.forEach((element, index) => {
        const originalText = element.textContent?.trim();
        if (originalText && originalText.length > 0) {
          const elementId = `elem-${index}`;
          
          // Add a data attribute to track this element
          element.setAttribute('data-translate-id', elementId);
          
          // Store original text if we don't have it yet
          if (!element.getAttribute('data-original-text')) {
            element.setAttribute('data-original-text', originalText);
          }
        }
      });
      
      // Translate elements in batches to avoid overwhelming the API
      const batchSize = 10;
      const elementsArray = Array.from(textElements);
      
      for (let i = 0; i < elementsArray.length; i += batchSize) {
        const batch = elementsArray.slice(i, i + batchSize);
        
        await Promise.all(batch.map(async (element) => {
          const elementId = element.getAttribute('data-translate-id');
          const originalText = element.getAttribute('data-original-text');
          
          if (elementId && originalText && originalText.length > 0) {
            try {
              const translatedText = await translateText(originalText, langCode);
              newTranslatedElements[elementId] = translatedText;
              
              // Update the element text
              element.textContent = translatedText;
            } catch (error) {
              console.error(`Error translating element ${elementId}:`, error);
            }
          }
        }));
      }
      
      setTranslatedElements(newTranslatedElements);
      setTranslationStatus('success');
      setSelectedLanguage(langCode);
      localStorage.setItem('selectedLanguage', langCode);
      
    } catch (error) {
      console.error('Page translation error:', error);
      setErrorMessage('Failed to translate page. Please try again later.');
      setTranslationStatus('error');
    }
  };

  // Function to change the language
  const changeLanguage = (langCode: string) => {
    setShowDropdown(false);
    
    if (langCode === selectedLanguage) return;
    
    translatePage(langCode);
  };

  const getSelectedLanguageName = () => {
    const lang = languages.find(lang => lang.code === selectedLanguage);
    return lang ? `${lang.name} (${lang.native})` : 'English';
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className={`${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-lg p-6`}>
        <div className="flex items-center gap-3 mb-8">
          <Globe className="h-8 w-8 text-indigo-400" />
          <h1 className="text-2xl font-semibold">Language Settings</h1>
        </div>

        <div className="space-y-6">
          <div className={`p-6 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
            <h2 className="text-lg font-semibold mb-4">Select Your Preferred Language</h2>
            <p className={`mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Choose from a variety of Indian languages to view the website in your preferred language.
            </p>
            
            {/* Error message display */}
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                {errorMessage}
              </div>
            )}
            
            {/* Custom language selector dropdown */}
            <div className="relative mb-4" ref={dropdownRef}>
              <div 
                className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer ${
                  theme === 'dark' 
                    ? 'bg-gray-800 border-gray-600 hover:bg-gray-750' 
                    : 'bg-white border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-indigo-500" />
                  <span>{getSelectedLanguageName()}</span>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${showDropdown ? 'transform rotate-180' : ''}`} />
              </div>
              
              {showDropdown && (
                <div className={`absolute z-10 mt-1 w-full rounded-lg border shadow-lg ${
                  theme === 'dark' 
                    ? 'bg-gray-800 border-gray-600' 
                    : 'bg-white border-gray-200'
                }`}>
                  <div className={`max-h-60 overflow-y-auto ${theme === 'dark' ? 'scrollbar-dark' : 'scrollbar-light'}`}>
                    {languages.map(lang => (
                      <div
                        key={lang.code}
                        className={`p-3 flex items-center gap-2 cursor-pointer ${
                          selectedLanguage === lang.code
                            ? theme === 'dark' ? 'bg-indigo-900' : 'bg-indigo-50'
                            : theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => changeLanguage(lang.code)}
                      >
                        <span className="font-medium">{lang.name}</span>
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {lang.native}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Translation status */}
            <div className="mb-4">
              <div className="flex items-center">
                {translationStatus === 'loading' ? (
                  <div className="flex items-center text-blue-500">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Translating page...</span>
                  </div>
                ) : translationStatus === 'success' && selectedLanguage !== 'en' ? (
                  <div className="text-green-500 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>Page translated to {getSelectedLanguageName()}</span>
                  </div>
                ) : translationStatus === 'error' ? (
                  <div className="text-red-500">
                    Translation failed. Please try again.
                  </div>
                ) : (
                  <div className="text-gray-500">
                    {selectedLanguage === 'en' ? 'Currently viewing in English' : 'Select a language to translate the page'}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={`p-6 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
            <h2 className="text-lg font-semibold mb-4">Supported Languages</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-2">Primary Language</h3>
                <ul className={`list-disc list-inside ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  <li>English (English)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-2">North Indian Languages</h3>
                <ul className={`list-disc list-inside ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  <li>Hindi (हिंदी)</li>
                  <li>Punjabi (ਪੰਜਾਬੀ)</li>
                  <li>Urdu (اردو)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-2">South Indian Languages</h3>
                <ul className={`list-disc list-inside ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  <li>Tamil (தமிழ்)</li>
                  <li>Telugu (తెలుగు)</li>
                  <li>Malayalam (മലയാളം)</li>
                  <li>Kannada (ಕನ್ನಡ)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-2">Other Indian Languages</h3>
                <ul className={`list-disc list-inside ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  <li>Assamese (অসমীয়া)</li>
                  <li>Odia (ଓଡ଼ିଆ)</li>
                  <li>Sanskrit (संस्कृतम्)</li>
                  <li>Nepali (नेपाली)</li>
                  <li>Sindhi (سنڌي)</li>
                </ul>
              </div>
            </div>
          </div>

          <div className={`p-6 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
            <h2 className="text-lg font-semibold mb-4">Language Support Information</h2>
            <ul className={`space-y-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              <li>• Translations are provided through our backend translation service</li>
              <li>• Some technical terms may remain in English</li>
              <li>• Your language preference will be saved for future visits</li>
              <li>• For best results, ensure your browser is up to date</li>
            </ul>
          </div>
        </div>
      </div>
      
      <style>{`
        .scrollbar-dark::-webkit-scrollbar {
          width: 8px;
        }
        .scrollbar-dark::-webkit-scrollbar-track {
          background: #2d3748;
        }
        .scrollbar-dark::-webkit-scrollbar-thumb {
          background-color: #4a5568;
          border-radius: 4px;
        }
        .scrollbar-light::-webkit-scrollbar {
          width: 8px;
        }
        .scrollbar-light::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .scrollbar-light::-webkit-scrollbar-thumb {
          background-color: #d1d5db;
          border-radius: 4px;
        }
        .bg-gray-750 {
          background-color: #1e293b;
        }
      `}</style>
    </div>
  );
};

export default MultiLingual;