import React from 'react';
import Link from 'next/link';
import { getSettings, getUpdates } from '@/lib/data';

export async function generateMetadata() {
  const settings = getSettings();
  return {
    title: `What's New in ${settings.siteName || 'RiderSaathi'} — Version Changelog`,
    description: `${settings.siteName || 'RiderSaathi'} version history and updates.`,
  };
}

export default function UpdatesPage() {
  const settings = getSettings();
  const updates = getUpdates();

  return (
    <div className="wrap" style={{ paddingTop: '36px', paddingBottom: '60px' }}>
      <div className="section-head" style={{ textAlign: 'center', marginBottom: '36px' }}>
        <div className="pill-badge green" style={{ margin: '0 auto 12px' }}>
          Current Release: v{settings.appVersion || '5.28.1'}
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
          What's New in {settings.siteName || 'RiderSaathi'}
        </h1>
        <p style={{ maxWidth: '620px', margin: '8px auto 20px', fontSize: '16px', color: 'var(--text-muted)' }}>
          Har naye version ke changelog aur improvements — sabse naya update sabse upar:
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <a className="btn" href="/download">
            Download Latest v{settings.appVersion || '5.28.1'}
          </a>
          <Link className="btn ghost" href="/install">
            Install Guide
          </Link>
        </div>
      </div>

      {updates.map((up, idx) => (
        <div key={idx} className="card card-section">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px',
              marginBottom: '12px',
              paddingBottom: '10px',
              borderBottom: '1px solid var(--border-light)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '22px',
                  fontWeight: 700,
                  color: 'var(--text-heading)',
                  margin: 0,
                }}
              >
                {up.version}
              </h2>
              {up.status && (
                <span className="pill-badge" style={{ margin: 0, padding: '2px 10px', fontSize: '11.5px' }}>
                  {up.status}
                </span>
              )}
            </div>
            <span style={{ fontSize: '13.5px', color: 'var(--text-muted)', fontWeight: 500 }}>{up.date}</span>
          </div>

          <p style={{ fontSize: '15.5px', fontWeight: 700, color: 'var(--brand-primary)', marginBottom: '12px' }}>
            {up.headline}
          </p>

          <ul style={{ paddingLeft: '20px', lineHeight: 1.8, fontSize: '14.5px', color: 'var(--text-body)' }}>
            {up.points && up.points.map((pt, pIdx) => <li key={pIdx}>{pt}</li>)}
          </ul>
        </div>
      ))}

      <div className="card card-section">
        <h3
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '20px',
            fontWeight: 700,
            color: 'var(--text-heading)',
            marginBottom: '10px',
          }}
        >
          Update Kaise Install Karein
        </h3>
        <p style={{ fontSize: '15px', color: 'var(--text-body)', lineHeight: 1.7 }}>
          <strong>{settings.siteName || 'RiderSaathi'} 5.8 se aage ke versions me update app ke andar hi ho jata hai:</strong> "Update
          karo" dabane par download app me background me chalta hai, aur "Install" button apne aap aa jata hai. Pehli baar
          phone poochhega ki permission do — allow kar dein, dubara nahi poochhega.
        </p>
      </div>
    </div>
  );
}
