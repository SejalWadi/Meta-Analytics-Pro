import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Filter, Download, TrendingUp, Users, Eye, Heart } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import MetricCard from '../components/Dashboard/MetricCard';
import EngagementChart from '../components/Charts/EngagementChart';

const Analytics: React.FC = () => {
  const { metricsData, loading } = useData();
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header with Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics</h1>
          <p className="text-gray-400 mt-1">Deep dive into your content performance metrics</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Platforms</option>
            <option value="facebook">Facebook</option>
            <option value="instagram">Instagram</option>
          </select>
          
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </motion.button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Reach"
          value={metricsData?.totalReach || 0}
          change="+12.5%"
          changeType="positive"
          icon={Eye}
          loading={loading}
        />
        <MetricCard
          title="Engagement Rate"
          value={`${metricsData?.engagementRate || 0}%`}
          change="+0.8%"
          changeType="positive"
          icon={Heart}
          loading={loading}
        />
        <MetricCard
          title="Impressions"
          value={metricsData?.totalImpressions || 0}
          change="+5.4%"
          changeType="positive"
          icon={TrendingUp}
          loading={loading}
        />
        <MetricCard
          title="New Followers"
          value="1,234"
          change="+23.1%"
          changeType="positive"
          icon={Users}
          loading={loading}
        />
      </div>

      {/* Main Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EngagementChart 
          data={metricsData?.engagementByTime || []} 
          loading={loading}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-800 p-6 rounded-xl border border-gray-700"
        >
          <h3 className="text-lg font-bold text-white mb-4">Platform Performance</h3>
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-white">Facebook</span>
                </div>
                <div className="text-right">
                  <div className="text-white font-semibold">67%</div>
                  <div className="text-sm text-gray-400">145K reach</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                  <span className="text-white">Instagram</span>
                </div>
                <div className="text-right">
                  <div className="text-white font-semibold">33%</div>
                  <div className="text-sm text-gray-400">78K reach</div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Detailed Analytics Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-lg font-bold text-white">Content Performance Details</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Content</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Platform</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Reach</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Engagement</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Rate</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-700">
                    <td className="p-4">
                      <div className="h-4 bg-gray-600 rounded animate-pulse"></div>
                    </td>
                    <td className="p-4">
                      <div className="h-4 bg-gray-600 rounded animate-pulse w-20"></div>
                    </td>
                    <td className="p-4">
                      <div className="h-4 bg-gray-600 rounded animate-pulse w-16"></div>
                    </td>
                    <td className="p-4">
                      <div className="h-4 bg-gray-600 rounded animate-pulse w-16"></div>
                    </td>
                    <td className="p-4">
                      <div className="h-4 bg-gray-600 rounded animate-pulse w-12"></div>
                    </td>
                    <td className="p-4">
                      <div className="h-4 bg-gray-600 rounded animate-pulse w-20"></div>
                    </td>
                  </tr>
                ))
              ) : (
                metricsData?.topPosts.map((post, index) => (
                  <motion.tr
                    key={post.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-b border-gray-700 hover:bg-gray-700 transition-colors"
                  >
                    <td className="p-4">
                      <div className="text-white font-medium truncate max-w-xs">
                        {post.content}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        post.platform === 'facebook' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-pink-600 text-white'
                      }`}>
                        {post.platform}
                      </span>
                    </td>
                    <td className="p-4 text-gray-300">{post.reach.toLocaleString()}</td>
                    <td className="p-4 text-gray-300">{post.engagement.toLocaleString()}</td>
                    <td className="p-4 text-gray-300">
                      {((post.engagement / post.reach) * 100).toFixed(1)}%
                    </td>
                    <td className="p-4 text-gray-300">2 days ago</td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Analytics;