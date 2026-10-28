import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { readJSON } from '@/lib/data';
import { getAdminSession } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = getAdminSession(cookies());
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const backup = {
      exportedAt: new Date().toISOString(),
      settings: readJSON('settings.json', {}),
      plans: readJSON('plans.json', []),
      faqs: readJSON('faqs.json', []),
      guides: readJSON('guides.json', []),
      updates: readJSON('updates.json', []),
      orders: readJSON('orders.json', []),
      inquiries: readJSON('inquiries.json', []),
      drivers: readJSON('drivers.json', []),
      rides: readJSON('rides.json', []),
      stats: readJSON('stats.json', {}),
    };

    return new NextResponse(JSON.stringify(backup, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename=ridersaathi-backup.json',
      },
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
