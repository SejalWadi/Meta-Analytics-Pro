import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Calendar, Filter, FileText, TrendingUp, Users, Eye, Share, Settings } from 'lucide-react';
import { useData } from '../contexts/DataContext';

const Reports: React.FC = () => {
  const { metricsData, loading } = useData();
  const [selectedReport, setSelectedReport] = useState('overview');
  const [dateRange, setDateRange] = useState('30d');

  const reportTypes = [
    { id: 'overview', name: 'Performance Overview', icon: TrendingUp },
    { id: 'audience', name: 'Audience Report', icon: Users },
    { id: 'content', name: 'Content Analysis', icon: FileText },
    { id: 'engagement', name: 'Engagement Report', icon: Share },
  ];

  const exportFormats = ['PDF', 'CSV', 'Excel'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Reports & Export</h1>
          <p className="text-gray-400 mt-1">Generate comprehensive reports and export your analytics data</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Download className="h-4 w-4" />
          <span>Generate Report</span>
        </motion.button>
      </div>

      {/* Report Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 p-6 rounded-xl border border-gray-700"
      >
        <h3 className="text-lg font-bold text-white mb-4">Report Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Report Type</label>
            <div className="space-y-2">
              {reportTypes.map((report) => {
                const IconComponent = report.icon;
                return (
                  <motion.button
                    key={report.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedReport(report.id)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                      selectedReport === report.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span className="text-sm">{report.name}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
              <option value="custom">Custom range</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Export Format</label>
            <div className="space-y-2">
              {exportFormats.map((format) => (
                <motion.button
                  key={format}
                  whileHover={{ scale: 1.02 }}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  Export as {format}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Report Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 p-6 rounded-xl border border-gray-700"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Report Preview</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <Calendar className="h-4 w-4" />
            <span>Generated on {new Date().toLocaleDateString()}</span>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-6 bg-gray-700 rounded mb-2 w-1/4"></div>
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Executive Summary */}
            <div className="bg-gray-700 p-4 rounded-lg">
              <h4 className="font-semibold text-white mb-3">Executive Summary</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{metricsData?.totalReach?.toLocaleString() || '0'}</div>
                  <div className="text-sm text-gray-400">Total Reach</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{metricsData?.totalEngagement?.toLocaleString() || '0'}</div>
                  <div className="text-sm text-gray-400">Engagement</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{metricsData?.engagementRate || '0'}%</div>
                  <div className="text-sm text-gray-400">Engagement Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400">{metricsData?.followerGrowth || '0'}%</div>
                  <div className="text-sm text-gray-400">Growth Rate</div>
                </div>
              </div>
            </div>

            {/* Top Performing Content */}
            <div className="bg-gray-700 p-4 rounded-lg">
              <h4 className="font-semibold text-white mb-3">Top Performing Content</h4>
              <div className="space-y-3">
                {metricsData?.topPosts?.slice(0, 3).map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-gray-600 rounded"
                  >
                    <div className="flex-1">
                      <div className="text-white font-medium truncate">{post.content}</div>
                      <div className="text-sm text-gray-400">
                        {post.reach.toLocaleString()} reach • {post.engagement.toLocaleString()} engagement
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-semibold">#{index + 1}</div>
                      <div className="text-xs text-gray-400 capitalize">{post.platform}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Key Insights */}
            <div className="bg-gray-700 p-4 rounded-lg">
              <h4 className="font-semibold text-white mb-3">Key Insights</h4>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                  <div>Your video content generates 340% more engagement than photo posts</div>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                  <div>Peak engagement occurs between 7-9 PM on weekdays</div>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                  <div>Your audience is primarily 25-34 years old (35% of total followers)</div>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-orange-400 rounded-full mt-2"></div>
                  <div>Instagram content has a 23% higher engagement rate than Facebook</div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-gray-700 p-4 rounded-lg">
              <h4 className="font-semibold text-white mb-3">Recommendations</h4>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                  <div>Increase video content production by 40% to maximize engagement</div>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                  <div>Schedule more posts during peak hours (7-9 PM) to reach more audience</div>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                  <div>Focus on Instagram strategy to leverage higher engagement rates</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Scheduled Reports */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 p-6 rounded-xl border border-gray-700"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Scheduled Reports</h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-blue-400 hover:text-blue-300 text-sm font-medium"
          >
            + Schedule New Report
          </motion.button>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
            <div>
              <div className="text-white font-medium">Weekly Performance Summary</div>
              <div className="text-sm text-gray-400">Every Monday at 9:00 AM</div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 bg-green-600 bg-opacity-20 text-green-400 text-xs rounded-full">
                Active
              </span>
              <button className="text-gray-400 hover:text-white">
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
            <div>
              <div className="text-white font-medium">Monthly Analytics Report</div>
              <div className="text-sm text-gray-400">First day of each month</div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 bg-green-600 bg-opacity-20 text-green-400 text-xs rounded-full">
                Active
              </span>
              <button className="text-gray-400 hover:text-white">
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Reports;