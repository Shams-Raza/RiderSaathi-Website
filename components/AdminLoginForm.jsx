'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function AdminLoginForm({ initialError = '', initialEmail = '', siteName = 'RiderSaathi' }) {
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
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (data.ok) {
        if (data.token && typeof window !== 'undefined') {
          try {
            localStorage.setItem('admin_token', data.token);
            sessionStorage.setItem('admin_token', data.token);
          } catch {}
        }
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
      {/* Brand Header */}
      <div className="login-brand-header">
        <div className="login-logo-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo.svg"
            alt={siteName}
            className="login-brand-logo"
            width="160"
            height="38"
            onError={(e) => {
              // Graceful fallback if SVG fails
              e.currentTarget.style.display = 'none';
              const fallback = document.getElementById('login-brand-fallback');
              if (fallback) fallback.style.display = 'flex';
            }}
          />
          <div id="login-brand-fallback" className="login-brand-fallback" style={{ display: 'none' }}>
            <span className="brand-fallback-icon">⚡</span>
            <span className="brand-fallback-text">{siteName}</span>
          </div>
        </div>

        <div className="login-portal-pill">
          <span className="portal-pill-dot" />
          <span>ADMIN PORTAL</span>
        </div>
      </div>

      <div className="login-header-text">
        <h1 className="login-title">Control Center Sign In</h1>
        <p className="login-subtitle">
          Manage driver fleet, verify payments, update pricing plans, and monitor live metrics.
        </p>
      </div>

      {error && (
        <div className="login-alert" role="alert">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ flexShrink: 0, marginTop: '2px' }}
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} autoComplete="on" className="login-form">
        <div className="form-group">
          <label htmlFor="email" className="login-field-label">
            Admin Email Address
          </label>
          <div className="input-field-wrap">
            <span className="input-icon" aria-hidden="true">
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
              className="login-input"
            />
          </div>
        </div>

        <div className="form-group">
          <div className="field-label-row">
            <label htmlFor="password" className="login-field-label">
              Master Password
            </label>
          </div>
          <div className="input-field-wrap">
            <span className="input-icon" aria-hidden="true">
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
              className="login-input"
            />
            <button
              type="button"
              className="toggle-pwd-btn"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={0}
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
            <span className="btn-loading-state">
              <span className="btn-spinner" />
              <span>Authenticating...</span>
            </span>
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

      <div className="login-footer">
        <Link href="/" className="login-back-link">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span>Return to RiderSaathi Website</span>
        </Link>

        <div className="security-notice">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
          </svg>
          <span>Encrypted Session &bull; Rate-Limited &bull; Bcrypt Authenticated</span>
        </div>
      </div>
    </div>
  );
}
