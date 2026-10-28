import React from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { getSettings, getPlans, getGuides, num } from '@/lib/data';

export async function generateMetadata() {
  const settings = getSettings();
  return {
    title: `${settings.siteName || 'RiderSaathi'} — Smart Ride Filter App for Rapido, Uber & Porter Drivers`,
    description: settings.seoDescription,
  };
}

export default function HomePage() {
  const settings = getSettings();
  const plans = getPlans();
  const cookieStore = cookies();
  const lang = cookieStore.get('lang')?.value || 'hi';
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
              <div className="pill-badge green">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                {cnt.heroBadge ||
                  (isEn
                    ? `⚡ First ${num(settings, 'freeTrialRides', 10)} rides completely free — Test without payment!`
                    : `⚡ पहली ${num(settings, 'freeTrialRides', 10)} राइड्स बिल्कुल फ्री — बिना पेमेंट टेस्ट करें!`)}
              </div>

              <h1
                className="hero-title"
                dangerouslySetInnerHTML={{
                  __html:
                    cnt.heroTitle ||
                    (isEn
                      ? 'Your preferred ride.<br><span class="highlight">On your own terms.</span>'
                      : 'अपनी पसंद की राइड.<br><span class="highlight">अपने रूल्स पर.</span>'),
                }}
              />

              <p className="hero-subtitle">
                {cnt.heroSubtitle ||
                  (isEn
                    ? 'Skip loss-making trips, accept profitable ones. RiderSaathi filters Rapido, Uber and Porter bookings based on your custom rules — so you can focus on the road without staring at your screen.'
                    : `${settings.siteName || 'RiderSaathi'} आपके सेट किए हुए रूल्स पर Rapido, Uber और Porter की बुकिंग्स फ़िल्टर करता है — ताकि आप स्क्रीन ताकने के बजाय सड़क पर ध्यान देकर बेफ़िकर काम कर सकें.`)}
              </p>

              <div className="hero-actions">
                <Link className="btn" href="/install">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM17 13l-5 5-5-5h3V9h4v4h3z" />
                  </svg>
                  {cnt.btnDownload || (isEn ? 'Download for Android' : 'Android के लिए डाउनलोड')}
                </Link>
                <Link className="btn ghost btn-video-cta" href="/how-it-works">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  {isEn ? 'How It Works (Video)' : 'कैसे काम करता है (वीडियो)'}
                </Link>
                <Link className="btn ghost" href="/pricing">
                  {cnt.btnViewPlans ||
                    (isEn
                      ? `Plans (From ₹${num(settings, 'starterPrice', 12)})`
                      : `प्लान्स (₹${num(settings, 'starterPrice', 12)} से)`)}
                </Link>
              </div>

              <div className="hero-meta">
                <span>Version {settings.appVersion || '5.28.1'}</span>
                <span className="dot"></span>
                <span>Size: {settings.apkFileSize || '11.1 MB'}</span>
                <span className="dot"></span>
                <span style={{ color: 'var(--success)', fontWeight: 700 }}>
                  {isEn ? '100% Virus Free' : '100% सुरक्षित & टेस्टेड'}
                </span>
              </div>

              <div className="trust-badges-bar">
                <div className="trust-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                  {cnt.statFreeRides ||
                    (isEn
                      ? `First ${num(settings, 'freeTrialRides', 10)} rides free`
                      : `पहली ${num(settings, 'freeTrialRides', 10)} राइड्स फ्री`)}
                </div>
                <div className="trust-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                  </svg>
                  {cnt.statZeroBan || (isEn ? 'Zero Account Ban' : 'जीरो अकाउंट बैन')}
                </div>
                <div className="trust-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13 2.05v3.03c3.39.49 6 3.39 6 6.92 0 .9-.18 1.75-.48 2.54l2.6 1.53c.56-1.24.88-2.62.88-4.07 0-5.18-3.95-9.45-9-9.95zM12 19c-3.87 0-7-3.13-7-7 0-3.53 2.61-6.43 6-6.92V2.05c-5.06.5-9 4.76-9 9.95 0 5.52 4.47 10 9.99 10 3.31 0 6.24-1.61 8.04-4.09l-2.6-1.53C16.15 17.58 14.24 19 12 19z" />
                  </svg>
                  {cnt.statNoAutoDebit || (isEn ? 'No Auto-Debit' : 'कोई ऑटो-डेबिट नहीं')}
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Simulator Mockup */}
            {(!settings.homeSections || settings.homeSections.heroSimulator !== false) && (
              <div className="mockup-container">
                <div className="phone-mockup">
                  <div className="phone-header">
                    <div className="phone-status">
                      <span className="pulse-indicator"></span>
                      <span>
                        {settings.siteName || 'RiderSaathi'} {isEn ? 'Filter Active' : 'फ़िल्टर एक्टिव'}
                      </span>
                    </div>
                    <span className="autopilot-pill">
                      {isEn ? '⚡ Auto-Pilot' : '⚡ ऑटो-पायलट'}
                    </span>
                  </div>

                  {/* Ride Simulation Card 1 (Accepted) */}
                  <div className="ride-card accepted">
                    <div className="ride-header-row">
                      <span className="platform-pill platform-rapido">Rapido Bike</span>
                      <span className="ride-fare">₹{num(settings, 'mock1Fare', 128)}</span>
                    </div>
                    <div className="ride-details">
                      <span>📍 Drop: {num(settings, 'mock1DropKm', 6.2)} km</span>
                      <span>🏃 Pickup: {num(settings, 'mock1PickupKm', 0.8)} km</span>
                    </div>
                    <div className="decision-badge accepted">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                      {isEn
                        ? `AUTO-ACCEPTED (Fare ₹${num(settings, 'mock1FarePerKm', 20)}/km)`
                        : `ऑटो-एक्सेप्टेड (किराया ₹${num(settings, 'mock1FarePerKm', 20)}/किमी)`}
                    </div>
                  </div>

                  {/* Ride Simulation Card 2 (Declined) */}
                  <div className="ride-card declined">
                    <div className="ride-header-row">
                      <span className="platform-pill platform-porter">Porter 2W</span>
                      <span className="ride-fare">₹{num(settings, 'mock2Fare', 24)}</span>
                    </div>
                    <div className="ride-details">
                      <span>📍 Drop: {num(settings, 'mock2DropKm', 1.1)} km</span>
                      <span style={{ color: 'var(--danger)', fontWeight: 700 }}>
                        🏃 Pickup: {num(settings, 'mock2PickupKm', 3.2)} km
                      </span>
                    </div>
                    <div className="decision-badge declined">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                      </svg>
                      {isEn
                        ? `FILTERED (Loss trip - ${num(settings, 'mock2PickupKm', 3.2)}km pickup)`
                        : `फ़िल्टर्ड (घाटे वाली राइड - ${num(settings, 'mock2PickupKm', 3.2)}किमी पिकअप)`}
                    </div>
                  </div>

                  {/* Ride Simulation Card 3 (Accepted) */}
                  <div className="ride-card accepted" style={{ marginBottom: 0 }}>
                    <div className="ride-header-row">
                      <span className="platform-pill platform-uber">Uber Auto</span>
                      <span className="ride-fare">₹{num(settings, 'mock3Fare', 175)}</span>
                    </div>
                    <div className="ride-details">
                      <span>📍 Drop: {num(settings, 'mock3DropKm', 8.5)} km</span>
                      <span>🏃 Pickup: {num(settings, 'mock3PickupKm', 1.1)} km</span>
                    </div>
                    <div className="decision-badge accepted">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                      {isEn ? 'AUTO-ACCEPTED (Towards Home)' : 'ऑटो-एक्सेप्टेड (घर की तरफ)'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

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

        {/* 5. PLANS & PRICING SECTION */}
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
