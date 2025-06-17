import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Facebook, Instagram, Settings, Users, TrendingUp, Eye } from 'lucide-react';
import { analyticsService } from '../services/analyticsService';
import { useAuth } from '../contexts/AuthContext';

interface Account {
  id: string;
  name: string;
  platform: 'facebook' | 'instagram';
  followers: number;
  isConnected: boolean;
  lastSync?: string;
}

const Accounts: React.FC = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAccounts();
  }, [user]);

  const fetchAccounts = async () => {
    if (!user) return;
    
    try {
      const accountsData = await analyticsService.getAccounts(user.accessToken);
      setAccounts(accountsData);
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAccount = (accountId: string) => {
    setAccounts(accounts.map(account => 
      account.id === accountId 
        ? { ...account, isConnected: !account.isConnected }
        : account
    ));
  };

  const getPlatformIcon = (platform: string) => {
    return platform === 'facebook' ? Facebook : Instagram;
  };

  const getPlatformColor = (platform: string) => {
    return platform === 'facebook' ? 'text-blue-400' : 'text-pink-400';
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
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Account</span>
        </motion.button>
      </div>

      {/* Account Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 p-6 rounded-xl border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">Total Accounts</p>
              <p className="text-2xl font-bold text-white">{accounts.length}</p>
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
                {accounts.reduce((sum, acc) => sum + acc.followers, 0).toLocaleString()}
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
                          <span>{account.followers.toLocaleString()} followers</span>
                          {account.lastSync && (
                            <span>Last sync: {account.lastSync}</span>
                          )}
                        </div>
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
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                      >
                        <Settings className="h-4 w-4" />
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
              <span className="text-gray-300">Pages Access</span>
              <span className="text-green-400">✓ Connected</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Insights API</span>
              <span className="text-green-400">✓ Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Posts Management</span>
              <span className="text-green-400">✓ Enabled</span>
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
              <span className="text-gray-300">Basic Display</span>
              <span className="text-green-400">✓ Connected</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Insights API</span>
              <span className="text-green-400">✓ Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Media Access</span>
              <span className="text-green-400">✓ Enabled</span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Accounts;