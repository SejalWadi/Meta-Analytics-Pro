import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Eye, Heart, RefreshCw, AlertCircle, Shield, ExternalLink, Info, CheckCircle } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import MetricCard from '../components/Dashboard/MetricCard';
import EngagementChart from '../components/Charts/EngagementChart';

const Dashboard: React.FC = () => {
  const { metricsData, loading, refreshData, error } = useData();
  const { user } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const openFacebookInsights = () => {
    window.open('https://www.facebook.com/insights/', '_blank');
  };

  const openInstagramInsights = () => {
    window.open('https://business.instagram.com/insights', '_blank');
  };

  // Check data status
  const hasRealData = metricsData?.realDataFound;
  const dataStatus = metricsData?.dataStatus || 'loading';
  const statusMessage = metricsData?.statusMessage || 'Loading your Facebook data...';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'real': return 'from-green-600 to-blue-600 border-green-500';
      case 'no_pages': return 'from-orange-600 to-red-600 border-orange-500';
      case 'loading': return 'from-blue-600 to-purple-600 border-blue-500';
      default: return 'from-gray-600 to-gray-700 border-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'real': return '✅';
      case 'no_pages': return '📭';
      case 'loading': return '🔄';
      default: return '📊';
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">Welcome back, {user?.name}! Here's your real Facebook analytics.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={refreshData}
          disabled={loading}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </motion.button>
      </motion.div>

      {/* Real Data Status */}
      <motion.div
        variants={itemVariants}
        className={`p-4 rounded-lg border bg-gradient-to-r ${getStatusColor(dataStatus)}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="h-6 w-6 text-white" />
            <div>
              <h3 className="text-white font-semibold flex items-center space-x-2">
                <span>{getStatusIcon(dataStatus)}</span>
                <span>{statusMessage}</span>
              </h3>
              <p className="text-white text-opacity-90 text-sm">
                {dataStatus === 'real' && 'Showing real data from your Facebook pages and Instagram account'}
                {dataStatus === 'no_pages' && 'Create a Facebook page to see real analytics data'}
                {dataStatus === 'loading' && 'Connecting to Facebook Graph API to fetch your data...'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={openFacebookInsights}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
            >
              <ExternalLink className="h-3 w-3" />
              <span>Facebook Insights</span>
            </button>
            <button
              onClick={openInstagramInsights}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
            >
              <ExternalLink className="h-3 w-3" />
              <span>Instagram Insights</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* User Permissions Status */}
      {user?.permissions && (
        <motion.div
          variants={itemVariants}
          className="bg-gray-800 p-4 rounded-lg border border-gray-700"
        >
          <h3 className="text-white font-semibold mb-2 flex items-center">
            <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
            Your Facebook Connection Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-gray-700 p-3 rounded">
              <div className="text-green-400 font-medium mb-1">✓ Basic Access</div>
              <div className="text-gray-300">
                Connected to {user.name}'s Facebook account with email and profile access
              </div>
            </div>
            <div className="bg-gray-700 p-3 rounded">
              <div className={`font-medium mb-1 ${user.permissions.hasPageAccess ? 'text-green-400' : 'text-orange-400'}`}>
                {user.permissions.hasPageAccess ? '✓ Page Access' : '⚠ Page Access'}
              </div>
              <div className="text-gray-300">
                {user.permissions.hasPageAccess 
                  ? 'Can access your Facebook pages and their analytics'
                  : 'Additional permissions needed for page analytics'
                }
              </div>
            </div>
            <div className="bg-gray-700 p-3 rounded">
              <div className={`font-medium mb-1 ${user.permissions.hasInstagramAccess ? 'text-green-400' : 'text-gray-400'}`}>
                {user.permissions.hasInstagramAccess ? '✓ Instagram' : '○ Instagram'}
              </div>
              <div className="text-gray-300">
                {user.permissions.hasInstagramAccess 
                  ? 'Instagram business account connected'
                  : 'Instagram access not configured'
                }
              </div>
            </div>
          </div>
          {metricsData && (
            <div className="mt-3 text-xs text-gray-500 bg-gray-700 p-2 rounded">
              Real Data Status: Pages: {metricsData.totalPages || 0} | Posts: {metricsData.totalPosts || 0} | 
              Followers: {metricsData.totalFollowers || 0} | Can Access Real Data: {user.permissions.canAccessRealData ? 'Yes' : 'No'}
            </div>
          )}
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-600 bg-opacity-20 border border-red-600 text-red-400 p-4 rounded-lg flex items-center space-x-2"
        >
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </motion.div>
      )}

      {/* Metrics Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Reach"
          value={metricsData?.totalReach || 0}
          change="+12.5% from last month"
          changeType="positive"
          icon={Eye}
          loading={loading}
        />
        <MetricCard
          title="Total Engagement"
          value={metricsData?.totalEngagement || 0}
          change="+8.2% from last month"
          changeType="positive"
          icon={Heart}
          loading={loading}
        />
        <MetricCard
          title="Impressions"
          value={metricsData?.totalImpressions || 0}
          change="+5.4% from last month"
          changeType="positive"
          icon={TrendingUp}
          loading={loading}
        />
        <MetricCard
          title="Engagement Rate"
          value={`${metricsData?.engagementRate || 0}%`}
          change="+2.1% from last month"
          changeType="positive"
          icon={Users}
          loading={loading}
        />
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <EngagementChart 
            data={metricsData?.engagementByTime || []} 
            loading={loading}
          />
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-gray-800 p-6 rounded-xl border border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Top Performing Posts</h3>
            <div className={`text-xs px-2 py-1 rounded ${
              hasRealData 
                ? 'text-green-400 bg-green-600 bg-opacity-20' 
                : 'text-orange-400 bg-orange-600 bg-opacity-20'
            }`}>
              {hasRealData ? 'Real Facebook Data' : 'No Posts Found'}
            </div>
          </div>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : metricsData?.topPosts && metricsData.topPosts.length > 0 ? (
            <div className="space-y-4">
              {metricsData.topPosts.slice(0, 3).map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-gray-700 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-white font-medium mb-2 line-clamp-2">
                        {post.content || 'No content available'}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span>Reach: {(post.reach || 0).toLocaleString()}</span>
                        <span>Engagement: {(post.engagement || 0).toLocaleString()}</span>
                        <span className="capitalize">{post.platform}</span>
                        {post.page_name && (
                          <span className="text-blue-400">from {post.page_name}</span>
                        )}
                      </div>
                      {post.created_time && (
                        <div className="text-xs text-gray-500 mt-1">
                          Posted: {new Date(post.created_time).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                        #{index + 1}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">No posts found</div>
              <p className="text-sm text-gray-500 mb-4">
                {dataStatus === 'no_pages' 
                  ? 'Create a Facebook page and post content to see analytics'
                  : 'Post some content on your Facebook pages to see performance data'
                }
              </p>
              <button 
                onClick={refreshData}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                Refresh data
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Content Performance Overview */}
      <motion.div
        variants={itemVariants}
        className="bg-gray-800 p-6 rounded-xl border border-gray-700"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Content Performance by Type</h3>
          <div className={`text-xs px-2 py-1 rounded ${
            hasRealData 
              ? 'text-green-400 bg-green-600 bg-opacity-20' 
              : 'text-orange-400 bg-orange-600 bg-opacity-20'
          }`}>
            {hasRealData ? 'Based on Real Posts' : 'No Data Available'}
          </div>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        ) : metricsData?.contentPerformance && metricsData.contentPerformance.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {metricsData.contentPerformance.map((content, index) => (
              <motion.div
                key={content.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-700 p-4 rounded-lg text-center"
              >
                <div className="text-2xl font-bold text-white mb-1">
                  {content.posts || 0}
                </div>
                <div className="text-sm text-gray-400 mb-2">{content.type}</div>
                <div className="text-xs text-gray-500">
                  Avg: {(content.avgEngagement || 0).toLocaleString()} eng
                </div>
                <div className={`text-xs mt-1 ${
                  hasRealData ? 'text-green-400' : 'text-orange-400'
                }`}>
                  {hasRealData ? 'Real data from your posts' : 'No data available'}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">No content performance data available</div>
            <p className="text-sm text-gray-500 mb-4">
              {dataStatus === 'no_pages' 
                ? 'Create a Facebook page and post content to see performance analytics'
                : 'Post content on your Facebook pages to see performance breakdown'
              }
            </p>
            <button 
              onClick={refreshData}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              Refresh data
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;