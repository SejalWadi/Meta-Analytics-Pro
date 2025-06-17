import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bug, Eye, EyeOff } from 'lucide-react';

const DebugPanel: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  if (import.meta.env.MODE === 'production') {
    return null;
  }

  const debugInfo = {
    fbSdkLoaded: typeof window !== 'undefined' && window.FB ? '✅ Loaded' : '❌ Not Loaded',
    appId: import.meta.env.VITE_FACEBOOK_APP_ID || 'Not Set',
    environment: import.meta.env.NODE_ENV || 'development',
    apiUrl: import.meta.env.VITE_API_URL || 'Not Set',
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'N/A',
    localStorage: typeof window !== 'undefined' ? Object.keys(localStorage).length : 0,
    currentUrl: typeof window !== 'undefined' ? window.location.href : 'N/A'
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsVisible(!isVisible)}
        className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg"
      >
        {isVisible ? <EyeOff className="h-5 w-5" /> : <Bug className="h-5 w-5" />}
      </motion.button>

      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="absolute bottom-16 right-0 bg-gray-800 border border-gray-600 rounded-lg p-4 w-80 max-h-96 overflow-y-auto"
        >
          <h3 className="text-white font-bold mb-3 flex items-center">
            <Bug className="h-4 w-4 mr-2" />
            Debug Information
          </h3>
          
          <div className="space-y-2 text-xs">
            {Object.entries(debugInfo).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                <span className="text-white font-mono text-right ml-2 break-all">
                  {String(value)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-600">
            <h4 className="text-white font-semibold mb-2">Quick Actions</h4>
            <div className="space-y-2">
              <button
                onClick={() => localStorage.clear()}
                className="w-full bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs"
              >
                Clear LocalStorage
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
              >
                Reload Page
              </button>
              <button
                onClick={() => console.log('Debug Info:', debugInfo)}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs"
              >
                Log to Console
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DebugPanel;