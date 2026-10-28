'use client';

import React, { useState } from 'react';

export default function UtrConfirmForm({ orderId, initialConfirmed = false, planName = '', price = 0, phone = '', whatsappNumber = '919876543210', lang = 'hi' }) {
  const isEn = lang === 'en';
  const [utr, setUtr] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(initialConfirmed);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanUtr = String(utr || '').trim();
    if (!cleanUtr || cleanUtr.length < 6) {
      setErrorMsg(isEn ? 'Please enter a valid 12-digit UPI Reference / UTR Number.' : 'कृपया 12-अंकों का मान्य UPI Reference / UTR नंबर दर्ज करें.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/buy/confirm-utr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, utr: cleanUtr }),
      });

      const data = await res.json();
      if (data.ok) {
        setConfirmed(true);
      } else {
        setErrorMsg(data.error || (isEn ? 'Failed to submit UTR. Please try again.' : 'UTR सबमिट करने में समस्या आई. कृपया पुनः प्रयास करें.'));
      }
    } catch (err) {
      setErrorMsg(isEn ? 'Network error. Please try again.' : 'नेटवर्क समस्या. कृपया पुनः प्रयास करें.');
    } finally {
      setSubmitting(false);
    }
  };

  const waText = encodeURIComponent(
    `Maine ${planName} ke liye ₹${price} bheje hain. Order ID: ${orderId}, Phone: ${phone}`
  );

  if (confirmed) {
    return (
      <div
        className="notice-box success"
        style={{
          display: 'block',
          padding: '24px',
          borderRadius: 'var(--radius-md)',
          textAlign: 'center',
          marginTop: '16px',
        }}
      >
        <div style={{ fontSize: '36px', marginBottom: '8px' }}>🎉</div>
        <h4 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--success)', marginBottom: '8px' }}>
          {isEn ? 'UTR Submitted Successfully!' : 'UTR सफलतापूर्वक प्राप्त हुआ!'}
        </h4>
        <p style={{ fontSize: '14.5px', color: 'var(--text-body)', lineHeight: 1.6, maxWidth: '520px', margin: '0 auto 16px' }}>
          {isEn
            ? `Your order reference (${orderId}) is now pending admin verification. Your plan will be activated within 1-2 minutes automatically.`
            : `आपका आर्डर (${orderId}) वेरिफिकेशन में है. 1-2 मिनट में आपका प्लान चालू कर दिया जायेगा.`}
        </p>
        <a
          className="btn success btn-sm"
          href={`https://wa.me/${whatsappNumber}?text=${waText}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'inline-flex', padding: '10px 20px', fontSize: '14px' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px' }}>
            <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z" />
          </svg>
          {isEn ? 'Share Screenshot on WhatsApp' : 'व्हाट्सएप पर स्क्रीनशॉट भेजें'}
        </a>
      </div>
    );
  }

  return (
    <div className="card" style={{ marginTop: '20px' }}>
      <h3
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '20px',
          fontWeight: 700,
          color: 'var(--text-heading)',
          marginBottom: '8px',
        }}
      >
        {isEn ? 'Enter UTR / Ref Number After Payment' : 'पेमेंट के बाद UTR / Ref नंबर डालें'}
      </h3>
      <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>
        {isEn
          ? 'After completing payment in your UPI app, enter the 12-digit UTR / UPI Ref number from the receipt:'
          : 'पेमेंट होने के बाद आपके GPay / PhonePe / Paytm रसीद पर 12-अंकों का UTR / UPI Ref नंबर मिलता है. उसे यहाँ दर्ज करें:'}
      </p>

      {errorMsg && (
        <div
          className="notice-box danger"
          style={{ display: 'block', marginBottom: '16px', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}
        >
          <strong>{isEn ? 'Error:' : 'त्रुटि:'}</strong> {errorMsg}
        </div>
      )}

      <form className="delform" onSubmit={handleSubmit}>
        <input type="hidden" name="orderId" value={orderId} />
        <label htmlFor="utr">
          {isEn ? '12-Digit UPI Ref / UTR Number' : '12-अंकों का UPI Ref / UTR नंबर'}
        </label>
        <input
          id="utr"
          name="utr"
          placeholder="e.g. 429182736451"
          required
          pattern="[0-9A-Za-z]{8,24}"
          value={utr}
          onChange={(e) => setUtr(e.target.value)}
          style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', fontWeight: 600 }}
        />

        <button
          type="submit"
          className="btn success"
          disabled={submitting}
          style={{ width: '100%', marginTop: '18px', padding: '14px' }}
        >
          {submitting
            ? (isEn ? 'Verifying UTR...' : 'वेरिफाई हो रहा है...')
            : `✓ ${isEn ? 'Submit UTR & Activate Plan' : 'UTR सबमिट करें और प्लान चालू करें'}`}
        </button>
      </form>

      <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px dashed var(--border)', textAlign: 'center' }}>
        <span style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
          {isEn ? 'Facing any issue? Send a screenshot on WhatsApp:' : 'कोई परेशानी आये तो व्हाट्सएप पर स्क्रीनशॉट भेजें:'}
        </span>
        <br />
        <a
          className="btn ghost btn-sm"
          href={`https://wa.me/${whatsappNumber}?text=${waText}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ marginTop: '10px', display: 'inline-flex' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '6px' }}>
            <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z" />
          </svg>
          {isEn ? `WhatsApp Support (+${whatsappNumber})` : `व्हाट्सएप सपोर्ट (+${whatsappNumber})`}
        </a>
      </div>
    </div>
  );
}
