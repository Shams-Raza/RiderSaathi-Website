import React from 'react';
import { getSettings, getPlans } from '@/lib/data';

export async function generateMetadata() {
  const settings = getSettings();
  return {
    title: `Buy Plan — ${settings.siteName || 'RiderSaathi'}`,
    description: `Activate your ${settings.siteName || 'RiderSaathi'} subscription via UPI.`,
  };
}

export default function BuyPage({ searchParams }) {
  const settings = getSettings();
  const plans = getPlans();
  const selectedPlanId = searchParams?.plan || 'week1';
  const selectedPlan = plans.find((p) => p.id === selectedPlanId) || plans[0];
  const initialPhone = searchParams?.phone || '';

  return (
    <div className="wrap" style={{ paddingTop: '36px', paddingBottom: '60px' }}>
      <div className="form-card">
        <div className="section-head" style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div className="pill-badge green" style={{ margin: '0 auto 12px' }}>
            Instant Digital Activation
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '34px',
              fontWeight: 800,
              color: 'var(--text-heading)',
              letterSpacing: '-0.6px',
            }}
          >
            Activate {settings.siteName || 'RiderSaathi'} Plan
          </h1>
          <p style={{ fontSize: '15.5px', color: 'var(--text-muted)' }}>
            Apna 10-digit mobile number enter karein aur plan chunein. Payment direct UPI se hoti hai — na auto-debit, na
            card details.
          </p>
        </div>

        <div className="card" style={{ boxShadow: 'var(--shadow-md)' }}>
          <form method="post" action="/buy/upi" className="delform">
            <label htmlFor="phone" style={{ marginTop: 0 }}>
              1. Aapka {settings.siteName || 'RiderSaathi'} Mobile Number
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
                placeholder="10-digit registered number (e.g. 9876543210)"
                defaultValue={initialPhone}
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
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '6px' }}>
              * Usi number par plan activate hoga jisse aapne app me sign in kiya hai.
            </p>

            <label style={{ marginTop: '24px' }}>2. Plan Chunein</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
              {plans.map((p) => {
                const isSelected = selectedPlan && selectedPlan.id === p.id;
                return (
                  <label
                    key={p.id}
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
                        defaultChecked={isSelected}
                        required
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
                          {p.name}
                          {p.badge && (
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
                              {p.badge}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                          {p.durationText} validity &middot; {p.description}
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
                        <div style={{ fontSize: '12px', color: 'var(--text-faint)', textDecoration: 'line-through' }}>
                          ₹{p.wasPrice}
                        </div>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>

            <button type="submit" className="btn" style={{ width: '100%', marginTop: '26px', padding: '15px', fontSize: '16px' }}>
              Proceed to UPI Payment &rarr;
            </button>
          </form>
        </div>

        {/* Reassurance Features */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            marginTop: '24px',
          }}
        >
          <div
            style={{
              textAlign: 'center',
              padding: '16px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>⚡</div>
            <strong style={{ fontSize: '13.5px', color: 'var(--text-heading)', display: 'block' }}>Instant Activation</strong>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>1-2 min me plan chalu</span>
          </div>

          <div
            style={{
              textAlign: 'center',
              padding: '16px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>🔒</div>
            <strong style={{ fontSize: '13.5px', color: 'var(--text-heading)', display: 'block' }}>Safe UPI Transfer</strong>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Direct GPay / PhonePe / Paytm</span>
          </div>

          <div
            style={{
              textAlign: 'center',
              padding: '16px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>💬</div>
            <strong style={{ fontSize: '13.5px', color: 'var(--text-heading)', display: 'block' }}>WhatsApp Support</strong>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Instant helpline available</span>
          </div>
        </div>
      </div>
    </div>
  );
}
