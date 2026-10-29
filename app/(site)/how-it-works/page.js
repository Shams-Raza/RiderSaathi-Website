import React from 'react';
import Link from 'next/link';
import { headers, cookies } from 'next/headers';
import { getSettings, num, resolveLang } from '@/lib/data';

export async function generateMetadata({ searchParams }) {
  const settings = getSettings();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'http://localhost:3000';
  const siteName = settings.siteName || 'RiderSaathi';
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
    ? `${baseUrl}/how-it-works?lang=${qLang}`
    : `${baseUrl}/how-it-works`;

  const titleText = isEn
    ? 'How RiderSaathi Works — Driver Guide'
    : 'RiderSaathi कैसे काम करता है — गाइड';
  const descText = isEn
    ? 'Watch step-by-step video tutorial to install RiderSaathi, configure custom ride rules, and auto-accept profitable rides on Rapido, Uber and Porter.'
    : 'RiderSaathi इनस्टॉल करने, कस्टम राइड रूल्स सेट करने, और रैपिडो, उबर व पोर्टर पर ऑटो-एक्सेप्ट चालू करने का पूरा वीडियो ट्यूटोरियल देखें.';

  return {
    title: titleText,
    description: descText,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'hi-IN': `${baseUrl}/how-it-works?lang=hi`,
        'en-IN': `${baseUrl}/how-it-works?lang=en`,
        'x-default': `${baseUrl}/how-it-works`,
      },
    },
    openGraph: {
      title: `${titleText} — ${siteName}`,
      description: descText,
      url: canonicalUrl,
      siteName: siteName,
      locale: isEn ? 'en_US' : 'hi_IN',
      alternateLocale: isEn ? ['hi_IN'] : ['en_US'],
      type: 'article',
      images: [
        {
          url: `${baseUrl}/images/og-default.png`,
          width: 1200,
          height: 630,
          alt: `${siteName} How It Works`,
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

export default function HowItWorksPage({ searchParams }) {
  const settings = getSettings();
  const headersList = headers();
  const cookieStore = cookies();
  const lang = resolveLang(searchParams, cookieStore, headersList);
  const isEn = lang === 'en';

  const hiw = settings.howItWorks || {};
  const pageTitle = isEn
    ? hiw.title_en || 'How RiderSaathi Works — Complete Driver Guide & Tutorial'
    : hiw.title_hi || 'RiderSaathi कैसे काम करता है — पूरी जानकारी & वीडियो ट्यूटोरियल';
  const pageSubtitle = isEn
    ? hiw.subtitle_en ||
      'Watch this step-by-step video to learn how to install, set up custom ride rules, and auto-accept profitable rides on Rapido, Uber & Porter.'
    : hiw.subtitle_hi ||
      'देखिये कैसे 2 मिनट में RiderSaathi ऐप इनस्टॉल करें, अपनी मर्जी के रूल्स लगाएं और घाटे वाली राइड्स छोड़कर कमाई वाली राइड्स उठाएं.';

  let embedUrl = hiw.youtubeEmbedUrl || 'https://www.youtube.com/embed/dQw4w9WgXcQ';
  if (hiw.youtubeVideoUrl && !hiw.youtubeEmbedUrl) {
    try {
      const u = new URL(hiw.youtubeVideoUrl);
      if (u.hostname.includes('youtube.com') && u.searchParams.get('v')) {
        embedUrl = 'https://www.youtube.com/embed/' + u.searchParams.get('v');
      } else if (u.hostname.includes('youtu.be')) {
        embedUrl = 'https://www.youtube.com/embed/' + u.pathname.replace('/', '');
      }
    } catch (e) {}
  }

  const steps =
    hiw.steps && hiw.steps.length > 0
      ? hiw.steps
      : [
          {
            num: 1,
            title_en: 'Download & Install the APK',
            title_hi: 'APK डाउनलोड और इनस्टॉल करें',
            desc_en:
              'Download the official RiderSaathi APK directly to your Android device and install it with one tap.',
            desc_hi: 'वेबसाइट से ऑफिशियल RiderSaathi APK डाउनलोड करके अपने एंड्रॉइड फ़ोन में इनस्टॉल करें.',
          },
          {
            num: 2,
            title_en: 'Enable Accessibility Permission',
            title_hi: 'Accessibility परमिशन चालू करें',
            desc_en:
              'Turn on Accessibility Service so RiderSaathi can safely read incoming ride requests on your screen.',
            desc_hi:
              'Accessibility परमिशन ऑन करें ताकि ऐप Rapido, Uber और Porter की बुकिंग कार्ड्स पढ़ सके.',
          },
          {
            num: 3,
            title_en: 'Set Your Ride Filters & Rules',
            title_hi: 'अपने राइड फ़िल्टर्स और रूल्स सेट करें',
            desc_en:
              'Configure minimum fare, max pickup distance (e.g., 2.5 km), Go-To route, and vehicle toggles.',
            desc_hi:
              'मिनिमम किराया, पिकअप दूरी लिमिट (जैसे 2.5 किमी), घर की तरफ रूट और सवारी/पार्सल स्विच सेट करें.',
          },
          {
            num: 4,
            title_en: 'Turn On Auto-Filter Assistant',
            title_hi: 'ऑटो-फ़िल्टर असिस्टेंट ऑन करें',
            desc_en:
              'Activate the assistant. Keep your phone on the bike mount and keep your eyes safely on the road.',
            desc_hi: 'ऐप का स्विच ऑन करें. फ़ोन को माउंट पर लगाएं और सड़क पर ध्यान रखकर गाड़ी चलाएं.',
          },
          {
            num: 5,
            title_en: 'Start Earning More Every Shift',
            title_hi: 'हर शिफ्ट में ज्यादा कमाई शुरू करें',
            desc_en:
              'RiderSaathi auto-accepts high-fare matching bookings in 1 second while filtering out loss-making rides.',
            desc_hi:
              'मैचिंग राइड आते ही 1 सेकंड में ऑटो-एक्सेप्ट होगी और घाटे वाली राइड्स अपने आप रिजेक्ट होंगी.',
          },
        ];

  return (
    <main className="how-it-works-page">
      <div className="wrap" style={{ paddingTop: '40px', paddingBottom: '70px' }}>
        {/* Section Header */}
        <div className="section-head" style={{ textAlign: 'center', maxWidth: '820px', margin: '0 auto 36px' }}>
          <div className="pill-badge green" style={{ margin: '0 auto 14px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            <span>{isEn ? 'Official Video Tutorial & Guide' : 'ऑफिशियल वीडियो ट्यूटोरियल & गाइड'}</span>
          </div>
          <h1
            className="page-title"
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '38px',
              fontWeight: 800,
              color: 'var(--text-heading)',
              letterSpacing: '-0.6px',
              lineHeight: 1.25,
              marginBottom: '14px',
            }}
          >
            {pageTitle}
          </h1>
          <p
            className="page-subtitle"
            style={{ fontSize: '17px', color: 'var(--text-muted)', lineHeight: 1.6, margin: '0 auto' }}
          >
            {pageSubtitle}
          </p>
        </div>

        {/* YouTube Responsive Video Container (16:9 Aspect Ratio) */}
        <div className="video-showcase-card">
          <div className="video-responsive-wrapper">
            <iframe
              id="howItWorksVideoIframe"
              src={embedUrl}
              title={pageTitle}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>
          </div>
          <div className="video-caption-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                className="live-dot"
                style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }}
              ></span>
              <strong style={{ color: 'var(--text-heading)', fontSize: '14.5px' }}>
                {isEn ? 'Full Walkthrough Video' : 'पूरा स्टेप-बाय-स्टेप वीडियो'}
              </strong>
            </div>
            <div style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
              {isEn ? 'Learn how to set rules & prevent loss-making trips' : 'रूल्स सेट करना और घाटे वाली राइड्स रोकना सीखें'}
            </div>
          </div>
        </div>

        {/* 5 Step-by-Step Interactive Cards */}
        <div style={{ marginTop: '56px' }}>
          <div className="section-head" style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', fontWeight: 800, color: 'var(--text-heading)' }}>
              {isEn ? '5 Simple Steps to Start Earning More' : 'ज्यादा कमाई शुरू करने के 5 आसान स्टेप्स'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '15.5px' }}>
              {isEn
                ? 'Follow this guide to get up and running in under 2 minutes.'
                : 'इस गाइड को फॉलो करें और 2 मिनट में ऐप चालू करें.'}
            </p>
          </div>

          <div className="steps-grid">
            {steps.map((step, idx) => (
              <div key={idx} className="step-card">
                <div className="step-number-badge">{step.num || idx + 1}</div>
                <h3 className="step-title">
                  {isEn ? step.title_en || step.title : step.title_hi || step.title}
                </h3>
                <p className="step-desc">
                  {isEn ? step.desc_en || step.desc : step.desc_hi || step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action Banner */}
        <div className="how-it-works-cta-card">
          <div className="cta-inner">
            <div>
              <h3
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '24px',
                  fontWeight: 800,
                  color: '#fff',
                  marginBottom: '6px',
                }}
              >
                {isEn ? 'Ready to drive with confidence?' : 'तैयार हैं बिना टेंशन ज्यादा कमाई के लिए?'}
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.88)', fontSize: '15px', margin: 0 }}>
                {isEn
                  ? `Get your first ${num(settings, 'freeTrialRides', 10)} rides free — no payment card required.`
                  : `अपनी पहली ${num(settings, 'freeTrialRides', 10)} राइड्स बिल्कुल फ्री पाएं — कोई पेमेंट कार्ड नहीं चाहिए.`}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <a
                href="/download"
                className="btn"
                style={{ background: '#fff', color: 'var(--brand-primary)', fontWeight: 700 }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM17 13l-5 5-5-5h3V9h4v4h3z" />
                </svg>
                {isEn ? 'Download APK Free' : 'फ्री APK डाउनलोड करें'}
              </a>
              <a
                href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(settings.whatsappText || 'Hello')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn ghost"
                style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.5)' }}
              >
                💬 {isEn ? 'Ask on WhatsApp' : 'व्हाट्सएप पर पूछें'}
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
