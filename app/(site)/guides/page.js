import React from 'react';
import Link from 'next/link';
import { getSettings, getGuides } from '@/lib/data';

export async function generateMetadata() {
  const settings = getSettings();
  return {
    title: `Guides for Drivers — ${settings.siteName || 'RiderSaathi'}`,
    description: `Rules and settings guide for ${settings.siteName || 'RiderSaathi'} ride filter assistant.`,
  };
}

export default function GuidesPage() {
  const settings = getSettings();
  const guides = getGuides();
  const categories = [...new Set(guides.map((g) => g.category || 'General'))];

  return (
    <div className="wrap" style={{ paddingTop: '36px', paddingBottom: '60px' }}>
      <div className="section-head" style={{ textAlign: 'center', marginBottom: '36px' }}>
        <div className="pill-badge green" style={{ margin: '0 auto 12px' }}>
          Tips, Rules &amp; Optimization
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '38px',
            fontWeight: 800,
            color: 'var(--text-heading)',
            letterSpacing: '-0.8px',
          }}
        >
          Driver Guides &amp; Tutorials
        </h1>
        <p style={{ maxWidth: '620px', margin: '8px auto 0', fontSize: '16px', color: 'var(--text-muted)' }}>
          {settings.siteName || 'RiderSaathi'} ke har ek rule ka guide — Rapido, Uber, Porter me rules kaise set karein
          aur kamai kaise badhayein:
        </p>
      </div>

      {categories.map((cat) => {
        const catGuides = guides.filter((g) => (g.category || 'General') === cat);
        return (
          <div key={cat} className="card card-section">
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '22px',
                fontWeight: 700,
                color: 'var(--text-heading)',
                marginBottom: '18px',
                paddingBottom: '10px',
                borderBottom: '1px solid var(--border-light)',
              }}
            >
              📁 {cat}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
              {catGuides.map((g) => (
                <div key={g.slug} className="feature-box">
                  <h4 style={{ marginBottom: '6px' }}>
                    <Link href={`/guides/${g.slug}`} style={{ color: 'var(--text-heading)', textDecoration: 'none' }}>
                      {g.title} &rarr;
                    </Link>
                  </h4>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{g.summary}</p>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <div
        className="card"
        style={{
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(239,246,255,0.7) 0%, rgba(240,253,244,0.7) 100%)',
        }}
      >
        <h3
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '22px',
            fontWeight: 700,
            color: 'var(--text-heading)',
            marginBottom: '8px',
          }}
        >
          Ready to test on your phone?
        </h3>
        <p style={{ fontSize: '15px', color: 'var(--text-body)', maxWidth: '500px', margin: '0 auto 20px' }}>
          Apni pasand ke rules test karne ke liye official app install karein. Pehle 10 rides bilkul free hain.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <Link className="btn btn-sm" href="/install">
            Install Guide &amp; APK
          </Link>
          <Link className="btn ghost btn-sm" href="/faq">
            Driver FAQs
          </Link>
        </div>
      </div>
    </div>
  );
}
