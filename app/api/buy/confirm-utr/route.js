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

    const { orderId, utr } = body || {};

    if (!orderId || !String(orderId).trim()) {
      return NextResponse.json({ ok: false, error: 'Order ID is missing.' }, { status: 400 });
    }

    const cleanUtr = String(utr || '').trim();
    if (!cleanUtr || cleanUtr.length < 6) {
      return NextResponse.json(
        { ok: false, error: 'Please enter a valid 12-digit UPI Reference / UTR Number.' },
        { status: 400 }
      );
    }

    let foundOrder = null;
    await updateJSON(
      'orders.json',
      (orders) => {
        const list = Array.isArray(orders) ? orders : [];
        const order = list.find((o) => o.id === orderId.trim());
        if (order) {
          order.utr = cleanUtr;
          order.status = 'Pending Verification';
          order.updatedAt = new Date().toISOString();
          foundOrder = order;
        }
        return list;
      },
      []
    );

    if (!foundOrder) {
      return NextResponse.json({ ok: false, error: 'Order not found.' }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      message: 'Payment UTR submitted! Admin verification is in progress.',
    });
  } catch (err) {
    console.error('Error in /api/buy/confirm-utr:', err);
    return NextResponse.json(
      { ok: false, error: 'Server error confirming transaction UTR.' },
      { status: 500 }
    );
  }
}
