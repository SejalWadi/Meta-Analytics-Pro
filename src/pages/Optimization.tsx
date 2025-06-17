import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, Clock, TrendingUp, Hash, Lightbulb, Calendar } from 'lucide-react';
import { analyticsService } from '../services/analyticsService';
import { useAuth } from '../contexts/AuthContext';

interface OptimizationData {
  bestTimeToPost: {
    weekdays: Array<{
      day: string;
      hours: number[];
    }>;
  };
  contentRecommendations: Array<{
    type: string;
    reason: string;
    impact: string;
    effort: string;
  }>;
  hashtagAnalysis: {
    top: string[];
    trending: string[];
    underused: string[];
  };
}

const Optimization: React.FC = () => {
  const { user } = useAuth();
  const [optimizationData, setOptimizationData] = useState<OptimizationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOptimizationData();
  }, [user]);

  const fetchOptimizationData = async () => {
    if (!user) return;
    
    try {
      const data = await analyticsService.getOptimizationRecommendations(user.accessToken);
      setOptimizationData(data);
    } catch (error) {
      console.error('Failed to fetch optimization data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact.toLowerCase()) {
      case 'high': return 'text-green-400 bg-green-400 bg-opacity-20';
      case 'medium': return 'text-yellow-400 bg-yellow-400 bg-opacity-20';
      case 'low': return 'text-blue-400 bg-blue-400 bg-opacity-20';
      default: return 'text-gray-400 bg-gray-400 bg-opacity-20';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort.toLowerCase()) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Content Optimization</h1>
          <p className="text-gray-400 mt-1">AI-powered recommendations to boost your content performance</p>
        </div>
      </div>

      {/* Optimization Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-xl"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Optimization Score</h2>
            <p className="text-blue-100">Your content performance score based on current analytics</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-white">78</div>
            <div className="text-blue-100">out of 100</div>
          </div>
        </div>
        <div className="mt-4">
          <div className="w-full bg-blue-800 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '78%' }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              className="bg-white h-2 rounded-full"
            ></motion.div>
          </div>
        </div>
      </motion.div>

      {/* Best Time to Post */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 p-6 rounded-xl border border-gray-700"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Clock className="h-6 w-6 text-blue-400" />
          <h3 className="text-lg font-bold text-white">Best Times to Post</h3>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-7 gap-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-700 rounded mb-2"></div>
                <div className="space-y-1">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-6 bg-gray-700 rounded"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {optimizationData?.bestTimeToPost.weekdays.map((day, index) => (
              <motion.div
                key={day.day}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-700 p-4 rounded-lg text-center"
              >
                <div className="font-semibold text-white mb-2">{day.day}</div>
                <div className="space-y-1">
                  {day.hours.map((hour) => (
                    <div
                      key={hour}
                      className="bg-blue-600 text-white text-xs px-2 py-1 rounded"
                    >
                      {hour}:00
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Content Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 p-6 rounded-xl border border-gray-700"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Lightbulb className="h-6 w-6 text-yellow-400" />
          <h3 className="text-lg font-bold text-white">Content Recommendations</h3>
        </div>
        
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-6 bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {optimizationData?.contentRecommendations.map((rec, index) => (
              <motion.div
                key={rec.type}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-700 p-4 rounded-lg"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-white">{rec.type}</h4>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(rec.impact)}`}>
                      {rec.impact} Impact
                    </span>
                    <span className={`text-xs ${getEffortColor(rec.effort)}`}>
                      {rec.effort} Effort
                    </span>
                  </div>
                </div>
                <p className="text-gray-300 text-sm">{rec.reason}</p>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Hashtag Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 p-6 rounded-xl border border-gray-700"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Hash className="h-6 w-6 text-purple-400" />
          <h3 className="text-lg font-bold text-white">Hashtag Analysis</h3>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-6 bg-gray-700 rounded mb-4"></div>
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <div key={j} className="h-4 bg-gray-700 rounded"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold text-green-400 mb-3">Top Performing</h4>
              <div className="space-y-2">
                {optimizationData?.hashtagAnalysis.top.map((hashtag, index) => (
                  <motion.div
                    key={hashtag}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-green-600 bg-opacity-20 text-green-400 px-3 py-1 rounded-full text-sm"
                  >
                    {hashtag}
                  </motion.div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-orange-400 mb-3">Trending Now</h4>
              <div className="space-y-2">
                {optimizationData?.hashtagAnalysis.trending.map((hashtag, index) => (
                  <motion.div
                    key={hashtag}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-orange-600 bg-opacity-20 text-orange-400 px-3 py-1 rounded-full text-sm"
                  >
                    {hashtag}
                  </motion.div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-blue-400 mb-3">Underutilized</h4>
              <div className="space-y-2">
                {optimizationData?.hashtagAnalysis.underused.map((hashtag, index) => (
                  <motion.div
                    key={hashtag}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-blue-600 bg-opacity-20 text-blue-400 px-3 py-1 rounded-full text-sm"
                  >
                    {hashtag}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Action Items */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 p-6 rounded-xl border border-gray-700"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Target className="h-6 w-6 text-red-400" />
          <h3 className="text-lg font-bold text-white">Quick Action Items</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 rounded-lg cursor-pointer"
          >
            <h4 className="font-semibold text-white mb-2">Schedule Next Week's Posts</h4>
            <p className="text-blue-100 text-sm mb-3">
              Plan your content for optimal engagement times
            </p>
            <button className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-medium">
              Open Scheduler
            </button>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-r from-purple-600 to-purple-700 p-4 rounded-lg cursor-pointer"
          >
            <h4 className="font-semibold text-white mb-2">Analyze Competitor Content</h4>
            <p className="text-purple-100 text-sm mb-3">
              See what's working in your industry
            </p>
            <button className="bg-white text-purple-600 px-4 py-2 rounded-lg text-sm font-medium">
              View Analysis
            </button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Optimization;