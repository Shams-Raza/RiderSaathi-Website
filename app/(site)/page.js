import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { headers, cookies } from 'next/headers';
import { getSettings, getPlans, getGuides, num, resolveLang } from '@/lib/data';

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
    ? `${baseUrl}/?lang=${qLang}`
    : `${baseUrl}/`;

  const titleText = isEn
    ? `${siteName} — Smart Ride Filter App for Rapido, Uber & Porter Drivers`
    : `${siteName} — रैपिडो, उबर और पोर्टर कप्तानों के लिए स्मार्ट राइड फिल्टर ऐप`;
  const descText = isEn
    ? 'Smart ride filtering assistant for Rapido, Uber and Porter drivers. Set custom rules, pickup distance limits, and auto-accept rides. First 10 rides are free.'
    : 'रैपिडो, उबर और पोर्टर ड्राइवर्स के लिए स्मार्ट राइड फिल्टरिंग असिस्टेंट. मनपसंद दूरी, मिनिमम किराया और ऑटो-एक्सेप्ट रूल्स सेट करें. पहली 10 राइड्स बिल्कुल फ्री.';

  return {
    title: {
      absolute: titleText,
    },
    description: descText,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'hi-IN': `${baseUrl}/?lang=hi`,
        'en-IN': `${baseUrl}/?lang=en`,
        'x-default': `${baseUrl}/`,
      },
    },
    openGraph: {
      title: titleText,
      description: descText,
      url: canonicalUrl,
      siteName: siteName,
      locale: isEn ? 'en_US' : 'hi_IN',
      alternateLocale: isEn ? ['hi_IN'] : ['en_US'],
      type: 'website',
      images: [
        {
          url: `${baseUrl}/images/og-default.png`,
          width: 1200,
          height: 630,
          alt: `${siteName} Banner`,
          type: 'image/png',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: titleText,
      description: descText,
      images: [`${baseUrl}/images/og-default.png`],
    },
  };
}

export default function HomePage({ searchParams }) {
  const settings = getSettings();
  const plans = getPlans();
  const headersList = headers();
  const cookieStore = cookies();
  const lang = resolveLang(searchParams, cookieStore, headersList);
  const isEn = lang === 'en';
  const cnt = isEn ? (settings.content_en || {}) : (settings.content_hi || {});

  return (
    <main>
      {/* 1. HERO SECTION */}
      <section className="hero-wrapper">
        <div className="wrap">
          <div className="hero-grid">
            {/* Left Column: High-Impact Copy */}
            <div className="hero-content">
              <div className="hero-smart-badge">
                <span className="live-dot-green"></span>
                <span>{isEn ? 'SMART RIDE COMPANION' : 'स्मार्ट राइड कम्पैनियन'}</span>
              </div>

              <h1 className="hero-title">
                {isEn ? (
                  <>
                    Never Miss a <span className="text-primary">Ride Opportunity</span>
                  </>
                ) : (
                  <>
                    कभी न चूकें एक भी <span className="text-primary">कमाई वाली राइड</span>
                  </>
                )}
              </h1>

              <p className="hero-subtitle">
                {cnt.heroSubtitle ||
                  (isEn
                    ? 'Skip loss-making trips, accept profitable ones. RiderSaathi filters Rapido, Uber and Porter bookings based on your custom rules — so you can focus on the road without staring at your screen.'
                    : `${settings.siteName || 'RiderSaathi'} आपके सेट किए हुए रूल्स पर Rapido, Uber और Porter की बुकिंग्स फ़िल्टर करता है — ताकि आप स्क्रीन ताकने के बजाय सड़क पर ध्यान देकर बेफ़िकर काम कर सकें.`)}
              </p>

              <div className="hero-actions">
                <Link className="btn-hero-primary" href="/install">
                  <span>{cnt.btnDownload || (isEn ? 'Get Started' : 'शुरू करें — डाउनलोड')}</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link className="btn-hero-secondary" href="/how-it-works">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <span>{isEn ? 'See How It Works' : 'देखें कैसे काम करता है'}</span>
                </Link>
              </div>

              <div className="hero-trust-indicators">
                <div className="hero-trust-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                  </svg>
                  <span>{isEn ? 'Safe & Secure' : '100% सुरक्षित'}</span>
                </div>
                <div className="hero-trust-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17 1H7c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 18H7V5h10v14z" />
                  </svg>
                  <span>{isEn ? 'Works on Android' : 'Android पर समर्थित'}</span>
                </div>
                <div className="hero-trust-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                  <span>{isEn ? `First ${num(settings, 'freeTrialRides', 10)} Rides Free` : `पहली ${num(settings, 'freeTrialRides', 10)} राइड्स फ्री`}</span>
                </div>
              </div>
            </div>

            {/* Right Column: 3D Robot Visual & Floating Glassmorphism Cards */}
            <div className="hero-visual-area">
              <div className="hero-glow-blob" aria-hidden="true" />

              <div className="hero-robot-wrapper">
                <Image
                  src="/images/hero-robot-clean.png"
                  alt="RiderSaathi 3D Robot with Ride Auto Accept on Scooter"
                  width={420}
                  height={420}
                  priority
                  className="hero-robot-img"
                />
              </div>

              {/* Floating Card 1: More Opportunities (Top Right) */}
              <div className="hero-float-card card-top-right">
                <div className="growth-badge-icon">📈</div>
                <div className="growth-text-col">
                  <div className="growth-label">{isEn ? 'More Opportunities' : 'ज्यादा अवसर'}</div>
                  <div className="growth-val">{isEn ? '+45% Daily Rides' : '+45% ज्यादा राइड्स'}</div>
                </div>
                <div className="mini-bar-chart" aria-hidden="true">
                  <span className="mini-bar"></span>
                  <span className="mini-bar"></span>
                  <span className="mini-bar"></span>
                  <span className="mini-bar"></span>
                </div>
              </div>

              {/* Floating Card 2: Ride Accepted (Right Middle) */}
              <div className="hero-float-card card-mid-right">
                <div className="ride-accepted-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                </div>
                <div className="ride-accepted-info">
                  <div className="ride-accepted-title">
                    <span>Rapido Bike</span>
                    <span className="fare-tag">₹140</span>
                  </div>
                  <div className="ride-accepted-meta">
                    {isEn ? 'Ride Accepted • 2 min ago' : 'राइड एक्सेप्टेड • 2 मिनट पहले'}
                  </div>
                </div>
              </div>

              {/* Floating Card 3: Ride Accepted (Bottom Left) */}
              <div className="hero-float-card card-bottom-left">
                <div className="ride-accepted-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                </div>
                <div className="ride-accepted-info">
                  <div className="ride-accepted-title">
                    <span>Uber Auto</span>
                    <span className="fare-tag">₹185</span>
                  </div>
                  <div className="ride-accepted-meta">
                    {isEn ? 'Ride Accepted • 8 min ago' : 'राइड एक्सेप्टेड • 8 मिनट पहले'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE STRIP & 3 MODERN SAAS FEATURE CARDS */}
      <div className="wrap">
        <div className="feature-strip">
          <div className="feature-strip-grid">
            <div className="feature-strip-item">
              <div className="feature-strip-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 2v11h3v9l7-12h-4l4-8z" />
                </svg>
              </div>
              <div>
                <div className="feature-strip-title">{isEn ? 'Faster Responses' : 'तेज़ रिस्पांस'}</div>
                <div className="feature-strip-sub">{isEn ? 'Auto-accepts in < 1 second' : '1 सेकंड में ऑटो-एक्सेप्ट'}</div>
              </div>
            </div>

            <div className="feature-strip-item">
              <div className="feature-strip-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 11.24V7.5a2.5 2.5 0 0 1 5 0v3.74c1.21-.81 2-2.18 2-3.74a4.5 4.5 0 0 0-9 0c0 1.56.79 2.93 2 3.74zm9.84 4.63l-4.54-2.26a1.99 1.99 0 0 0-1.87.12l-1.12.72-3.4-3.4a1.49 1.49 0 0 0-2.12 0l-.71.71 5.92 5.92c.38.38.88.58 1.41.58h5.59c1.02 0 1.88-.77 1.98-1.78l.34-3.41c.06-.57-.22-1.12-.48-1.2z" />
                </svg>
              </div>
              <div>
                <div className="feature-strip-title">{isEn ? 'Less Manual Tapping' : 'कम स्क्रीन टैपिंग'}</div>
                <div className="feature-strip-sub">{isEn ? 'Hands on bar, eyes on road' : 'हाथ हैंडल पर, नजर सड़क पर'}</div>
              </div>
            </div>

            <div className="feature-strip-item">
              <div className="feature-strip-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.2 14.2L11 13V7h1.5v5.2l4.5 2.7-.8 1.3z" />
                </svg>
              </div>
              <div>
                <div className="feature-strip-title">{isEn ? 'More Time on the Road' : 'सड़क पर ज्यादा समय'}</div>
                <div className="feature-strip-sub">{isEn ? 'Maximize daily net profit' : 'प्रति किलोमीटर ज्यादा कमाई'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* 3 FEATURE CARDS */}
        <div className="saas-features-grid">
          <div className="saas-feature-card">
            <div className="saas-feature-top">
              <div className="saas-feature-icon-circle">🤖</div>
              <div className="saas-feature-arrow">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </div>
            <h3>{isEn ? 'Smart Ride Assistance' : 'स्मार्ट राइड असिस्टेंस'}</h3>
            <p>
              {isEn
                ? 'Analyzes incoming booking fare, drop distance, and pickup route in milliseconds to accept only profitable trips.'
                : 'किराया, ड्रॉप की दूरी और पिकअप रूट को तुरंत परख कर सिर्फ मुनाफे वाली राइड्स चुनता है.'}
            </p>
          </div>

          <div className="saas-feature-card">
            <div className="saas-feature-top">
              <div className="saas-feature-icon-circle">⚡</div>
              <div className="saas-feature-arrow">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </div>
            <h3>{isEn ? 'Quick Ride Decisions' : 'त्वरित राइड निर्णय'}</h3>
            <p>
              {isEn
                ? 'Skips low-fare loss trips automatically and grabs high-value long routes instantly before competitors can react.'
                : 'छोटी घाटे वाली ₹20 की राइड्स को तुरंत छोड़ कर लंबी कमाई वाली बुकिंग्स पहले उठाता है.'}
            </p>
          </div>

          <div className="saas-feature-card">
            <div className="saas-feature-top">
              <div className="saas-feature-icon-circle">🛡️</div>
              <div className="saas-feature-arrow">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </div>
            <h3>{isEn ? 'Driver-Friendly Design' : 'ड्राइवर-फ्रेंडली डिज़ाइन'}</h3>
            <p>
              {isEn
                ? 'One-tap start with zero complicated setup. Operates seamlessly in background alongside Rapido, Uber, and Porter.'
                : 'एक टैप में शुरू, कोई कठिन सेटिंग नहीं. पार्टनर ऐप्स के साथ बैकग्राउंड में बिना रुकावट काम करता है.'}
            </p>
          </div>
        </div>
      </div>

      {/* 2. SUPPORTED PLATFORMS SECTION */}
      {(!settings.homeSections || settings.homeSections.supportedApps !== false) && (
        <div className="wrap">
          <div className="partners-section">
            <div className="partners-title">
              {cnt.compatibleTitle ||
                (isEn
                  ? 'Compatible Apps — Works Seamlessly Across All Platforms'
                  : 'कंपैटिबल ऐप्स — हर ऐप पर बराबर काम करता है')}
            </div>
            <div className="partners-grid">
              <div className="partner-chip">
                <span className="partner-dot" style={{ background: '#eab308' }}></span>
                Rapido Captain (Bike &amp; Auto)
              </div>
              <div className="partner-chip">
                <span className="partner-dot" style={{ background: '#0f172a' }}></span>
                Uber Driver (Moto, Auto, Cab)
              </div>
              <div className="partner-chip">
                <span className="partner-dot" style={{ background: '#0284c7' }}></span>
                Porter Partner (2-Wheeler &amp; 3W)
              </div>
              <div className="partner-chip">
                <span className="partner-dot" style={{ background: '#10b981' }}></span>
                Shadowfax Delivery
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="wrap">
        {/* 3. 3 BIG DRIVER PROBLEMS & RIDERSAATHI SOLUTION */}
        {(!settings.homeSections || settings.homeSections.driverProblems !== false) && (
          <div className="card card-section">
            <div className="section-head">
              <h2>
                {cnt.problemsHeading ||
                  (isEn
                    ? '3 Biggest Driver Challenges — And RiderSaathi\'s Solution'
                    : `ड्राइवर भाइयों की 3 सबसे बड़ी दिक्कतें — और ${settings.siteName || 'RiderSaathi'} का जवाब`)}
              </h2>
              <p>
                {cnt.problemsSubheading ||
                  (isEn
                    ? 'Designed from real captain experience on the streets so you never lose hard-earned fuel money.'
                    : 'आपकी मेहनत का पैसा किसी घाटे वाली राइड में न फंसे, इसलिए यह ऐप बनाया गया है:')}
              </p>
            </div>

            <div className="problems-grid">
              {/* Problem 1 */}
              <div className="problem-card">
                <div className="problem-icon icon-yellow">⚡</div>
                <h3>{cnt.problem1Title || (isEn ? '1. When ride demand is low' : '1. जब काम कम हो')}</h3>
                <div className="problem-box">
                  <strong>{isEn ? 'Challenge:' : 'दिक्कत:'}</strong>{' '}
                  {cnt.problem1Issue ||
                    (isEn
                      ? 'Captains wait idle. As soon as a ride sounds, someone else grabs it in 1-2 seconds before you can even read pickup/drop.'
                      : 'कप्तान खाली बैठे रहते हैं. राइड बजते ही 1-2 सेकंड में कोई और उठा लेता है. जब तक पिकअप और ड्रॉप पढ़ो तब तक राइड निकल जाती है.')}
                </div>
                <div className="solution-box">
                  <strong>{settings.siteName || 'RiderSaathi'}:</strong>{' '}
                  {cnt.problem1Solution ||
                    (isEn
                      ? `No need to stare at screen. RiderSaathi auto-accepts matching rides for your chosen area within ${num(settings, 'autoAcceptTimeSec', 1)} second.`
                      : `स्क्रीन घूरने की जरूरत नहीं. आपकी पसंद की दूरी और एरिया की राइड आते ही ${settings.siteName || 'RiderSaathi'} ${num(settings, 'autoAcceptTimeSec', 1)} सेकंड में उसे एक्सेप्ट कर लेता है.`)}
                </div>
              </div>

              {/* Problem 2 */}
              <div className="problem-card">
                <div className="problem-icon icon-blue">💰</div>
                <h3>{cnt.problem2Title || (isEn ? '2. When demand is peak' : '2. जब डिमांड ज्यादा हो')}</h3>
                <div className="problem-box">
                  <strong>{isEn ? 'Challenge:' : 'दिक्कत:'}</strong>{' '}
                  {cnt.problem2Issue ||
                    (isEn
                      ? `Back-to-back pings, mostly small ₹${num(settings, 'shortRideFareMin', 20)}-₹${num(settings, 'shortRideFareMax', 30)} trips. While dealing with these, high-value ${num(settings, 'longRideDistanceMin', 15)}-${num(settings, 'longRideDistanceMax', 20)} km trips slip away.`
                      : `राइड के ऊपर राइड बजती रहती है, और ज्यादातर ₹${num(settings, 'shortRideFareMin', 20)}-₹${num(settings, 'shortRideFareMax', 30)} वाली छोटी राइड्स होती हैं. इनके चक्कर में ${num(settings, 'longRideDistanceMin', 15)}-${num(settings, 'longRideDistanceMax', 20)} किमी वाली कमाई वाली राइड निकल जाती है.`)}
                </div>
                <div className="solution-box">
                  <strong>{settings.siteName || 'RiderSaathi'}:</strong>{' '}
                  {cnt.problem2Solution ||
                    (isEn
                      ? 'Filters out low-fare loss trips and accepts only long, profitable rides matching your distance and minimum fare.'
                      : 'छोटी घाटे वाली राइड्स को स्किप कर देता है, और सिर्फ आपके सेट किए हुए मिनिमम किराए व दूरी वाली लंबी राइड्स उठाता है.')}
                </div>
              </div>

              {/* Problem 3 */}
              <div className="problem-card">
                <div className="problem-icon icon-green">🛡️</div>
                <h3>{cnt.problem3Title || (isEn ? '3. Screen tapping fatigue' : '3. बार-बार हाथ मारने की थकान')}</h3>
                <div className="problem-box">
                  <strong>{isEn ? 'Challenge:' : 'दिक्कत:'}</strong>{' '}
                  {cnt.problem3Issue ||
                    (isEn
                      ? 'Constantly tapping the screen while riding a two-wheeler or auto is exhausting and dangerous in traffic.'
                      : 'बाइक या ऑटो चलाते वक्त स्क्रीन पर लगातार हाथ मारना थका देने वाला है, और ट्रैफिक में चलते वक्त खतरनाक भी.')}
                </div>
                <div className="solution-box">
                  <strong>{settings.siteName || 'RiderSaathi'}:</strong>{' '}
                  {cnt.problem3Solution ||
                    (isEn
                      ? 'Keep your phone safely on the mount until your desired ride arrives. Complete focus on driving with zero fine fear.'
                      : 'जब तक आपकी पसंद की राइड नहीं आती, फोन माउंट पर रखो. सड़क पर पूरा ध्यान रहेगा और चालान का डर नहीं.')}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. WHAT RULES YOU CAN CONTROL */}
        {(!settings.homeSections || settings.homeSections.ruleFeatures !== false) && (
          <div className="card card-section">
            <div className="section-head">
              <h2>{cnt.rulesHeading || (isEn ? 'Rules You Can Control & Customize' : 'आप क्या-क्या रूल्स तय कर सकते हैं')}</h2>
              <p>
                {cnt.rulesSubheading ||
                  (isEn
                    ? `${settings.siteName || 'RiderSaathi'} reads the full booking card — fare, pickup, drop and distance — and matches with your preferences:`
                    : `${settings.siteName || 'RiderSaathi'} बुकिंग कार्ड का पूरा ब्योरा पढ़ता है — किराया, पिकअप, ड्रॉप और दूरी — और आपके रूल्स से मिलाता है:`)}
              </p>
            </div>

            <div className="features-grid">
              <div className="feature-box">
                <h4>📦 {cnt.rule1Title || (isEn ? 'Parcel or Passenger Filter' : 'पार्सल या सवारी फ़िल्टर')}</h4>
                <p>
                  {cnt.rule1Desc ||
                    (isEn
                      ? 'Separate switches for bike, auto, cab, and parcel. Deliver parcels only or passengers only whenever you want.'
                      : 'बाइक, ऑटो, कैब और पार्सल — हर एक का अलग स्विच. आज सिर्फ पार्सल डिलीवरी करनी है तो राइड बंद, सिर्फ राइड करनी है तो पार्सल बंद.')}
                </p>
              </div>
              <div className="feature-box">
                <h4>🏃 {cnt.rule2Title || (isEn ? 'Pickup Distance Limit' : 'पिकअप दूरी लिमिट')}</h4>
                <p>
                  {cnt.rule2Desc ||
                    (isEn
                      ? `Slider from 0.5 km to 10 km. Avoid traveling far for passenger pickups (e.g. limit to ${num(settings, 'maxPickupDistanceKm', 2.5)} km).`
                      : `पैसेंजर तक कितनी दूर तक जाना है — 0.5 किमी से 10 किमी तक का स्लाइडर. ${num(settings, 'maxPickupDistanceKm', 2.5)} किमी से दूर का पिकअप लेने से बचें.`)}
                </p>
              </div>
              <div className="feature-box">
                <h4>📍 {cnt.rule3Title || (isEn ? 'Trip Distance (Min / Max km)' : 'ट्रिप दूरी (कम से कम / ज्यादा से ज्यादा)')}</h4>
                <p>
                  {cnt.rule3Desc ||
                    (isEn
                      ? 'Set minimum and maximum km trip bounds. Filter unprofitable short trips and focus on lucrative routes.'
                      : 'कम से कम और ज्यादा से ज्यादा कितने किमी की ट्रिप लेनी है. छोटी घाटे वाली राइड्स फ़िल्टर करके लंबी कमाई वाली उठाएं.')}
                </p>
              </div>
              <div className="feature-box">
                <h4>💵 {cnt.rule4Title || (isEn ? 'Minimum Fare Rule' : 'मिनिमम किराया रूल')}</h4>
                <p>
                  {cnt.rule4Desc ||
                    (isEn
                      ? `Set a minimum fare threshold (e.g. above ₹${num(settings, 'minFareDefault', 50)}). On apps hiding upfront fares, distance rules kick in.`
                      : `मिनिमम किराया सेट करें (जैसे ₹${num(settings, 'minFareDefault', 50)} से ऊपर). जहां किराया नहीं दिखता, वहां कम से कम दूरी का रूल काम करता है.`)}
                </p>
              </div>
              <div className="feature-box">
                <h4>🏠 {cnt.rule5Title || (isEn ? 'Go-To (Towards Home)' : 'Go To — घर की तरफ')}</h4>
                <p>
                  {cnt.rule5Desc ||
                    (isEn
                      ? 'Ending your shift? Enter your home neighborhood to only receive bookings headed your way — zero wasted petrol.'
                      : 'शिफ्ट खत्म होने पर अपने इलाके का नाम डाल दें. सिर्फ उसी तरफ जाने वाली राइड्स एक्सेप्ट होंगी — खाली पेट्रोल बर्बाद नहीं होगा.')}
                </p>
              </div>
              <div className="feature-box">
                <h4>🚫 {cnt.rule6Title || (isEn ? 'Blacklist Restricted Zones' : 'जहां नहीं जाना (ब्लैकलिस्ट)')}</h4>
                <p>
                  {cnt.rule6Desc ||
                    (isEn
                      ? 'Block severe traffic choke points, bad roads, or no-entry zones. Incoming rides to these areas are rejected automatically.'
                      : 'हैवी ट्रैफिक, नो-एंट्री या खराब रोड वाले इलाके ब्लॉक कर सकते हैं. वहां की बुकिंग्स आते ही रिजेक्ट हो जाएंगी.')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 5. BUILT FOR DRIVERS SECTION */}
        <section className="built-drivers-section">
          {/* Left Column: Image of happy driver with floating bubble */}
          <div className="driver-image-container">
            <Image
              src="/images/happy-driver.jpg"
              alt="Happy Indian Captain Driver with RiderSaathi"
              width={560}
              height={420}
              className="driver-photo"
            />
            <div className="driver-speech-bubble">
              <div className="bubble-check">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              </div>
              <div>
                <div className="bubble-title">{isEn ? 'Ride Accepted • ₹165' : 'राइड एक्सेप्टेड • ₹165'}</div>
                <div className="bubble-sub">{isEn ? '5.2 km Drop (Towards Home)' : '5.2 किमी ड्रॉप (घर की तरफ)'}</div>
              </div>
            </div>
          </div>

          {/* Right Column: Copy & 3 inline features */}
          <div className="driver-content-col">
            <div className="pill-badge green">
              {isEn ? 'BUILT FOR DRIVERS' : 'ड्राइवर भाइयों के लिए समर्पित'}
            </div>
            <h2>
              {isEn ? (
                <>Drive Smarter with <span className="text-primary">Rider Sathi</span></>
              ) : (
                <>ड्राइव करें स्मार्ट <span className="text-primary">Rider Sathi</span> के साथ</>
              )}
            </h2>
            <p className="driver-lead">
              {isEn
                ? 'Crafted specifically to solve everyday challenges faced by bike captains and auto drivers on Indian roads — maximizing profits while keeping you safe.'
                : 'सड़क पर चलने वाले बाइक कप्तानों और ऑटो ड्राइवरों की असली जरूरतों को समझ कर बनाया गया है — ताकि घाटे वाली राइड्स खत्म हों और पूरी बचत हाथ लगे.'}
            </p>

            <div className="driver-features-list">
              <div className="driver-feature-row">
                <div className="driver-feat-icon">👀</div>
                <div className="driver-feat-text">
                  <h4>{isEn ? 'Stay Focused' : 'सड़क पर पूरा ध्यान'}</h4>
                  <p>{isEn ? 'Keep eyes on traffic with zero phone-tapping distraction, avoiding dangerous accidents and traffic fines.' : 'चलते वाहन पर स्क्रीन घूरने की जरूरत नहीं — सुरक्षित ड्राइविंग और चालान से मुक्ति.'}</p>
                </div>
              </div>

              <div className="driver-feature-row">
                <div className="driver-feat-icon">🎯</div>
                <div className="driver-feat-text">
                  <h4>{isEn ? 'Better Opportunities' : 'बेहतरीन कमाई के अवसर'}</h4>
                  <p>{isEn ? 'Filters out far-off pickups and loss-making trips so every liter of fuel converts into maximum earnings.' : 'दूर के पिकअप और घाटे के फेरे अपने आप फ़िल्टर — हर लीटर पेट्रोल पर पूरी कमाई.'}</p>
                </div>
              </div>

              <div className="driver-feature-row">
                <div className="driver-feat-icon">👌</div>
                <div className="driver-feat-text">
                  <h4>{isEn ? 'Simple & Reliable' : 'सरल और भरोसेमंद'}</h4>
                  <p>{isEn ? 'Zero complicated configuration required. One tap to activate and it works quietly alongside your driver apps.' : 'कोई कठिन सेटिंग नहीं. एक टैप में एक्टिवेट और आपके सभी पार्टनर ऐप्स के साथ बैकग्राउंड में रेडी.'}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. PLANS & PRICING SECTION */}
        {(!settings.homeSections || settings.homeSections.pricingPreview !== false) && (
          <div className="card card-section" id="pricing">
            <div className="section-head" style={{ textAlign: 'center' }}>
              <div className="pill-badge green" style={{ margin: '0 auto 12px' }}>
                {isEn ? 'Transparent Pricing' : 'पारदर्शी कीमतें'}
              </div>
              <h2>
                {cnt.pricingHeading ||
                  (isEn
                    ? `Simple Plans — First ${num(settings, 'freeTrialRides', 10)} Rides Free`
                    : `सिंपल प्लान्स — पहली ${num(settings, 'freeTrialRides', 10)} राइड्स फ्री`)}
              </h2>
              <p style={{ maxWidth: '620px', margin: '0 auto' }}>
                {cnt.pricingSubheading ||
                  (isEn
                    ? `Every new account receives ${num(settings, 'freeTrialRides', 10)} free rides. Choose your preferred pass when ready. No card details or auto-debit required.`
                    : `हर नए अकाउंट को पहली ${num(settings, 'freeTrialRides', 10)} राइड्स बिल्कुल फ्री मिलती हैं. पसंदीदा प्लान चुनें. न कार्ड डिटेल्स चाहिए, न ऑटो-डेबिट का झंझट.`)}
              </p>
            </div>

            <div className="pricing-grid">
              {plans.map((plan) => {
                const pName = isEn ? plan.name : (plan.name_hi || plan.name);
                const pBadge = isEn ? plan.badge : (plan.badge_hi || plan.badge);
                const pDuration = isEn ? plan.durationText : (plan.durationText_hi || plan.durationText);
                const pDesc = isEn ? plan.description : (plan.description_hi || plan.description);
                const pFeatures = isEn ? (plan.features || []) : (plan.features_hi || plan.features || []);

                return (
                  <div key={plan.id} className={`plancard ${pBadge ? 'popular' : ''}`}>
                    {pBadge && <div className="plancard-ribbon">{pBadge}</div>}
                    <div className="plancard-title">{pName}</div>

                    <div className="plancard-price-row">
                      <span className="plancard-price">₹{plan.price}</span>
                      {plan.wasPrice && <span className="plancard-wasprice">₹{plan.wasPrice}</span>}
                    </div>
                    <div className="plancard-duration">
                      {pDuration} {isEn ? 'validity' : 'वैलिडिटी'}
                    </div>
                    <div className="plancard-desc">{pDesc}</div>

                    <ul className="plancard-features">
                      {pFeatures.length > 0 ? (
                        pFeatures.map((feat, fIdx) => (
                          <li key={fIdx}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                            </svg>
                            {feat}
                          </li>
                        ))
                      ) : (
                        <>
                          <li>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                            </svg>
                            Rapido, Uber, Porter Support
                          </li>
                          <li>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                            </svg>
                            Go-To (Ghar ki taraf) Route
                          </li>
                          <li>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                            </svg>
                            Custom Fare &amp; Distance Rules
                          </li>
                          <li>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                            </svg>
                            Voice &amp; Sound Alerts
                          </li>
                        </>
                      )}
                    </ul>

                    <Link className={`btn ${pBadge ? '' : 'ghost'}`} href={`/buy?plan=${plan.id}`}>
                      {isEn ? `Choose ${pName}` : `${pName} चुनें`}
                    </Link>
                  </div>
                );
              })}
            </div>

            <div className="notice-box info" style={{ marginTop: '14px' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0, color: 'var(--brand-primary)' }}>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
              </svg>
              <div>
                <strong>{isEn ? 'Instant Digital Activation:' : 'प्लान एक्टिवेशन टाइमिंग:'}</strong>{' '}
                {isEn
                  ? `Within 1 to 2 minutes of completing UPI payment, your pass is activated on your phone number. Need assistance? Support hours: ${settings.supportHours}.`
                  : `UPI पेमेंट करने के 1 से 2 मिनट के अंदर डिजिटल प्लान आपके मोबाइल नंबर पर एक्टिवेट हो जाता है. सहायता समय: ${settings.supportHours}.`}
              </div>
            </div>
          </div>
        )}

        {/* 6. REAL CAPTAIN TESTIMONIALS / REVIEWS */}
        {(!settings.homeSections || settings.homeSections.driverReviews !== false) && (
          <div className="card card-section">
            <div className="section-head" style={{ textAlign: 'center' }}>
              <div className="pill-badge" style={{ margin: '0 auto 12px' }}>
                {isEn ? 'Captain Feedback' : 'कप्तानों की राय'}
              </div>
              <h2>{cnt.reviewsHeading || (isEn ? 'Trusted by Captains Across India' : 'देश भर के कप्तानों का भरोसा')}</h2>
              <p>
                {cnt.reviewsSubheading ||
                  (isEn
                    ? 'See what fellow bike-taxi, auto and delivery captains say about RiderSaathi:'
                    : `देखिए ड्राइवर भाई ${settings.siteName || 'RiderSaathi'} के बारे में क्या कह रहे हैं:`)}
              </p>
            </div>

            <div className="reviews-grid">
              <div className="review-card">
                <div className="review-stars">★★★★★</div>
                <p className="review-text">
                  "Pehle din bhar me ₹400-500 hi bachte the petrol nikal kar kyunki chhoti ₹20 wali rides aa jaati thi. RiderSaathi lagane ke baad ₹{num(settings, 'dailySavingsEst', '800+')} daily bachat ho rahi hai!"
                </p>
                <div className="review-author">
                  <div className="author-avatar">R</div>
                  <div className="author-info">
                    <h5>Raju Sharma</h5>
                    <span>Rapido Captain, Indore</span>
                  </div>
                </div>
              </div>

              <div className="review-card">
                <div className="review-stars">★★★★★</div>
                <p className="review-text">
                  "Porter 2-wheeler par chalaata hoon. 3-4 km door jakar sirf ₹30 milte the. Is app se maine pickup {num(settings, 'maxPickupDistanceKm', 2.5)} km limit set kar diya. Ab ghaate ka trip kabhi nahi lagta."
                </p>
                <div className="review-author">
                  <div className="author-avatar">M</div>
                  <div className="author-info">
                    <h5>Mukesh Yadav</h5>
                    <span>Porter Partner, Delhi NCR</span>
                  </div>
                </div>
              </div>

              <div className="review-card">
                <div className="review-stars">★★★★★</div>
                <p className="review-text">
                  "Bike chalate waqt screen par baar-baar tap karne ka jhanjhat khatam. Phone mount par rehta hai, sadak par dhyan rehta hai. Chalan ka darr bhi nahi."
                </p>
                <div className="review-author">
                  <div className="author-avatar">S</div>
                  <div className="author-info">
                    <h5>Suresh Patel</h5>
                    <span>Uber Moto &amp; Auto, Bangalore</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 7. WHATSAPP & SUPPORT SECTION */}
        {(!settings.homeSections || settings.homeSections.communityCard !== false) && (
          <div className="card card-section community-cta-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', marginBottom: '8px', color: 'var(--text-heading)' }}>
                  {cnt.communityHeading || (isEn ? 'WhatsApp Community & Direct Support' : 'व्हाट्सएप कम्युनिटी और डायरेक्ट सपोर्ट')}
                </h2>
                <p style={{ fontSize: '15px', color: 'var(--text-body)', maxWidth: '540px', margin: 0 }}>
                  {cnt.communitySubheading ||
                    (isEn
                      ? 'Join our official WhatsApp group for version updates, driver tips, and priority support from our team.'
                      : 'नए वर्जन अपडेट्स, टिप्स और किसी भी समस्या के लिए डायरेक्ट व्हाट्सएप पर जुड़ें. हमारी टीम आपकी पूरी मदद करेगी.')}
                </p>
              </div>
              <div>
                <a
                  className="btn success"
                  href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(settings.whatsappText || 'Hello RiderSaathi')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z" />
                  </svg>
                  {cnt.communityBtn || (isEn ? 'Join on WhatsApp' : 'व्हाट्सएप पर जुड़ें')}
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Structured Data: JSON-LD for Organization, WebSite & SoftwareApplication */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'Organization',
                  '@id': `${process.env.SITE_URL || 'http://localhost:3000'}#organization`,
                  name: settings.siteName || 'RiderSaathi',
                  url: process.env.SITE_URL || 'http://localhost:3000',
                  logo: `${process.env.SITE_URL || 'http://localhost:3000'}/images/icon.svg`,
                  contactPoint: {
                    '@type': 'ContactPoint',
                    telephone: `+${settings.whatsappNumber || '919876543210'}`,
                    contactType: 'customer support',
                    availableLanguage: ['Hindi', 'English'],
                  },
                },
                {
                  '@type': 'WebSite',
                  '@id': `${process.env.SITE_URL || 'http://localhost:3000'}#website`,
                  url: process.env.SITE_URL || 'http://localhost:3000',
                  name: settings.siteName || 'RiderSaathi',
                  publisher: {
                    '@id': `${process.env.SITE_URL || 'http://localhost:3000'}#organization`,
                  },
                  inLanguage: ['hi', 'en'],
                },
                {
                  '@type': 'SoftwareApplication',
                  name: settings.siteName || 'RiderSaathi',
                  operatingSystem: 'Android',
                  applicationCategory: 'BusinessApplication',
                  offers: {
                    '@type': 'Offer',
                    price: '0',
                    priceCurrency: 'INR',
                  },
                  description:
                    settings.seoDescription ||
                    'Independent ride-filtering assistant for Rapido, Uber and Porter drivers.',
                },
              ],
            }),
          }}
        />
      </div>
    </main>
  );
}
