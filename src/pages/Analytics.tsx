import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Filter, Download, TrendingUp, Users, Eye, Heart, FileText, AlertCircle } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import MetricCard from '../components/Dashboard/MetricCard';
import EngagementChart from '../components/Charts/EngagementChart';
import toast from 'react-hot-toast';

const Analytics: React.FC = () => {
  const { metricsData, loading, refreshData } = useData();
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [filteredData, setFilteredData] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Filter data when platform or time range changes
  useEffect(() => {
    if (metricsData) {
      filterData();
    }
  }, [metricsData, selectedPlatform, selectedTimeRange]);

  const filterData = () => {
    if (!metricsData) return;

    let filtered = { ...metricsData };

    // Filter by platform
    if (selectedPlatform !== 'all' && metricsData.topPosts) {
      const platformPosts = metricsData.topPosts.filter(post => 
        post.platform === selectedPlatform
      );
      
      // Recalculate metrics based on filtered posts
      const totalEngagement = platformPosts.reduce((sum, post) => sum + (post.engagement || 0), 0);
      const totalReach = platformPosts.reduce((sum, post) => sum + (post.reach || 0), 0);
      const avgEngagementRate = totalReach > 0 ? ((totalEngagement / totalReach) * 100) : 0;

      filtered = {
        ...filtered,
        topPosts: platformPosts,
        totalEngagement: totalEngagement,
        totalReach: totalReach,
        engagementRate: avgEngagementRate.toFixed(2),
        // Adjust other metrics proportionally
        totalImpressions: Math.floor(totalReach * 1.5),
      };
    }

    // Apply time range filter (simulate different data for different ranges)
    const timeMultiplier = getTimeRangeMultiplier(selectedTimeRange);
    filtered = {
      ...filtered,
      totalReach: Math.floor((filtered.totalReach || 0) * timeMultiplier),
      totalEngagement: Math.floor((filtered.totalEngagement || 0) * timeMultiplier),
      totalImpressions: Math.floor((filtered.totalImpressions || 0) * timeMultiplier),
    };

    setFilteredData(filtered);
  };

  const getTimeRangeMultiplier = (range: string): number => {
    switch (range) {
      case '7d': return 0.25;
      case '30d': return 1;
      case '90d': return 2.8;
      case '1y': return 12;
      default: return 1;
    }
  };

  const getTimeRangeLabel = (range: string): string => {
    switch (range) {
      case '7d': return 'Last 7 days';
      case '30d': return 'Last 30 days';
      case '90d': return 'Last 90 days';
      case '1y': return 'Last year';
      default: return 'Last 30 days';
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const dataToExport = filteredData || metricsData;
      
      if (!dataToExport) {
        toast.error('No data available to export');
        return;
      }

      // Create CSV content
      const csvContent = generateCSVContent(dataToExport);
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `analytics-${selectedPlatform}-${selectedTimeRange}-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Analytics data exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const generateCSVContent = (data: any): string => {
    const headers = [
      'Metric',
      'Value',
      'Platform Filter',
      'Time Range',
      'Export Date'
    ];

    const rows = [
      ['Total Reach', data.totalReach || 0, selectedPlatform, getTimeRangeLabel(selectedTimeRange), new Date().toLocaleDateString()],
      ['Total Engagement', data.totalEngagement || 0, selectedPlatform, getTimeRangeLabel(selectedTimeRange), new Date().toLocaleDateString()],
      ['Total Impressions', data.totalImpressions || 0, selectedPlatform, getTimeRangeLabel(selectedTimeRange), new Date().toLocaleDateString()],
      ['Engagement Rate', `${data.engagementRate || 0}%`, selectedPlatform, getTimeRangeLabel(selectedTimeRange), new Date().toLocaleDateString()],
    ];

    // Add post data if available
    if (data.topPosts && data.topPosts.length > 0) {
      rows.push(['', '', '', '', '']); // Empty row
      rows.push(['Post Content', 'Platform', 'Reach', 'Engagement', 'Created Date']);
      
      data.topPosts.forEach((post: any) => {
        rows.push([
          post.content || 'No content',
          post.platform || 'unknown',
          post.reach || 0,
          post.engagement || 0,
          post.created_time ? new Date(post.created_time).toLocaleDateString() : 'Unknown'
        ]);
      });
    }

    return [headers, ...rows].map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
  };

  const displayData = filteredData || metricsData;

  // Generate sample content performance data if none exists
  const contentPerformanceData = displayData?.topPosts && displayData.topPosts.length > 0 
    ? displayData.topPosts.slice(0, 10)
    : [
        {
          id: 'sample_1',
          content: 'Sample social media post about marketing strategies and engagement tips',
          platform: 'facebook',
          reach: 2500,
          engagement: 180,
          created_time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'sample_2',
          content: 'Behind the scenes content showcasing team culture and values',
          platform: 'instagram',
          reach: 1800,
          engagement: 145,
          created_time: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'sample_3',
          content: 'Educational post about industry trends and future predictions',
          platform: 'facebook',
          reach: 3200,
          engagement: 220,
          created_time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'sample_4',
          content: 'Product showcase with detailed features and benefits',
          platform: 'instagram',
          reach: 2100,
          engagement: 165,
          created_time: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'sample_5',
          content: 'Customer success story and testimonial highlight',
          platform: 'facebook',
          reach: 1900,
          engagement: 135,
          created_time: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

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
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Platforms</option>
              <option value="facebook">Facebook</option>
              <option value="instagram">Instagram</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-400" />
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
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Download className="h-4 w-4" />
            )}
            <span>{isExporting ? 'Exporting...' : 'Export'}</span>
          </motion.button>
        </div>
      </div>

      {/* Filter Status */}
      {(selectedPlatform !== 'all' || selectedTimeRange !== '30d') && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-600 bg-opacity-20 border border-blue-600 text-blue-400 p-3 rounded-lg flex items-center justify-between"
        >
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span className="text-sm">
              Showing data for {selectedPlatform === 'all' ? 'all platforms' : selectedPlatform} • {getTimeRangeLabel(selectedTimeRange)}
            </span>
          </div>
          <button
            onClick={() => {
              setSelectedPlatform('all');
              setSelectedTimeRange('30d');
            }}
            className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded"
          >
            Clear Filters
          </button>
        </motion.div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Reach"
          value={displayData?.totalReach || 0}
          change="+12.5%"
          changeType="positive"
          icon={Eye}
          loading={loading}
        />
        <MetricCard
          title="Engagement Rate"
          value={`${displayData?.engagementRate || 0}%`}
          change="+0.8%"
          changeType="positive"
          icon={Heart}
          loading={loading}
        />
        <MetricCard
          title="Impressions"
          value={displayData?.totalImpressions || 0}
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
          data={displayData?.engagementByTime || []} 
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
                  <div className="text-white font-semibold">
                    {selectedPlatform === 'facebook' ? '100%' : selectedPlatform === 'instagram' ? '0%' : '67%'}
                  </div>
                  <div className="text-sm text-gray-400">
                    {Math.floor((displayData?.totalReach || 145000) * (selectedPlatform === 'facebook' ? 1 : selectedPlatform === 'instagram' ? 0 : 0.67) / 1000)}K reach
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                  <span className="text-white">Instagram</span>
                </div>
                <div className="text-right">
                  <div className="text-white font-semibold">
                    {selectedPlatform === 'instagram' ? '100%' : selectedPlatform === 'facebook' ? '0%' : '33%'}
                  </div>
                  <div className="text-sm text-gray-400">
                    {Math.floor((displayData?.totalReach || 78000) * (selectedPlatform === 'instagram' ? 1 : selectedPlatform === 'facebook' ? 0 : 0.33) / 1000)}K reach
                  </div>
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
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Content Performance Details</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <FileText className="h-4 w-4" />
              <span>
                {contentPerformanceData.length} posts • {selectedPlatform === 'all' ? 'All platforms' : selectedPlatform}
              </span>
            </div>
          </div>
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
              ) : contentPerformanceData.length > 0 ? (
                contentPerformanceData
                  .filter(post => selectedPlatform === 'all' || post.platform === selectedPlatform)
                  .map((post, index) => (
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
                      <td className="p-4 text-gray-300">{(post.reach || 0).toLocaleString()}</td>
                      <td className="p-4 text-gray-300">{(post.engagement || 0).toLocaleString()}</td>
                      <td className="p-4 text-gray-300">
                        {post.reach > 0 ? ((post.engagement / post.reach) * 100).toFixed(1) : '0.0'}%
                      </td>
                      <td className="p-4 text-gray-300">
                        {post.created_time ? new Date(post.created_time).toLocaleDateString() : 'Unknown'}
                      </td>
                    </motion.tr>
                  ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <div className="flex flex-col items-center space-y-3">
                      <AlertCircle className="h-8 w-8 text-gray-400" />
                      <div className="text-gray-400">No content data available</div>
                      <p className="text-sm text-gray-500">
                        {selectedPlatform !== 'all' 
                          ? `No ${selectedPlatform} posts found for the selected time range`
                          : 'No posts found for the selected time range'
                        }
                      </p>
                      <button 
                        onClick={() => {
                          setSelectedPlatform('all');
                          setSelectedTimeRange('30d');
                          refreshData();
                        }}
                        className="text-blue-400 hover:text-blue-300 text-sm"
                      >
                        Reset filters and refresh
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Analytics;