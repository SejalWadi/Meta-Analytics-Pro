import React from 'react';
import { motion } from 'framer-motion';
import { Users, MapPin, Clock, TrendingUp } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const Audience: React.FC = () => {
  const { metricsData, loading } = useData();

  const genderData = {
    labels: metricsData?.demographicsData?.gender?.map((item: any) => item.type) || [],
    datasets: [
      {
        data: metricsData?.demographicsData?.gender?.map((item: any) => item.percentage) || [],
        backgroundColor: ['#EC4899', '#3B82F6', '#10B981'],
        borderWidth: 0,
      },
    ],
  };

  const ageData = {
    labels: metricsData?.demographicsData?.age?.map((item: any) => item.range) || [],
    datasets: [
      {
        label: 'Percentage',
        data: metricsData?.demographicsData?.age?.map((item: any) => item.percentage) || [],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#fff',
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(75, 85, 99, 0.3)',
        },
        ticks: {
          color: '#9CA3AF',
        },
      },
      y: {
        grid: {
          color: 'rgba(75, 85, 99, 0.3)',
        },
        ticks: {
          color: '#9CA3AF',
        },
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Audience Intelligence</h1>
          <p className="text-gray-400 mt-1">Understand your audience demographics and behavior patterns</p>
        </div>
      </div>

      {/* Key Audience Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 p-6 rounded-xl border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">Total Followers</p>
              <p className="text-2xl font-bold text-white">28,456</p>
              <p className="text-sm text-green-400">+12.5% this month</p>
            </div>
            <div className="p-3 bg-blue-600 bg-opacity-20 rounded-lg">
              <Users className="h-6 w-6 text-blue-400" />
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
              <p className="text-sm font-medium text-gray-400 mb-1">Active Audience</p>
              <p className="text-2xl font-bold text-white">18,234</p>
              <p className="text-sm text-green-400">+8.2% this month</p>
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
              <p className="text-sm font-medium text-gray-400 mb-1">Top Location</p>
              <p className="text-2xl font-bold text-white">United States</p>
              <p className="text-sm text-gray-400">45% of audience</p>
            </div>
            <div className="p-3 bg-purple-600 bg-opacity-20 rounded-lg">
              <MapPin className="h-6 w-6 text-purple-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800 p-6 rounded-xl border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">Peak Activity</p>
              <p className="text-2xl font-bold text-white">7-9 PM</p>
              <p className="text-sm text-gray-400">Weekdays</p>
            </div>
            <div className="p-3 bg-orange-600 bg-opacity-20 rounded-lg">
              <Clock className="h-6 w-6 text-orange-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Demographics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-800 p-6 rounded-xl border border-gray-700"
        >
          <h3 className="text-lg font-bold text-white mb-4">Gender Distribution</h3>
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="h-64">
              <Doughnut data={genderData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 p-6 rounded-xl border border-gray-700"
        >
          <h3 className="text-lg font-bold text-white mb-4">Age Distribution</h3>
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="h-64">
              <Bar data={ageData} options={chartOptions} />
            </div>
          )}
        </motion.div>
      </div>

      {/* Geographic Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 p-6 rounded-xl border border-gray-700"
      >
        <h3 className="text-lg font-bold text-white mb-4">Geographic Distribution</h3>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-2 bg-gray-700 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {metricsData?.demographicsData?.locations?.map((location: any, index: number) => (
              <motion.div
                key={location.country}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-white font-medium">{location.country}</div>
                  <div className="text-sm text-gray-400">{location.percentage}%</div>
                </div>
                <div className="flex-1 mx-4">
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${location.percentage}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className="bg-blue-500 h-2 rounded-full"
                    ></motion.div>
                  </div>
                </div>
                <div className="text-sm text-gray-400 w-16 text-right">
                  {Math.round((location.percentage / 100) * 28456).toLocaleString()}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Engagement Patterns */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 p-6 rounded-xl border border-gray-700"
      >
        <h3 className="text-lg font-bold text-white mb-4">Audience Behavior Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-700 p-4 rounded-lg">
            <h4 className="font-semibold text-white mb-2">Most Active Days</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-300">Tuesday</span>
                <span className="text-blue-400">34%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Wednesday</span>
                <span className="text-blue-400">28%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Thursday</span>
                <span className="text-blue-400">23%</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-700 p-4 rounded-lg">
            <h4 className="font-semibold text-white mb-2">Content Preferences</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-300">Videos</span>
                <span className="text-green-400">42%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Images</span>
                <span className="text-green-400">31%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Carousels</span>
                <span className="text-green-400">27%</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-700 p-4 rounded-lg">
            <h4 className="font-semibold text-white mb-2">Engagement Types</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-300">Likes</span>
                <span className="text-purple-400">58%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Comments</span>
                <span className="text-purple-400">27%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Shares</span>
                <span className="text-purple-400">15%</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Audience;