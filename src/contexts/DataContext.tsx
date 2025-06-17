import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { analyticsService } from '../services/analyticsService';
import { useAuth } from './AuthContext';

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
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date()
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      refreshData();
    }
  }, [isAuthenticated, user, selectedAccounts, dateRange]);

  const refreshData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await analyticsService.getMetrics({
        accessToken: user.accessToken,
        accounts: selectedAccounts,
        dateRange
      });
      setMetricsData(data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
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
        setDateRange
      }}
    >
      {children}
    </DataContext.Provider>
  );
};