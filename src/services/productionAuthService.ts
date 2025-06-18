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
          // User needs to log in
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
            scope: 'email,public_profile,pages_show_list,pages_read_engagement,pages_read_user_content,instagram_basic',
            return_scopes: true,
            auth_type: 'rerequest' // Force permission dialog
          });
        }
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
    const optionalPermissions = ['pages_show_list', 'pages_read_engagement', 'pages_read_user_content', 'instagram_basic'];
    
    const missingRequired = requiredPermissions.filter(perm => !grantedPermissions.includes(perm));
    const missingOptional = optionalPermissions.filter(perm => !grantedPermissions.includes(perm));
    
    if (missingRequired.length > 0) {
      reject(new Error(`Required permissions missing: ${missingRequired.join(', ')}. Please grant all permissions to use the app.`));
      return;
    }
    
    // Log permission status for debugging
    console.log('Permission status:', {
      granted: grantedPermissions,
      missingOptional: missingOptional,
      hasPageAccess: grantedPermissions.includes('pages_show_list'),
      hasInstagramAccess: grantedPermissions.includes('instagram_basic')
    });
    
    // Get user info even if some optional permissions are missing
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
        permissions: permissionInfo || {}
      };
      
      console.log('Successfully authenticated production user:', userData.name);
      
      // Show helpful message about permissions
      if (permissionInfo && !permissionInfo.hasPageAccess) {
        console.warn('User does not have page access permissions. Limited analytics will be available.');
      }
      
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
    // Check for Facebook pages
    const pagesResponse = await fetch(
      `https://graph.facebook.com/me/accounts?access_token=${accessToken}&fields=id,name,fan_count`
    );
    const pagesData = await pagesResponse.json();
    
    if (pagesData.data && pagesData.data.length > 0) {
      setup.hasPages = true;
      
      // Check for recent posts on first page
      const page = pagesData.data[0];
      const postsResponse = await fetch(
        `https://graph.facebook.com/${page.id}/posts?access_token=${accessToken}&limit=1`
      );
      const postsData = await postsResponse.json();
      
      if (postsData.data && postsData.data.length > 0) {
        setup.hasPosts = true;
      }
    }
    
    // Check for Instagram
    const instagramResponse = await fetch(
      `https://graph.facebook.com/me?fields=instagram_business_account&access_token=${accessToken}`
    );
    const instagramData = await instagramResponse.json();
    
    if (instagramData.instagram_business_account) {
      setup.hasInstagram = true;
    }
    
    // Generate recommendations
    if (!setup.hasPages) {
      setup.recommendations.push('Create a Facebook page to access analytics');
    }
    if (!setup.hasPosts) {
      setup.recommendations.push('Post content on your Facebook page to see performance data');
    }
    if (!setup.hasInstagram) {
      setup.recommendations.push('Connect an Instagram business account for cross-platform analytics');
    }
    
  } catch (error) {
    console.error('Error checking user setup:', error);
  }
  
  return setup;
};