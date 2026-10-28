'use client';

import React, { useState, useEffect } from 'react';

export default function FloatingSocialDock({ settings = {} }) {
  const floating = settings.floatingSocial || {
    enabled: true,
    showByDefault: true,
    showInstagram: true,
    showWhatsapp: true,
    showFacebook: true,
    showYoutube: true,
  };
  const soc = settings.socialLinks || {};

  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('ridersaathi_floating_social');
      if (stored === 'collapsed') {
        setIsCollapsed(true);
      } else if (stored === 'expanded') {
        setIsCollapsed(false);
      } else if (floating.showByDefault === false) {
        setIsCollapsed(true);
      }
    } catch (e) {}
  }, [floating.showByDefault]);

  if (floating.enabled === false) {
    return null;
  }

  const toggleDock = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    try {
      localStorage.setItem('ridersaathi_floating_social', next ? 'collapsed' : 'expanded');
    } catch (e) {}
  };

  return (
    <aside
      className={`floating-social-dock ${isCollapsed ? 'collapsed' : ''}`}
      id="floatingSocialDock"
      aria-label="Social media floating links"
    >
      <div className="floating-social-items" id="floatingSocialItems">
        {floating.showWhatsapp !== false && soc.whatsapp && soc.whatsapp.enabled !== false && (
          <a
            href={soc.whatsapp.url || `https://wa.me/${settings.whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="social-dock-btn whatsapp"
            title="Chat on WhatsApp"
            aria-label="WhatsApp"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z" />
            </svg>
            <span className="dock-tooltip">WhatsApp</span>
          </a>
        )}

        {floating.showInstagram !== false && soc.instagram && soc.instagram.enabled !== false && (
          <a
            href={soc.instagram.url || 'https://instagram.com/ridersaathi'}
            target="_blank"
            rel="noopener noreferrer"
            className="social-dock-btn instagram"
            title="Follow on Instagram"
            aria-label="Instagram"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
            <span className="dock-tooltip">Instagram</span>
          </a>
        )}

        {floating.showFacebook !== false && soc.facebook && soc.facebook.enabled !== false && (
          <a
            href={soc.facebook.url || 'https://facebook.com/ridersaathi'}
            target="_blank"
            rel="noopener noreferrer"
            className="social-dock-btn facebook"
            title="Connect on Facebook"
            aria-label="Facebook"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <span className="dock-tooltip">Facebook</span>
          </a>
        )}

        {floating.showYoutube !== false && soc.youtube && soc.youtube.enabled !== false && (
          <a
            href={soc.youtube.url || 'https://youtube.com/@ridersaathi'}
            target="_blank"
            rel="noopener noreferrer"
            className="social-dock-btn youtube"
            title="Watch on YouTube"
            aria-label="YouTube"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            <span className="dock-tooltip">YouTube</span>
          </a>
        )}
      </div>

      <button
        type="button"
        className="floating-dock-toggle"
        id="floatingDockToggle"
        onClick={toggleDock}
        title="Toggle Social Links"
        aria-label="Show or hide social media links"
      >
        <svg
          className="toggle-icon-show"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          style={{ display: isCollapsed ? 'block' : 'none' }}
        >
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
          <polyline points="15 3 21 3 21 9"></polyline>
          <line x1="10" y1="14" x2="21" y2="3"></line>
        </svg>
        <svg
          className="toggle-icon-hide"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          style={{ display: isCollapsed ? 'none' : 'block' }}
        >
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </aside>
  );
}
