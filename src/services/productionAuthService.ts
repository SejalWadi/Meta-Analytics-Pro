export const productionAuthService = {
  loginWithFacebook: (): Promise<any> => {
    return new Promise((resolve, reject) => {
      console.log('Production Facebook login initiated');
      
      if (typeof window === 'undefined' || !window.FB) {
        reject(new Error('Facebook SDK not loaded. Please refresh the page and try again.'));
        return;
      }

      // Check login status first
      window.FB.getLoginStatus((response: any) => {
        console.log('Login status:', response);
        
        if (response.status === 'connected') {
          // User is already logged in, verify permissions
          verifyPermissions(response.authResponse.accessToken, resolve, reject);
        } else {
          // User needs to log in - use only basic permissions that are always available
          console.log('Initiating Facebook login for production...');
          window.FB.login((loginResponse: any) => {
            console.log('Login response:', loginResponse);
            
            if (loginResponse.authResponse) {
              verifyPermissions(loginResponse.authResponse.accessToken, resolve, reject);
            } else {
              console.error('Login failed or cancelled:', loginResponse);
              
              // Provide helpful error messages for production users
              if (loginResponse.status === 'not_authorized') {
                reject(new Error('Please authorize the app to access your Facebook data.'));
              } else {
                reject(new Error('Facebook login was cancelled. Please try again to access your analytics.'));
              }
            }
          }, { 
            // Use only basic permissions that are always available
            scope: 'email,public_profile',
            return_scopes: true,
            auth_type: 'rerequest'
          });
        }
      });
    });
  },

  // Request additional permissions separately after basic login
  requestPagePermissions: (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.FB) {
        reject(new Error('Facebook SDK not loaded'));
        return;
      }

      // Request page permissions separately
      window.FB.login((response: any) => {
        if (response.authResponse) {
          console.log('Additional permissions granted:', response);
          resolve(response);
        } else {
          console.log('Additional permissions denied or cancelled');
          // Don't reject - user can still use basic features
          resolve({ authResponse: null, grantedScopes: [] });
        }
      }, {
        scope: 'pages_show_list,pages_read_engagement',
        auth_type: 'rerequest',
        return_scopes: true
      });
    });
  },

  logout: () => {
    if (typeof window !== 'undefined' && window.FB) {
      window.FB.logout((response: any) => {
        console.log('User logged out:', response);
      });
    }
  },

  getCurrentUser: (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.FB) {
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
  }
};

function verifyPermissions(accessToken: string, resolve: Function, reject: Function) {
  if (typeof window === 'undefined' || !window.FB) {
    reject(new Error('Facebook SDK not available'));
    return;
  }

  // Check current permissions
  window.FB.api('/me/permissions', { access_token: accessToken }, (response: any) => {
    console.log('Current permissions:', response);
    
    if (response.error) {
      reject(new Error('Unable to verify permissions. Please try logging in again.'));
      return;
    }
    
    const grantedPermissions = response.data?.filter((p: any) => p.status === 'granted').map((p: any) => p.permission) || [];
    const requiredPermissions = ['email', 'public_profile'];
    
    const missingRequired = requiredPermissions.filter(perm => !grantedPermissions.includes(perm));
    
    if (missingRequired.length > 0) {
      reject(new Error(`Required permissions missing: ${missingRequired.join(', ')}. Please grant all permissions to use the app.`));
      return;
    }
    
    // Log permission status for debugging
    console.log('Permission status:', {
      granted: grantedPermissions,
      hasPageAccess: grantedPermissions.includes('pages_show_list'),
      hasInstagramAccess: grantedPermissions.includes('instagram_basic')
    });
    
    // Get user info with available permissions
    getUserInfo(accessToken, resolve, reject, {
      hasPageAccess: grantedPermissions.includes('pages_show_list'),
      hasInstagramAccess: grantedPermissions.includes('instagram_basic'),
      grantedPermissions
    });
  });
}

function getUserInfo(accessToken: string, resolve: Function, reject: Function, permissionInfo?: any) {
  if (typeof window === 'undefined' || !window.FB) {
    reject(new Error('Facebook SDK not available'));
    return;
  }

  window.FB.api('/me', { 
    fields: 'name,email,picture.width(200).height(200),verified',
    access_token: accessToken 
  }, (userInfo: any) => {
    console.log('User info:', userInfo);
    
    if (userInfo && !userInfo.error) {
      const userData = {
        id: userInfo.id,
        name: userInfo.name,
        email: userInfo.email || '',
        picture: userInfo.picture?.data?.url || '',
        verified: userInfo.verified || false,
        accessToken: accessToken,
        permissions: permissionInfo || {
          hasPageAccess: false,
          hasInstagramAccess: false,
          grantedPermissions: ['email', 'public_profile']
        }
      };
      
      console.log('Successfully authenticated production user:', userData.name);
      resolve(userData);
    } else {
      console.error('Error getting user info:', userInfo?.error);
      reject(new Error('Failed to get user information from Facebook. Please try again.'));
    }
  });
}

// Helper function to check if user has required setup for analytics
export const checkUserSetup = async (accessToken: string): Promise<{
  hasPages: boolean;
  hasInstagram: boolean;
  hasPosts: boolean;
  recommendations: string[];
}> => {
  const setup = {
    hasPages: false,
    hasInstagram: false,
    hasPosts: false,
    recommendations: []
  };

  try {
    // Check for Facebook pages - only if we have permission
    try {
      const pagesResponse = await fetch(
        `https://graph.facebook.com/me/accounts?access_token=${accessToken}&fields=id,name,fan_count`
      );
      const pagesData = await pagesResponse.json();
      
      if (pagesData.data && pagesData.data.length > 0) {
        setup.hasPages = true;
        
        // Check for recent posts on first page
        const page = pagesData.data[0];
        try {
          const postsResponse = await fetch(
            `https://graph.facebook.com/${page.id}/posts?access_token=${accessToken}&limit=1`
          );
          const postsData = await postsResponse.json();
          
          if (postsData.data && postsData.data.length > 0) {
            setup.hasPosts = true;
          }
        } catch (postsError) {
          console.log('Posts data not available - may need additional permissions');
        }
      }
    } catch (pagesError) {
      console.log('Pages data not available - may need additional permissions');
    }
    
    // Check for Instagram - only if we have permission
    try {
      const instagramResponse = await fetch(
        `https://graph.facebook.com/me?fields=instagram_business_account&access_token=${accessToken}`
      );
      const instagramData = await instagramResponse.json();
      
      if (instagramData.instagram_business_account) {
        setup.hasInstagram = true;
      }
    } catch (instagramError) {
      console.log('Instagram data not available - may need additional permissions');
    }
    
    // Generate recommendations based on what's available
    if (!setup.hasPages) {
      setup.recommendations.push('Create a Facebook page to access analytics');
      setup.recommendations.push('Grant page permissions to see your Facebook pages');
    }
    if (!setup.hasPosts) {
      setup.recommendations.push('Post content on your Facebook page to see performance data');
    }
    if (!setup.hasInstagram) {
      setup.recommendations.push('Connect an Instagram business account for cross-platform analytics');
    }
    
  } catch (error) {
    console.error('Error checking user setup:', error);
    setup.recommendations.push('Some features may require additional Facebook permissions');
  }
  
  return setup;
};