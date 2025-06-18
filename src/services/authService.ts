export const authService = {
  loginWithFacebook: (): Promise<any> => {
    return new Promise((resolve, reject) => {
      console.log('Checking FB object:', typeof window !== 'undefined' ? window.FB : 'undefined');
      
      if (typeof window === 'undefined' || !window.FB) {
        reject(new Error('Facebook SDK not loaded'));
        return;
      }

      // Check login status first
      window.FB.getLoginStatus((response: any) => {
        console.log('Login status:', response);
        
        if (response.status === 'connected') {
          // User is already logged in, but check if we have the right permissions
          checkAndRequestPermissions(response.authResponse.accessToken, resolve, reject);
        } else {
          // User needs to log in
          console.log('Initiating Facebook login...');
          window.FB.login((loginResponse: any) => {
            console.log('Login response:', loginResponse);
            
            if (loginResponse.authResponse) {
              getUserInfo(loginResponse.authResponse.accessToken, resolve, reject);
            } else {
              console.error('Login failed or cancelled:', loginResponse);
              reject(new Error('Facebook login was cancelled or failed'));
            }
          }, { 
            scope: 'email,public_profile,pages_show_list,pages_read_engagement,pages_read_user_content,instagram_basic',
            return_scopes: true,
            auth_type: 'rerequest' // Force permission dialog if needed
          });
        }
      });
    });
  },

  logout: () => {
    if (typeof window !== 'undefined' && window.FB) {
      window.FB.logout();
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

function checkAndRequestPermissions(accessToken: string, resolve: Function, reject: Function) {
  if (typeof window === 'undefined' || !window.FB) {
    reject(new Error('Facebook SDK not available'));
    return;
  }

  // Check current permissions
  window.FB.api('/me/permissions', { access_token: accessToken }, (response: any) => {
    console.log('Current permissions:', response);
    
    const grantedPermissions = response.data?.filter((p: any) => p.status === 'granted').map((p: any) => p.permission) || [];
    const requiredPermissions = ['email', 'public_profile', 'pages_show_list', 'pages_read_engagement'];
    
    const missingPermissions = requiredPermissions.filter(perm => !grantedPermissions.includes(perm));
    
    if (missingPermissions.length > 0) {
      console.log('Missing permissions:', missingPermissions);
      
      // Request missing permissions
      window.FB.login((loginResponse: any) => {
        if (loginResponse.authResponse) {
          getUserInfo(loginResponse.authResponse.accessToken, resolve, reject);
        } else {
          reject(new Error('Additional permissions required'));
        }
      }, {
        scope: requiredPermissions.join(','),
        auth_type: 'rerequest'
      });
    } else {
      // All permissions granted, get user info
      getUserInfo(accessToken, resolve, reject);
    }
  });
}

function getUserInfo(accessToken: string, resolve: Function, reject: Function) {
  if (typeof window === 'undefined' || !window.FB) {
    reject(new Error('Facebook SDK not available'));
    return;
  }

  window.FB.api('/me', { 
    fields: 'name,email,picture.width(200).height(200)',
    access_token: accessToken 
  }, (userInfo: any) => {
    console.log('User info:', userInfo);
    
    if (userInfo && !userInfo.error) {
      const userData = {
        id: userInfo.id,
        name: userInfo.name,
        email: userInfo.email || '',
        picture: userInfo.picture?.data?.url || '',
        accessToken: accessToken
      };
      
      console.log('Successfully authenticated user:', userData.name);
      resolve(userData);
    } else {
      console.error('Error getting user info:', userInfo?.error);
      reject(new Error('Failed to get user information'));
    }
  });
}