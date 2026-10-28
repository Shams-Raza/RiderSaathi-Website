import React from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { getSettings, getFaqs, t } from '@/lib/data';
import FaqAccordion from '@/components/FaqAccordion';

export const runtime = 'nodejs';

export async function generateMetadata() {
  const settings = getSettings();
  const cookieStore = cookies();
  const lang = cookieStore.get('lang')?.value || 'hi';
  const isEn = lang === 'en';
  const siteName = settings.siteName || 'RiderSaathi';

  return {
    title: isEn
      ? `${siteName} FAQ — Rules, Settings & Common Questions`
      : `${siteName} FAQ — रूल्स, सेटिंग्स और आम सवाल`,
    description: isEn
      ? `Driver questions and answers for ${siteName}. How ride filtering, pickup distance, and auto-accept rules work.`
      : `${siteName} के लिए कप्तानों के सवाल और जवाब. रूल्स, सेटिंग्स, अकाउंट सुरक्षा और एक्टिवेशन की पूरी जानकारी.`,
    alternates: {
      canonical: `${process.env.SITE_URL || 'http://localhost:3000'}/faq`,
    },
  };
}

export default function FaqPage() {
  const settings = getSettings();
  const faqs = getFaqs();
  const cookieStore = cookies();
  const lang = cookieStore.get('lang')?.value || 'hi';
  const isEn = lang === 'en';

  const localizedFaqs = faqs.map((item) => ({
    id: item.id,
    q: t(item.q, lang) || item.q,
    a: t(item.a, lang) || item.a,
    category: item.category || 'General',
  }));

  return (
    <div className="wrap" style={{ paddingTop: '36px', paddingBottom: '60px' }}>
      <div className="section-head" style={{ textAlign: 'center', marginBottom: '36px' }}>
        <div className="pill-badge green" style={{ margin: '0 auto 12px' }}>
          {isEn ? 'Driver Q&A Guide' : 'ड्राइवर सवाल & जवाब'}
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
          {isEn ? 'Frequently Asked Questions' : 'अक्सर पूछे जाने वाले सवाल (FAQ)'}
        </h1>
        <p style={{ maxWidth: '620px', margin: '8px auto 0', fontSize: '16px', color: 'var(--text-muted)' }}>
          {isEn
            ? 'Clear answers regarding rules, settings, account security, payment, and app installation:'
            : 'रूल्स, सेटिंग्स, अकाउंट सुरक्षा, पेमेंट और इंस्टॉलेशन से जुड़े आम सवालों के सीधे जवाब:'}
        </p>
      </div>

      <FaqAccordion items={localizedFaqs} />

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
            {isEn ? 'Have any other questions or facing issues?' : 'कोई और सवाल या दिक्कत है?'}
          </h3>
          <p style={{ fontSize: '15px', color: 'var(--text-body)', maxWidth: '520px', margin: '0 auto 20px' }}>
            {isEn
              ? 'Reach out directly on our WhatsApp helpline or write to us through the contact form. Our team responds quickly.'
              : 'आप डायरेक्ट हमारी व्हाट्सएप हेल्पलाइन पर मैसेज भेज सकते हैं या कॉन्टैक्ट फॉर्म से लिख सकते हैं. हमारी टीम तुरंत मदद करेगी.'}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <a
              className="btn success btn-sm"
              href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent('Mujhe RiderSaathi ke baare me kuch poochhna hai')}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '6px' }}>
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z" />
              </svg>
              {isEn ? 'WhatsApp Support Chat' : 'व्हाट्सएप सपोर्ट चैट'}
            </a>
            <Link className="btn ghost btn-sm" href="/contact">
              {isEn ? 'Open Contact Form' : 'कॉन्टैक्ट फॉर्म भरें'}
            </Link>
          </div>
        </div>
      </div>

      {/* JSON-LD FAQPage Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: localizedFaqs.map((f) => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: {
                '@type': 'Answer',
                text: f.a,
              },
            })),
          }),
        }}
      />
    </div>
  );
}
