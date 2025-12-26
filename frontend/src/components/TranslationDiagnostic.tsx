import { useState, useEffect } from 'react';
import backendTranslationService from '../utils/backendTranslation';

const TranslationDiagnostic = () => {
  const [diagnostics, setDiagnostics] = useState<string[]>([]);
  const [testResult, setTestResult] = useState<string | null>(null);

  const addDiagnostic = (message: string) => {
    setDiagnostics(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    addDiagnostic('Translation diagnostic started');
    
    // Check for backend translation service
    const checkBackendService = async () => {
      try {
        const languages = await backendTranslationService.getSupportedLanguages();
        addDiagnostic(`✅ Backend translation service available with ${Object.keys(languages.supported_languages).length} languages`);
        return true;
      } catch (error) {
        addDiagnostic(`❌ Backend translation service not available: ${error}`);
        return false;
      }
    };

    // Check for translated elements
    const checkTranslatedElements = () => {
      const elements = document.querySelectorAll('[data-translate-id]');
      addDiagnostic(`Found ${elements.length} elements with translation IDs`);
      
      const originalElements = document.querySelectorAll('[data-original-text]');
      addDiagnostic(`Found ${originalElements.length} elements with original text stored`);
    };

    // Initial checks
    checkBackendService();
    
    // Periodic checks
    const interval = setInterval(() => {
      checkTranslatedElements();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const testTranslation = async () => {
    addDiagnostic('Testing manual translation...');
    setTestResult('Testing...');
    
    try {
      const result = await backendTranslationService.translateText('Hello, this is a test message.', 'hi');
      addDiagnostic(`✅ Translation successful: "${result.translated_text}"`);
      setTestResult(result.translated_text);
    } catch (error) {
      addDiagnostic(`❌ Translation failed: ${error}`);
      setTestResult('Translation failed');
    }
  };

  const resetTranslation = () => {
    addDiagnostic('Resetting test...');
    setTestResult(null);
    
    // Restore original text for all elements with data-original-text attribute
    document.querySelectorAll('[data-original-text]').forEach(element => {
      const originalText = element.getAttribute('data-original-text');
      if (originalText) {
        element.textContent = originalText;
      }
    });
    
    addDiagnostic('Reset completed');
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg mb-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
        🔧 Translation Diagnostic Panel
      </h3>
      
      <div className="flex gap-2 mb-4">
        <button
          onClick={testTranslation}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Test Hindi Translation
        </button>
        <button
          onClick={resetTranslation}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Reset
        </button>
      </div>

      {testResult && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
          <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Test Result:</h4>
          <div className="text-blue-800 dark:text-blue-300 font-medium">
            {testResult}
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 p-4 rounded-lg">
        <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Diagnostic Log:</h4>
        <div className="space-y-1 max-h-60 overflow-y-auto">
          {diagnostics.map((diagnostic, index) => (
            <div key={index} className="text-sm text-gray-600 dark:text-gray-400 font-mono">
              {diagnostic}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TranslationDiagnostic;