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

    const { driverId, days, planName } = await req.json().catch(() => ({}));
    let targetDriver = null;

    await updateJSON('drivers.json', (drivers = []) => {
      const driver = drivers.find(d => d.id === driverId || d.phone === driverId);
      if (!driver) return drivers;

      const durationDays = parseInt(days) || 7;
      const now = new Date();
      let baseDate = now;
      if (driver.subscription && driver.subscription.expiresAt) {
        const existingExp = new Date(driver.subscription.expiresAt);
        if (existingExp > now) {
          baseDate = existingExp;
        }
      }

      const newExpiry = new Date(baseDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
      driver.subscription = {
        status: 'active',
        planId: 'custom',
        planName: planName || `${durationDays} Days Pass`,
        startsAt: now.toISOString(),
        expiresAt: newExpiry.toISOString(),
      };
      driver.status = 'active';
      targetDriver = { ...driver };
      return drivers;
    }, []);

    if (!targetDriver) {
      return NextResponse.json({ success: false, message: 'Driver not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Granted ${parseInt(days) || 7} days to driver ${targetDriver.phone}`,
      driver: targetDriver,
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
