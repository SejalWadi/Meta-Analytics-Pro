import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Facebook, Instagram, TrendingUp, BarChart, Users, Target, Shield, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Login: React.FC = () => {
  const { login, isAuthenticated, loading } = useAuth();
  const [isLogging, setIsLogging] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async () => {
    setIsLogging(true);
    try {
      console.log('🚀 Starting real Facebook login...');
      await login();
      toast.success('Successfully connected to your Facebook account!');
    } catch (error: any) {
      console.error('❌ Login error:', error);
      
      // Provide helpful error messages
      if (error.message.includes('permissions')) {
        toast.error('Please grant all requested permissions to access your Facebook data.');
      } else if (error.message.includes('cancelled')) {
        toast.error('Login was cancelled. Please try again to access your analytics.');
      } else {
        toast.error('Failed to connect to Facebook. Please try again.');
      }
    } finally {
      setIsLogging(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white">Loading Facebook SDK...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-8">
        {/* Left side - Hero content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col justify-center space-y-8"
        >
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Meta Analytics Pro</h1>
                <p className="text-blue-300">Real Facebook Analytics Platform</p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-white leading-tight">
                Connect Your
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {' '}Real Facebook Account
                </span>
              </h2>
              <p className="text-xl text-gray-300 leading-relaxed">
                Access your actual Facebook page analytics, Instagram insights, and real engagement data. 
                No demo data - see your authentic social media performance.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gray-800 bg-opacity-50 p-4 rounded-lg border border-gray-700"
              >
                <BarChart className="h-8 w-8 text-blue-400 mb-2" />
                <h3 className="font-semibold text-white mb-1">Real Analytics</h3>
                <p className="text-sm text-gray-400">Your actual Facebook page data</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gray-800 bg-opacity-50 p-4 rounded-lg border border-gray-700"
              >
                <Users className="h-8 w-8 text-purple-400 mb-2" />
                <h3 className="font-semibold text-white mb-1">Live Insights</h3>
                <p className="text-sm text-gray-400">Real-time engagement metrics</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gray-800 bg-opacity-50 p-4 rounded-lg border border-gray-700"
              >
                <Target className="h-8 w-8 text-green-400 mb-2" />
                <h3 className="font-semibold text-white mb-1">Your Content</h3>
                <p className="text-sm text-gray-400">Analyze your actual posts</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gray-800 bg-opacity-50 p-4 rounded-lg border border-gray-700"
              >
                <TrendingUp className="h-8 w-8 text-orange-400 mb-2" />
                <h3 className="font-semibold text-white mb-1">Real Growth</h3>
                <p className="text-sm text-gray-400">Track your genuine progress</p>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Right side - Login form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex items-center justify-center"
        >
          <div className="bg-gray-800 bg-opacity-80 backdrop-blur-sm p-8 rounded-2xl border border-gray-700 w-full max-w-md">
            <div className="text-center space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Connect Your Account</h3>
                <p className="text-gray-400">Login with Facebook to access your real analytics data</p>
              </div>

              {/* What you'll get */}
              <div className="bg-blue-600 bg-opacity-20 border border-blue-600 rounded-lg p-4 text-left">
                <h4 className="text-blue-400 font-semibold mb-2 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  What You'll Access
                </h4>
                <ul className="text-sm text-blue-100 space-y-1">
                  <li>• Your Facebook pages and their analytics</li>
                  <li>• Real post performance data</li>
                  <li>• Actual engagement metrics</li>
                  <li>• Instagram business account data</li>
                  <li>• Audience demographics</li>
                </ul>
              </div>

              <div className="space-y-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogin}
                  disabled={isLogging}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLogging ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Facebook className="h-5 w-5" />
                      <span>Connect with Facebook</span>
                    </>
                  )}
                </motion.button>

                <div className="flex items-center space-x-4">
                  <div className="flex-1 h-px bg-gray-600"></div>
                  <span className="text-sm text-gray-400">Accesses</span>
                  <div className="flex-1 h-px bg-gray-600"></div>
                </div>

                <div className="flex items-center justify-center space-x-6">
                  <div className="flex items-center space-x-2 text-blue-400">
                    <Facebook className="h-5 w-5" />
                    <span className="text-sm">Facebook Pages</span>
                  </div>
                  <div className="flex items-center space-x-2 text-pink-400">
                    <Instagram className="h-5 w-5" />
                    <span className="text-sm">Instagram</span>
                  </div>
                </div>
              </div>

              {/* Security notice */}
              <div className="bg-green-600 bg-opacity-20 border border-green-600 rounded-lg p-3 text-left">
                <h4 className="text-green-400 font-semibold mb-1 flex items-center text-sm">
                  <Shield className="h-4 w-4 mr-2" />
                  Secure & Private
                </h4>
                <p className="text-xs text-green-100">
                  We only read your public page data and analytics. Your personal information stays private.
                </p>
              </div>

              <div className="text-xs text-gray-500 leading-relaxed">
                By connecting, you agree to our Terms of Service and Privacy Policy. 
                We use Facebook's official Graph API to access your analytics data securely.
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;