import { useState, useEffect, useRef } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import backendTranslationService from '../utils/backendTranslation';

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

const GlobalLanguageSelector = () => {
  const { theme } = useTheme();
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [showDropdown, setShowDropdown] = useState(false);
  const [translationStatus, setTranslationStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

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
      setSelectedLanguage('en');
      localStorage.setItem('selectedLanguage', 'en');
      
      // Restore original text for all elements with data-original-text attribute
      document.querySelectorAll('[data-original-text]').forEach(element => {
        const originalText = element.getAttribute('data-original-text');
        if (originalText) {
          element.textContent = originalText;
        }
      });
      
      setTranslationStatus('idle');
      return;
    }

    setTranslationStatus('loading');
    setErrorMessage('');
    
    try {
      // Get all text elements on the page that need translation
      const textElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, button, a, li, label');
      
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
              
              // Update the element text
              element.textContent = translatedText;
            } catch (error) {
              console.error(`Error translating element ${elementId}:`, error);
            }
          }
        }));
      }
      
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

  const selectedLang = languages.find(lang => lang.code === selectedLanguage) || languages[0];
  const isDark = theme === 'dark';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
          isDark
            ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
        }`}
        title="Change Language"
      >
        <Globe className="h-4 w-4" />
        <span className="text-sm font-medium hidden sm:inline">
          {selectedLang.native}
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
      </button>

      {showDropdown && (
        <div className={`absolute right-0 mt-2 w-48 py-2 rounded-lg shadow-lg border z-50 ${
          isDark
            ? 'bg-gray-800 border-gray-600'
            : 'bg-white border-gray-200'
        }`}>
          <div className={`px-3 py-2 text-xs font-medium border-b ${
            isDark ? 'text-gray-400 border-gray-600' : 'text-gray-500 border-gray-200'
          }`}>
            Select Language
          </div>
          
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => changeLanguage(language.code)}
              className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center justify-between ${
                selectedLanguage === language.code
                  ? isDark
                    ? 'bg-indigo-900 text-indigo-200'
                    : 'bg-indigo-50 text-indigo-700'
                  : isDark
                    ? 'hover:bg-gray-700 text-gray-200'
                    : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <span>{language.name}</span>
              <span className={`text-xs ${
                selectedLanguage === language.code
                  ? isDark ? 'text-indigo-300' : 'text-indigo-500'
                  : isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {language.native}
              </span>
            </button>
          ))}
          
          <div className={`px-3 py-2 text-xs border-t mt-2 ${
            isDark ? 'text-gray-400 border-gray-600' : 'text-gray-500 border-gray-200'
          }`}>
            {translationStatus === 'loading' ? (
              <span className="text-yellow-500">⏳ Translating...</span>
            ) : translationStatus === 'success' ? (
              <span className="text-green-500">✓ Translation Ready</span>
            ) : translationStatus === 'error' ? (
              <span className="text-red-500">✗ Translation Failed</span>
            ) : (
              <span className="text-gray-500">Select a language</span>
            )}
            {errorMessage && (
              <div className="text-xs mt-1 text-red-500">
                {errorMessage}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalLanguageSelector;