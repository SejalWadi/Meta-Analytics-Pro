import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';

interface User {
  id: string;
  name: string;
  email: string;
  picture: string;
  accessToken: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sdkLoaded, setSdkLoaded] = useState(false);

  useEffect(() => {
    console.log('AuthProvider mounted');
    
    // Check if SDK is already loaded
    if (typeof window !== 'undefined' && window.FB) {
      console.log('Facebook SDK already loaded');
      setSdkLoaded(true);
      setLoading(false);
    } else {
      // Listen for SDK load event
      const handleSdkLoad = () => {
        console.log('Facebook SDK loaded event received');
        setSdkLoaded(true);
        setLoading(false);
      };
      
      if (typeof window !== 'undefined') {
        window.addEventListener('fbSdkLoaded', handleSdkLoad);
        
        // Fallback timeout in case SDK doesn't load
        const timeout = setTimeout(() => {
          console.log('Facebook SDK load timeout, continuing anyway');
          setLoading(false);
        }, 5000);
        
        // Cleanup
        return () => {
          window.removeEventListener('fbSdkLoaded', handleSdkLoad);
          clearTimeout(timeout);
        };
      } else {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (sdkLoaded) {
      checkAuthStatus();
    }
  }, [sdkLoaded]);

  const checkAuthStatus = async () => {
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        console.log('Found saved user:', userData);
        setUser(userData);
      }
    } catch (error) {
      console.error('Error parsing saved user data:', error);
      localStorage.removeItem('user');
    }
  };

  const login = async () => {
    try {
      console.log('Starting Facebook login...');
      console.log('SDK loaded:', sdkLoaded);
      console.log('FB object:', typeof window !== 'undefined' ? window.FB : 'undefined');
      
      if (typeof window === 'undefined' || !window.FB) {
        throw new Error('Facebook SDK not loaded');
      }

      const userData = await authService.loginWithFacebook();
      console.log('Facebook login successful:', userData);
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

declare global {
  interface Window {
    fbAsyncInit: () => void;
    FB: any;
  }
}