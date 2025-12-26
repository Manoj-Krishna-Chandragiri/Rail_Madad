import SimpleGoogleTranslate from '../components/SimpleGoogleTranslate';
import DirectGoogleTranslate from '../components/DirectGoogleTranslate';
import TranslationDiagnostic from '../components/TranslationDiagnostic';

const TranslationTest = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Translation Test Page
      </h1>
      
      {/* Google Translate Widget */}
      <TranslationDiagnostic />
      <DirectGoogleTranslate />
      <SimpleGoogleTranslate />
      
      {/* Test Content in English */}
      <div className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          Welcome to Rail Madad
        </h2>
        
        <p className="text-lg text-gray-700 dark:text-gray-300">
          Rail Madad provides a seamless platform for all Indian Railways passenger assistance and complaint resolution.
        </p>
        
        <p className="text-base text-gray-600 dark:text-gray-400">
          Our system allows passengers to:
        </p>
        
        <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
          <li>Submit complaints about train services</li>
          <li>Track complaint status in real-time</li>
          <li>Get assistance for travel-related issues</li>
          <li>Access multilingual support</li>
          <li>Contact customer service directly</li>
        </ul>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-blue-800 dark:text-blue-200 mb-2">
            How Rail Madad Can Help You
          </h3>
          <p className="text-blue-700 dark:text-blue-300">
            Whether you have issues with cleanliness, staff behavior, or booking problems, 
            Rail Madad is here to ensure your voice is heard and your concerns are addressed promptly.
          </p>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-green-800 dark:text-green-200 mb-2">
            Quick Response System
          </h3>
          <p className="text-green-700 dark:text-green-300">
            Our dedicated team works around the clock to resolve passenger grievances 
            and improve the overall travel experience across the Indian Railways network.
          </p>
        </div>
      </div>
      
      <div className="mt-8 text-center text-gray-500 dark:text-gray-400">
        <p>Use the Google Translate widget above to translate this page to your preferred language.</p>
      </div>
    </div>
  );
};

export default TranslationTest;