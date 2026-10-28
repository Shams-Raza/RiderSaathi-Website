import { NextResponse } from 'next/server';
import { readJSON, updateJSON, getSettings } from '@/lib/data';
import { evaluateDriverAccess } from '@/lib/driver';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { phone, name, deviceId, deviceModel, appVersion } = body;

    if (!phone) {
      return NextResponse.json({ success: false, message: 'Phone number is required' }, { status: 400 });
    }

    const cleanPhone = String(phone).replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      return NextResponse.json({ success: false, message: 'Valid 10-digit mobile number is required' }, { status: 400 });
    }

    const settings = getSettings();
    const initialTrialRides = parseInt(settings.freeRidesTrial) || 10;
    let authDriver = null;
    let isNewDriver = false;

    await updateJSON('drivers.json', (drivers = []) => {
      let driver = drivers.find(d => d.phone && d.phone.replace(/\D/g, '').slice(-10) === cleanPhone);

      if (!driver) {
        isNewDriver = true;
        const token = 'token_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8);
        driver = {
          id: 'DRV-' + Date.now().toString(36).toUpperCase(),
          phone: cleanPhone,
          name: name ? name.trim() : 'Captain ' + cleanPhone.slice(-4),
          deviceId: deviceId || '',
          deviceModel: deviceModel || '',
          appVersion: appVersion || settings.appVersion || '5.28.1',
          authToken: token,
          trialRidesTotal: initialTrialRides,
          trialRidesUsed: 0,
          isTrialActive: true,
          subscription: {
            status: 'trial',
            planId: null,
            planName: null,
            startsAt: null,
            expiresAt: null,
          },
          filterRules: {
            minFare: 50,
            maxPickupDistanceKm: 2.5,
            minFarePerKm: 12,
            platforms: {
              rapido: true,
              uber: true,
              porter: true,
              ola: true,
            },
            passengers: true,
            parcels: true,
            autoAccept: true,
            voiceAlert: true,
          },
          status: 'active',
          totalRidesAccepted: 0,
          createdAt: new Date().toISOString(),
          lastActiveAt: new Date().toISOString(),
        };
        drivers.unshift(driver);
      } else {
        if (name && name.trim()) driver.name = name.trim();
        if (deviceId) driver.deviceId = deviceId;
        if (deviceModel) driver.deviceModel = deviceModel;
        if (appVersion) driver.appVersion = appVersion;
        driver.lastActiveAt = new Date().toISOString();
        if (!driver.authToken) {
          driver.authToken = 'token_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8);
        }
      }

      authDriver = { ...driver };
      return drivers;
    }, []);

    if (isNewDriver) {
      await updateJSON('stats.json', (stats = {}) => {
        stats.totalDrivers = (stats.totalDrivers || 0) + 1;
        return stats;
      }, {});
    }

    const access = evaluateDriverAccess(authDriver);

    return NextResponse.json({
      success: true,
      message: 'Driver authenticated successfully',
      token: authDriver.authToken,
      driver: {
        id: authDriver.id,
        phone: authDriver.phone,
        name: authDriver.name,
        status: authDriver.status,
      },
      access,
      filterRules: authDriver.filterRules,
      appConfig: {
        latestVersion: settings.appVersion,
        supportWhatsApp: settings.whatsappNumber,
        upiId: settings.upiId,
        upiPayeeName: settings.upiPayeeName,
      },
    });
  } catch (err) {
    console.error('Error in /api/app/auth:', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
