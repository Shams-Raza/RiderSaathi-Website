import { NextResponse } from 'next/server';
import { readJSON, updateJSON, getPlans, getSettings } from '@/lib/data';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function handleCreateAppOrder(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { planId, phone } = body;
    const cleanPhone = String(phone || '').replace(/\D/g, '').slice(-10);

    if (!cleanPhone || cleanPhone.length !== 10) {
      return NextResponse.json({ success: false, message: 'Valid 10-digit mobile number required' }, { status: 400 });
    }

    const plans = getPlans();
    const plan = plans.find(p => p.id === planId);
    if (!plan) {
      return NextResponse.json({ success: false, message: 'Selected plan not found' }, { status: 404 });
    }

    const settings = getSettings();
    const orderId = 'ORD-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(100 + Math.random() * 900);
    const upiString = `upi://pay?pa=${encodeURIComponent(settings.upiId)}&pn=${encodeURIComponent(settings.upiPayeeName)}&am=${plan.price}&cu=INR&tn=${encodeURIComponent(`${settings.siteName}_${plan.id}_${cleanPhone}`)}`;

    const order = {
      id: orderId,
      planId: plan.id,
      planName: plan.name,
      amount: plan.price,
      durationDays: plan.durationDays,
      phone: cleanPhone,
      utr: '',
      status: 'Pending Payment',
      createdAt: new Date().toISOString(),
      source: 'mobile_app',
    };

    await updateJSON('orders.json', (orders = []) => {
      orders.unshift(order);
      return orders;
    }, []);

    await updateJSON('stats.json', (stats = {}) => {
      stats.orders = (stats.orders || 0) + 1;
      return stats;
    }, {});

    return NextResponse.json({
      success: true,
      orderId,
      planName: plan.name,
      amount: plan.price,
      durationDays: plan.durationDays,
      upiString,
      upiId: settings.upiId,
      upiPayeeName: settings.upiPayeeName,
    });
  } catch (err) {
    console.error('Error in in-app order creation:', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function POST(req) {
  return handleCreateAppOrder(req);
}
