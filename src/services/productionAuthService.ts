export const productionAuthService = {
  loginWithFacebook: (): Promise<any> => {
    return new Promise((resolve, reject) => {
      console.log('🔐 Initiating real Facebook login...');
      
      if (typeof window === 'undefined' || !window.FB) {
        reject(new Error('Facebook SDK not loaded. Please refresh the page and try again.'));
        return;
      }

      // Check current login status
      window.FB.getLoginStatus((response: any) => {
        console.log('📊 Current login status:', response);
        
        if (response.status === 'connected') {
          // User is already logged in, get their info and permissions
          getUserInfoAndPermissions(response.authResponse.accessToken, resolve, reject);
        } else {
          // User needs to log in with comprehensive permissions
          console.log('🚀 Starting Facebook login flow...');
          window.FB.login((loginResponse: any) => {
            console.log('📝 Login response:', loginResponse);
            
            if (loginResponse.authResponse) {
              getUserInfoAndPermissions(loginResponse.authResponse.accessToken, resolve, reject);
            } else {
              console.error('❌ Login failed or cancelled:', loginResponse);
              
              if (loginResponse.status === 'not_authorized') {
                reject(new Error('Please authorize the app to access your Facebook data to see your real analytics.'));
              } else {
                reject(new Error('Facebook login was cancelled. Please try again to access your real page analytics.'));
              }
            }
          }, { 
            // Request all necessary permissions for real data access
            scope: 'email,public_profile,pages_show_list,pages_read_engagement,pages_read_user_content,instagram_basic,instagram_manage_insights',
            return_scopes: true,
            auth_type: 'rerequest' // Force permission dialog
          });
        }
      });
    });
  },

  // Request additional permissions if needed
  requestAdditionalPermissions: (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.FB) {
        reject(new Error('Facebook SDK not loaded'));
        return;
      }

      console.log('🔑 Requesting additional Facebook permissions...');
      window.FB.login((response: any) => {
        if (response.authResponse) {
          console.log('✅ Additional permissions granted:', response);
          resolve(response);
        } else {
          console.log('❌ Additional permissions denied');
          reject(new Error('Additional permissions are required to access your Facebook page data.'));
        }
      }, {
        scope: 'pages_show_list,pages_read_engagement,pages_read_user_content,instagram_basic,instagram_manage_insights',
        auth_type: 'rerequest',
        return_scopes: true
      });
    });
  },

  logout: () => {
    if (typeof window !== 'undefined' && window.FB) {
      window.FB.logout((response: any) => {
        console.log('👋 User logged out:', response);
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
          getUserInfoAndPermissions(response.authResponse.accessToken, resolve, reject);
        } else {
          reject(new Error('Not authenticated with Facebook'));
        }
      });
    });
  }
};

function getUserInfoAndPermissions(accessToken: string, resolve: Function, reject: Function) {
  console.log('🔍 Getting user info and checking permissions...');
  
  if (typeof window === 'undefined' || !window.FB) {
    reject(new Error('Facebook SDK not available'));
    return;
  }

  // Get user basic information
  window.FB.api('/me', { 
    fields: 'name,email,picture.width(200).height(200),verified',
    access_token: accessToken 
  }, (userInfo: any) => {
    console.log('👤 User info received:', userInfo);
    
    if (userInfo && !userInfo.error) {
      // Check what permissions we have
      window.FB.api('/me/permissions', { access_token: accessToken }, (permissionsResponse: any) => {
        console.log('🔐 Permissions response:', permissionsResponse);
        
        if (permissionsResponse.error) {
          reject(new Error('Unable to verify Facebook permissions. Please try logging in again.'));
          return;
        }
        
        const grantedPermissions = permissionsResponse.data?.filter((p: any) => p.status === 'granted').map((p: any) => p.permission) || [];
        console.log('✅ Granted permissions:', grantedPermissions);
        
        // Check for required permissions
        const requiredPermissions = ['email', 'public_profile'];
        const optionalPermissions = ['pages_show_list', 'pages_read_engagement', 'pages_read_user_content'];
        
        const missingRequired = requiredPermissions.filter(perm => !grantedPermissions.includes(perm));
        
        if (missingRequired.length > 0) {
          reject(new Error(`Required permissions missing: ${missingRequired.join(', ')}. Please grant all permissions to use the app.`));
          return;
        }
        
        const hasPagePermissions = optionalPermissions.some(perm => grantedPermissions.includes(perm));
        const hasInstagramPermissions = grantedPermissions.includes('instagram_basic');
        
        console.log('📊 Permission status:', {
          hasPagePermissions,
          hasInstagramPermissions,
          totalPermissions: grantedPermissions.length
        });
        
        const userData = {
          id: userInfo.id,
          name: userInfo.name,
          email: userInfo.email || '',
          picture: userInfo.picture?.data?.url || '',
          verified: userInfo.verified || false,
          accessToken: accessToken,
          permissions: {
            hasPageAccess: hasPagePermissions,
            hasInstagramAccess: hasInstagramPermissions,
            grantedPermissions: grantedPermissions,
            canAccessRealData: hasPagePermissions
          }
        };
        
        console.log('🎉 Successfully authenticated user with real data access:', userData.name);
        resolve(userData);
      });
    } else {
      console.error('❌ Error getting user info:', userInfo?.error);
      reject(new Error('Failed to get user information from Facebook. Please try again.'));
    }
  });
}

// Enhanced function to check user's real Facebook setup
export const checkUserRealDataAccess = async (accessToken: string): Promise<{
  hasPages: boolean;
  hasInstagram: boolean;
  hasPosts: boolean;
  pageCount: number;
  postCount: number;
  canAccessRealData: boolean;
  recommendations: string[];
}> => {
  console.log('🔍 Checking user\'s real Facebook data access...');
  
  const setup = {
    hasPages: false,
    hasInstagram: false,
    hasPosts: false,
    pageCount: 0,
    postCount: 0,
    canAccessRealData: false,
    recommendations: []
  };

  try {
    // Check for Facebook pages with admin access
    console.log('📄 Fetching user\'s Facebook pages...');
    const pagesResponse = await fetch(
      `https://graph.facebook.com/me/accounts?access_token=${accessToken}&fields=id,name,fan_count,access_token,category,about`
    );
    const pagesData = await pagesResponse.json();
    
    if (pagesData.error) {
      console.warn('❌ Pages API error:', pagesData.error);
      if (pagesData.error.code === 10 || pagesData.error.message.includes('permissions')) {
        setup.recommendations.push('Grant page permissions to access your Facebook pages');
      }
    } else if (pagesData.data && pagesData.data.length > 0) {
      setup.hasPages = true;
      setup.pageCount = pagesData.data.length;
      setup.canAccessRealData = true;
      
      console.log(`✅ Found ${setup.pageCount} Facebook pages`);
      
      // Check for posts on the first page
      const firstPage = pagesData.data[0];
      try {
        console.log(`📝 Checking posts for page: ${firstPage.name}`);
        const postsResponse = await fetch(
          `https://graph.facebook.com/${firstPage.id}/posts?access_token=${firstPage.access_token}&fields=id,message,created_time&limit=10`
        );
        const postsData = await postsResponse.json();
        
        if (postsData.error) {
          console.warn('❌ Posts API error:', postsData.error);
        } else if (postsData.data && postsData.data.length > 0) {
          setup.hasPosts = true;
          setup.postCount = postsData.data.length;
          console.log(`✅ Found ${setup.postCount} posts on ${firstPage.name}`);
        } else {
          console.log('📭 No posts found on this page');
          setup.recommendations.push('Create some posts on your Facebook page to see analytics data');
        }
      } catch (postsError) {
        console.warn('❌ Error checking posts:', postsError);
      }
    } else {
      console.log('📭 No Facebook pages found');
      setup.recommendations.push('Create a Facebook page to access analytics');
    }
    
    // Check for Instagram business account
    console.log('📸 Checking for Instagram business account...');
    try {
      const instagramResponse = await fetch(
        `https://graph.facebook.com/me?fields=instagram_business_account&access_token=${accessToken}`
      );
      const instagramData = await instagramResponse.json();
      
      if (instagramData.error) {
        console.warn('❌ Instagram API error:', instagramData.error);
      } else if (instagramData.instagram_business_account) {
        setup.hasInstagram = true;
        console.log('✅ Instagram business account found');
        
        // Get Instagram account details
        const igAccountId = instagramData.instagram_business_account.id;
        const igInfoResponse = await fetch(
          `https://graph.facebook.com/${igAccountId}?fields=name,username,followers_count&access_token=${accessToken}`
        );
        const igInfo = await igInfoResponse.json();
        
        if (!igInfo.error) {
          console.log(`✅ Instagram account: ${igInfo.username || igInfo.name}`);
        }
      } else {
        console.log('📸 No Instagram business account found');
        setup.recommendations.push('Connect an Instagram business account for additional analytics');
      }
    } catch (instagramError) {
      console.warn('❌ Instagram check error:', instagramError);
    }
    
    // Generate final recommendations
    if (!setup.hasPages) {
      setup.recommendations.unshift('Create a Facebook page to start using analytics');
    }
    if (setup.hasPages && !setup.hasPosts) {
      setup.recommendations.unshift('Post content on your Facebook page to see performance data');
    }
    if (!setup.hasInstagram && setup.hasPages) {
      setup.recommendations.push('Link your Instagram business account to Facebook for cross-platform analytics');
    }
    
    console.log('📊 Final setup status:', setup);
    return setup;
    
  } catch (error) {
    console.error('❌ Error checking user setup:', error);
    setup.recommendations.push('Unable to check your Facebook setup. Please ensure you have granted all necessary permissions.');
    return setup;
  }
};