import { NextResponse } from 'next/server';
import { readJSON, updateJSON } from '@/lib/data';
import { getDriverFromNextRequest, evaluateDriverAccess } from '@/lib/driver';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function handleRecordRide(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const drivers = readJSON('drivers.json', []);
    const { driver } = getDriverFromNextRequest(req, body, drivers);

    if (!driver) {
      return NextResponse.json({ success: false, message: 'Driver not found' }, { status: 404 });
    }

    const access = evaluateDriverAccess(driver);
    if (!access.accessGranted) {
      return NextResponse.json({
        success: false,
        accessGranted: false,
        reason: access.reason,
        message: access.message,
      }, { status: 403 });
    }

    const { platform, fare, pickupDistanceKm, tripDistanceKm } = body;
    let updatedAccess = null;

    await updateJSON('drivers.json', (driverList = []) => {
      const targetDriver = driverList.find(d => d.id === driver.id);
      if (!targetDriver) return driverList;

      if (access.reason === 'trial_active') {
        targetDriver.trialRidesUsed = (targetDriver.trialRidesUsed || 0) + 1;
        if (targetDriver.trialRidesUsed >= (targetDriver.trialRidesTotal || 10)) {
          targetDriver.isTrialActive = false;
        }
      }

      targetDriver.totalRidesAccepted = (targetDriver.totalRidesAccepted || 0) + 1;
      targetDriver.lastActiveAt = new Date().toISOString();

      updatedAccess = evaluateDriverAccess(targetDriver);
      return driverList;
    }, []);

    const rideRecord = {
      id: 'RIDE-' + Date.now().toString(36).toUpperCase(),
      driverId: driver.id,
      driverPhone: driver.phone,
      platform: platform || 'general',
      fare: Number(fare) || 0,
      pickupDistanceKm: Number(pickupDistanceKm) || 0,
      tripDistanceKm: Number(tripDistanceKm) || 0,
      acceptedAt: new Date().toISOString(),
    };

    await updateJSON('rides.json', (rides = []) => {
      rides.unshift(rideRecord);
      if (rides.length > 500) rides.length = 500;
      return rides;
    }, []);

    await updateJSON('stats.json', (stats = {}) => {
      stats.totalRidesFiltered = (stats.totalRidesFiltered || 0) + 1;
      return stats;
    }, {});

    return NextResponse.json({
      success: true,
      message: 'Ride accepted & recorded successfully',
      rideId: rideRecord.id,
      access: updatedAccess || access,
    });
  } catch (err) {
    console.error('Error in record ride:', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function POST(req) {
  return handleRecordRide(req);
}
