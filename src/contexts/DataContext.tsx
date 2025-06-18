import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { analyticsService } from '../services/analyticsService';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface MetricsData {
  totalReach: number;
  totalEngagement: number;
  totalImpressions: number;
  engagementRate: number;
  followerGrowth: number;
  topPosts: any[];
  demographicsData: any;
  engagementByTime: any[];
  contentPerformance: any[];
}

interface DataContextType {
  metricsData: MetricsData | null;
  loading: boolean;
  selectedAccounts: string[];
  dateRange: { start: Date; end: Date };
  refreshData: () => Promise<void>;
  setSelectedAccounts: (accounts: string[]) => void;
  setDateRange: (range: { start: Date; end: Date }) => void;
  error: string | null;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [metricsData, setMetricsData] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date()
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('User authenticated, fetching data...');
      refreshData();
    }
  }, [isAuthenticated, user]);

  const refreshData = async () => {
    if (!user?.accessToken) {
      console.warn('No access token available');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Refreshing data with access token:', user.accessToken.substring(0, 20) + '...');
      
      const data = await analyticsService.getMetrics({
        accessToken: user.accessToken,
        accounts: selectedAccounts,
        dateRange
      });
      
      console.log('Data fetched successfully:', data);
      setMetricsData(data);
      toast.success('Data refreshed successfully!');
    } catch (error: any) {
      console.error('Failed to fetch data:', error);
      setError(error.message || 'Failed to fetch analytics data');
      toast.error('Failed to refresh data. Please try again.');
      
      // Set fallback data so UI isn't completely empty
      setMetricsData({
        totalReach: 0,
        totalEngagement: 0,
        totalImpressions: 0,
        engagementRate: 0,
        followerGrowth: 0,
        topPosts: [],
        demographicsData: {
          age: [],
          gender: [],
          locations: []
        },
        engagementByTime: [],
        contentPerformance: []
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DataContext.Provider
      value={{
        metricsData,
        loading,
        selectedAccounts,
        dateRange,
        refreshData,
        setSelectedAccounts,
        setDateRange,
        error
      }}
    >
      {children}
    </DataContext.Provider>
  );
};