import React from 'react';

export default function StickyMobileBar({ settings = {}, lang = 'hi' }) {
  const isEn = lang === 'en';
  const freeTrial = (settings.numbers && settings.numbers.freeTrialRides) || 10;

  return (
    <div className="mobile-sticky-bar">
      <div className="mobile-bar-inner">
        <div className="mobile-bar-info">
          <span className="mobile-bar-badge">
            🎉 {isEn ? `${freeTrial} Rides Free Trial` : `पहली ${freeTrial} राइड्स फ्री`}
          </span>
          <span className="mobile-bar-title">
            {settings.siteName || 'RiderSaathi'} v{settings.appVersion || '5.28.1'}
          </span>
        </div>
        <a href="/download" className="btn btn-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM17 13l-5 5-5-5h3V9h4v4h3z" />
          </svg>
          {isEn ? 'Download APK' : 'APK डाउनलोड'}
        </a>
      </div>
    </div>
  );
}
