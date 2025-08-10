import React from 'react';
import { X, ExternalLink, Phone } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface DocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: any[];
  onContactSupport: () => void;
}

const DocumentationModal: React.FC<DocumentationModalProps> = ({
  isOpen,
  onClose,
  title,
  content,
  onContactSupport
}) => {
  const { theme } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${
        theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'
      } rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col`}>
        
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${
          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h2 className="text-2xl font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-8">
            {content.map((section, index) => (
              <div key={index} className="space-y-4">
                <h3 className="text-xl font-semibold text-indigo-400">
                  {section.title}
                </h3>
                
                <div className={`${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                } leading-relaxed`}>
                  {section.content.split('\n').map((paragraph: string, pIndex: number) => (
                    <p key={pIndex} className="mb-3">
                      {paragraph}
                    </p>
                  ))}
                </div>

                {section.code && (
                  <div className={`p-4 rounded-lg font-mono text-sm ${
                    theme === 'dark' ? 'bg-gray-900 text-green-400' : 'bg-gray-100 text-gray-800'
                  }`}>
                    <pre className="whitespace-pre-wrap">{section.code}</pre>
                  </div>
                )}

                {section.image && (
                  <div className="flex justify-center">
                    <img 
                      src={section.image} 
                      alt={section.title}
                      className="max-w-full h-auto rounded-lg shadow-lg"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className={`p-6 border-t ${
          theme === 'dark' ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4 text-sm">
              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                Need more help?
              </span>
              <button
                onClick={onContactSupport}
                className="flex items-center gap-2 text-indigo-500 hover:text-indigo-400 transition-colors"
              >
                <Phone className="h-4 w-4" />
                Contact Support
              </button>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  theme === 'dark' 
                    ? 'border-gray-600 hover:bg-gray-700' 
                    : 'border-gray-300 hover:bg-gray-100'
                }`}
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Print Guide
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentationModal;
