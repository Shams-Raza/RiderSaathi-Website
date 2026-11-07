import React from 'react';
import Link from 'next/link';

export default function NotFoundContent() {
  return (
    <section className="not-found-section">
      <div className="wrap">
        <div className="card not-found-card">
          <div className="not-found-badge">
            <span>⚠️</span> Error 404
          </div>

          <div className="not-found-num">404</div>

          <h1 className="not-found-title">
            Page Not Found &bull; यह पेज नहीं मिला
          </h1>

          <div className="not-found-desc">
            <p>
              The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>
            <p>
              Aap jo page dhoondh rahe hain woh shayad hata diya gaya hai, uska naam badal gaya hai, ya URL galat hai.
            </p>
          </div>

          <div className="not-found-actions">
            <Link href="/" className="btn">
              ← Back to Home / होम पेज पर जाएं
            </Link>
            <Link href="/pricing" className="btn ghost">
              Plans &amp; Pricing
            </Link>
          </div>

          <div className="not-found-quicklinks-wrap">
            <div className="not-found-quicklinks-title">
              Helpful Quick Links / उपयोगी लिंक्स
            </div>
            <div className="not-found-quicklinks-grid">
              <Link href="/pricing" className="not-found-quicklink">
                <span>💰</span>
                <span>Pricing Plans</span>
              </Link>
              <Link href="/how-it-works" className="not-found-quicklink">
                <span>⚙️</span>
                <span>How It Works</span>
              </Link>
              <Link href="/guides" className="not-found-quicklink">
                <span>📖</span>
                <span>Driver Guides</span>
              </Link>
              <Link href="/faq" className="not-found-quicklink">
                <span>❓</span>
                <span>Driver FAQ</span>
              </Link>
              <Link href="/contact" className="not-found-quicklink">
                <span>💬</span>
                <span>Contact Support</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

