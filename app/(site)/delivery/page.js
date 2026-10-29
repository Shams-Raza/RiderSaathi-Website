import React from 'react';
import Link from 'next/link';
import { getSettings } from '@/lib/data';

export const runtime = 'nodejs';

export async function generateMetadata() {
  const settings = getSettings();
  const siteName = settings.siteName || 'RiderSaathi';
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'http://localhost:3000';
  const title = 'Delivery & Plan Activation Terms';
  const description =
    'Learn how RiderSaathi digital software licenses are delivered and activated automatically within minutes via mobile number without needing any shipping.';

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/delivery`,
      languages: {
        'hi-IN': `${baseUrl}/delivery?lang=hi`,
        'en-IN': `${baseUrl}/delivery?lang=en`,
        'x-default': `${baseUrl}/delivery`,
      },
    },
    openGraph: {
      title: `${title} — ${siteName}`,
      description,
      url: `${baseUrl}/delivery`,
      siteName,
      locale: 'en_US',
      alternateLocale: ['hi_IN'],
      type: 'website',
      images: [
        {
          url: `${baseUrl}/images/og-default.png`,
          width: 1200,
          height: 630,
          alt: `${siteName} Delivery & Activation`,
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

export default function DeliveryPage() {
  const settings = getSettings();

  return (
    <div className="wrap">
      <div className="legal">
        <h1>Delivery &amp; Activation</h1>
        <p><strong>Last updated: 19 October 2026</strong></p>
        <p>
          {settings.siteName || 'RiderSaathi'} is a digital service. Nothing is posted or couriered to you, and there are
          no delivery or shipping charges.
        </p>

        <h2>What you are buying</h2>
        <p>
          A prepaid software subscription for the {settings.siteName || 'RiderSaathi'} Android app: a fixed number of days
          on one mobile number. There is no auto-renewal and no saved card. A plan simply ends when its days run out.
        </p>

        <h2>How it reaches you</h2>
        <ul>
          <li>
            The plan is attached to the <strong>mobile number you enter when you pay</strong>, so use the number you signed
            in to the app with.
          </li>
          <li>
            <strong>Online payment through UPI:</strong> your plan starts within about a minute of the payment being
            confirmed.
          </li>
          <li>
            <strong>Direct UPI to our account, from the order page:</strong> your plan starts within a few minutes once the
            payment matches our bank record; if it has to be checked by hand, the same day.
          </li>
          <li>
            The app picks up a new plan on its own within a minute, and the Status screen shows the new expiry date.
          </li>
          <li>
            Nothing has to be installed again, and no key or code is sent to you. The plan is attached to your number, not to
            a file.
          </li>
        </ul>

        <h2>Where it works</h2>
        <p>India, on one Android phone per plan. Using the same plan on a second phone needs account authorization.</p>

        <h2>If your plan does not activate</h2>
        <p>
          Write to us with your mobile number and the payment reference — the order number or the UPI transaction ID. Our
          contact details are on the <Link href="/contact">Contact</Link> page, and we reply within 2 working days.
        </p>

        <h2>Refunds</h2>
        <p>
          Cancellation and refunds are covered by our{' '}
          <Link href="/refunds">Refund &amp; Cancellation Policy</Link>.
        </p>
        <p>
          <strong>Support hours:</strong> {settings.supportHours}
        </p>

        <h2>Who runs {settings.siteName || 'RiderSaathi'}</h2>
        <p>
          {settings.siteName || 'RiderSaathi'} is owned and operated by its founder,{' '}
          <strong>{settings.ownerName}</strong>.
        </p>
        <ul>
          <li>
            Email: <a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a>
          </li>
          <li>Address: {settings.officeAddress}</li>
        </ul>

        <h3>Grievance officer</h3>
        <p>
          <strong>{settings.grievanceOfficer}</strong> —{' '}
          <a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a>.<br />
          Complaints about the app or about your data are acknowledged within 24 hours and resolved within 15 days.
        </p>
      </div>
    </div>
  );
}
