import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { updateJSON } from '@/lib/data';
import { getAdminSession } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const session = getAdminSession(cookies());
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const newPlan = await req.json().catch(() => ({}));
    if (!newPlan.id || !newPlan.name || !newPlan.price) {
      return NextResponse.json({ success: false, message: 'Invalid plan details' }, { status: 400 });
    }

    newPlan.price = Number(newPlan.price);
    newPlan.wasPrice = Number(newPlan.wasPrice) || newPlan.price;
    newPlan.durationDays = Number(newPlan.durationDays) || 1;
    newPlan.active = true;

    await updateJSON('plans.json', (plans = []) => {
      plans.push(newPlan);
      return plans;
    }, []);

    return NextResponse.json({ success: true, message: 'Plan added!' });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
