import React from 'react';
import { motion } from 'framer-motion';
import { Divide as DefaultIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';



interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: LucideIcon;
  loading?: boolean;
}


const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon = DefaultIcon,
  loading = false
}) => {
  const changeColors = {
    positive: 'text-green-400',
    negative: 'text-red-400',
    neutral: 'text-gray-400'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-gray-600 transition-all duration-200"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400 mb-1">{title}</p>
          {loading ? (
            <div className="h-8 w-24 bg-gray-700 rounded animate-pulse"></div>
          ) : (
            <>
              <p className="text-2xl font-bold text-white mb-1">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
              {change && (
                <p className={`text-sm ${changeColors[changeType]}`}>
                  {change}
                </p>
              )}
            </>
          )}
        </div>
        <div className="p-3 bg-blue-600 bg-opacity-20 rounded-lg">
          <Icon className="h-6 w-6 text-blue-400" />
        </div>
      </div>
    </motion.div>
  );
};

export default MetricCard;