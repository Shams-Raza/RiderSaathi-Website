import { NextResponse } from 'next/server';
import { readJSON, updateJSON } from '@/lib/data';
import { getDriverFromNextRequest } from '@/lib/driver';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const drivers = readJSON('drivers.json', []);
    const { driver } = getDriverFromNextRequest(req, {}, drivers);
    if (!driver) {
      return NextResponse.json({ success: false, message: 'Driver not found' }, { status: 404 });
    }
    const rules = driver.filterRules || {};
    return NextResponse.json({ success: true, filterRules: rules, rules });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const drivers = readJSON('drivers.json', []);
    const { driver } = getDriverFromNextRequest(req, body, drivers);

    if (!driver) {
      return NextResponse.json({ success: false, message: 'Driver not found' }, { status: 404 });
    }

    const incoming = body.filterRules || body.rules || (typeof body === 'object' && body.minFare ? body : null);
    if (!incoming || typeof incoming !== 'object') {
      return NextResponse.json({ success: false, message: 'Invalid filterRules payload' }, { status: 400 });
    }

    let updatedRules = null;
    await updateJSON('drivers.json', (driverList = []) => {
      const target = driverList.find(d => d.id === driver.id);
      if (target) {
        target.filterRules = { ...(target.filterRules || {}), ...incoming };
        target.lastActiveAt = new Date().toISOString();
        updatedRules = target.filterRules;
      }
      return driverList;
    }, []);

    return NextResponse.json({
      success: true,
      message: 'Filter rules synchronized',
      filterRules: updatedRules,
      rules: updatedRules,
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
