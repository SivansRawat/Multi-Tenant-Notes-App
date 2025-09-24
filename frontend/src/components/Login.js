import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { login, error } = useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await login(credentials);

    if (result.success) {
      // Redirect will be handled by App component
      window.location.href = '/dashboard';
    }

    setIsLoading(false);
  };

  const quickLogin = (email) => {
    setCredentials({
      email,
      password: 'password'
    });
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>SaaS Notes</h1>
          <p>Multi-tenant Notes Application</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={credentials.email}
              onChange={handleInputChange}
              required
              placeholder="Enter your email"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleInputChange}
              required
              placeholder="Enter your password"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="test-accounts">
          <h3>Test Accounts</h3>
          <p className="test-accounts-note">Click to auto-fill credentials</p>

          <div className="test-account-grid">
            <div className="test-account-section">
              <h4>Acme Corporation</h4>
              <button 
                type="button"
                className="test-account-btn admin"
                onClick={() => quickLogin('admin@acme.test')}
                disabled={isLoading}
              >
                Admin Account
                <span>admin@acme.test</span>
              </button>
              <button 
                type="button"
                className="test-account-btn member"
                onClick={() => quickLogin('user@acme.test')}
                disabled={isLoading}
              >
                Member Account
                <span>user@acme.test</span>
              </button>
            </div>

            <div className="test-account-section">
              <h4>Globex Corporation</h4>
              <button 
                type="button"
                className="test-account-btn admin"
                onClick={() => quickLogin('admin@globex.test')}
                disabled={isLoading}
              >
                Admin Account
                <span>admin@globex.test</span>
              </button>
              <button 
                type="button"
                className="test-account-btn member"
                onClick={() => quickLogin('user@globex.test')}
                disabled={isLoading}
              >
                Member Account
                <span>user@globex.test</span>
              </button>
            </div>
          </div>

          <p className="password-note">All accounts use password: <strong>password</strong></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
