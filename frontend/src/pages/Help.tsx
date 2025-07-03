import { HelpCircle, Book, Phone, Mail } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Help = () => {
  const { theme } = useTheme();

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className={`${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-lg p-4 sm:p-6`}>
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <HelpCircle className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-400 flex-shrink-0" />
          <h1 className="text-xl sm:text-2xl font-semibold">Help & Support</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className={`${
            theme === 'dark' ? 'border-gray-700 bg-gray-700' : 'border'
          } rounded-lg p-4 sm:p-6`}>
            <Book className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-400 mb-3 sm:mb-4" />
            <h2 className="text-base sm:text-lg font-semibold mb-2">Documentation</h2>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-3 sm:mb-4 text-sm sm:text-base`}>
              Find detailed guides and documentation about using the Rail Madad system.
            </p>
            <button className="text-indigo-400 hover:text-indigo-300 text-sm sm:text-base">
              View Documentation →
            </button>
          </div>

          <div className={`${
            theme === 'dark' ? 'border-gray-700 bg-gray-700' : 'border'
          } rounded-lg p-4 sm:p-6`}>
            <Phone className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-400 mb-3 sm:mb-4" />
            <h2 className="text-base sm:text-lg font-semibold mb-2">Contact Support</h2>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-3 sm:mb-4 text-sm sm:text-base`}>
              Get in touch with our support team for assistance.
            </p>
            <button className="text-indigo-400 hover:text-indigo-300 text-sm sm:text-base">
              Contact Support →
            </button>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <h2 className="text-lg sm:text-xl font-semibold">Frequently Asked Questions</h2>
          <div className="space-y-3 sm:space-y-4">
            <details className={`${
              theme === 'dark' ? 'border-gray-700 bg-gray-700' : 'border'
            } rounded-lg p-3 sm:p-4`}>
              <summary className="font-medium cursor-pointer text-sm sm:text-base">
                How do I file a new complaint?
              </summary>
              <p className={`mt-2 text-sm sm:text-base ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                To file a new complaint, click on the "File Complaint" option in the sidebar menu. Fill in the required details about your complaint and submit the form.
              </p>
            </details>

            <details className={`${
              theme === 'dark' ? 'border-gray-700 bg-gray-700' : 'border'
            } rounded-lg p-3 sm:p-4`}>
              <summary className="font-medium cursor-pointer text-sm sm:text-base">
                How can I track my complaint status?
              </summary>
              <p className={`mt-2 text-sm sm:text-base ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                You can track your complaint status by clicking on the "Track Status" option in the sidebar menu. Enter your complaint ID or PNR number to view the current status.
              </p>
            </details>

            <details className={`${
              theme === 'dark' ? 'border-gray-700 bg-gray-700' : 'border'
            } rounded-lg p-3 sm:p-4`}>
              <summary className="font-medium cursor-pointer text-sm sm:text-base">
                What are the supported languages?
              </summary>
              <p className={`mt-2 text-sm sm:text-base ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Rail Madad supports multiple Indian languages including Hindi, Bengali, Telugu, Tamil, and more. You can change the language from the settings menu.
              </p>
            </details>
          </div>
        </div>

        <div className={`mt-6 sm:mt-8 p-4 sm:p-6 ${
          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
        } rounded-lg`}>
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Contact Information</h2>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-start sm:items-center gap-3">
              <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-400 flex-shrink-0 mt-1 sm:mt-0" />
              <div>
                <p className="font-medium text-sm sm:text-base">Helpline</p>
                <p className={`text-sm sm:text-base ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  139 (Toll Free)
                </p>
              </div>
            </div>
            <div className="flex items-start sm:items-center gap-3">
              <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-400 flex-shrink-0 mt-1 sm:mt-0" />
              <div>
                <p className="font-medium text-sm sm:text-base">Email Support</p>
                <p className={`text-sm sm:text-base break-all ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  support@railmadad.indianrailways.gov.in
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;