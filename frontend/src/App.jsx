import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Layout/Navbar';
import DashboardView from './components/Dashboard/DashboardView';
import TransactionsView from './components/Transactions/TransactionsView';
import AuthModal from './components/Auth/AuthModal';

const MainApp = () => {
  const { isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-primary)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div className="logo-icon" style={{ margin: '0 auto 16px auto', animation: 'spin 2s linear infinite' }}>
            💸
          </div>
          <h3>Loading SpendWise...</h3>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthModal />;
  }

  return (
    <div className="app-layout">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="main-content">
        {activeTab === 'dashboard' ? (
          <DashboardView setActiveTab={setActiveTab} />
        ) : (
          <TransactionsView />
        )}
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
