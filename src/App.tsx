import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Audience from './pages/Audience';
import Optimization from './pages/Optimization';
import Accounts from './pages/Accounts';
import Reports from './pages/Reports';
import Login from './pages/Login';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import DebugPanel from './components/Debug/DebugPanel';

function App() {
  console.log('App component rendering');

  // ✅ Facebook SDK Initialization
  useEffect(() => {
  // Facebook SDK Initialization
  window.fbAsyncInit = function () {
    window.FB.init({
      appId: '649991254751238', // Replace this with your actual App ID
      cookie: true,
      xfbml: true,
      version: 'v19.0',
    });

    console.log('✅ Facebook SDK initialized');
  };

  // Load Facebook SDK script safely
  const loadFbSdk = () => {
    if (document.getElementById('facebook-jssdk')) return;

    const js = document.createElement('script');
    js.id = 'facebook-jssdk';
    js.src = 'https://connect.facebook.net/en_US/sdk.js';

    const fjs = document.getElementsByTagName('script')[0];
    if (fjs && fjs.parentNode) {
      fjs.parentNode.insertBefore(js, fjs);
    } else {
      document.body.appendChild(js); // fallback
    }
  };

  loadFbSdk();
}, []);


  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <div className="min-h-screen bg-gray-900 text-white">
            <Toaster 
              position="top-right"
              toastOptions={{
                style: {
                  background: '#1f2937',
                  color: '#fff',
                  border: '1px solid #374151'
                }
              }}
            />
            
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/*" element={
                <ProtectedRoute>
                  <div className="flex h-screen">
                    <Sidebar />
                    <div className="flex-1 flex flex-col overflow-hidden">
                      <Header />
                      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-900 p-6">
                        <Routes>
                          <Route path="/" element={<Dashboard />} />
                          <Route path="/analytics" element={<Analytics />} />
                          <Route path="/audience" element={<Audience />} />
                          <Route path="/optimization" element={<Optimization />} />
                          <Route path="/accounts" element={<Accounts />} />
                          <Route path="/reports" element={<Reports />} />
                        </Routes>
                      </main>
                    </div>
                  </div>
                </ProtectedRoute>
              } />
            </Routes>

            <DebugPanel />
          </div>
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
