'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginForm({ initialError = '', initialEmail = '', siteName = 'RiderSaathi' }) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(initialError);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (data.ok) {
        window.location.href = data.redirectUrl || '/admin';
      } else {
        setError(data.error || 'Invalid email address or password.');
        setLoading(false);
      }
    } catch (err) {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="login-card">
      <div className="brand-badge">
        <div className="brand-icon">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="#fff">
            <path d="M14 2 5 13h6l-1 9 9-11h-6z" />
          </svg>
        </div>
        <div>
          <span style={{ fontSize: '17px', fontWeight: 800, color: 'var(--admin-text)' }}>{siteName}</span>
          <span
            style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--admin-primary)',
              letterSpacing: '0.5px',
            }}
          >
            ADMINISTRATION
          </span>
        </div>
      </div>

      <h1 className="login-title">Admin Dashboard</h1>
      <p className="login-subtitle">Sign in to manage website content, drivers, pricing plans, and system settings.</p>

      {error && (
        <div className="login-alert">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ flexShrink: 0, marginTop: '1px' }}
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} autoComplete="on">
        <div className="form-group" style={{ marginBottom: '16px' }}>
          <label htmlFor="email" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--admin-text)', marginBottom: '6px' }}>
            Admin Email Address
          </label>
          <div className="input-field-wrap">
            <span className="input-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </span>
            <input
              type="email"
              id="email"
              name="email"
              required
              placeholder="admin@ridersaathi.in"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '16px' }}>
          <label htmlFor="password" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--admin-text)', marginBottom: '6px' }}>
            Master Password
          </label>
          <div className="input-field-wrap">
            <span className="input-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              required
              placeholder="••••••••••••"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="toggle-pwd-btn"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              )}
            </button>
          </div>
        </div>

        <button type="submit" className="login-btn" disabled={loading}>
          {loading ? (
            'Authenticating...'
          ) : (
            <>
              <span>Sign In to Dashboard</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </>
          )}
        </button>
      </form>

      <div className="security-notice">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
        </svg>
        <span>Protected with bcrypt hashing &amp; signed sessions</span>
      </div>
    </div>
  );
}
