// Utility to handle browser extension communication errors
// These errors are common and usually don't affect the application functionality

export const suppressExtensionErrors = () => {
  // Add global error handler for extension communication errors
  window.addEventListener('error', (event) => {
    if (event.error && event.error.message) {
      const message = event.error.message.toLowerCase();
      
      // Suppress common extension-related errors
      if (
        message.includes('message channel closed') ||
        message.includes('listener indicated an asynchronous response') ||
        message.includes('extension context invalidated') ||
        message.includes('could not establish connection')
      ) {
        console.log('Suppressed extension communication error:', event.error.message);
        event.preventDefault();
        return false;
      }
    }
  });

  // Handle unhandled promise rejections from extensions
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && typeof event.reason === 'object') {
      const message = event.reason.message || String(event.reason).toLowerCase();
      
      if (
        message.includes('message channel closed') ||
        message.includes('listener indicated an asynchronous response') ||
        message.includes('extension context invalidated') ||
        message.includes('could not establish connection')
      ) {
        console.log('Suppressed extension promise rejection:', message);
        event.preventDefault();
        return false;
      }
    }
  });
};

// Initialize error suppression
export const initializeErrorHandling = () => {
  suppressExtensionErrors();
  
  // Add helpful console message
  console.log('🛡️ Extension error handling initialized');
  console.log('ℹ️  Browser extension communication errors are automatically suppressed');
  console.log('   These errors don\'t affect the Rail Madad application functionality');
};