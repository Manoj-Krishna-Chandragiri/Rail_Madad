import { Globe, ChevronDown } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useState, useEffect, useRef } from 'react';

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit?: () => void;
  }
}

const MultiLingual = () => {
  const { theme } = useTheme();
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const googleElementLoaded = useRef(false);

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

  // Custom language switcher function
  const changeLanguage = (langCode: string) => {
    setSelectedLanguage(langCode);
    setShowDropdown(false);
    
    // Use Google Translate API to change the language
    const langSelector = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (langSelector) {
      langSelector.value = langCode;
      langSelector.dispatchEvent(new Event('change'));
    } else {
      console.error('Google Translate element not found');
    }
  };

  useEffect(() => {
    // Add Google Translate script
    const addScript = () => {
      // Check if script already exists
      const existingScript = document.querySelector('script[src*="translate.google.com"]');
      if (existingScript) return;

      const script = document.createElement('script');
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      script.defer = true;
      
      // Add error handling
      script.onerror = () => {
        console.error('Failed to load Google Translate script');
        const errorElement = document.getElementById('google_translate_error');
        if (errorElement) {
          errorElement.style.display = 'block';
        }
      };
      
      document.body.appendChild(script);
    };

    // Initialize Google Translate with error handling
    window.googleTranslateElementInit = () => {
      try {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: 'en,hi,bn,te,ta,mr,gu,kn,ml,pa,ur', // Reduced language list to avoid errors
            layout: window.google.translate.TranslateElement.InlineLayout.VERTICAL,
            autoDisplay: false,
            gaTrack: false, // Disable Google Analytics tracking
          },
          'google_translate_element'
        );
        
        // Hide the default Google Translate widget after it's loaded
        setTimeout(() => {
          const googleElement = document.getElementById('google_translate_element');
          if (googleElement) {
            googleElement.style.visibility = 'hidden';
            googleElement.style.position = 'absolute';
            googleElement.style.top = '-9999px';
            googleElementLoaded.current = true;
          }
        }, 1000);
      } catch (error) {
        console.error('Error initializing Google Translate:', error);
        const errorElement = document.getElementById('google_translate_error');
        if (errorElement) {
          errorElement.style.display = 'block';
        }
      }
    };

    addScript();

    // Cleanup
    return () => {
      delete window.googleTranslateElementInit;
    };
  }, []);

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
            
            {/* Add error message display */}
            <div id="google_translate_error" style={{display: 'none'}} className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              Unable to load translation service. Please try refreshing the page or check your internet connection.
            </div>
            
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
            
            {/* Hidden Google Translate element */}
            <div className="google-translate-container">
              <div id="google_translate_element"></div>
              {/* Fallback for when Google Translate fails */}
              <noscript>
                <p className="mt-2 text-sm text-red-500">JavaScript must be enabled to use translation features.</p>
              </noscript>
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
              <li>• Translations are provided through Google Translate service</li>
              <li>• Some technical terms may remain in English</li>
              <li>• Your language preference will be saved for future visits</li>
              <li>• For best results, ensure your browser is up to date</li>
            </ul>
          </div>
        </div>
      </div>
      
      <style jsx>{`
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