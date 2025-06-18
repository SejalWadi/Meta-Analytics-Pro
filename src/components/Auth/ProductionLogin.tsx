import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Facebook, Instagram, TrendingUp, BarChart, Users, Target, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const ProductionLogin: React.FC = () => {
  const { login, isAuthenticated, loading } = useAuth();
  const [isLogging, setIsLogging] = useState(false);
  const [showRequirements, setShowRequirements] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async () => {
    setIsLogging(true);
    try {
      console.log('Production login initiated');
      await login();
      toast.success('Successfully logged in!');
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle specific Facebook errors for production users
      if (error.message.includes('permissions')) {
        toast.error('Please grant all required permissions to use the app.');
      } else if (error.message.includes('pages')) {
        toast.error('You need admin access to Facebook pages to see analytics.');
        setShowRequirements(true);
      } else {
        toast.error('Login failed. Please try again or contact support.');
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
                <p className="text-blue-300">Content Performance Analyzer</p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-white leading-tight">
                Unlock the Power of Your
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {' '}Social Media Data
                </span>
              </h2>
              <p className="text-xl text-gray-300 leading-relaxed">
                Comprehensive Facebook and Instagram analytics platform that transforms your content strategy 
                with deep insights, audience intelligence, and optimization recommendations.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gray-800 bg-opacity-50 p-4 rounded-lg border border-gray-700"
              >
                <BarChart className="h-8 w-8 text-blue-400 mb-2" />
                <h3 className="font-semibold text-white mb-1">Advanced Analytics</h3>
                <p className="text-sm text-gray-400">Cross-platform performance tracking</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gray-800 bg-opacity-50 p-4 rounded-lg border border-gray-700"
              >
                <Users className="h-8 w-8 text-purple-400 mb-2" />
                <h3 className="font-semibold text-white mb-1">Audience Insights</h3>
                <p className="text-sm text-gray-400">Demographics & behavior analysis</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gray-800 bg-opacity-50 p-4 rounded-lg border border-gray-700"
              >
                <Target className="h-8 w-8 text-green-400 mb-2" />
                <h3 className="font-semibold text-white mb-1">Optimization</h3>
                <p className="text-sm text-gray-400">AI-powered recommendations</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gray-800 bg-opacity-50 p-4 rounded-lg border border-gray-700"
              >
                <TrendingUp className="h-8 w-8 text-orange-400 mb-2" />
                <h3 className="font-semibold text-white mb-1">Growth Tracking</h3>
                <p className="text-sm text-gray-400">Real-time performance metrics</p>
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
                <h3 className="text-2xl font-bold text-white mb-2">Get Started</h3>
                <p className="text-gray-400">Connect your Facebook and Instagram accounts to begin</p>
              </div>

              {/* Requirements Notice */}
              <div className="bg-blue-600 bg-opacity-20 border border-blue-600 rounded-lg p-4 text-left">
                <h4 className="text-blue-400 font-semibold mb-2 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Requirements for Full Analytics
                </h4>
                <ul className="text-sm text-blue-100 space-y-1">
                  <li>• Admin access to Facebook pages</li>
                  <li>• Instagram business account (optional)</li>
                  <li>• Recent posts on your pages</li>
                  <li>• Grant all requested permissions</li>
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
                      <span>Continue with Facebook</span>
                    </>
                  )}
                </motion.button>

                <div className="flex items-center space-x-4">
                  <div className="flex-1 h-px bg-gray-600"></div>
                  <span className="text-sm text-gray-400">Connects to</span>
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

              {showRequirements && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-yellow-600 bg-opacity-20 border border-yellow-600 rounded-lg p-4 text-left"
                >
                  <h4 className="text-yellow-400 font-semibold mb-2 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Need Help Getting Started?
                  </h4>
                  <div className="text-sm text-yellow-100 space-y-2">
                    <p>To see your analytics data, you need:</p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>Admin access to at least one Facebook page</li>
                      <li>Recent posts on your page (within last 30 days)</li>
                      <li>Instagram business account linked to your Facebook page</li>
                    </ol>
                    <p className="mt-2">
                      <a 
                        href="https://www.facebook.com/help/1503421039731588" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-yellow-300 underline hover:text-yellow-200"
                      >
                        Learn how to create a Facebook page →
                      </a>
                    </p>
                  </div>
                </motion.div>
              )}

              <div className="text-xs text-gray-500 leading-relaxed">
                By continuing, you agree to our{' '}
                <a href="/terms" className="text-blue-400 hover:text-blue-300">Terms of Service</a>
                {' '}and{' '}
                <a href="/privacy" className="text-blue-400 hover:text-blue-300">Privacy Policy</a>. 
                We only access public data and insights from your connected accounts.
              </div>

              {/* Production Status Indicator */}
              {import.meta.env.MODE === 'production' && (
                <div className="text-xs text-green-400 bg-green-600 bg-opacity-20 rounded p-2">
                  ✓ Production App - Available to all Facebook users
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductionLogin;