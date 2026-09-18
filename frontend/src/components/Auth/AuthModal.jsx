import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Wallet, Lock, Mail, User, Eye, EyeOff, Zap } from 'lucide-react';

const AuthModal = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currency, setCurrency] = useState('$');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { login, register, demoLogin, authError, setAuthError } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    if (isLogin) {
      await login(email, password);
    } else {
      await register(name, email, password, currency);
    }
    setSubmitting(false);
  };

  const handleDemoClick = async () => {
    setSubmitting(true);
    await demoLogin();
    setSubmitting(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Brand Header */}
        <div className="auth-header">
          <div className="logo-icon" style={{ margin: '0 auto', width: 52, height: 52 }}>
            <Wallet size={28} />
          </div>
          <h1>
            Spend<span className="brand-gradient">Wise</span>
          </h1>
          <p>
            {isLogin
              ? 'Sign in to manage your budget & transactions'
              : 'Create an account to start tracking your finances'}
          </p>
        </div>

        {/* Error Alert */}
        {authError && <div className="alert-error">{authError}</div>}

        {/* Auth Form */}
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Alex Morgan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
              <button
                type="button"
                className="icon-action-btn"
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Preferred Currency</label>
              <select
                className="form-input"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="$">$ (USD - Dollar)</option>
                <option value="€">€ (EUR - Euro)</option>
                <option value="£">£ (GBP - Pound)</option>
                <option value="₹">₹ (INR - Rupee)</option>
                <option value="¥">¥ (JPY - Yen)</option>
                <option value="C$">C$ (CAD - Canadian Dollar)</option>
                <option value="A$">A$ (AUD - Australian Dollar)</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 8 }}
            disabled={submitting}
          >
            {submitting
              ? 'Please wait...'
              : isLogin
              ? 'Sign In to Dashboard'
              : 'Create Account'}
          </button>
        </form>

        {/* Switch Login / Register */}
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button
            type="button"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary-500)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem',
            }}
            onClick={() => {
              setAuthError(null);
              setIsLogin(!isLogin);
            }}
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : 'Already have an account? Log in'}
          </button>
        </div>

        {/* One-Click Demo Feature */}
        <div className="demo-box">
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 8 }}>
            Want to test immediately with sample data?
          </p>
          <button
            type="button"
            className="demo-btn"
            onClick={handleDemoClick}
            disabled={submitting}
          >
            <Zap size={16} color="#f7b731" />
            <span>Explore with Demo Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
