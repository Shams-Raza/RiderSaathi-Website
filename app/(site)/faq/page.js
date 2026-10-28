import React from 'react';
import Link from 'next/link';
import { getSettings, getFaqs } from '@/lib/data';
import FaqAccordion from '@/components/FaqAccordion';

export async function generateMetadata() {
  const settings = getSettings();
  return {
    title: `${settings.siteName || 'RiderSaathi'} FAQ — Rules, settings aur aam sawal`,
    description: `Driver questions and answers for ${settings.siteName || 'RiderSaathi'}.`,
  };
}

export default function FaqPage() {
  const settings = getSettings();
  const faqs = getFaqs();

  return (
    <div className="wrap" style={{ paddingTop: '36px', paddingBottom: '60px' }}>
      <div className="section-head" style={{ textAlign: 'center', marginBottom: '36px' }}>
        <div className="pill-badge green" style={{ margin: '0 auto 12px' }}>
          Driver Sawal &amp; Jawab
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
          Frequently Asked Questions
        </h1>
        <p style={{ maxWidth: '620px', margin: '8px auto 0', fontSize: '16px', color: 'var(--text-muted)' }}>
          Rules, settings, account security, payment aur install se jude aam sawalon ke seedhe jawab:
        </p>
      </div>

      <FaqAccordion items={faqs} />

      <div style={{ maxWidth: '820px', margin: '0 auto' }}>
        <div
          className="card"
          style={{
            marginTop: '32px',
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
            Koi aur sawal ya dikkat hai?
          </h3>
          <p style={{ fontSize: '15px', color: 'var(--text-body)', maxWidth: '520px', margin: '0 auto 20px' }}>
            Aap direct hamari WhatsApp helpline par message bhej sakte hain ya contact form se likh sakte hain. Hamari team
            turant madad karegi.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <a
              className="btn success btn-sm"
              href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent('Mujhe RiderSaathi ke baare me kuch poochhna hai')}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp Support Chat
            </a>
            <Link className="btn ghost btn-sm" href="/contact">
              Contact Form Bharein
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
