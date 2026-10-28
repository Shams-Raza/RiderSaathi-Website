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

    await updateJSON('orders.json', (orders = []) => {
      const order = orders.find(o => o.id === id);
      if (order) {
        order.status = body.status || 'Activated';
        order.updatedAt = new Date().toISOString();
        found = true;
      }
      return orders;
    }, []);

    if (!found) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
