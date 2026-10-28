import React from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { getSettings, getPlans, num } from '@/lib/data';

export async function generateMetadata() {
  const settings = getSettings();
  const cookieStore = cookies();
  const lang = cookieStore.get('lang')?.value || 'hi';
  const isEn = lang === 'en';

  return {
    title: isEn
      ? `Plans & Pricing — ${settings.siteName || 'RiderSaathi'}`
      : `प्लान्स और कीमतें — ${settings.siteName || 'RiderSaathi'}`,
    description: isEn
      ? `${settings.siteName || 'RiderSaathi'} plans and prices. 1 day, 1 week, 1 month. Free trial first, no auto-renewal.`
      : `${settings.siteName || 'RiderSaathi'} के पारदर्शी प्लान्स. 1 दिन, 1 हफ्ता, 1 महीना. पहले 10 राइड्स फ्री.`,
  };
}

export default function PricingPage() {
  const settings = getSettings();
  const plans = getPlans();
  const cookieStore = cookies();
  const lang = cookieStore.get('lang')?.value || 'hi';
  const isEn = lang === 'en';
  const freeRides = num(settings, 'freeTrialRides', 10);

  return (
    <div className="wrap" style={{ paddingTop: '36px', paddingBottom: '60px' }}>
      <div className="section-head" style={{ textAlign: 'center', marginBottom: '36px' }}>
        <div className="pill-badge green" style={{ margin: '0 auto 12px' }}>
          {isEn ? 'No Hidden Charges • No Auto-Renewal' : 'कोई छुपा शुल्क नहीं • कोई ऑटो-डेबिट नहीं'}
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
          {isEn ? 'Plans & Pricing' : 'प्लान्स और कीमतें'}
        </h1>
        <p style={{ maxWidth: '640px', margin: '8px auto 0', fontSize: '16.5px', color: 'var(--text-muted)' }}>
          {isEn
            ? `First ${freeRides} rides completely free — test without any payment. When satisfied, choose a 1 day, 1 week, or 1 month pass.`
            : `पहली ${freeRides} राइड्स बिल्कुल फ्री — बिना किसी पेमेंट के टेस्ट करें. पसंद आने पर 1 दिन, 1 हफ्ता या 1 महीने का पास चुनें.`}
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
                      Rapido, Uber &amp; Porter Filter
                    </li>
                    <li>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                      Ghar ki taraf (Go-To) Route
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
                      Auto-Accept Profitable Bookings
                    </li>
                    <li>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                      WhatsApp Priority Assistance
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

      {/* Highlights & Policies Card */}
      <div className="card" style={{ marginTop: '36px' }}>
        <h3
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '20px',
            fontWeight: 700,
            color: 'var(--text-heading)',
            marginBottom: '14px',
          }}
        >
          {isEn ? 'Important Details on Payment & Plan Activation' : 'पेमेंट और प्लान एक्टिवेशन के बारे में जरूरी बातें'}
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          <div
            style={{
              background: 'var(--surface-alt)',
              padding: '18px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
            }}
          >
            <strong style={{ color: 'var(--text-heading)', display: 'block', marginBottom: '6px' }}>
              ⚡ {isEn ? 'Instant Digital Delivery' : 'इंस्टेंट डिजिटल एक्टिवेशन'}
            </strong>
            <p style={{ fontSize: '14px', margin: 0, color: 'var(--text-body)' }}>
              {isEn
                ? 'Within 1-2 minutes of UPI payment confirmation, the digital pass activates on your registered mobile number without reinstalling.'
                : 'UPI पेमेंट कन्फर्म होते ही 1-2 मिनट में प्लान आपके रजिस्टर्ड मोबाइल नंबर पर चालू हो जाता है. ऐप दोबारा इनस्टॉल करने की जरूरत नहीं होती.'}
            </p>
          </div>

          <div
            style={{
              background: 'var(--surface-alt)',
              padding: '18px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
            }}
          >
            <strong style={{ color: 'var(--text-heading)', display: 'block', marginBottom: '6px' }}>
              🛡️ {isEn ? 'No Auto-Debit / No Saved Cards' : 'कोई ऑटो-डेबिट नहीं / कार्ड सुरक्षित'}
            </strong>
            <p style={{ fontSize: '14px', margin: 0, color: 'var(--text-body)' }}>
              {isEn
                ? 'We never store bank or card credentials. Once your chosen pass duration expires, the service simply pauses with zero surprise deductions.'
                : 'हमारे पास कोई बैंक या कार्ड डिटेल्स सेव नहीं होती. प्लान का समय पूरा होने पर वह अपने आप बंद हो जाता है — बिना किसी अनचाहे डिडक्शन के.'}
            </p>
          </div>

          <div
            style={{
              background: 'var(--surface-alt)',
              padding: '18px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
            }}
          >
            <strong style={{ color: 'var(--text-heading)', display: 'block', marginBottom: '6px' }}>
              📞 {isEn ? '6 Days Direct Support' : '6 दिन डायरेक्ट सपोर्ट'}
            </strong>
            <p style={{ fontSize: '14px', margin: 0, color: 'var(--text-body)' }}>
              {isEn
                ? `If you have any questions after payment, send your UTR screenshot on WhatsApp. Support hours: ${settings.supportHours}.`
                : `अगर पेमेंट के बाद कोई सवाल हो, तो व्हाट्सएप पर UTR स्क्रीनशॉट भेजें. सहायता समय (${settings.supportHours}) में टीम तुरंत मदद करेगी.`}
            </p>
          </div>
        </div>

        <div
          style={{
            marginTop: '24px',
            paddingTop: '18px',
            borderTop: '1px solid var(--border-light)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ fontSize: '14px' }}>
            <Link href="/delivery" style={{ marginRight: '14px' }}>
              {isEn ? 'Delivery & Activation Policy' : 'डिलीवरी और एक्टिवेशन पॉलिसी'}
            </Link>{' '}
            &middot;{' '}
            <Link href="/refunds">
              {isEn ? 'Refund & Cancellation Policy' : 'रिफंड और कैंसलेशन पॉलिसी'}
            </Link>
          </div>
          <div>
            <Link className="btn ghost btn-sm" href="/install">
              {isEn ? 'Download APK First' : 'पहले APK डाउनलोड करें'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
