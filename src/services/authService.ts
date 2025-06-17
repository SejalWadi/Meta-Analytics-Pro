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
          // User is already logged in
          getUserInfo(response.authResponse.accessToken, resolve, reject);
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
            scope: 'email,public_profile',
            return_scopes: true
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

function getUserInfo(accessToken: string, resolve: Function, reject: Function) {
  if (typeof window === 'undefined' || !window.FB) {
    reject(new Error('Facebook SDK not available'));
    return;
  }

  window.FB.api('/me', { fields: 'name,email,picture.width(200).height(200)' }, (userInfo: any) => {
    console.log('User info:', userInfo);
    
    if (userInfo && !userInfo.error) {
      const userData = {
        id: userInfo.id,
        name: userInfo.name,
        email: userInfo.email || '',
        picture: userInfo.picture?.data?.url || '',
        accessToken: accessToken
      };
      resolve(userData);
    } else {
      console.error('Error getting user info:', userInfo?.error);
      reject(new Error('Failed to get user information'));
    }
  });
}