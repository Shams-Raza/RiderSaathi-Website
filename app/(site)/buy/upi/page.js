import React from 'react';
import Link from 'next/link';
import { getSettings, getPlans, getOrders } from '@/lib/data';
import CopyUpiButton from '@/components/CopyUpiButton';

export async function generateMetadata() {
  const settings = getSettings();
  return {
    title: `Complete UPI Payment — ${settings.siteName || 'RiderSaathi'}`,
    description: `Complete your UPI payment for ${settings.siteName || 'RiderSaathi'}.`,
  };
}

export default function BuyUpiPage({ searchParams }) {
  const settings = getSettings();
  const plans = getPlans();
  const orders = getOrders();

  const orderId = searchParams?.orderId || '';
  const confirmed = searchParams?.confirmed === '1';

  let order = null;
  if (orderId) {
    order = orders.find((o) => o.id === orderId);
  }

  const planId = order ? order.planId : (searchParams?.plan || 'week1');
  const plan = plans.find((p) => p.id === planId) || plans[0] || { name: '1 Week Pass', price: 68, durationText: '7 Din' };
  const phone = order ? order.phone : (searchParams?.phone || '9876543210');
  const displayOrderId = orderId || ('ORD-' + Date.now().toString(36).toUpperCase());

  const upiId = settings.upiId || 'ridersaathi@upi';
  const upiPayee = settings.upiPayeeName || 'RiderSaathi';
  const note = `${settings.siteName || 'RiderSaathi'}_${plan.id || 'plan'}_${phone || 'driver'}`;
  const upiString = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(upiPayee)}&am=${plan.price}&cu=INR&tn=${encodeURIComponent(note)}`;

  return (
    <div className="wrap" style={{ paddingTop: '36px', paddingBottom: '60px' }}>
      <div className="form-card">
        <div className="section-head" style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div className="pill-badge green" style={{ margin: '0 auto 10px' }}>
            Step 2: Complete UPI Payment
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
            Pay via UPI (GPay / PhonePe / Paytm)
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)' }}>
            Niche diye UPI link par tap karein ya UPI ID copy karke payment karein. Payment hone par turant plan chalu ho jayega.
          </p>
        </div>

        {confirmed && (
          <div className="notice-box success" style={{ marginBottom: '20px' }}>
            <strong>✓ UTR Submitted!</strong> Aapka transaction reference mil gaya hai. Payment verify hote hi plan 1-2 minute me activate ho jayega.
          </div>
        )}

        {/* Main UPI Payment Card */}
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
            Total Amount to Pay
          </div>
          <div className="upibig">₹{plan.price}</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-body)', marginBottom: '12px' }}>
            {plan.name} ({plan.durationText} Validity) for <strong>+91 {phone}</strong>
          </div>

          {/* Direct UPI App Button */}
          <a
            href={upiString}
            className="btn"
            style={{ width: '100%', maxWidth: '380px', margin: '12px auto 16px', fontSize: '16px', padding: '14px' }}
          >
            ⚡ Open UPI App Directly to Pay
          </a>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', margin: '8px 0' }}>
            <span style={{ height: '1px', background: 'var(--border)', width: '60px' }}></span>
            <span style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontWeight: 600 }}>
              YA FIR DIRECT UPI ID PAR BHEJEIN
            </span>
            <span style={{ height: '1px', background: 'var(--border)', width: '60px' }}></span>
          </div>

          <div className="upiid-badge" id="upiBadgeText">
            {upiId}
          </div>

          <div>
            <CopyUpiButton upiId={upiId} />
          </div>

          <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '10px' }}>
            Payee Name: <strong>{upiPayee}</strong> &middot; Order Ref: <code>{displayOrderId}</code>
          </div>
        </div>

        {/* Order Summary Details */}
        <div className="card" style={{ padding: '20px 24px', marginBottom: '24px' }}>
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
            <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Registered Mobile:</span>
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
            <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Selected Plan:</span>
            <strong style={{ color: 'var(--text-heading)' }}>
              {plan.name} (₹{plan.price})
            </strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Order ID:</span>
            <code style={{ fontSize: '13.5px' }}>{displayOrderId}</code>
          </div>
        </div>

        {/* UTR Submission Form */}
        <div className="card">
          <h3
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '20px',
              fontWeight: 700,
              color: 'var(--text-heading)',
              marginBottom: '8px',
            }}
          >
            Payment Ke Baad UTR / Ref Number Dalein
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Payment hone ke baad aapke GPay / PhonePe / Paytm receipt par 12-digit ka UTR / UPI Ref number milta hai. Use yahan daalein:
          </p>

          <form method="post" action="/buy/confirm-utr" className="delform">
            <input type="hidden" name="orderId" value={displayOrderId} />
            <label htmlFor="utr">12-Digit UPI Ref / UTR Number</label>
            <input
              id="utr"
              name="utr"
              placeholder="e.g. 429182736451"
              required
              pattern="[0-9A-Za-z]{8,24}"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', fontWeight: 600 }}
            />

            <button type="submit" className="btn success" style={{ width: '100%', marginTop: '18px', padding: '14px' }}>
              ✓ Submit UTR &amp; Activate Plan
            </button>
          </form>

          <div
            style={{
              marginTop: '20px',
              paddingTop: '16px',
              borderTop: '1px dashed var(--border)',
              textAlign: 'center',
            }}
          >
            <span style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
              Koi pareshani aaye toh WhatsApp par screenshot bhejein:
            </span>
            <br />
            <a
              className="btn ghost btn-sm"
              href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(
                `Maine ${plan.name} ke liye ₹${plan.price} bheje hain. Order ID: ${displayOrderId}, Phone: ${phone}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ marginTop: '10px', display: 'inline-flex' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z" />
              </svg>
              WhatsApp Support (+{settings.whatsappNumber})
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
