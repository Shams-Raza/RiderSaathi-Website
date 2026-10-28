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

    const { driverId, extraRides } = await req.json().catch(() => ({}));
    let targetDriver = null;

    await updateJSON('drivers.json', (drivers = []) => {
      const driver = drivers.find(d => d.id === driverId || d.phone === driverId);
      if (!driver) return drivers;

      const ridesToAdd = parseInt(extraRides) || 10;
      driver.trialRidesTotal = (driver.trialRidesTotal || 10) + ridesToAdd;
      driver.isTrialActive = true;
      targetDriver = { ...driver };
      return drivers;
    }, []);

    if (!targetDriver) {
      return NextResponse.json({ success: false, message: 'Driver not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Added ${parseInt(extraRides) || 10} free rides to ${targetDriver.phone}`,
      driver: targetDriver,
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
