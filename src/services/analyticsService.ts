// src/services/analyticsService.ts

// ✅ This is your Facebook auth service
export const authService = {
  loginWithFacebook: (): Promise<any> => {
    return new Promise((resolve, reject) => {
      console.log('Checking FB object:', window.FB);

      if (!window.FB) {
        reject(new Error('Facebook SDK not loaded'));
        return;
      }

      window.FB.getLoginStatus((response: any) => {
        console.log('Login status:', response);

        if (response.status === 'connected') {
          getUserInfo(response.authResponse.accessToken, resolve, reject);
        } else {
          window.FB.login(
            (loginResponse: any) => {
              console.log('Login response:', loginResponse);

              if (loginResponse.authResponse) {
                getUserInfo(loginResponse.authResponse.accessToken, resolve, reject);
              } else {
                reject(new Error('Facebook login was cancelled or failed'));
              }
            },
            {
              scope:
                'email,pages_read_engagement,pages_read_user_content,pages_show_list,instagram_basic,instagram_manage_insights',
              return_scopes: true,
            }
          );
        }
      });
    });
  },

  logout: () => {
    if (window.FB) {
      window.FB.logout();
    }
  },

  getCurrentUser: (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!window.FB) {
        reject(new Error('Facebook SDK not loaded'));
        return;
      }

      window.FB.getLoginStatus((response: any) => {
        if (response.status === 'connected') {
          getUserInfo(response.authResponse.accessToken, resolve, reject);
        } else {
          reject(new Error('Not authenticated'));
        }
      });
    });
  },
};

// ✅ analyticsService with added getAccounts method
export const analyticsService = {
  getMetrics: async ({
    accessToken,
    accounts,
    dateRange,
  }: {
    accessToken: string;
    accounts: string[];
    dateRange: { start: Date; end: Date };
  }): Promise<any> => {
    try {
      const response = await fetch('http://localhost:3001/api/metrics', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accounts, dateRange }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch metrics');
      }
      return await response.json();
    } catch (error) {
      console.error('Metrics fetch error:', error);
      throw error;
    }
  },

  getAnalytics: async (): Promise<any> => {
    try {
      const response = await fetch('http://localhost:3001/api/analytics');
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      return await response.json();
    } catch (error) {
      console.error('Analytics fetch error:', error);
      throw error;
    }
  },

  getInsights: async (): Promise<any> => {
    try {
      const response = await fetch('http://localhost:3001/api/insights');
      if (!response.ok) {
        throw new Error('Failed to fetch insights');
      }
      return await response.json();
    } catch (error) {
      console.error('Insights fetch error:', error);
      throw error;
    }
  },

  // ✅ New method added to fix red line
  getAccounts: async (accessToken: string): Promise<any> => {
    try {
      const response = await fetch('http://localhost:3001/api/accounts', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch accounts');
      }

      return await response.json();
    } catch (error) {
      console.error('Accounts fetch error:', error);
      throw error;
    }
  },

   getOptimizationRecommendations: async (accessToken: string): Promise<any> => {
    try {
      const response = await fetch('http://localhost:3001/api/optimization-recommendations', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch optimization recommendations');
      }

      return await response.json();
    } catch (error) {
      console.error('Optimization fetch error:', error);
      throw error;
    }
  },
};

// Internal helper function
function getUserInfo(accessToken: string, resolve: Function, reject: Function) {
  window.FB.api('/me', { fields: 'name,email,picture.width(200).height(200)' }, (userInfo: any) => {
    console.log('User info:', userInfo);

    if (userInfo && !userInfo.error) {
      const userData = {
        id: userInfo.id,
        name: userInfo.name,
        email: userInfo.email || '',
        picture: userInfo.picture?.data?.url || '',
        accessToken: accessToken,
      };
      resolve(userData);
    } else {
      console.error('Error getting user info:', userInfo.error);
      reject(new Error('Failed to get user information'));
    }
  });
}
