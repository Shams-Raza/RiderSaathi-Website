import { NextResponse } from 'next/server';
import { getPlans, updateJSON } from '@/lib/data';
import { checkGeneralRateLimit } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    if (!checkGeneralRateLimit(ip, 20, 60000)) {
      return NextResponse.json(
        { ok: false, error: 'Too many requests. Please wait a moment before trying again.' },
        { status: 429 }
      );
    }
    let body;
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      body = await request.json();
    } else {
      const formData = await request.formData();
      body = Object.fromEntries(formData.entries());
    }

    const { planId, phone } = body || {};

    if (!planId) {
      return NextResponse.json({ ok: false, error: 'Please select a valid plan.' }, { status: 400 });
    }

    const plans = getPlans();
    const plan = plans.find((p) => p.id === planId);
    if (!plan) {
      return NextResponse.json({ ok: false, error: 'Selected plan does not exist.' }, { status: 400 });
    }

    const cleanPhone = String(phone || '').replace(/\D/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length !== 10) {
      return NextResponse.json(
        { ok: false, error: 'Please enter a valid 10-digit registered mobile number.' },
        { status: 400 }
      );
    }

    const orderId =
      'ORD-' +
      Date.now().toString(36).toUpperCase() +
      '-' +
      Math.floor(100 + Math.random() * 900);

    const newOrder = {
      id: orderId,
      planId: plan.id,
      planName: plan.name,
      amount: plan.price,
      durationDays: plan.durationDays,
      phone: cleanPhone,
      utr: '',
      status: 'Pending Payment',
      createdAt: new Date().toISOString(),
      source: 'web',
    };

    // Atomic update of orders
    await updateJSON(
      'orders.json',
      (orders) => {
        const list = Array.isArray(orders) ? orders : [];
        list.unshift(newOrder);
        return list;
      },
      []
    );

    // Atomic update of stats counter (fail-open)
    try {
      await updateJSON(
        'stats.json',
        (stats) => {
          const s = stats || {};
          s.orders = (s.orders || 0) + 1;
          return s;
        },
        {}
      );
    } catch (e) {
      console.error('Failed to increment orders counter:', e);
    }

    return NextResponse.json({
      ok: true,
      orderId,
      redirectUrl: `/buy/upi?orderId=${orderId}`,
    });
  } catch (err) {
    console.error('Error in /api/buy/upi:', err);
    return NextResponse.json(
      { ok: false, error: 'Server error processing payment request.' },
      { status: 500 }
    );
  }
}
