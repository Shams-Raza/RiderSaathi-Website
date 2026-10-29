import React from 'react';
import { headers, cookies } from 'next/headers';
import { getSettings, resolveLang } from '@/lib/data';
import ContactForm from '@/components/ContactForm';

export const runtime = 'nodejs';

export async function generateMetadata({ searchParams }) {
  const settings = getSettings();
  const siteName = settings.siteName || 'RiderSaathi';
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'http://localhost:3000';
  const headersList = headers();
  const cookieStore = cookies();
  const lang = resolveLang(searchParams, cookieStore, headersList);
  const isEn = lang === 'en';

  let qLang = null;
  if (searchParams) {
    if (typeof searchParams.getAll === 'function') {
      const all = searchParams.getAll('lang');
      if (all.length === 1) qLang = all[0];
    } else if (typeof searchParams.get === 'function') {
      qLang = searchParams.get('lang');
    } else if (typeof searchParams.lang === 'string') {
      qLang = searchParams.lang;
    }
  }

  const canonicalUrl = (qLang === 'en' || qLang === 'hi')
    ? `${baseUrl}/contact?lang=${qLang}`
    : `${baseUrl}/contact`;

  const title = isEn
    ? 'Contact Us & Captain Helpline Support'
    : 'हमसे संपर्क करें और हेल्पलाइन सपोर्ट';
  const description = isEn
    ? 'Get in touch with RiderSaathi customer support team for instant app activation, subscription inquiries, ride filter rules guidance, and official helpline assistance.'
    : 'RiderSaathi सपोर्ट टीम से संपर्क करें: तुरंत ऐप एक्टिवेशन, सब्सक्रिप्शन पूछताछ, राइड रूल्स गाइडेंस और आधिकारिक हेल्पलाइन सहायता.';

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'hi-IN': `${baseUrl}/contact?lang=hi`,
        'en-IN': `${baseUrl}/contact?lang=en`,
        'x-default': `${baseUrl}/contact`,
      },
    },
    openGraph: {
      title: `${title} — ${siteName}`,
      description,
      url: canonicalUrl,
      siteName,
      locale: isEn ? 'en_US' : 'hi_IN',
      alternateLocale: isEn ? ['hi_IN'] : ['en_US'],
      type: 'website',
      images: [
        {
          url: `${baseUrl}/images/og-default.png`,
          width: 1200,
          height: 630,
          alt: `${siteName} Contact Support`,
          type: 'image/png',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} — ${siteName}`,
      description,
      images: [`${baseUrl}/images/og-default.png`],
    },
  };
}

export default function ContactPage({ searchParams }) {
  const settings = getSettings();
  const headersList = headers();
  const cookieStore = cookies();
  const lang = resolveLang(searchParams, cookieStore, headersList);
  const isEn = lang === 'en';

  const loc = settings.location || {};
  const soc = settings.socialLinks || {};

  return (
    <div className="wrap" style={{ paddingTop: '36px', paddingBottom: '60px' }}>
      <div className="section-head" style={{ textAlign: 'center', marginBottom: '36px' }}>
        <div className="pill-badge green" style={{ margin: '0 auto 12px' }}>
          {isEn ? `Support Hours: ${settings.supportHours}` : `सहायता समय: ${settings.supportHours}`}
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
          {isEn ? `Contact ${settings.siteName || 'RiderSaathi'} Support` : `${settings.siteName || 'RiderSaathi'} सपोर्ट से संपर्क करें`}
        </h1>
        <p style={{ maxWidth: '600px', margin: '8px auto 0', fontSize: '16px', color: 'var(--text-muted)' }}>
          {isEn
            ? 'Reach out for plan activation, app installation, filtering rules, or any captain support queries:'
            : 'प्लान एक्टिवेशन, ऐप इंस्टॉलेशन, रूल्स या किसी भी सवाल के लिए हमसे संपर्क करें:'}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px' }}>
        {/* Left Column: Direct Info & Location */}
        <div>
          <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <h3
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '22px',
                fontWeight: 700,
                color: 'var(--text-heading)',
                marginBottom: '16px',
              }}
            >
              {isEn ? 'Direct Helpline & Registered Office' : 'डायरेक्ट हेल्पलाइन और ऑफिस'}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flexGrow: 1 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    background: '#dcfce7',
                    color: '#15803d',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontSize: '18px',
                  }}
                >
                  📱
                </div>
                <div>
                  <strong style={{ color: 'var(--text-heading)', fontSize: '14.5px', display: 'block' }}>
                    WhatsApp Support
                  </strong>
                  <a
                    href={`https://wa.me/${settings.whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '14px', fontWeight: 600, color: '#16a34a' }}
                  >
                    +{settings.whatsappNumber} ({isEn ? 'Instant Reply' : 'तुरंत जवाब'})
                  </a>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    background: '#e0f2fe',
                    color: '#0369a1',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontSize: '18px',
                  }}
                >
                  ✉️
                </div>
                <div>
                  <strong style={{ color: 'var(--text-heading)', fontSize: '14.5px', display: 'block' }}>
                    {isEn ? 'Official Email' : 'ऑफिशियल ईमेल'}
                  </strong>
                  <a href={`mailto:${settings.contactEmail}`} style={{ fontSize: '14px', color: 'var(--brand-primary)' }}>
                    {settings.contactEmail}
                  </a>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    background: 'var(--brand-tint)',
                    color: 'var(--brand-primary)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontSize: '18px',
                  }}
                >
                  ✈️
                </div>
                <div>
                  <strong style={{ color: 'var(--text-heading)', fontSize: '14.5px', display: 'block' }}>
                    Telegram Channel
                  </strong>
                  <a
                    href={(soc.telegram && soc.telegram.url) || settings.telegramUrl || 'https://t.me/RiderSaathi_app'}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '14px' }}
                  >
                    {settings.telegramHandle || '@RiderSaathi_app'}
                  </a>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    background: '#fef3c7',
                    color: '#b45309',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontSize: '18px',
                  }}
                >
                  🏢
                </div>
                <div>
                  <strong style={{ color: 'var(--text-heading)', fontSize: '14.5px', display: 'block' }}>
                    {isEn ? 'Office Address' : 'ऑफिस का पता'}
                  </strong>
                  <span style={{ fontSize: '13.5px', color: 'var(--text-body)', lineHeight: 1.5, display: 'block' }}>
                    {loc.address || settings.officeAddress}
                  </span>
                  {loc.googleMapsUrl && (
                    <a
                      href={loc.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: 'var(--brand-primary)',
                        marginTop: '4px',
                        display: 'inline-block',
                      }}
                    >
                      🗺️ {isEn ? 'Open in Google Maps →' : 'गूगल मैप्स में खोलें →'}
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Google Maps Embed Card */}
            {loc.googleMapsEmbedUrl && (
              <div
                style={{
                  marginTop: '20px',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  border: '1px solid var(--border)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <iframe
                  src={loc.googleMapsEmbedUrl}
                  width="100%"
                  height="180"
                  style={{ border: 0, display: 'block' }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            )}

            <div className="notice-box" style={{ marginTop: '20px', marginBottom: 0 }}>
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="currentColor"
                style={{ flexShrink: 0, color: 'var(--warning)' }}
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
              <div style={{ fontSize: '12.5px' }}>
                <strong>{isEn ? 'Security Alert:' : 'सुरक्षा अलर्ट:'}</strong>{' '}
                {isEn
                  ? `${settings.siteName || 'RiderSaathi'} never asks for OTP, UPI PIN, password, or banking credentials. Please stay alert against fraud.`
                  : `${settings.siteName || 'RiderSaathi'} कभी आपसे OTP, UPI पिन, पासवर्ड या बैंक डिटेल्स नहीं मांगता. कृपया फ्रॉड से सावधान रहें.`}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Message Form */}
        <div>
          <div className="card">
            <h3
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '22px',
                fontWeight: 700,
                color: 'var(--text-heading)',
                marginBottom: '6px',
              }}
            >
              {isEn ? 'Send us a Message' : 'हमे संदेश भेजें'}
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '18px' }}>
              {isEn
                ? 'Fill in your query and our team will get back to you shortly:'
                : 'अपना सवाल या परेशानी नीचे लिखें, हमारी टीम जल्द संपर्क करेगी:'}
            </p>

            <ContactForm lang={lang} />
          </div>
        </div>
      </div>

      {/* JSON-LD ContactPage & LocalBusiness Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ContactPage',
            name: `Contact ${settings.siteName || 'RiderSaathi'}`,
            url: `${process.env.SITE_URL || 'http://localhost:3000'}/contact`,
            description:
              'Official contact and driver customer support desk for RiderSaathi app subscriptions and troubleshooting.',
            mainEntity: {
              '@type': 'LocalBusiness',
              name: settings.siteName || 'RiderSaathi',
              legalName: settings.legalBusinessName || 'RiderSaathi Technologies',
              telephone: `+${settings.whatsappNumber}`,
              email: settings.contactEmail,
              address: {
                '@type': 'PostalAddress',
                streetAddress: settings.officeAddress,
                addressCountry: 'IN',
              },
            },
          }),
        }}
      />
    </div>
  );
}
