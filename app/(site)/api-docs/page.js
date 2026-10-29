import React from 'react';
import { getSettings } from '@/lib/data';

export const runtime = 'nodejs';

export async function generateMetadata() {
  const settings = getSettings();
  const siteName = settings.siteName || 'RiderSaathi';
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'http://localhost:3000';
  const title = 'Mobile App REST API Documentation';
  const description =
    'Explore RiderSaathi Android and Flutter mobile application REST APIs for authentication, 10 free trial rides count, rule sync and subscription verification.';

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/api-docs`,
      languages: {
        'hi-IN': `${baseUrl}/api-docs?lang=hi`,
        'en-IN': `${baseUrl}/api-docs?lang=en`,
        'x-default': `${baseUrl}/api-docs`,
      },
    },
    openGraph: {
      title: `${title} — ${siteName}`,
      description,
      url: `${baseUrl}/api-docs`,
      siteName,
      locale: 'en_US',
      alternateLocale: ['hi_IN'],
      type: 'website',
      images: [
        {
          url: `${baseUrl}/images/og-default.png`,
          width: 1200,
          height: 630,
          alt: `${siteName} Mobile APIs`,
          type: 'image/png',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} — ${siteName}`,
      description,
      images: [`${baseUrl}/images/og-default.png`],
    },
  };
}

export default function ApiDocsPage() {
  const settings = getSettings();

  return (
    <div style={{ maxWidth: '1040px', margin: '40px auto 80px', padding: '0 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: '999px',
            fontSize: '13px',
            fontWeight: 700,
            background: 'rgba(30, 102, 245, 0.1)',
            color: 'var(--brand-primary)',
            marginBottom: '16px',
          }}
        >
          ⚡ Android &amp; Flutter App Integration
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '12px' }}>
          {settings.siteName || 'RiderSaathi'} Mobile App REST APIs
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--text-muted)', maxWidth: '680px', margin: '0 auto' }}>
          Use these production-ready endpoints to connect the RiderSaathi Android APK with your live backend for
          authentication, 10 free trial rides counter, active subscription verification, filter rules sync, and OTA updates.
        </p>
        <div
          style={{
            marginTop: '16px',
            fontFamily: 'var(--font-mono)',
            fontSize: '14px',
            background: 'rgba(30,102,245,0.06)',
            padding: '8px 16px',
            borderRadius: '8px',
            display: 'inline-block',
          }}
        >
          Base URL: <strong>/api/app</strong> (e.g. <code>http://localhost:3000/api/app</code>)
        </div>
      </div>

      {/* 1. Auth Endpoint */}
      <div
        className="card"
        style={{
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '6px',
              textTransform: 'uppercase',
              background: '#e0f2fe',
              color: '#0284c7',
            }}
          >
            POST
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', fontWeight: 600, color: 'var(--text-heading)' }}>
            /api/app/auth
          </span>
        </div>
        <div style={{ fontSize: '14.5px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
          Driver Login or Registration. Automatically assigns 10 Free Trial Rides on new sign up, checks existing subscription,
          and returns auth token with driver filter rules.
        </div>
        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '14px' }}>
          Request Body (JSON)
        </div>
        <pre
          style={{
            background: '#0f172a',
            color: '#f8fafc',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            padding: '16px',
            borderRadius: '10px',
            overflowX: 'auto',
            marginTop: '8px',
          }}
        >
          <code>{`{
  "phone": "9876543210",
  "name": "Raju Captain",
  "deviceId": "android-uuid-99a12c",
  "deviceModel": "Xiaomi Redmi Note 12",
  "appVersion": "5.28.1"
}`}</code>
        </pre>
        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '14px' }}>
          Response (200 OK)
        </div>
        <pre
          style={{
            background: '#0f172a',
            color: '#f8fafc',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            padding: '16px',
            borderRadius: '10px',
            overflowX: 'auto',
            marginTop: '8px',
          }}
        >
          <code>{`{
  "success": true,
  "message": "Authenticated successfully",
  "token": "token_17300000_abc123",
  "driver": {
    "id": "DRV-1730000001",
    "phone": "9876543210",
    "name": "Raju Captain",
    "status": "active"
  },
  "access": {
    "accessGranted": true,
    "reason": "trial_active",
    "message": "Free trial active: 10 rides remaining",
    "trial": { "total": 10, "used": 0, "remaining": 10 },
    "subscription": { "isActive": false, "daysLeft": 0 }
  },
  "filterRules": {
    "minFare": 50,
    "maxPickupDistanceKm": 2.5,
    "minFarePerKm": 12,
    "platforms": { "rapido": true, "uber": true, "porter": true },
    "autoAccept": true
  }
}`}</code>
        </pre>
      </div>

      {/* 2. Status & Subscription Check */}
      <div
        className="card"
        style={{
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '6px',
              textTransform: 'uppercase',
              background: '#dcfce7',
              color: '#16a34a',
            }}
          >
            GET
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', fontWeight: 600, color: 'var(--text-heading)' }}>
            /api/app/status
          </span>
        </div>
        <div style={{ fontSize: '14.5px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
          Verify if the driver is currently allowed to filter rides. Returns trial status or days left in active paid subscription.
        </div>
        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '14px' }}>
          Headers
        </div>
        <pre
          style={{
            background: '#0f172a',
            color: '#f8fafc',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            padding: '16px',
            borderRadius: '10px',
            overflowX: 'auto',
            marginTop: '8px',
          }}
        >
          <code>{`Authorization: Bearer <token>
// OR Query param: ?phone=9876543210`}</code>
        </pre>
        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '14px' }}>
          Response (200 OK)
        </div>
        <pre
          style={{
            background: '#0f172a',
            color: '#f8fafc',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            padding: '16px',
            borderRadius: '10px',
            overflowX: 'auto',
            marginTop: '8px',
          }}
        >
          <code>{`{
  "success": true,
  "accessGranted": true,
  "reason": "active_subscription",
  "subscription": {
    "isActive": true,
    "planName": "1 Week Pass",
    "expiresAt": "2026-10-28T12:00:00.000Z",
    "daysLeft": 7
  },
  "trial": { "total": 10, "used": 10, "remaining": 0 },
  "serverTime": "2026-10-21T16:40:00.000Z"
}`}</code>
        </pre>
      </div>

      {/* 3. Record Filtered / Used Ride */}
      <div
        className="card"
        style={{
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '6px',
              textTransform: 'uppercase',
              background: '#e0f2fe',
              color: '#0284c7',
            }}
          >
            POST
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', fontWeight: 600, color: 'var(--text-heading)' }}>
            /api/app/ride/record
          </span>
        </div>
        <div style={{ fontSize: '14.5px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
          Triggered when RiderSaathi accessibility service accepts or filters a matching ride. Deducts 1 ride from the 10
          free trial rides (if in trial mode) and updates driver stats.
        </div>
        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '14px' }}>
          Request Body (JSON)
        </div>
        <pre
          style={{
            background: '#0f172a',
            color: '#f8fafc',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            padding: '16px',
            borderRadius: '10px',
            overflowX: 'auto',
            marginTop: '8px',
          }}
        >
          <code>{`{
  "token": "token_17300000_abc123",
  "platform": "rapido",
  "fare": 95,
  "pickupDistanceKm": 1.4,
  "tripDistanceKm": 6.8
}`}</code>
        </pre>
        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '14px' }}>
          Response (200 OK)
        </div>
        <pre
          style={{
            background: '#0f172a',
            color: '#f8fafc',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            padding: '16px',
            borderRadius: '10px',
            overflowX: 'auto',
            marginTop: '8px',
          }}
        >
          <code>{`{
  "success": true,
  "message": "Ride recorded successfully",
  "access": {
    "accessGranted": true,
    "reason": "trial_active",
    "trial": { "total": 10, "used": 1, "remaining": 9 }
  }
}`}</code>
        </pre>
      </div>

      {/* 4. Sync Filter Rules */}
      <div
        className="card"
        style={{
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '6px',
              textTransform: 'uppercase',
              background: '#e0f2fe',
              color: '#0284c7',
            }}
          >
            POST
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', fontWeight: 600, color: 'var(--text-heading)' }}>
            /api/app/rules/sync
          </span>
        </div>
        <div style={{ fontSize: '14.5px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
          Saves the driver's custom filter settings (Min Fare, Max Pickup, Platforms) to cloud so settings are never lost
          on phone restart.
        </div>
        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '14px' }}>
          Request Body (JSON)
        </div>
        <pre
          style={{
            background: '#0f172a',
            color: '#f8fafc',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            padding: '16px',
            borderRadius: '10px',
            overflowX: 'auto',
            marginTop: '8px',
          }}
        >
          <code>{`{
  "token": "token_17300000_abc123",
  "filterRules": {
    "minFare": 60,
    "maxPickupDistanceKm": 2.0,
    "minFarePerKm": 14,
    "platforms": { "rapido": true, "uber": true, "porter": false },
    "passengers": true,
    "parcels": false,
    "autoAccept": true,
    "voiceAlert": true
  }
}`}</code>
        </pre>
      </div>

      {/* 5. App Version Update Check */}
      <div
        className="card"
        style={{
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '6px',
              textTransform: 'uppercase',
              background: '#dcfce7',
              color: '#16a34a',
            }}
          >
            GET
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', fontWeight: 600, color: 'var(--text-heading)' }}>
            /api/app/check-update?version=5.28.1
          </span>
        </div>
        <div style={{ fontSize: '14.5px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
          Checks if a newer APK is released. Prompts the driver to download update.
        </div>
        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '14px' }}>
          Response (200 OK)
        </div>
        <pre
          style={{
            background: '#0f172a',
            color: '#f8fafc',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            padding: '16px',
            borderRadius: '10px',
            overflowX: 'auto',
            marginTop: '8px',
          }}
        >
          <code>{`{
  "hasUpdate": false,
  "latestVersion": "5.28.1",
  "apkUrl": "https://ridersaathi.onrender.com/downloads/RiderSaathi-v5.28.1.apk",
  "apkFileSize": "11.1 MB",
  "releaseNotes": "Faster Rapido & Uber filter response with Android 14 support",
  "isForceUpdate": false
}`}</code>
        </pre>
      </div>

      {/* 6. In-App Plan Purchase */}
      <div
        className="card"
        style={{
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '6px',
              textTransform: 'uppercase',
              background: '#e0f2fe',
              color: '#0284c7',
            }}
          >
            POST
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', fontWeight: 600, color: 'var(--text-heading)' }}>
            /api/app/order/create
          </span>
        </div>
        <div style={{ fontSize: '14.5px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
          Initiate plan subscription directly inside the mobile app. Returns UPI payment intent string and QR details.
        </div>
        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '14px' }}>
          Request Body (JSON)
        </div>
        <pre
          style={{
            background: '#0f172a',
            color: '#f8fafc',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            padding: '16px',
            borderRadius: '10px',
            overflowX: 'auto',
            marginTop: '8px',
          }}
        >
          <code>{`{
  "planId": "week1",
  "phone": "9876543210"
}`}</code>
        </pre>
        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '14px' }}>
          Response (200 OK)
        </div>
        <pre
          style={{
            background: '#0f172a',
            color: '#f8fafc',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            padding: '16px',
            borderRadius: '10px',
            overflowX: 'auto',
            marginTop: '8px',
          }}
        >
          <code>{`{
  "success": true,
  "orderId": "ORD-17300000-ABC",
  "planName": "1 Week",
  "amount": 68,
  "upiString": "upi://pay?pa=ridersaathi@upi&pn=RiderSaathi&am=68&tn=RiderSaathi_week1",
  "upiId": "ridersaathi@upi"
}`}</code>
        </pre>
      </div>
    </div>
  );
}
