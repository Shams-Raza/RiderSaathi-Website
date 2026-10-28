import { NextResponse } from 'next/server';
import { readJSON, getSettings } from '@/lib/data';
import { getDriverFromNextRequest, evaluateDriverAccess } from '@/lib/driver';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function handleDriverStatus(req, body = {}) {
  try {
    const drivers = readJSON('drivers.json', []);
    const { driver } = getDriverFromNextRequest(req, body, drivers);

    if (!driver) {
      return NextResponse.json({
        success: false,
        accessGranted: false,
        reason: 'driver_not_found',
        message: 'Driver not found. Please authenticate via /api/app/auth first.',
      }, { status: 404 });
    }

    const access = evaluateDriverAccess(driver);
    const settings = getSettings();

    return NextResponse.json({
      success: true,
      driver: {
        id: driver.id,
        phone: driver.phone,
        name: driver.name,
        status: driver.status,
      },
      ...access,
      serverTime: new Date().toISOString(),
      appConfig: {
        latestVersion: settings.appVersion,
        supportWhatsApp: settings.whatsappNumber,
      },
    });
  } catch (err) {
    console.error('Error in handleDriverStatus:', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function GET(req) {
  return handleDriverStatus(req);
}

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  return handleDriverStatus(req, body);
}
