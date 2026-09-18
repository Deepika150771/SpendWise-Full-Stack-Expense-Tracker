import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('spendwise_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('spendwise_token') || null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('spendwise_theme') || 'dark');

  // Apply theme to html root attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('spendwise_theme', theme);
  }, [theme]);

  // Toggle theme
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Check current session on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const res = await authAPI.getMe();
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('spendwise_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('[AuthContext] Session expired or invalid');
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    setAuthError(null);
    try {
      const res = await authAPI.login({ email, password });
      if (res.data.success) {
        const { token, user } = res.data;
        setToken(token);
        setUser(user);
        localStorage.setItem('spendwise_token', token);
        localStorage.setItem('spendwise_user', JSON.stringify(user));
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed. Please check your credentials.';
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  const register = async (name, email, password, currency = '$') => {
    setAuthError(null);
    try {
      const res = await authAPI.register({ name, email, password, currency });
      if (res.data.success) {
        const { token, user } = res.data;
        setToken(token);
        setUser(user);
        localStorage.setItem('spendwise_token', token);
        localStorage.setItem('spendwise_user', JSON.stringify(user));
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed. Please try again.';
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  const demoLogin = async () => {
    setAuthError(null);
    try {
      const res = await authAPI.demoLogin();
      if (res.data.success) {
        const { token, user } = res.data;
        setToken(token);
        setUser(user);
        localStorage.setItem('spendwise_token', token);
        localStorage.setItem('spendwise_user', JSON.stringify(user));
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Demo login failed.';
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('spendwise_token');
    localStorage.removeItem('spendwise_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        authError,
        setAuthError,
        login,
        register,
        demoLogin,
        logout,
        theme,
        toggleTheme,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
