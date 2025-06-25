import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, ExternalLink, Facebook, Instagram, FileText, Users, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { checkUserSetup } from '../../services/productionAuthService';
import toast from 'react-hot-toast';

interface SetupStatus {
  hasPages: boolean;
  hasInstagram: boolean;
  hasPosts: boolean;
  recommendations: string[];
}

const UserSetupGuide: React.FC = () => {
  const { user, requestPagePermissions } = useAuth();
  const [setupStatus, setSetupStatus] = useState<SetupStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [requestingPermissions, setRequestingPermissions] = useState(false);

  useEffect(() => {
    if (user?.accessToken) {
      checkSetup();
    }
  }, [user]);

  const checkSetup = async () => {
    if (!user?.accessToken) return;
    
    try {
      const status = await checkUserSetup(user.accessToken);
      setSetupStatus(status);
    } catch (error) {
      console.error('Error checking setup:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPermissions = async () => {
    setRequestingPermissions(true);
    try {
      await requestPagePermissions();
      toast.success('Permissions requested! Please check your setup again.');
      // Refresh setup status
      setTimeout(() => {
        checkSetup();
      }, 2000);
    } catch (error) {
      console.error('Error requesting permissions:', error);
      toast.error('Failed to request permissions. Please try again.');
    } finally {
      setRequestingPermissions(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700 rounded w-1/3"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!setupStatus) return null;

  const hasBasicAccess = user?.permissions?.grantedPermissions?.includes('email') && user?.permissions?.grantedPermissions?.includes('public_profile');
  const hasPageAccess = user?.permissions?.hasPageAccess || setupStatus.hasPages;
  const allSetup = hasBasicAccess && hasPageAccess && setupStatus.hasPosts;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-xl border ${
        allSetup 
          ? 'bg-green-600 bg-opacity-20 border-green-600' 
          : hasBasicAccess
          ? 'bg-blue-600 bg-opacity-20 border-blue-600'
          : 'bg-yellow-600 bg-opacity-20 border-yellow-600'
      }`}
    >
      <div className="flex items-center space-x-3 mb-4">
        {allSetup ? (
          <CheckCircle className="h-6 w-6 text-green-400" />
        ) : hasBasicAccess ? (
          <Shield className="h-6 w-6 text-blue-400" />
        ) : (
          <AlertCircle className="h-6 w-6 text-yellow-400" />
        )}
        <h3 className={`text-lg font-bold ${
          allSetup ? 'text-green-400' : hasBasicAccess ? 'text-blue-400' : 'text-yellow-400'
        }`}>
          {allSetup ? 'Setup Complete!' : hasBasicAccess ? 'Basic Login Complete' : 'Setup Required'}
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className={`p-4 rounded-lg border ${
          hasBasicAccess 
            ? 'bg-green-600 bg-opacity-20 border-green-600' 
            : 'bg-red-600 bg-opacity-20 border-red-600'
        }`}>
          <div className="flex items-center space-x-2 mb-2">
            <Facebook className="h-5 w-5" />
            <span className="font-medium text-white">Basic Login</span>
          </div>
          <div className={`text-sm ${hasBasicAccess ? 'text-green-400' : 'text-red-400'}`}>
            {hasBasicAccess ? '✓ Connected' : '✗ Required'}
          </div>
        </div>

        <div className={`p-4 rounded-lg border ${
          hasPageAccess 
            ? 'bg-green-600 bg-opacity-20 border-green-600' 
            : 'bg-yellow-600 bg-opacity-20 border-yellow-600'
        }`}>
          <div className="flex items-center space-x-2 mb-2">
            <Users className="h-5 w-5" />
            <span className="font-medium text-white">Page Access</span>
          </div>
          <div className={`text-sm ${hasPageAccess ? 'text-green-400' : 'text-yellow-400'}`}>
            {hasPageAccess ? '✓ Granted' : '○ Optional'}
          </div>
        </div>

        <div className={`p-4 rounded-lg border ${
          setupStatus.hasPosts 
            ? 'bg-green-600 bg-opacity-20 border-green-600' 
            : 'bg-gray-600 bg-opacity-20 border-gray-600'
        }`}>
          <div className="flex items-center space-x-2 mb-2">
            <FileText className="h-5 w-5" />
            <span className="font-medium text-white">Recent Posts</span>
          </div>
          <div className={`text-sm ${setupStatus.hasPosts ? 'text-green-400' : 'text-gray-400'}`}>
            {setupStatus.hasPosts ? '✓ Found' : '○ None found'}
          </div>
        </div>

        <div className={`p-4 rounded-lg border ${
          setupStatus.hasInstagram 
            ? 'bg-green-600 bg-opacity-20 border-green-600' 
            : 'bg-gray-600 bg-opacity-20 border-gray-600'
        }`}>
          <div className="flex items-center space-x-2 mb-2">
            <Instagram className="h-5 w-5" />
            <span className="font-medium text-white">Instagram</span>
          </div>
          <div className={`text-sm ${setupStatus.hasInstagram ? 'text-green-400' : 'text-gray-400'}`}>
            {setupStatus.hasInstagram ? '✓ Connected' : '○ Optional'}
          </div>
        </div>
      </div>

      {!hasPageAccess && hasBasicAccess && (
        <div className="bg-blue-600 bg-opacity-20 border border-blue-600 rounded-lg p-4 mb-4">
          <h4 className="text-blue-400 font-semibold mb-2">Want to see your Facebook page analytics?</h4>
          <p className="text-blue-100 text-sm mb-3">
            Grant additional permissions to access your Facebook pages and see real analytics data.
          </p>
          <button
            onClick={handleRequestPermissions}
            disabled={requestingPermissions}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {requestingPermissions ? 'Requesting...' : 'Grant Page Permissions'}
          </button>
        </div>
      )}

      {setupStatus.recommendations.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-white">Recommendations:</h4>
          <ul className="space-y-2">
            {setupStatus.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start space-x-2 text-sm text-gray-300">
                <span className="text-yellow-400 mt-0.5">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
          
          <div className="flex flex-wrap gap-3 mt-4">
            {!setupStatus.hasPages && (
              <a
                href="https://www.facebook.com/pages/create"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                <Facebook className="h-4 w-4" />
                <span>Create Facebook Page</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
            
            {hasBasicAccess && !setupStatus.hasInstagram && (
              <a
                href="https://business.instagram.com/getting-started"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                <Instagram className="h-4 w-4" />
                <span>Connect Instagram</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      )}

      {allSetup && (
        <div className="text-green-400 text-sm">
          🎉 Your account is fully set up! You can now access comprehensive analytics for your Facebook and Instagram content.
        </div>
      )}

      {hasBasicAccess && !allSetup && (
        <div className="text-blue-400 text-sm">
          ✅ You're logged in! The app will show demo data and any available real data from your Facebook account.
        </div>
      )}
    </motion.div>
  );
};

export default UserSetupGuide;