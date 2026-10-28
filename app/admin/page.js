import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';
import {
  getSettings,
  getPlans,
  getFaqs,
  getGuides,
  getUpdates,
  getInquiries,
  getOrders,
  getStats,
  getDrivers,
  getRides,
  getAdmin,
} from '@/lib/data';
import AdminDashboard from '@/components/AdminDashboard';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const metadata = {
  title: 'Admin Dashboard & CMS — RiderSaathi',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPage() {
  const cookieStore = cookies();
  const session = getAdminSession(cookieStore);

  if (!session) {
    redirect('/admin/login');
  }

  const settings = getSettings();
  const plans = getPlans();
  const faqs = getFaqs();
  const guides = getGuides();
  const updates = getUpdates();
  const inquiries = getInquiries();
  const orders = getOrders();
  const stats = getStats();
  const drivers = getDrivers();
  const rides = getRides();
  const admin = getAdmin();

  return (
    <AdminDashboard
      initialSettings={settings}
      initialPlans={plans}
      initialFaqs={faqs}
      initialGuides={guides}
      initialUpdates={updates}
      initialInquiries={inquiries}
      initialOrders={orders}
      initialStats={stats}
      initialDrivers={drivers}
      initialRides={rides}
      adminEmail={admin?.email || session?.email || 'admin@ridersaathi.in'}
    />
  );
}
