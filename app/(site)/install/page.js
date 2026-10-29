import React from 'react';
import Link from 'next/link';
import { getSettings, num } from '@/lib/data';

export async function generateMetadata() {
  const settings = getSettings();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'http://localhost:3000';
  const siteName = settings.siteName || 'RiderSaathi';
  const titleText = 'How to Install on Android';
  const descText =
    'Follow this easy step-by-step guide to download and install RiderSaathi APK on Android phones. Enable accessibility service and configure custom ride rules.';

  return {
    title: titleText,
    description: descText,
    alternates: {
      canonical: `${baseUrl}/install`,
      languages: {
        'hi-IN': `${baseUrl}/install?lang=hi`,
        'en-IN': `${baseUrl}/install?lang=en`,
        'x-default': `${baseUrl}/install`,
      },
    },
    openGraph: {
      title: `${titleText} — ${siteName}`,
      description: descText,
      url: `${baseUrl}/install`,
      siteName: siteName,
      locale: 'hi_IN',
      alternateLocale: ['en_US'],
      type: 'article',
      images: [
        {
          url: `${baseUrl}/images/og-default.png`,
          width: 1200,
          height: 630,
          alt: `${siteName} Install Guide`,
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

export default function InstallPage() {
  const settings = getSettings();

  return (
    <div className="wrap" style={{ paddingTop: '36px', paddingBottom: '60px' }}>
      <div className="section-head" style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div className="pill-badge green" style={{ margin: '0 auto 12px' }}>
          Android 8.0 se Android 14+ Supported
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
          How to install {settings.siteName || 'RiderSaathi'}
        </h1>
        <p style={{ maxWidth: '580px', margin: '8px auto 20px', fontSize: '16.5px', color: 'var(--text-muted)' }}>
          Sirf 2 minute ka aasan process. Niche diye button se official APK download karein.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '12px' }}>
          <a className="btn" href="/download">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM17 13l-5 5-5-5h3V9h4v4h3z" />
            </svg>
            Download {settings.siteName || 'RiderSaathi'} APK
          </a>
          <Link className="btn ghost" href="/faq">
            Common Questions
          </Link>
        </div>

        <div className="hero-meta" style={{ justifyContent: 'center' }}>
          <span>Version {settings.appVersion || '5.28.1'}</span>
          <span className="dot"></span>
          <span>Size: {settings.apkFileSize || '11.1 MB'}</span>
          <span className="dot"></span>
          <span style={{ color: 'var(--success)', fontWeight: 700 }}>
            {num(settings, 'freeTrialRides', 10)} Free Rides Included
          </span>
        </div>
      </div>

      {/* Step-by-Step Installation Cards */}
      <div className="card card-section">
        <div className="section-head">
          <h2>4 Aasan Steps me Install &amp; Setup Karein</h2>
          <p>Download hone ke baad apne phone me ye aasan steps follow karein:</p>
        </div>

        <div className="steps-container">
          <div className="step-row">
            <div className="step-badge">1</div>
            <div className="step-content">
              <h4>APK File Download &amp; Open Karein</h4>
              <p>
                Upar diye button par click karke file download karein. Download poora hone par notification ya Downloads
                folder se file open karein. Chrome agar "Install unknown apps" pooche, toh <strong>Allow</strong> kar dein.
              </p>
            </div>
          </div>

          <div className="step-row">
            <div className="step-badge">2</div>
            <div className="step-content">
              <h4>Mobile Number Se Sign In Karein</h4>
              <p>
                App open karke apna 10-digit mobile number enter karein. Har naye captain ko turant{' '}
                <strong>{num(settings, 'freeTrialRides', 10)} Free Trial Rides</strong> mil jaati hain.
              </p>
            </div>
          </div>

          <div className="step-row">
            <div className="step-badge">3</div>
            <div className="step-content">
              <h4>Accessibility Permission Allow Karein</h4>
              <p>
                App me Accessibility switch on karein. Yahi feature aapke driver apps (Rapido, Uber, Porter) ke booking
                cards ko padhta hai taaki ride auto-filter ho sake. Ye kisi bhi private data ya password ko access nahi karta.
              </p>
            </div>
          </div>

          <div className="step-row">
            <div className="step-badge">4</div>
            <div className="step-content">
              <h4>Display Over Other Apps (Floating Button)</h4>
              <p>
                Floating control switch on karein taaki screen par chhota icon dikhe. Isse aap chalte-chalte bhi filter
                on/off ya pause kar sakte hain.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Play Protect Guidance */}
      <div className="card card-section">
        <div className="section-head">
          <h2>Agar Play Protect Warning Aaye Toh Kya Karein?</h2>
          <p>Google Play Store se bahar install hone wali har naye app par Android ek security note dikhata hai. Isse ghabrane ki zaroorat nahi hai:</p>
        </div>

        <div className="notice-box info">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0, color: 'var(--brand-primary)' }}>
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
          </svg>
          <div>
            <strong>Aapko Play Protect band karne ki koi zaroorat nahi hai:</strong><br />
            1. Screen par <strong>"More details"</strong> par tap karein.<br />
            2. Uske baad <strong>"Install anyway"</strong> par tap karein. Install 2 second me complete ho jayega.
          </div>
        </div>
      </div>

      {/* Android 13/14 Restricted Settings */}
      <div className="card card-section">
        <div className="section-head">
          <h2>Android 13 ya 14 par "Restricted Setting" Aaye Toh?</h2>
          <p>Naye Android phones me Accessibility on karte waqt <em>"Restricted setting"</em> likha aaye toh ye ek-time setting karni hoti hai:</p>
        </div>

        <ol className="delform" style={{ paddingLeft: '20px', lineHeight: 1.8, color: 'var(--text-body)' }}>
          <li>Phone ke <strong>Settings</strong> &rarr; <strong>Apps</strong> &rarr; <strong>{settings.siteName || 'RiderSaathi'}</strong> me jayein.</li>
          <li>Upar right corner me <strong>3 dots (⋮)</strong> par tap karein.</li>
          <li><strong>"Allow restricted settings"</strong> select karein aur phone ka lock screen PIN daalein.</li>
          <li>Wapas app me aakar Accessibility on kar dein — chalu ho jayega!</li>
        </ol>
      </div>

      {/* Vivo, Oppo, Realme, Xiaomi Battery Lock */}
      <div className="card card-section">
        <div className="section-head">
          <h2>Vivo, Oppo, Realme aur Xiaomi Phone Ke Liye Zaroori</h2>
          <p>Ye phones background apps ko band kar dete hain. Shift ke dauran app active rahe, isliye ye 2 settings zaroor karein:</p>
        </div>

        <div className="features-grid">
          <div className="feature-box">
            <h4>🔋 Battery Optimization Off</h4>
            <p>Settings &rarr; Battery &rarr; {settings.siteName || 'RiderSaathi'} &rarr; <strong>"Don't optimize" / "Allow background activity"</strong> chunein.</p>
          </div>
          <div className="feature-box">
            <h4>🔒 App Lock in Recent Apps</h4>
            <p>Recent apps menu kholein, {settings.siteName || 'RiderSaathi'} par press karke <strong>Lock icon</strong> daba dein taaki clearing se app close na ho.</p>
          </div>
        </div>
      </div>

      <div className="notice-box">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0, color: 'var(--warning)' }}>
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
        </svg>
        <div>
          <strong>Suraksha ki guarantee:</strong> Hamesha official {settings.siteName || 'RiderSaathi'} website se hi download karein. Hum kabhi bhi aapka OTP, ride app password ya UPI PIN nahi maangte.
        </div>
      </div>
    </div>
  );
}
