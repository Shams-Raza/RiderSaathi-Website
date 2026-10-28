import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { updateJSON } from '@/lib/data';
import { getAdminSession } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req, { params }) {
  try {
    const session = getAdminSession(cookies());
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json().catch(() => ({}));
    let found = false;

    await updateJSON('inquiries.json', (inquiries = []) => {
      const inquiry = inquiries.find(i => String(i.id) === String(id));
      if (inquiry) {
        inquiry.status = body.status || 'Resolved';
        found = true;
      }
      return inquiries;
    }, []);

    if (!found) {
      return NextResponse.json({ success: false, message: 'Inquiry not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
