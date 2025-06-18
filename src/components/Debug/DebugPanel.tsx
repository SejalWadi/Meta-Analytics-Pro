import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bug, Eye, EyeOff, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

const DebugPanel: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { user } = useAuth();
  const { metricsData } = useData();

  if (import.meta.env.MODE === 'production') {
    return null;
  }

  // Create user seed for debugging (same logic as in analyticsService)
  const createUserSeed = (userId: string, userName: string): number => {
    let seed = 0;
    const combined = userId + userName;
    for (let i = 0; i < combined.length; i++) {
      seed = ((seed << 5) - seed + combined.charCodeAt(i)) & 0xffffffff;
    }
    return Math.abs(seed);
  };

  const userSeed = user ? createUserSeed(user.id, user.name) : 0;

  const debugInfo = {
    fbSdkLoaded: typeof window !== 'undefined' && window.FB ? '✅ Loaded' : '❌ Not Loaded',
    appId: import.meta.env.VITE_FACEBOOK_APP_ID || 'Not Set',
    environment: import.meta.env.NODE_ENV || 'development',
    apiUrl: import.meta.env.VITE_API_URL || 'Not Set',
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'N/A',
    localStorage: typeof window !== 'undefined' ? Object.keys(localStorage).length : 0,
    currentUrl: typeof window !== 'undefined' ? window.location.href : 'N/A',
    // User-specific debug info
    userId: user?.id || 'Not logged in',
    userName: user?.name || 'Not logged in',
    userSeed: userSeed,
    totalReach: metricsData?.totalReach || 'No data',
    totalEngagement: metricsData?.totalEngagement || 'No data',
    engagementRate: metricsData?.engagementRate || 'No data',
    topPostsCount: metricsData?.topPosts?.length || 0
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
          className="absolute bottom-16 right-0 bg-gray-800 border border-gray-600 rounded-lg p-4 w-96 max-h-96 overflow-y-auto"
        >
          <h3 className="text-white font-bold mb-3 flex items-center">
            <Bug className="h-4 w-4 mr-2" />
            Debug Information
          </h3>
          
          <div className="space-y-2 text-xs">
            {Object.entries(debugInfo).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                <span className={`text-white font-mono text-right ml-2 break-all ${
                  key === 'userSeed' ? 'text-yellow-400 font-bold' : ''
                } ${
                  key.includes('total') || key.includes('Rate') ? 'text-green-400' : ''
                }`}>
                  {String(value)}
                </span>
              </div>
            ))}
          </div>

          {user && (
            <div className="mt-4 pt-3 border-t border-gray-600">
              <h4 className="text-white font-semibold mb-2 flex items-center">
                <User className="h-4 w-4 mr-2" />
                User Data Verification
              </h4>
              <div className="text-xs text-gray-300 space-y-1">
                <div>User Seed: <span className="text-yellow-400 font-bold">{userSeed}</span></div>
                <div>This seed ensures different data for each user</div>
                <div className="text-green-400">✓ Data should be unique per user</div>
              </div>
            </div>
          )}

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
              <button
                onClick={() => console.log('Metrics Data:', metricsData)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-xs"
              >
                Log Metrics Data
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DebugPanel;