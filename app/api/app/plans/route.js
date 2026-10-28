import { NextResponse } from 'next/server';
import { getPlans, getSettings } from '@/lib/data';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const plans = getPlans();
    const settings = getSettings();
    return NextResponse.json({
      success: true,
      plans,
      payment: {
        upiId: settings.upiId,
        upiPayeeName: settings.upiPayeeName,
      },
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
