import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';
import { getSettings } from '@/lib/data';
import AdminLoginForm from '@/components/AdminLoginForm';
import '@/public/css/admin.css';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const settings = getSettings();
  return {
    title: `Admin Login — ${settings.siteName || 'RiderSaathi'}`,
    description: 'Secure Administrative Portal for RiderSaathi management.',
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function AdminLoginPage({ searchParams }) {
  const cookieStore = cookies();
  const session = getAdminSession(cookieStore);

  if (session) {
    redirect('/admin');
  }

  const settings = getSettings();
  const initialError = searchParams?.error || '';
  const initialEmail = searchParams?.email || '';

  return (
    <div className="admin-login-screen">
      {/* Ambient background glow elements */}
      <div className="login-ambient-blob" aria-hidden="true" />

      <div className="login-wrapper">
        <AdminLoginForm
          initialError={initialError}
          initialEmail={initialEmail}
          siteName={settings.siteName || 'RiderSaathi'}
        />
      </div>
    </div>
  );
}
