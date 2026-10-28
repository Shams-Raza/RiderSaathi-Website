'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BuyPlanForm({ plans = [], defaultPlanId = 'week1', initialPhone = '', lang = 'hi', siteName = 'RiderSaathi' }) {
  const router = useRouter();
  const isEn = lang === 'en';

  const [selectedPlanId, setSelectedPlanId] = useState(defaultPlanId);
  const [phone, setPhone] = useState(initialPhone);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) || plans[0] || {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanPhone = String(phone || '').replace(/\D/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length !== 10) {
      setErrorMsg(isEn ? 'Please enter a valid 10-digit mobile number.' : 'कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/buy/upi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: selectedPlanId, phone: cleanPhone }),
      });

      const data = await res.json();
      if (data.ok && data.redirectUrl) {
        router.push(data.redirectUrl);
      } else {
        setErrorMsg(data.error || (isEn ? 'Failed to create order. Please try again.' : 'ऑर्डर बनाने में समस्या आई. कृपया पुनः प्रयास करें.'));
        setLoading(false);
      }
    } catch (err) {
      setErrorMsg(isEn ? 'Network error. Please try again.' : 'नेटवर्क समस्या. कृपया पुनः प्रयास करें.');
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ boxShadow: 'var(--shadow-md)' }}>
      {errorMsg && (
        <div
          className="notice-box danger"
          style={{ display: 'block', marginBottom: '16px', padding: '12px 16px', borderRadius: 'var(--radius-sm)' }}
        >
          <strong>{isEn ? 'Error:' : 'त्रुटि:'}</strong> {errorMsg}
        </div>
      )}

      <form className="delform" onSubmit={handleSubmit}>
        <label htmlFor="phone" style={{ marginTop: 0 }}>
          1. {isEn ? `Your ${siteName} Mobile Number` : `आपका ${siteName} मोबाइल नंबर`}
        </label>
        <div style={{ position: 'relative' }}>
          <input
            id="phone"
            name="phone"
            inputMode="numeric"
            autoComplete="tel"
            required
            pattern="[0-9]{10}"
            maxLength={10}
            placeholder={isEn ? '10-digit registered number (e.g. 9876543210)' : '10 अंकों का रजिस्टर्ड नंबर (उदा. 9876543210)'}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{ paddingLeft: '48px', fontSize: '16px', fontWeight: 600 }}
          />
          <span
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontWeight: 700,
              color: 'var(--text-muted)',
              fontSize: '15px',
            }}
          >
            +91
          </span>
        </div>
        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '6px 0 0' }}>
          {isEn
            ? '* Plan will be activated on the number registered with the app.'
            : '* उसी नंबर पर प्लान एक्टिवेट होगा जिससे आपने ऐप में साइन इन किया है.'}
        </p>

        <label style={{ marginTop: '24px' }}>
          2. {isEn ? 'Choose Your Plan' : 'प्लान चुनें'}
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
          {plans.map((p) => {
            const isSelected = selectedPlanId === p.id;
            const pName = isEn ? p.name : (p.name_hi || p.name);
            const pBadge = isEn ? p.badge : (p.badge_hi || p.badge);
            const pDuration = isEn ? p.durationText : (p.durationText_hi || p.durationText);
            const pDesc = isEn ? p.description : (p.description_hi || p.description);

            return (
              <label
                key={p.id}
                onClick={() => setSelectedPlanId(p.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  borderRadius: 'var(--radius-md)',
                  border: `2px solid ${isSelected ? 'var(--brand-primary)' : 'var(--border)'}`,
                  background: isSelected ? 'var(--brand-tint)' : 'var(--surface)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input
                    type="radio"
                    name="planId"
                    value={p.id}
                    checked={isSelected}
                    onChange={() => setSelectedPlanId(p.id)}
                    style={{ width: 'auto', margin: 0, transform: 'scale(1.2)' }}
                  />
                  <div>
                    <div
                      style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: '16.5px',
                        fontWeight: 700,
                        color: 'var(--text-heading)',
                      }}
                    >
                      {pName}
                      {pBadge && (
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 800,
                            background: 'var(--brand-primary)',
                            color: '#fff',
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-pill)',
                            marginLeft: '6px',
                          }}
                        >
                          {pBadge}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      {pDuration} {isEn ? 'validity' : 'वैलिडिटी'} &middot; {pDesc}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '20px',
                      fontWeight: 800,
                      color: 'var(--text-heading)',
                    }}
                  >
                    ₹{p.price}
                  </div>
                  {p.wasPrice && (
                    <div
                      style={{
                        fontSize: '12px',
                        color: 'var(--text-faint)',
                        textDecoration: 'line-through',
                      }}
                    >
                      ₹{p.wasPrice}
                    </div>
                  )}
                </div>
              </label>
            );
          })}
        </div>

        <button
          type="submit"
          className="btn"
          disabled={loading}
          style={{ width: '100%', marginTop: '26px', padding: '15px', fontSize: '16px' }}
        >
          {loading
            ? (isEn ? 'Creating Order...' : 'ऑर्डर तैयार हो रहा है...')
            : `${isEn ? 'Proceed to UPI Payment' : 'UPI पेमेंट के लिए आगे बढ़ें'} (₹${selectedPlan.price || 0}) →`}
        </button>
      </form>
    </div>
  );
}
