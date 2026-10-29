import React from 'react';
import { cookies } from 'next/headers';
import { getSettings, getPlans } from '@/lib/data';
import BuyPlanForm from '@/components/BuyPlanForm';

export const runtime = 'nodejs';

export async function generateMetadata() {
  const settings = getSettings();
  const siteName = settings.siteName || 'RiderSaathi';
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'http://localhost:3000';
  const titleText = 'Buy Subscription Pass';
  const descText =
    'Choose your RiderSaathi subscription pass and activate instantly via UPI. Secure direct payment for Rapido, Uber and Porter captains with zero hidden fees.';

  return {
    title: titleText,
    description: descText,
    alternates: {
      canonical: `${baseUrl}/buy`,
      languages: {
        'hi-IN': `${baseUrl}/buy?lang=hi`,
        'en-IN': `${baseUrl}/buy?lang=en`,
        'x-default': `${baseUrl}/buy`,
      },
    },
    openGraph: {
      title: `${titleText} — ${siteName}`,
      description: descText,
      url: `${baseUrl}/buy`,
      siteName: siteName,
      locale: 'hi_IN',
      alternateLocale: ['en_US'],
      type: 'website',
      images: [
        {
          url: `${baseUrl}/images/og-default.png`,
          width: 1200,
          height: 630,
          alt: `${siteName} Buy Subscription`,
          type: 'image/png',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${titleText} — ${siteName}`,
      description: descText,
      images: [`${baseUrl}/images/og-default.png`],
    },
  };
}

export default function BuyPage({ searchParams }) {
  const settings = getSettings();
  const plans = getPlans();
  const cookieStore = cookies();
  const lang = cookieStore.get('lang')?.value || 'hi';
  const isEn = lang === 'en';

  const selectedPlanId = searchParams?.plan || 'week1';
  const initialPhone = searchParams?.phone || '';

  return (
    <div className="wrap" style={{ paddingTop: '36px', paddingBottom: '60px' }}>
      <div className="form-card">
        <div className="section-head" style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div className="pill-badge green" style={{ margin: '0 auto 12px' }}>
            {isEn ? 'Instant Digital Activation' : 'तुरंत डिजिटल एक्टिवेशन'}
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '34px',
              fontWeight: 800,
              color: 'var(--text-heading)',
              letterSpacing: '-0.6px',
            }}
          >
            {isEn ? `Activate ${settings.siteName || 'RiderSaathi'} Plan` : `${settings.siteName || 'RiderSaathi'} प्लान एक्टिवेट करें`}
          </h1>
          <p style={{ fontSize: '15.5px', color: 'var(--text-muted)' }}>
            {isEn
              ? 'Enter your 10-digit registered number and choose a plan. Direct UPI payment — no auto-debit, no card details needed.'
              : 'अपना 10-अंकों का मोबाइल नंबर दर्ज करें और प्लान चुनें. डायरेक्ट UPI से सुरक्षित पेमेंट — न ऑटो-डेबिट, न कार्ड डिटेल्स.'}
          </p>
        </div>

        {/* Interactive Buy Plan Form */}
        <BuyPlanForm
          plans={plans}
          defaultPlanId={selectedPlanId}
          initialPhone={initialPhone}
          lang={lang}
          siteName={settings.siteName || 'RiderSaathi'}
        />

        {/* Reassurance Features */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            marginTop: '24px',
          }}
        >
          <div
            style={{
              textAlign: 'center',
              padding: '16px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>⚡</div>
            <strong style={{ fontSize: '13.5px', color: 'var(--text-heading)', display: 'block' }}>
              {isEn ? 'Instant Activation' : 'तुरंत एक्टिवेशन'}
            </strong>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {isEn ? 'Plan active in 1-2 mins' : '1-2 मिनट में प्लान चालू'}
            </span>
          </div>

          <div
            style={{
              textAlign: 'center',
              padding: '16px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>🔒</div>
            <strong style={{ fontSize: '13.5px', color: 'var(--text-heading)', display: 'block' }}>
              {isEn ? 'Safe UPI Transfer' : 'सुरक्षित UPI ट्रांसफर'}
            </strong>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {isEn ? 'Direct GPay / PhonePe / Paytm' : 'डायरेक्ट GPay / PhonePe / Paytm'}
            </span>
          </div>

          <div
            style={{
              textAlign: 'center',
              padding: '16px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>💬</div>
            <strong style={{ fontSize: '13.5px', color: 'var(--text-heading)', display: 'block' }}>
              {isEn ? 'WhatsApp Support' : 'व्हाट्सएप सपोर्ट'}
            </strong>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {isEn ? 'Instant helpline available' : 'हेल्पलाइन हमेशा उपलब्ध'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
