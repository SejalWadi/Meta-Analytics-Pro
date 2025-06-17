import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Eye, Heart, RefreshCw } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import MetricCard from '../components/Dashboard/MetricCard';
import EngagementChart from '../components/Charts/EngagementChart';

const Dashboard: React.FC = () => {
  const { metricsData, loading, refreshData } = useData();

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
          <p className="text-gray-400 mt-1">Welcome back! Here's your content performance overview.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={refreshData}
          disabled={loading}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </motion.button>
      </motion.div>

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
          title="Follower Growth"
          value={`${metricsData?.followerGrowth || 0}%`}
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
          <h3 className="text-lg font-bold text-white mb-4">Top Performing Posts</h3>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {metricsData?.topPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-gray-700 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-white font-medium mb-2">{post.content}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span>Reach: {post.reach.toLocaleString()}</span>
                        <span>Engagement: {post.engagement.toLocaleString()}</span>
                        <span className="capitalize">{post.platform}</span>
                      </div>
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
          )}
        </motion.div>
      </div>

      {/* Content Performance Overview */}
      <motion.div
        variants={itemVariants}
        className="bg-gray-800 p-6 rounded-xl border border-gray-700"
      >
        <h3 className="text-lg font-bold text-white mb-4">Content Performance by Type</h3>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {metricsData?.contentPerformance.map((content, index) => (
              <motion.div
                key={content.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-700 p-4 rounded-lg text-center"
              >
                <div className="text-2xl font-bold text-white mb-1">
                  {content.posts}
                </div>
                <div className="text-sm text-gray-400 mb-2">{content.type}</div>
                <div className="text-xs text-gray-500">
                  Avg: {content.avgEngagement} eng
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;