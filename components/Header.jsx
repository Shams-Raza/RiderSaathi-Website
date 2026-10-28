'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function Header({ settings = {}, lang = 'hi' }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('light');
  const [currentLang, setCurrentLang] = useState(lang);

  useEffect(() => {
    // Check initial theme from localStorage or document attribute
    const docTheme = document.documentElement.getAttribute('data-theme');
    const storedTheme = localStorage.getItem('theme');
    const active = storedTheme || docTheme || 'light';
    setCurrentTheme(active);
    document.documentElement.setAttribute('data-theme', active);

    // Check stored language
    const storedLang = localStorage.getItem('ridersaathi_lang');
    if (storedLang && (storedLang === 'en' || storedLang === 'hi')) {
      setCurrentLang(storedLang);
    }
  }, []);

  const toggleTheme = () => {
    const next = currentTheme === 'dark' ? 'light' : 'dark';
    setCurrentTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem('theme', next);
    } catch (e) {}
  };

  const switchLanguage = (newLang) => {
    setCurrentLang(newLang);
    try {
      document.cookie = `lang=${newLang};path=/;max-age=${365 * 24 * 60 * 60};SameSite=Lax`;
      localStorage.setItem('ridersaathi_lang', newLang);
    } catch (e) {}
    router.refresh();
  };

  const isEn = currentLang === 'en';
  const content = isEn ? (settings.content_en || {}) : (settings.content_hi || {});

  const bannerAlert = isEn
    ? (settings.bannerAlert_en || settings.bannerAlert)
    : (settings.bannerAlert || settings.bannerAlert_en);

  return (
    <>
      {settings.showBanner && bannerAlert && (
        <div className="top-bar">
          <div className="wrap top-bar-wrap">
            <span>⚡ {bannerAlert}</span>
            <Link href="/install">
              {isEn ? 'Try Free Now →' : 'फ्री में टेस्ट करें →'}
            </Link>
          </div>
        </div>
      )}

      <header>
        <div className="wrap header-inner">
          <Link className="brand" href="/">
            <span className="brand-glyph">
              <svg viewBox="0 0 24 24">
                <path d="M14 2 5 13h6l-1 9 9-11h-6z" />
              </svg>
            </span>
            <span className="brand-name">{settings.siteName || 'RiderSaathi'}</span>
          </Link>

          <nav id="mainNav" className={mobileNavOpen ? 'open' : ''}>
            <Link
              href="/"
              className={pathname === '/' ? 'active' : ''}
              onClick={() => setMobileNavOpen(false)}
            >
              {content.navHome || (isEn ? 'Home' : 'होम')}
            </Link>
            <Link
              href="/pricing"
              className={pathname === '/pricing' ? 'active' : ''}
              onClick={() => setMobileNavOpen(false)}
            >
              {content.navPricing || (isEn ? 'Pricing' : 'प्लान्स')}
            </Link>
            <Link
              href="/how-it-works"
              className={pathname === '/how-it-works' ? 'active' : ''}
              onClick={() => setMobileNavOpen(false)}
            >
              {content.navHowItWorks || (isEn ? 'How It Works' : 'कैसे काम करता है')}
            </Link>
            <Link
              href="/install"
              className={pathname === '/install' ? 'active' : ''}
              onClick={() => setMobileNavOpen(false)}
            >
              {content.navInstall || (isEn ? 'Install App' : 'ऐप इनस्टॉल')}
            </Link>
            <Link
              href="/guides"
              className={pathname.startsWith('/guides') ? 'active' : ''}
              onClick={() => setMobileNavOpen(false)}
            >
              {content.navGuides || (isEn ? 'Guides' : 'गाइड्स')}
            </Link>
            <Link
              href="/faq"
              className={pathname === '/faq' ? 'active' : ''}
              onClick={() => setMobileNavOpen(false)}
            >
              {content.navFaq || (isEn ? 'FAQ' : 'सवाल-जवाब')}
            </Link>
            <Link
              href="/contact"
              className={pathname === '/contact' ? 'active' : ''}
              onClick={() => setMobileNavOpen(false)}
            >
              {content.navContact || (isEn ? 'Contact' : 'संपर्क')}
            </Link>
          </nav>

          <div className="header-right">
            {/* Language Switcher */}
            <div className="lang-switcher" id="langSwitcher" role="group" aria-label="Language selection">
              <button
                type="button"
                className={`lang-btn ${currentLang === 'en' ? 'active' : ''}`}
                onClick={() => switchLanguage('en')}
                title="Switch to English"
                style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit', padding: 0 }}
              >
                English
              </button>
              <span className="lang-divider">|</span>
              <button
                type="button"
                className={`lang-btn ${currentLang === 'hi' ? 'active' : ''}`}
                onClick={() => switchLanguage('hi')}
                title="हिंदी में बदलें"
                style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit', padding: 0 }}
              >
                हिंदी
              </button>
            </div>

            <a href="/download" className="btn-header-cta" title="Download Official APK">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM17 13l-5 5-5-5h3V9h4v4h3z" />
              </svg>
              <span>{content.navDownload || (isEn ? 'Download APK' : 'APK डाउनलोड')}</span>
            </a>

            <button
              className="theme-toggle"
              id="themeToggle"
              onClick={toggleTheme}
              title="Toggle Light/Dark Theme"
              aria-label="Toggle theme"
            >
              {currentTheme === 'dark' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5" />
                  <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>

            <button
              className="mobile-nav-toggle"
              id="navToggle"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              aria-label="Toggle navigation menu"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
