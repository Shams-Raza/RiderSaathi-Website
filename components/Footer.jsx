import React from 'react';
import Link from 'next/link';

export default function Footer({ settings = {}, lang = 'hi' }) {
  const isEn = lang === 'en';
  const soc = settings.socialLinks || {};
  const currentYear = new Date().getFullYear();

  return (
    <footer>
      <div className="wrap">
        <div className="footer-top-grid">
          {/* Col 1: Brand & Bio */}
          <div className="footer-col brand-col">
            <Link className="brand" href="/" aria-label="RiderSathi Home" style={{ marginBottom: '14px', display: 'inline-flex' }}>
              <img
                src="/images/logo.svg"
                alt={settings.siteName || 'RiderSathi'}
                width="160"
                height="40"
                className="brand-logo-img"
              />
            </Link>
            <p className="footer-bio">
              {isEn
                ? 'Smart ride filter assistant for bike-taxi, auto, cab & parcel captains. Earn more, drive safe, stop staring at screens.'
                : 'बाइक-टैक्सी, ऑटो, कैब और पार्सल कप्तानों के लिए स्मार्ट राइड फ़िल्टर सहायक. स्क्रीन ताकना छोड़ें, सुरक्षित चलाएं और अधिक कमाएं.'}
            </p>

            {/* Social Icons Row in Footer */}
            <div className="footer-social-row">
              {soc.whatsapp && soc.whatsapp.enabled !== false && (
                <a
                  href={soc.whatsapp.url || `https://wa.me/${settings.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-social-icon"
                  title="WhatsApp"
                  aria-label="WhatsApp"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z" />
                  </svg>
                </a>
              )}
              {soc.instagram && soc.instagram.enabled !== false && (
                <a
                  href={soc.instagram.url || 'https://instagram.com/ridersaathi'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-social-icon"
                  title="Instagram"
                  aria-label="Instagram"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              )}
              {soc.facebook && soc.facebook.enabled !== false && (
                <a
                  href={soc.facebook.url || 'https://facebook.com/ridersaathi'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-social-icon"
                  title="Facebook"
                  aria-label="Facebook"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
              )}
              {soc.youtube && soc.youtube.enabled !== false && (
                <a
                  href={soc.youtube.url || 'https://youtube.com/@ridersaathi'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-social-icon"
                  title="YouTube"
                  aria-label="YouTube"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
              )}
              {soc.telegram && soc.telegram.enabled !== false && (
                <a
                  href={soc.telegram.url || settings.telegramUrl || 'https://t.me/RiderSaathi_app'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-social-icon"
                  title="Telegram"
                  aria-label="Telegram"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="footer-col">
            <div className="footer-col-title">{isEn ? 'Quick Links' : 'त्वरित लिंक्स'}</div>
            <div className="footer-nav">
              <Link href="/">{isEn ? 'Home' : 'होम'}</Link>
              <Link href="/pricing">{isEn ? 'Pricing Plans' : 'प्लान्स और कीमतें'}</Link>
              <Link href="/how-it-works">{isEn ? 'How It Works (Video)' : 'कैसे काम करता है (वीडियो)'}</Link>
              <Link href="/install">{isEn ? 'Install App' : 'ऐप इनस्टॉल'}</Link>
              <Link href="/guides">{isEn ? 'Driver Guides' : 'ड्राइवर गाइड्स'}</Link>
              <Link href="/faq">{isEn ? 'FAQ' : 'सवाल-जवाब'}</Link>
              <Link href="/about">{isEn ? 'About Us' : 'हमारे बारे में'}</Link>
              <Link href="/contact">{isEn ? 'Contact' : 'संपर्क करें'}</Link>
            </div>
          </div>

          {/* Col 3: Policies & Legal */}
          <div className="footer-col">
            <div className="footer-col-title">{isEn ? 'Policies & Legal' : 'पॉलिसी और शर्तें'}</div>
            <div className="footer-nav">
              <Link href="/refunds">{isEn ? 'Refund & Cancellation' : 'रिफंड और रद्दीकरण'}</Link>
              <Link href="/delivery">{isEn ? 'Delivery & Activation' : 'डिलीवरी और एक्टिवेशन'}</Link>
              <Link href="/terms">{isEn ? 'Terms of Use' : 'नियम और शर्तें'}</Link>
              <Link href="/privacy">{isEn ? 'Privacy Notice' : 'प्राइवेसी नोटिस'}</Link>
            </div>
          </div>

          {/* Col 4: Office & Location */}
          <div className="footer-col">
            <div className="footer-col-title">{isEn ? 'Office & Location' : 'ऑफिस और लोकेशन'}</div>
            <p style={{ fontSize: '13.5px', color: 'var(--text-body)', lineHeight: 1.6, marginBottom: '8px' }}>
              📍 {(settings.location && settings.location.address) || settings.officeAddress}
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
              🕒 {settings.supportHours}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13.5px' }}>
              <a href={`mailto:${settings.contactEmail}`} style={{ color: 'var(--brand-primary)', fontWeight: 500 }}>
                ✉️ {settings.contactEmail}
              </a>
              <a
                href={`https://wa.me/${settings.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--success)', fontWeight: 600 }}
              >
                💬 +{settings.whatsappNumber}
              </a>
              {settings.location && settings.location.googleMapsUrl && (
                <a
                  href={settings.location.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--text-heading)', fontSize: '13px', textDecoration: 'underline' }}
                >
                  🗺️ {isEn ? 'View on Google Maps →' : 'गूगल मैप्स पर देखें →'}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Company Details Bar */}
        <div className="footer-meta-bar">
          <span>
            {isEn ? 'Founded & operated by' : 'संस्थापक एवं संचालक:'}{' '}
            <strong>{settings.ownerName}</strong> ({settings.legalBusinessName}, {settings.businessType})
          </span>
          <span className="meta-separator">&middot;</span>
          <span>{settings.registrationDetails}</span>
        </div>

        {/* Legal Disclaimer */}
        <div className="footer-disclaimer">
          {settings.footerDisclaimer ||
            `${settings.siteName || 'RiderSaathi'} is an independent driver productivity & screen assist utility and is not affiliated with, endorsed by or sponsored by Rapido, Uber or Porter.`}
        </div>

        {/* Copyright Notice */}
        <div className="footer-copyright">
          {settings.copyrightText || `© ${currentYear} ${settings.legalBusinessName || 'RiderSaathi'}. All rights reserved.`}
        </div>
      </div>
    </footer>
  );
}
