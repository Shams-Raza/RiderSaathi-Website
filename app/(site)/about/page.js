import React from 'react';
import Link from 'next/link';
import { getSettings } from '@/lib/data';

export async function generateMetadata() {
  const settings = getSettings();
  return {
    title: `About ${settings.siteName || 'RiderSaathi'} — Kaun banata hai aur kyun`,
    description: `${settings.siteName || 'RiderSaathi'} is built for bike-taxi, auto, cab and parcel drivers.`,
  };
}

export default function AboutPage() {
  const settings = getSettings();

  return (
    <div className="wrap" style={{ paddingTop: '36px', paddingBottom: '60px' }}>
      <div className="section-head" style={{ textAlign: 'center', marginBottom: '36px' }}>
        <div className="pill-badge green" style={{ margin: '0 auto 12px' }}>
          By Captains, For Captains
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
          {settings.siteName || 'RiderSaathi'} Kyun Bana
        </h1>
        <p style={{ maxWidth: '620px', margin: '8px auto 0', fontSize: '16.5px', color: 'var(--text-muted)' }}>
          Ye app kisi air-conditioned office me nahi bana — ye sadak par, ghanton dhoop aur traffic me mehnat karne ke baad
          bana.
        </p>
      </div>

      <div className="card card-section">
        <h2
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '22px',
            fontWeight: 700,
            color: 'var(--text-heading)',
            marginBottom: '12px',
          }}
        >
          Shuruaat ki Kahani
        </h2>
        <p style={{ fontSize: '15.5px', color: 'var(--text-body)', lineHeight: 1.7, marginBottom: '14px' }}>
          {settings.siteName || 'RiderSaathi'} banane wale khud Rapido, Ola aur Uber par ride chala chuke hain. Roz ki
          wahi kahani: ghanton ka intezaar, aur jab ride bajti hai toh do second me kisi aur ke paas chali jaati hai.
          Pickup aur drop padhne me hi waqt nikal jaata tha.
        </p>
        <p style={{ fontSize: '15.5px', color: 'var(--text-body)', lineHeight: 1.7, marginBottom: '14px' }}>
          Aur jab demand chadhti hai toh ulta problem — ride ke upar ride, zyadatar ₹20-₹30 wali. Inhi ko dekhne ke
          chakkar me 15-20 km wali kamai wali ride kab nikal gayi, pata hi nahi chalta.
        </p>
        <p style={{ fontSize: '15.5px', color: 'var(--text-body)', lineHeight: 1.7 }}>
          Sabse badi baat ye thi ki is dikkat ko kisi ne samjha hi nahi. Driver ko billi ki tarah taak laga kar baithna
          padta tha. {settings.siteName || 'RiderSaathi'} isi liye bana — taaki rider aaram se, befikar ho kar baithe,
          aur jo ride uske kaam ki hai wahi uske paas aaye.
        </p>
      </div>

      <div className="card card-section">
        <h2
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '22px',
            fontWeight: 700,
            color: 'var(--text-heading)',
            marginBottom: '12px',
          }}
        >
          Hum Kya Banate Hain
        </h2>
        <p style={{ fontSize: '15.5px', color: 'var(--text-body)', lineHeight: 1.7, marginBottom: '14px' }}>
          {settings.siteName || 'RiderSaathi'} ek Android app hai jo driver ke apne phone par chalta hai. Driver apne
          rules khud tay karta hai — kitni doori ki ride, kitna pickup, parcel ya sawari, kaunsa raasta, kitni kamai — aur
          app unhi rules par chalta hai.
        </p>
        <p style={{ fontSize: '15.5px', color: 'var(--text-body)', lineHeight: 1.7 }}>
          Har feature kisi na kisi asli dikkat se nikla hai. Raste wali agli ride, kyunki khaali lautna ghaata hai. Go To,
          kyunki shift ke aakhir me ghar ki taraf jaana hota hai. Jahan nahi jaana, kyunki har shehar me kuch ilaake aise
          hote hain jahan se nikalna hi mushkil hai.
        </p>
      </div>

      <div className="card card-section">
        <h2
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '22px',
            fontWeight: 700,
            color: 'var(--text-heading)',
            marginBottom: '12px',
          }}
        >
          Kaun Chalata Hai (Ownership &amp; Legal Info)
        </h2>
        <p style={{ fontSize: '15.5px', color: 'var(--text-body)', lineHeight: 1.7, marginBottom: '14px' }}>
          {settings.siteName || 'RiderSaathi'} <strong>{settings.ownerName}</strong> ka business hai (
          {settings.legalBusinessName}). Ye {settings.registrationDetails}.
        </p>
        <p style={{ fontSize: '15.5px', color: 'var(--text-body)', lineHeight: 1.7 }}>
          Driver ek prepaid plan leta hai — ek mobile number par, UPI se. Na koi auto-renewal, na card save hota hai. Plan
          apne waqt par apne aap khatam ho jaata hai.
        </p>
      </div>

      <div
        className="card card-section"
        style={{ background: 'var(--surface-alt)', borderColor: 'var(--brand-border)' }}
      >
        <h3
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '20px',
            fontWeight: 700,
            color: 'var(--text-heading)',
            marginBottom: '14px',
          }}
        >
          Driver Support &amp; Contact
        </h3>
        <p style={{ fontSize: '15px', color: 'var(--text-body)', marginBottom: '18px' }}>
          Support WhatsApp aur website ke Contact se chalta hai. Har sawal ka jawab 2 working days ke andar.
        </p>
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          <Link className="btn btn-sm" href="/contact">
            Contact Support
          </Link>
          <Link className="btn ghost btn-sm" href="/install">
            Download {settings.siteName || 'RiderSaathi'}
          </Link>
        </div>
      </div>
    </div>
  );
}
