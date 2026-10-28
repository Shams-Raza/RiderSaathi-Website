import React from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getSettings, getGuides } from '@/lib/data';

export async function generateMetadata({ params }) {
  const settings = getSettings();
  const guides = getGuides();
  const guide = guides.find((g) => g.slug === params.slug);

  if (!guide) {
    return {
      title: `Guides — ${settings.siteName || 'RiderSaathi'}`,
    };
  }

  return {
    title: `${guide.title} — ${settings.siteName || 'RiderSaathi'} Guides`,
    description: guide.summary,
  };
}

export default function GuideDetailPage({ params }) {
  const settings = getSettings();
  const guides = getGuides();
  const guide = guides.find((g) => g.slug === params.slug);

  if (!guide) {
    redirect('/guides');
  }

  return (
    <div className="wrap" style={{ paddingTop: '28px', paddingBottom: '60px' }}>
      <div style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginBottom: '20px' }}>
        <Link href="/">Home</Link> &rsaquo; <Link href="/guides">Guides</Link> &rsaquo;{' '}
        <span style={{ color: 'var(--text-heading)', fontWeight: 600 }}>{guide.title}</span>
      </div>

      <div className="card" style={{ padding: '36px 32px' }}>
        <div className="pill-badge green" style={{ marginBottom: '12px' }}>
          {guide.category}
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '34px',
            fontWeight: 800,
            color: 'var(--text-heading)',
            letterSpacing: '-0.6px',
            marginBottom: '12px',
          }}
        >
          {guide.title}
        </h1>
        <p
          style={{
            fontSize: '17px',
            fontWeight: 500,
            color: 'var(--text-body)',
            lineHeight: 1.6,
            marginBottom: '24px',
            paddingBottom: '18px',
            borderBottom: '1px solid var(--border-light)',
          }}
        >
          {guide.summary}
        </p>

        <div
          className="guide-body"
          style={{ lineHeight: 1.75, fontSize: '16px', color: 'var(--text-body)' }}
          dangerouslySetInnerHTML={{ __html: guide.content }}
        />

        <div className="notice-box info" style={{ marginTop: '36px' }}>
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{ flexShrink: 0, color: 'var(--brand-primary)' }}
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
          <div>
            <strong>Pehle 10 rides bilkul free hain!</strong> Ye settings apne phone par try karne ke liye abhi app
            download karein aur live rides me test karein.
          </div>
        </div>

        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginTop: '24px' }}>
          <Link className="btn" href="/install">
            Download APK (Free)
          </Link>
          <Link className="btn ghost" href="/guides">
            Back to all guides
          </Link>
        </div>
      </div>
    </div>
  );
}
