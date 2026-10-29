import React from 'react';
import Link from 'next/link';
import { getSettings } from '@/lib/data';

export const runtime = 'nodejs';

export async function generateMetadata() {
  const settings = getSettings();
  const siteName = settings.siteName || 'RiderSaathi';
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'http://localhost:3000';
  const title = 'Refund & Cancellation Policy';
  const description =
    'Read RiderSaathi official refund and cancellation policy. Understand how digital license activation, phone compatibility refunds, and duplicate charges work.';

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/refunds`,
      languages: {
        'hi-IN': `${baseUrl}/refunds?lang=hi`,
        'en-IN': `${baseUrl}/refunds?lang=en`,
        'x-default': `${baseUrl}/refunds`,
      },
    },
    openGraph: {
      title: `${title} — ${siteName}`,
      description,
      url: `${baseUrl}/refunds`,
      siteName,
      locale: 'en_US',
      alternateLocale: ['hi_IN'],
      type: 'website',
      images: [
        {
          url: `${baseUrl}/images/og-default.png`,
          width: 1200,
          height: 630,
          alt: `${siteName} Refund Policy`,
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

export default function RefundsPage() {
  const settings = getSettings();

  return (
    <div className="wrap">
      <div className="legal">
        <h1>Refund &amp; Cancellation Policy</h1>
        <p><strong>Last updated: 19 October 2026</strong></p>
        <p>
          {settings.siteName || 'RiderSaathi'} provides a digital subscription for driver productivity software. Please
          review this policy before making a payment.
        </p>

        <h2>Free trial first</h2>
        <p>
          Every new account receives a free trial counted in rides. We encourage drivers to test all filtering rules and
          verify phone compatibility before purchasing any paid plan.
        </p>

        <h2>Paid plans</h2>
        <ul>
          <li>
            Plans are digital software licenses, activated on your mobile number once the payment is confirmed — our{' '}
            <Link href="/delivery">Delivery &amp; Activation</Link> page gives the times. Current plans and prices are
            published on our <Link href="/pricing">Pricing</Link> page.
          </li>
          <li>
            A plan is usable the moment it starts, so a started plan is not refunded for a change of mind. The free trial
            is there so you can decide before paying.
          </li>
          <li>
            <strong>Charged but no plan, or charged twice:</strong> contact us within 7 days with your transaction
            reference. A verified unactivated or duplicate payment is refunded in full.
          </li>
          <li>
            <strong>{settings.siteName || 'RiderSaathi'} does not work on your phone:</strong> if our support team cannot
            make it work within 7 days of you telling us, we refund the unused part of your plan.
          </li>
          <li>
            <strong>How refunds are paid:</strong> to the original payment method — the bank account or UPI ID the money
            came from — within 7 working days of the refund being approved.
          </li>
        </ul>

        <h2>Cancellation</h2>
        <ul>
          <li>
            There is no automatic recurring billing and no saved card requirement. Each plan is a one-time prepaid
            purchase that simply concludes when its duration expires.
          </li>
          <li>
            You may cease using {settings.siteName || 'RiderSaathi'} at any time without cancellation penalties.
          </li>
        </ul>

        <h2>Things outside our control</h2>
        <p>
          {settings.siteName || 'RiderSaathi'} carries out the filtering rules you set, on your own phone. Ride platforms
          operate independently of us: changes they make to their apps or their terms, shifts in passenger demand, and
          decisions they take about driver accounts are outside our control and are not grounds for a refund of your{' '}
          {settings.siteName || 'RiderSaathi'} plan. Section 2 of our <Link href="/terms">Terms</Link> sets this out before
          you buy.
        </p>

        <h2>Reaching us</h2>
        <p>
          Keep your payment reference (Order ID or UPI Transaction ID) and contact our support team at{' '}
          <a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a> or via the Help section in the app. We
          respond to all billing inquiries within 2 business days.
        </p>

        <h2>Who runs {settings.siteName || 'RiderSaathi'}</h2>
        <p>
          {settings.siteName || 'RiderSaathi'} is owned and operated by its founder,{' '}
          <strong>{settings.ownerName}</strong> ({settings.legalBusinessName}).
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
