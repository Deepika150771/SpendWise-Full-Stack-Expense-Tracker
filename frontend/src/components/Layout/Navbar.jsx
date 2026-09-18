import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Wallet,
  LayoutDashboard,
  Receipt,
  Sun,
  Moon,
  LogOut,
  Sparkles,
} from 'lucide-react';

const Navbar = ({ activeTab, setActiveTab }) => {
  const { user, logout, theme, toggleTheme } = useAuth();

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Brand Logo */}
        <div className="brand-logo">
          <div className="logo-icon">
            <Wallet size={22} />
          </div>
          <span>
            Spend<span className="brand-gradient">Wise</span>
          </span>
        </div>

        {/* Navigation Tabs */}
        <nav className="nav-links">
          <button
            className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>

          <button
            className={`nav-btn ${activeTab === 'transactions' ? 'active' : ''}`}
            onClick={() => setActiveTab('transactions')}
          >
            <Receipt size={18} />
            <span>Transactions</span>
          </button>
        </nav>

        {/* Right Nav Controls */}
        <div className="nav-actions">
          {/* Theme Switcher */}
          <button
            className="icon-btn"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* User Profile Badge */}
          {user && (
            <div className="user-pill">
              <div className="avatar-circle">{getInitials(user.name)}</div>
              <span className="user-name">{user.name}</span>
            </div>
          )}

          {/* Logout Button */}
          <button className="icon-btn" onClick={logout} title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
