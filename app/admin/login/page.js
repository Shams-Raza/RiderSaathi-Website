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
    <div className="admin-body">
      <div
        className="login-wrapper"
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 16px',
          background: 'radial-gradient(circle at 50% 20%, rgba(29, 78, 216, 0.08) 0%, transparent 60%), var(--admin-bg)',
        }}
      >
        <AdminLoginForm
          initialError={initialError}
          initialEmail={initialEmail}
          siteName={settings.siteName || 'RiderSaathi'}
        />
      </div>
    </div>
  );
}
