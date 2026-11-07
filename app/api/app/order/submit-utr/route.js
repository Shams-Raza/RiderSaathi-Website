import { NextResponse } from 'next/server';
import { updateJSON } from '@/lib/data';
import { sanitizeUtr, sanitizeInput } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function handleSubmitAppUtr(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { orderId, utr } = body;

    const cleanOrderId = sanitizeInput(orderId, 60);
    const cleanUtr = sanitizeUtr(utr);

    if (!cleanOrderId || !cleanUtr || cleanUtr.length < 6) {
      return NextResponse.json({ success: false, message: 'Valid Order ID and UTR/Transaction ID are required' }, { status: 400 });
    }

    let updatedOrder = null;
    await updateJSON('orders.json', (orders = []) => {
      const order = orders.find(o => o.id === cleanOrderId);
      if (order) {
        order.utr = cleanUtr;
        order.status = 'Pending Verification';
        order.updatedAt = new Date().toISOString();
        updatedOrder = { ...order };
      }
      return orders;
    }, []);

    if (!updatedOrder) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Payment UTR submitted! Admin will verify and activate your plan shortly.',
      order: updatedOrder,
    });
  } catch (err) {
    console.error('Error in submit-utr:', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function POST(req) {
  return handleSubmitAppUtr(req);
}
