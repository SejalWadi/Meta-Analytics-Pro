import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { productionAuthService, checkUserRealDataAccess } from '../services/productionAuthService';

interface User {
  id: string;
  name: string;
  email: string;
  picture: string;
  verified: boolean;
  accessToken: string;
  permissions: {
    hasPageAccess: boolean;
    hasInstagramAccess: boolean;
    grantedPermissions: string[];
    canAccessRealData: boolean;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  requestAdditionalPermissions: () => Promise<void>;
  checkUserSetup: () => Promise<any>;
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
    console.log('🔐 AuthProvider mounted - Real Facebook Integration Mode');
    
    // Check if SDK is already loaded
    if (typeof window !== 'undefined' && window.FB) {
      console.log('✅ Facebook SDK already loaded');
      setSdkLoaded(true);
      setLoading(false);
    } else {
      // Listen for SDK load event
      const handleSdkLoad = () => {
        console.log('✅ Facebook SDK loaded event received');
        setSdkLoaded(true);
        setLoading(false);
      };
      
      if (typeof window !== 'undefined') {
        window.addEventListener('fbSdkLoaded', handleSdkLoad);
        
        // Fallback timeout in case SDK doesn't load
        const timeout = setTimeout(() => {
          console.log('⚠️ Facebook SDK load timeout, continuing anyway');
          setLoading(false);
        }, 10000);
        
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
        console.log('🔍 Found saved user:', userData.name);
        
        // Verify the saved token is still valid
        if (typeof window !== 'undefined' && window.FB) {
          window.FB.getLoginStatus((response: any) => {
            if (response.status === 'connected' && response.authResponse.userID === userData.id) {
              // Update access token if it's different
              if (response.authResponse.accessToken !== userData.accessToken) {
                userData.accessToken = response.authResponse.accessToken;
                localStorage.setItem('user', JSON.stringify(userData));
              }
              setUser(userData);
              console.log('✅ User session restored:', userData.name);
            } else {
              console.log('❌ Saved user token is invalid, clearing');
              localStorage.removeItem('user');
            }
          });
        } else {
          setUser(userData);
        }
      }
    } catch (error) {
      console.error('❌ Error parsing saved user data:', error);
      localStorage.removeItem('user');
    }
  };

  const login = async () => {
    try {
      console.log('🚀 Starting real Facebook login for data access...');
      console.log('📊 SDK loaded:', sdkLoaded);
      console.log('🔧 FB object:', typeof window !== 'undefined' ? !!window.FB : 'undefined');
      
      if (typeof window === 'undefined' || !window.FB) {
        throw new Error('Facebook SDK not loaded. Please refresh the page and try again.');
      }

      const userData = await productionAuthService.loginWithFacebook();
      console.log('🎉 Real Facebook login successful:', userData.name);
      console.log('🔐 Permissions granted:', userData.permissions.grantedPermissions);
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Store auth token for API calls
      localStorage.setItem('authToken', userData.accessToken);
      
      // Check user's real data access
      if (userData.permissions.canAccessRealData) {
        console.log('✅ User can access real Facebook data');
      } else {
        console.log('⚠️ User needs additional permissions for full data access');
      }
      
    } catch (error) {
      console.error('❌ Real Facebook login failed:', error);
      throw error;
    }
  };

  const requestAdditionalPermissions = async () => {
    try {
      console.log('🔑 Requesting additional Facebook permissions...');
      
      if (typeof window === 'undefined' || !window.FB) {
        throw new Error('Facebook SDK not available');
      }

      const response = await productionAuthService.requestAdditionalPermissions();
      
      if (response.authResponse) {
        // Update user with new permissions
        if (user) {
          const updatedUser = {
            ...user,
            accessToken: response.authResponse.accessToken,
            permissions: {
              ...user.permissions,
              hasPageAccess: true,
              canAccessRealData: true,
              grantedPermissions: [...user.permissions.grantedPermissions, 'pages_show_list', 'pages_read_engagement']
            }
          };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
          localStorage.setItem('authToken', response.authResponse.accessToken);
          console.log('✅ Additional permissions granted');
        }
      }
      
    } catch (error) {
      console.error('❌ Failed to request additional permissions:', error);
      throw error;
    }
  };

  const checkUserSetup = async () => {
    if (!user?.accessToken) {
      throw new Error('User not authenticated');
    }
    
    try {
      console.log('🔍 Checking user\'s real Facebook setup...');
      const setup = await checkUserRealDataAccess(user.accessToken);
      console.log('📊 User setup status:', setup);
      return setup;
    } catch (error) {
      console.error('❌ Error checking user setup:', error);
      throw error;
    }
  };

  const logout = () => {
    productionAuthService.logout();
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    console.log('👋 User logged out');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        requestAdditionalPermissions,
        checkUserSetup
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