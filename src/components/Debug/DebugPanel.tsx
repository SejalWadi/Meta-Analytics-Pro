import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bug, Eye, EyeOff, User, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

interface VerificationResult {
  status: 'checking' | 'success' | 'warning' | 'error';
  details: string[];
}

interface VerificationResults {
  userVerification: VerificationResult;
  pagesVerification: VerificationResult;
  postsVerification: VerificationResult;
  permissionsVerification: VerificationResult;
}

const DebugPanel: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [verificationResults, setVerificationResults] = useState<VerificationResults | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
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

  const verifyDataAuthenticity = async () => {
    if (!user?.accessToken) return;
    
    setIsVerifying(true);
    const results: VerificationResults = {
      userVerification: { status: 'checking', details: [] },
      pagesVerification: { status: 'checking', details: [] },
      postsVerification: { status: 'checking', details: [] },
      permissionsVerification: { status: 'checking', details: [] }
    };
    
    try {
      // 1. Verify user identity
      const userResponse = await fetch(
        `https://graph.facebook.com/me?access_token=${user.accessToken}&fields=id,name,email,verified`
      );
      const userData = await userResponse.json();
      
      if (userData.error) {
        results.userVerification = {
          status: 'error',
          details: [`Error: ${userData.error.message}`]
        };
      } else {
        results.userVerification = {
          status: 'success',
          details: [
            `✓ User ID: ${userData.id}`,
            `✓ Name: ${userData.name}`,
            `✓ Email: ${userData.email || 'Not provided'}`,
            `✓ Verified Account: ${userData.verified ? 'Yes' : 'No'}`
          ]
        };
      }

      // 2. Verify pages access
      const pagesResponse = await fetch(
        `https://graph.facebook.com/me/accounts?access_token=${user.accessToken}&fields=id,name,fan_count,category,verification_status`
      );
      const pagesData = await pagesResponse.json();
      
      if (pagesData.error) {
        results.pagesVerification = {
          status: 'error',
          details: [`Error: ${pagesData.error.message}`]
        };
      } else if (pagesData.data && pagesData.data.length > 0) {
        results.pagesVerification = {
          status: 'success',
          details: pagesData.data.map((page: any) => 
            `✓ Page: ${page.name} (${page.fan_count || 0} followers) - ${page.category}`
          )
        };
      } else {
        results.pagesVerification = {
          status: 'warning',
          details: ['No Facebook pages found. You need admin access to pages to see analytics.']
        };
      }

      // 3. Verify recent posts
      if (pagesData.data && pagesData.data.length > 0) {
        const page = pagesData.data[0];
        const postsResponse = await fetch(
          `https://graph.facebook.com/${page.id}/posts?access_token=${page.access_token}&fields=id,message,created_time,likes.summary(true),comments.summary(true)&limit=5`
        );
        const postsData = await postsResponse.json();
        
        if (postsData.error) {
          results.postsVerification = {
            status: 'error',
            details: [`Error: ${postsData.error.message}`]
          };
        } else if (postsData.data && postsData.data.length > 0) {
          results.postsVerification = {
            status: 'success',
            details: [
              `✓ Found ${postsData.data.length} recent posts`,
              ...postsData.data.slice(0, 3).map((post: any) => 
                `✓ Post: "${(post.message || 'No text').substring(0, 50)}..." - ${post.likes?.summary?.total_count || 0} likes`
              )
            ]
          };
        } else {
          results.postsVerification = {
            status: 'warning',
            details: ['No recent posts found on your pages.']
          };
        }
      }

      // 4. Verify permissions
      const permissionsResponse = await fetch(
        `https://graph.facebook.com/me/permissions?access_token=${user.accessToken}`
      );
      const permissionsData = await permissionsResponse.json();
      
      if (permissionsData.data) {
        const grantedPermissions = permissionsData.data
          .filter((p: any) => p.status === 'granted')
          .map((p: any) => p.permission);
        
        const requiredPermissions = ['email', 'public_profile', 'pages_show_list', 'pages_read_engagement'];
        const hasAllRequired = requiredPermissions.every(perm => grantedPermissions.includes(perm));
        
        results.permissionsVerification = {
          status: hasAllRequired ? 'success' : 'warning',
          details: [
            `✓ Granted permissions: ${grantedPermissions.join(', ')}`,
            hasAllRequired ? '✓ All required permissions granted' : '⚠ Some permissions missing'
          ]
        };
      }

    } catch (error) {
      console.error('Verification error:', error);
    }
    
    setVerificationResults(results);
    setIsVerifying(false);
  };

  const openFacebookPage = () => {
    if (user?.id) {
      window.open(`https://www.facebook.com/${user.id}`, '_blank');
    }
  };

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
              
              <div className="mt-3 space-y-2">
                <button
                  onClick={verifyDataAuthenticity}
                  disabled={isVerifying}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-xs font-medium disabled:opacity-50"
                >
                  {isVerifying ? 'Verifying...' : 'Verify Data Authenticity'}
                </button>
                
                <button
                  onClick={openFacebookPage}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-xs font-medium flex items-center justify-center"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Open Facebook Profile
                </button>
              </div>
            </div>
          )}

          {verificationResults && (
            <div className="mt-4 pt-3 border-t border-gray-600">
              <h4 className="text-white font-semibold mb-2">Verification Results</h4>
              <div className="space-y-3 text-xs">
                {Object.entries(verificationResults).map(([key, result]) => (
                  <div key={key} className="space-y-1">
                    <div className="flex items-center space-x-2">
                      {result.status === 'success' && <CheckCircle className="h-3 w-3 text-green-400" />}
                      {result.status === 'warning' && <AlertTriangle className="h-3 w-3 text-yellow-400" />}
                      {result.status === 'error' && <AlertTriangle className="h-3 w-3 text-red-400" />}
                      <span className="text-white font-medium capitalize">
                        {key.replace(/([A-Z])/g, ' $1')}
                      </span>
                    </div>
                    <div className="ml-5 space-y-1">
                      {result.details.map((detail: string, index: number) => (
                        <div key={index} className={`${
                          detail.startsWith('✓') ? 'text-green-400' : 
                          detail.startsWith('⚠') ? 'text-yellow-400' : 
                          detail.startsWith('Error') ? 'text-red-400' : 'text-gray-300'
                        }`}>
                          {detail}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
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