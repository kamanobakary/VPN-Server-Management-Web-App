import React, { useState, useEffect } from 'react';
import { AuthContext, useAuthProvider } from './hooks/useAuth';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import VPNManagement from './pages/VPNManagement';
import UserManagement from './pages/UserManagement';
import Monitoring from './pages/Monitoring';
import Settings from './pages/Settings';
import { supabase } from './lib/supabase';

type Tab = 'dashboard' | 'vpn' | 'users' | 'monitoring' | 'settings';

function AppContent() {
  const auth = useAuthProvider();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [alertCount, setAlertCount] = useState(0);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    if (!auth.user) return;
    supabase
      .from('alerts')
      .select('id', { count: 'exact', head: true })
      .eq('is_resolved', false)
      .then(({ count }) => setAlertCount(count ?? 0));
  }, [auth.user]);

  if (auth.loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!auth.user) {
    return (
      <AuthContext.Provider value={auth}>
        {showRegister ? (
          <Register onBack={() => setShowRegister(false)} />
        ) : (
          <Login onCreateAdmin={() => setShowRegister(true)} />
        )}
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={auth}>
      <Layout activeTab={tab} onTabChange={(t) => setTab(t as Tab)} alertCount={alertCount}>
        {tab === 'dashboard'  && <Dashboard onTabChange={(t) => setTab(t as Tab)} />}
        {tab === 'vpn'        && <VPNManagement />}
        {tab === 'users'      && <UserManagement />}
        {tab === 'monitoring' && <Monitoring />}
        {tab === 'settings'   && <Settings />}
      </Layout>
    </AuthContext.Provider>
  );
}

export default function App() {
  return <AppContent />;
}
