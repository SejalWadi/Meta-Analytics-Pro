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
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Lightbulb className="h-6 w-6 text-yellow-400" />
            <h3 className="text-lg font-bold text-white">Content Recommendations</h3>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={openContentIdeas}
            className="flex items-center space-x-2 bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
          >
            <Lightbulb className="h-4 w-4" />
            <span>Get Ideas</span>
            <ExternalLink className="h-3 w-3" />
          </motion.button>
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
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Hash className="h-6 w-6 text-purple-400" />
            <h3 className="text-lg font-bold text-white">Hashtag Analysis</h3>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={openHashtagTool}
            className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
          >
            <Hash className="h-4 w-4" />
            <span>Hashtag Guide</span>
            <ExternalLink className="h-3 w-3" />
          </motion.button>
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
                    className="bg-green-600 bg-opacity-20 text-green-400 px-3 py-1 rounded-full text-sm cursor-pointer hover:bg-opacity-30 transition-colors"
                    onClick={() => {
                      navigator.clipboard.writeText(hashtag);
                      toast.success(`Copied ${hashtag} to clipboard!`);
                    }}
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
                    className="bg-orange-600 bg-opacity-20 text-orange-400 px-3 py-1 rounded-full text-sm cursor-pointer hover:bg-opacity-30 transition-colors"
                    onClick={() => {
                      navigator.clipboard.writeText(hashtag);
                      toast.success(`Copied ${hashtag} to clipboard!`);
                    }}
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
                    className="bg-blue-600 bg-opacity-20 text-blue-400 px-3 py-1 rounded-full text-sm cursor-pointer hover:bg-opacity-30 transition-colors"
                    onClick={() => {
                      navigator.clipboard.writeText(hashtag);
                      toast.success(`Copied ${hashtag} to clipboard!`);
                    }}
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
            onClick={openContentScheduler}
          >
            <h4 className="font-semibold text-white mb-2">Schedule Next Week's Posts</h4>
            <p className="text-blue-100 text-sm mb-3">
              Plan your content for optimal engagement times
            </p>
            <div className="flex items-center justify-between">
              <button className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Open Scheduler</span>
              </button>
              <ExternalLink className="h-4 w-4 text-blue-200" />
            </div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-r from-purple-600 to-purple-700 p-4 rounded-lg cursor-pointer"
            onClick={openCompetitorAnalysis}
          >
            <h4 className="font-semibold text-white mb-2">Analyze Competitor Content</h4>
            <p className="text-purple-100 text-sm mb-3">
              See what's working in your industry
            </p>
            <div className="flex items-center justify-between">
              <button className="bg-white text-purple-600 px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2">
                <BarChart className="h-4 w-4" />
                <span>View Analysis</span>
              </button>
              <ExternalLink className="h-4 w-4 text-purple-200" />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Optimization;