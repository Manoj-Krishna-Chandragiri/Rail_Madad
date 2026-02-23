import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { ExternalLink } from 'lucide-react';

const LoginPortal = () => {
  const { theme } = useTheme();

  const portalOptions = [
    {
      type: 'Admin',
      description: 'Administrative access for system management',
      icon: (
        <svg className="h-12 w-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      route: '/admin-login',
      bgColor: 'bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30',
      borderColor: 'border-red-200 dark:border-red-800',
      textColor: 'text-red-800 dark:text-red-200',
      buttonColor: 'bg-red-600 hover:bg-red-700'
    },
    {
      type: 'Staff',
      description: 'Railway staff access for operations management',
      icon: (
        <svg className="h-12 w-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      route: '/staff-login',
      bgColor: 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30',
      borderColor: 'border-blue-200 dark:border-blue-800',
      textColor: 'text-blue-800 dark:text-blue-200',
      buttonColor: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      type: 'Passenger',
      description: 'Passenger access for complaints and support',
      icon: (
        <svg className="h-12 w-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      route: '/passenger-login',
      bgColor: 'bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30',
      borderColor: 'border-green-200 dark:border-green-800',
      textColor: 'text-green-800 dark:text-green-200',
      buttonColor: 'bg-green-600 hover:bg-green-700'
    }
  ];

  return (
    <div 
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative"
      style={{
        backgroundImage: 'url(https://res.cloudinary.com/dbnkhibzi/image/upload/v1769581146/1520665647_pamban_bridge_rameshwaram_fotor1_rxk3oh.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Dark overlay for better readability */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      
      <div className="max-w-4xl w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-indigo-600 mb-6 shadow-xl">
            <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m13 0H3" />
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-4 drop-shadow-lg">
            Rail Madad Portal
          </h1>
          <p className="text-xl text-gray-200 mb-8 drop-shadow-md">
            Choose your login portal to access the appropriate dashboard
          </p>
        </div>

        {/* Portal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {portalOptions.map((portal) => (
            <div
              key={portal.type}
              className={`${portal.bgColor} ${portal.borderColor} border-2 rounded-xl p-8 text-center transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl`}
            >
              <div className="flex justify-center mb-6">
                {portal.icon}
              </div>
              
              <h3 className={`text-2xl font-bold ${portal.textColor} mb-4`}>
                {portal.type} Portal
              </h3>
              
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-8 text-sm leading-relaxed`}>
                {portal.description}
              </p>
              
              <Link
                to={portal.route}
                className={`${portal.buttonColor} text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 inline-block w-full`}
              >
                Login as {portal.type}
              </Link>
            </div>
          ))}
        </div>

        {/* Additional Information */}
        <div className="mt-12 text-center p-6 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Need Help Choosing?
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-semibold text-red-600">Admin:</span>
              <span className="text-gray-700">
                {' '}System administrators and managers
              </span>
            </div>
            <div>
              <span className="font-semibold text-blue-600">Staff:</span>
              <span className="text-gray-700">
                {' '}Railway employees and support staff
              </span>
            </div>
            <div>
              <span className="font-semibold text-green-600">Passenger:</span>
              <span className="text-gray-700">
                {' '}Travelers and general users
              </span>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Link 
              to="/landing" 
              className="text-sm text-white hover:text-indigo-300 font-medium drop-shadow-md flex items-center gap-2"
            >
              Learn More
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
          
          <p className="text-xs text-gray-300 drop-shadow-md">
            Secure portal access • Data protection compliant • Available 24/7
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPortal;