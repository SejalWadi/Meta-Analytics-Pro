import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Facebook, Instagram, Settings, Users, TrendingUp, RefreshCw, AlertCircle, ExternalLink, CheckCircle, Shield, Info } from 'lucide-react';
import { analyticsService } from '../services/analyticsService';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface Account {
  id: string;
  name: string;
  platform: 'facebook' | 'instagram';
  followers: number;
  isConnected: boolean;
  lastSync?: string;
  category?: string;
  about?: string;
  username?: string;
}

const Accounts: React.FC = () => {
  const { user, requestPagePermissions } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestingPermissions, setRequestingPermissions] = useState(false);
  const [setupStatus, setSetupStatus] = useState<{
    hasPages: boolean;
    hasPermissions: boolean;
    needsSetup: boolean;
    isBasicUser: boolean;
  }>({
    hasPages: false,
    hasPermissions: false,
    needsSetup: true,
    isBasicUser: true
  });

  useEffect(() => {
    if (user) {
      fetchAccounts();
      checkSetupStatus();
    }
  }, [user]);

  const checkSetupStatus = async () => {
    if (!user?.accessToken) return;

    try {
      // Check what permissions we actually have
      const hasBasicPermissions = user.permissions?.grantedPermissions?.includes('email') && 
                                 user.permissions?.grantedPermissions?.includes('public_profile');
      const hasPagePermissions = user.permissions?.grantedPermissions?.includes('pages_show_list') || 
                                user.permissions?.hasPageAccess;

      setSetupStatus({
        hasPermissions: hasPagePermissions,
        hasPages: false, // Will be updated by fetchAccounts
        needsSetup: !hasBasicPermissions,
        isBasicUser: hasBasicPermissions && !hasPagePermissions
      });

    } catch (error) {
      console.error('Error checking setup status:', error);
    }
  };

  const fetchAccounts = async () => {
    if (!user?.accessToken) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching accounts for user:', user.name);
      console.log('User permissions:', user.permissions);
      
      // Check if we have page permissions
      const hasPagePermissions = user.permissions?.grantedPermissions?.includes('pages_show_list') || 
                                user.permissions?.hasPageAccess;

      if (!hasPagePermissions) {
        // User doesn't have page permissions - show appropriate message
        setError('Page permissions not granted. You can still use the app with demo data, or grant permissions to see your real Facebook pages.');
        setAccounts([]);
        setSetupStatus(prev => ({
          ...prev,
          hasPages: false,
          isBasicUser: true
        }));
        toast.info('Using demo data. Grant page permissions to see your real Facebook pages.');
        setLoading(false);
        return;
      }

      // Try to fetch real accounts
      const accountsData = await analyticsService.getAccounts(user.accessToken);
      console.log('Accounts fetched:', accountsData);
      
      setAccounts(accountsData);
      setSetupStatus(prev => ({
        ...prev,
        hasPages: accountsData.length > 0,
        needsSetup: accountsData.length === 0
      }));
      
      if (accountsData.length === 0) {
        setError('No Facebook pages found. You need admin access to Facebook pages to see analytics. You can still use the app with demo data.');
        toast.warning('No pages found. The app will show demo data.');
      } else {
        toast.success(`Found ${accountsData.length} account(s)`);
        setError(null);
      }
    } catch (error: any) {
      console.error('Failed to fetch accounts:', error);
      
      // Handle specific permission errors
      if (error.message.includes('permissions') || error.message.includes('scope')) {
        setError('Additional permissions needed to access your Facebook pages. You can still use the app with demo data.');
        toast.info('Using demo data. Grant additional permissions to see real page data.');
      } else {
        setError('Unable to fetch account data. The app will show demo data instead.');
        toast.warning('Using demo data due to API limitations.');
      }
      
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPermissions = async () => {
    setRequestingPermissions(true);
    try {
      toast.loading('Requesting page permissions...');
      await requestPagePermissions();
      toast.success('Permissions requested! Refreshing accounts...');
      
      // Wait a moment then refresh
      setTimeout(() => {
        fetchAccounts();
        checkSetupStatus();
      }, 2000);
      
    } catch (error: any) {
      console.error('Permission request error:', error);
      toast.error('Permission request failed. You can still use the app with demo data.');
    } finally {
      setRequestingPermissions(false);
    }
  };

  const connectNewAccount = async () => {
    handleRequestPermissions();
  };

  const toggleAccount = (accountId: string) => {
    setAccounts(accounts.map(account => 
      account.id === accountId 
        ? { ...account, isConnected: !account.isConnected }
        : account
    ));
    toast.success('Account status updated');
  };

  const getPlatformIcon = (platform: string) => {
    return platform === 'facebook' ? Facebook : Instagram;
  };

  const getPlatformColor = (platform: string) => {
    return platform === 'facebook' ? 'text-blue-400' : 'text-pink-400';
  };

  const openFacebookPagesManager = () => {
    window.open('https://www.facebook.com/pages/', '_blank');
  };

  const openInstagramBusiness = () => {
    window.open('https://business.instagram.com/', '_blank');
  };

  const openFacebookAppReview = () => {
    window.open('https://developers.facebook.com/docs/app-review/', '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Connected Accounts</h1>
          <p className="text-gray-400 mt-1">Manage your Facebook and Instagram accounts</p>
        </div>
        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchAccounts}
            disabled={loading}
            className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={connectNewAccount}
            disabled={requestingPermissions}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            <span>{requestingPermissions ? 'Requesting...' : 'Grant Permissions'}</span>
          </motion.button>
        </div>
      </div>

      {/* App Status Information */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blue-600 bg-opacity-20 border border-blue-600 text-blue-400 p-6 rounded-lg"
      >
        <div className="flex items-start space-x-3">
          <Info className="h-6 w-6 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold mb-2">App Status & Permissions</h3>
            <div className="space-y-3 text-sm text-blue-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-700 bg-opacity-30 p-3 rounded">
                  <div className="font-medium text-blue-300 mb-1">✅ Basic Login</div>
                  <div className="text-xs">Email and profile access working</div>
                </div>
                <div className={`p-3 rounded ${setupStatus.hasPermissions ? 'bg-green-700 bg-opacity-30' : 'bg-yellow-700 bg-opacity-30'}`}>
                  <div className={`font-medium mb-1 ${setupStatus.hasPermissions ? 'text-green-300' : 'text-yellow-300'}`}>
                    {setupStatus.hasPermissions ? '✅ Page Permissions' : '⚠️ Page Permissions'}
                  </div>
                  <div className="text-xs">
                    {setupStatus.hasPermissions ? 'Can access Facebook pages' : 'Additional permissions needed'}
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-700 bg-opacity-30 p-3 rounded">
                <div className="font-medium text-blue-300 mb-2">Current Status:</div>
                {setupStatus.isBasicUser ? (
                  <div className="text-sm">
                    <p>• You're logged in with basic permissions</p>
                    <p>• The app shows demo data mixed with any available real data</p>
                    <p>• Grant additional permissions to see your Facebook page analytics</p>
                  </div>
                ) : setupStatus.hasPermissions ? (
                  <div className="text-sm">
                    <p>• You have page access permissions</p>
                    <p>• The app can show real data from your Facebook pages</p>
                    <p>• All features are available</p>
                  </div>
                ) : (
                  <div className="text-sm">
                    <p>• Basic login completed</p>
                    <p>• Additional setup needed for full functionality</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Permission Request Section */}
      {setupStatus.isBasicUser && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-600 bg-opacity-20 border border-yellow-600 text-yellow-400 p-6 rounded-lg"
        >
          <div className="flex items-start space-x-3">
            <Shield className="h-6 w-6 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold mb-2">Want to See Your Real Facebook Page Data?</h3>
              <div className="space-y-3 text-sm text-yellow-100">
                <p>Currently, you're seeing demo data. To access your real Facebook page analytics:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Grant additional Facebook permissions</li>
                  <li>Make sure you have admin access to Facebook pages</li>
                  <li>Ensure your pages have recent posts</li>
                </ul>
                
                <div className="flex flex-wrap gap-3 mt-4">
                  <button
                    onClick={handleRequestPermissions}
                    disabled={requestingPermissions}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 disabled:opacity-50"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>{requestingPermissions ? 'Requesting...' : 'Grant Page Permissions'}</span>
                  </button>
                  
                  <button
                    onClick={openFacebookPagesManager}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2"
                  >
                    <Facebook className="h-4 w-4" />
                    <span>Manage Facebook Pages</span>
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-orange-600 bg-opacity-20 border border-orange-600 text-orange-400 p-4 rounded-lg flex items-center space-x-2"
        >
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </motion.div>
      )}

      {/* Account Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 p-6 rounded-xl border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">Connected Accounts</p>
              <p className="text-2xl font-bold text-white">{accounts.length}</p>
              <p className="text-xs text-gray-500">
                {setupStatus.isBasicUser ? 'Demo mode active' : 'Real data available'}
              </p>
            </div>
            <div className="p-3 bg-blue-600 bg-opacity-20 rounded-lg">
              <Settings className="h-6 w-6 text-blue-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 p-6 rounded-xl border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">Active Accounts</p>
              <p className="text-2xl font-bold text-white">
                {accounts.filter(acc => acc.isConnected).length}
              </p>
              <p className="text-xs text-gray-500">
                {setupStatus.hasPermissions ? 'Real accounts' : 'Demo accounts'}
              </p>
            </div>
            <div className="p-3 bg-green-600 bg-opacity-20 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 p-6 rounded-xl border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">Total Followers</p>
              <p className="text-2xl font-bold text-white">
                {accounts.reduce((sum, acc) => sum + (acc.followers || 0), 0).toLocaleString() || '12.5K'}
              </p>
              <p className="text-xs text-gray-500">
                {setupStatus.isBasicUser ? 'Demo data' : 'Real followers'}
              </p>
            </div>
            <div className="p-3 bg-purple-600 bg-opacity-20 rounded-lg">
              <Users className="h-6 w-6 text-purple-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Accounts List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-lg font-bold text-white">Account Management</h3>
          <p className="text-sm text-gray-400 mt-1">
            {setupStatus.isBasicUser 
              ? 'Currently showing demo data. Grant permissions to see your real Facebook pages.'
              : 'Manage your connected Facebook and Instagram accounts.'
            }
          </p>
        </div>
        
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-700 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-700 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/6"></div>
                </div>
                <div className="w-16 h-8 bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        ) : accounts.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              {setupStatus.isBasicUser ? 'No page permissions granted' : 'No accounts found'}
            </div>
            <p className="text-sm text-gray-500 mb-4">
              {setupStatus.isBasicUser 
                ? 'The app is working with demo data. Grant page permissions to see your real Facebook pages.'
                : 'Make sure you have admin access to Facebook pages or Instagram business accounts'
              }
            </p>
            <div className="space-y-3">
              <button
                onClick={handleRequestPermissions}
                disabled={requestingPermissions}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors mr-3 disabled:opacity-50"
              >
                {requestingPermissions ? 'Requesting...' : 'Grant Page Permissions'}
              </button>
              <button
                onClick={openFacebookPagesManager}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Manage Facebook Pages
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {accounts.map((account, index) => {
              const PlatformIcon = getPlatformIcon(account.platform);
              return (
                <motion.div
                  key={account.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg bg-opacity-20 ${
                        account.platform === 'facebook' ? 'bg-blue-600' : 'bg-pink-600'
                      }`}>
                        <PlatformIcon className={`h-6 w-6 ${getPlatformColor(account.platform)}`} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{account.name}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span className="capitalize">{account.platform}</span>
                          <span>{(account.followers || 0).toLocaleString()} followers</span>
                          {account.category && <span>{account.category}</span>}
                          {account.lastSync && (
                            <span>Last sync: {new Date(account.lastSync).toLocaleDateString()}</span>
                          )}
                        </div>
                        {account.about && (
                          <p className="text-xs text-gray-500 mt-1 max-w-md truncate">{account.about}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        account.isConnected 
                          ? 'bg-green-600 bg-opacity-20 text-green-400' 
                          : 'bg-gray-600 bg-opacity-20 text-gray-400'
                      }`}>
                        {account.isConnected ? 'Connected' : 'Disconnected'}
                      </div>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleAccount(account.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          account.isConnected
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {account.isConnected ? 'Disconnect' : 'Connect'}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Platform Integration Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-800 p-6 rounded-xl border border-gray-700"
        >
          <div className="flex items-center space-x-3 mb-4">
            <Facebook className="h-6 w-6 text-blue-400" />
            <h3 className="text-lg font-bold text-white">Facebook Integration</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Basic Login</span>
              <span className="text-green-400">✓ Connected</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Page Access</span>
              <span className={setupStatus.hasPermissions ? 'text-green-400' : 'text-yellow-400'}>
                {setupStatus.hasPermissions ? '✓ Granted' : '○ Optional'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Analytics API</span>
              <span className={setupStatus.hasPermissions ? 'text-green-400' : 'text-gray-400'}>
                {setupStatus.hasPermissions ? '✓ Active' : '○ Demo Mode'}
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 p-6 rounded-xl border border-gray-700"
        >
          <div className="flex items-center space-x-3 mb-4">
            <Instagram className="h-6 w-6 text-pink-400" />
            <h3 className="text-lg font-bold text-white">Instagram Integration</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Business Account</span>
              <span className={accounts.some(acc => acc.platform === 'instagram') ? 'text-green-400' : 'text-yellow-400'}>
                {accounts.some(acc => acc.platform === 'instagram') ? '✓ Connected' : '○ Optional'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Insights API</span>
              <span className={accounts.some(acc => acc.platform === 'instagram') ? 'text-green-400' : 'text-gray-400'}>
                {accounts.some(acc => acc.platform === 'instagram') ? '✓ Active' : '○ Demo Mode'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Media Access</span>
              <span className={accounts.some(acc => acc.platform === 'instagram') ? 'text-green-400' : 'text-gray-400'}>
                {accounts.some(acc => acc.platform === 'instagram') ? '✓ Enabled' : '○ Demo Mode'}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* App Review Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 p-6 rounded-xl border border-gray-700"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="h-6 w-6 text-purple-400" />
          <h3 className="text-lg font-bold text-white">About Facebook App Permissions</h3>
        </div>
        <div className="space-y-3 text-sm text-gray-300">
          <p>
            <strong>Why some features show demo data:</strong> Facebook requires apps to go through 
            "App Review\" before accessing advanced permissions like page analytics.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-700 p-3 rounded">
              <div className="text-green-400 font-medium mb-1">✅ Currently Available</div>
              <ul className="text-xs space-y-1">
                <li>• Basic Facebook login</li>
                <li>• User profile information</li>
                <li>• Demo analytics data</li>
                <li>• All app features (with demo data)</li>
              </ul>
            </div>
            <div className="bg-gray-700 p-3 rounded">
              <div className="text-yellow-400 font-medium mb-1">⚠️ Requires App Review</div>
              <ul className="text-xs space-y-1">
                <li>• Real Facebook page analytics</li>
                <li>• Instagram business data</li>
                <li>• Live post performance metrics</li>
                <li>• Audience demographics</li>
              </ul>
            </div>
          </div>
          <div className="flex items-center space-x-3 mt-4">
            <button
              onClick={openFacebookAppReview}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Learn About App Review</span>
            </button>
            <span className="text-xs text-gray-500">
              For production apps serving real users
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Accounts;