import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cookies } from 'next/headers';
import QRCode from 'qrcode';
import { getSettings, getPlans, getOrders } from '@/lib/data';
import CopyUpiButton from '@/components/CopyUpiButton';
import UtrConfirmForm from '@/components/UtrConfirmForm';

export const runtime = 'nodejs';

export async function generateMetadata() {
  const settings = getSettings();
  const siteName = settings.siteName || 'RiderSaathi';
  return {
    title: `Complete UPI Payment — ${siteName}`,
    description: `Complete your UPI payment for ${siteName}. Instant digital activation for Rapido, Uber and Porter captains.`,
  };
}

export default async function BuyUpiPage({ searchParams }) {
  const settings = getSettings();
  const plans = getPlans();
  const orders = getOrders();
  const cookieStore = cookies();
  const lang = cookieStore.get('lang')?.value || 'hi';
  const isEn = lang === 'en';

  const orderId = searchParams?.orderId || '';
  const confirmed = searchParams?.confirmed === '1';

  let order = null;
  if (orderId) {
    order = orders.find((o) => o.id === orderId);
  }

  const planId = order ? order.planId : searchParams?.plan || 'week1';
  const plan =
    plans.find((p) => p.id === planId) ||
    plans[0] || { id: 'week1', name: '1 Week Pass', price: 68, durationText: '7 Din' };

  const phone = order ? order.phone : searchParams?.phone || '9876543210';
  const displayOrderId = orderId || 'ORD-' + Date.now().toString(36).toUpperCase();

  const upiId = settings.upiId || 'ridersaathi@upi';
  const upiPayee = settings.upiPayeeName || 'RiderSaathi';
  const note = `${settings.siteName || 'RiderSaathi'}_${plan.id || 'plan'}_${phone || 'driver'}`;
  const upiString = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(upiPayee)}&am=${plan.price}&cu=INR&tn=${encodeURIComponent(note)}`;

  // Generate QR Code locally via node qrcode module (100% offline, zero external requests)
  let qrDataUrl = '';
  try {
    qrDataUrl = await QRCode.toDataURL(upiString, {
      width: 220,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });
  } catch (err) {
    console.error('Error generating local QR code:', err);
  }

  return (
    <div className="wrap" style={{ paddingTop: '36px', paddingBottom: '60px' }}>
      <div className="form-card">
        <div className="section-head" style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div className="pill-badge green" style={{ margin: '0 auto 10px' }}>
            {isEn ? 'Step 2: Complete UPI Payment' : 'स्टेप 2: UPI पेमेंट पूरा करें'}
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '32px',
              fontWeight: 800,
              color: 'var(--text-heading)',
              letterSpacing: '-0.5px',
            }}
          >
            {isEn ? 'Pay via UPI (GPay / PhonePe / Paytm)' : 'UPI द्वारा पेमेंट करें (GPay / PhonePe / Paytm)'}
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)' }}>
            {isEn
              ? 'Scan the QR code or tap the button to open your UPI app directly. Plan activates immediately after verification.'
              : 'नीचे दिए QR कोड को स्कैन करें या डायरेक्ट UPI बटन पर टैप करें. पेमेंट होते ही प्लान चालू हो जाएगा.'}
          </p>
        </div>

        {/* Main UPI Payment Box */}
        <div className="card upibox" style={{ marginTop: 0 }}>
          <div
            style={{
              fontSize: '13.5px',
              fontWeight: 700,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            {isEn ? 'Total Amount to Pay' : 'कुल देय राशि'}
          </div>
          <div className="upibig">₹{plan.price}</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-body)', marginBottom: '14px' }}>
            {isEn ? plan.name : plan.name_hi || plan.name} (
            {isEn ? plan.durationText : plan.durationText_hi || plan.durationText}{' '}
            {isEn ? 'Validity' : 'वैलिडिटी'}) &middot;{' '}
            <strong>+91 {phone}</strong>
          </div>

          {/* Local QR Code */}
          {qrDataUrl && (
            <div
              style={{
                display: 'inline-block',
                padding: '12px',
                background: '#fff',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-sm)',
                marginBottom: '16px',
              }}
            >
              <Image
                src={qrDataUrl}
                alt="UPI Payment QR Code"
                width={190}
                height={190}
                style={{ display: 'block' }}
                unoptimized
              />
              <span
                style={{
                  display: 'block',
                  fontSize: '11px',
                  color: '#64748b',
                  fontWeight: 600,
                  marginTop: '6px',
                }}
              >
                Scan with any UPI App
              </span>
            </div>
          )}

          {/* Direct UPI App Intent Link */}
          <a
            href={upiString}
            className="btn"
            style={{
              width: '100%',
              maxWidth: '380px',
              margin: '0 auto 16px',
              fontSize: '16px',
              padding: '14px',
            }}
          >
            ⚡ {isEn ? 'Open UPI App Directly to Pay' : 'डायरेक्ट UPI ऐप खोलकर पे करें'}
          </a>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              margin: '8px 0',
            }}
          >
            <span style={{ height: '1px', background: 'var(--border)', width: '60px' }}></span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
              {isEn ? 'OR PAY DIRECTLY TO UPI ID' : 'या फिर डायरेक्ट UPI ID पर भेजें'}
            </span>
            <span style={{ height: '1px', background: 'var(--border)', width: '60px' }}></span>
          </div>

          <div className="upiid-badge" id="upiBadgeText">
            {upiId}
          </div>

          <div style={{ marginTop: '8px' }}>
            <CopyUpiButton upiId={upiId} />
          </div>

          <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '12px' }}>
            {isEn ? 'Payee Name:' : 'प्राप्तकर्ता:'} <strong>{upiPayee}</strong> &middot;{' '}
            {isEn ? 'Order Ref:' : 'ऑर्डर संदर्भ:'} <code>{displayOrderId}</code>
          </div>
        </div>

        {/* Order Summary Details */}
        <div className="card" style={{ padding: '20px 24px', marginTop: '20px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid var(--border-light)',
              paddingBottom: '10px',
              marginBottom: '10px',
            }}
          >
            <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              {isEn ? 'Registered Mobile:' : 'रजिस्टर्ड मोबाइल:'}
            </span>
            <strong style={{ color: 'var(--text-heading)' }}>+91 {phone}</strong>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid var(--border-light)',
              paddingBottom: '10px',
              marginBottom: '10px',
            }}
          >
            <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              {isEn ? 'Selected Plan:' : 'चुना हुआ प्लान:'}
            </span>
            <strong style={{ color: 'var(--text-heading)' }}>
              {isEn ? plan.name : plan.name_hi || plan.name} (₹{plan.price})
            </strong>
          </div>
          <div style={{ display: 'flex', justifyItems: 'space-between', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              {isEn ? 'Order ID:' : 'ऑर्डर आईडी:'}
            </span>
            <code style={{ fontSize: '13.5px' }}>{displayOrderId}</code>
          </div>
        </div>

        {/* Interactive UTR Confirmation Form */}
        <UtrConfirmForm
          orderId={displayOrderId}
          initialConfirmed={confirmed}
          planName={plan.name}
          price={plan.price}
          phone={phone}
          whatsappNumber={settings.whatsappNumber || '919876543210'}
          lang={lang}
        />
      </div>
    </div>
  );
}
