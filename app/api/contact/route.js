import { NextResponse } from 'next/server';
import { updateJSON } from '@/lib/data';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    let body;
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      body = await request.json();
    } else {
      const formData = await request.formData();
      body = Object.fromEntries(formData.entries());
    }

    const { name, phone, subject, message } = body || {};

    if (!name || !String(name).trim()) {
      return NextResponse.json({ ok: false, error: 'Name is required' }, { status: 400 });
    }

    const cleanPhone = String(phone || '').replace(/\D/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length !== 10) {
      return NextResponse.json({ ok: false, error: 'Valid 10-digit mobile number is required' }, { status: 400 });
    }

    if (!message || !String(message).trim()) {
      return NextResponse.json({ ok: false, error: 'Message content is required' }, { status: 400 });
    }

    const newInquiry = {
      id: 'INQ-' + Date.now().toString(36).toUpperCase(),
      name: String(name).trim(),
      phone: cleanPhone,
      subject: subject ? String(subject).trim() : 'General',
      message: String(message).trim(),
      status: 'New',
      createdAt: new Date().toISOString(),
    };

    let wasDuplicate = false;

    // Atomic update of inquiries with idempotency
    await updateJSON(
      'inquiries.json',
      (inquiries) => {
        const list = Array.isArray(inquiries) ? inquiries : [];
        const isDup = list.some(
          (inq) =>
            inq.phone === cleanPhone &&
            inq.message === String(message).trim() &&
            Date.now() - new Date(inq.createdAt).getTime() < 60000
        );
        if (isDup) {
          wasDuplicate = true;
          return list;
        }
        list.unshift(newInquiry);
        return list;
      },
      []
    );

    if (wasDuplicate) {
      return NextResponse.json({ ok: true, message: 'Message received successfully!' });
    }

    // Atomic update of stats counter (fail-open)
    try {
      await updateJSON(
        'stats.json',
        (stats) => {
          const s = stats || {};
          s.inquiries = (s.inquiries || 0) + 1;
          return s;
        },
        {}
      );
    } catch (e) {
      console.error('Failed to increment inquiries counter:', e);
    }

    return NextResponse.json({ ok: true, message: 'Message received successfully!' });
  } catch (err) {
    console.error('Error in /api/contact:', err);
    return NextResponse.json({ ok: false, error: 'Server error processing inquiry.' }, { status: 500 });
  }
}
