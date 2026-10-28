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
    let targetOrder = null;

    await updateJSON('orders.json', (orders = []) => {
      const order = orders.find(o => o.id === id);
      if (order) {
        order.status = 'Activated';
        order.updatedAt = new Date().toISOString();
        targetOrder = { ...order };
      }
      return orders;
    }, []);

    if (!targetOrder) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    const cleanPhone = String(targetOrder.phone).replace(/\D/g, '').slice(-10);
    const days = parseInt(targetOrder.durationDays) || 7;
    const now = new Date();
    let targetDriver = null;

    await updateJSON('drivers.json', (drivers = []) => {
      let driver = drivers.find(d => d.phone && d.phone.replace(/\D/g, '').slice(-10) === cleanPhone);

      if (!driver) {
        const token = 'token_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8);
        const newExpiry = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
        driver = {
          id: 'DRV-' + Date.now().toString(36).toUpperCase(),
          phone: cleanPhone,
          name: 'Captain ' + cleanPhone.slice(-4),
          deviceId: '',
          deviceModel: '',
          appVersion: '5.28.1',
          authToken: token,
          trialRidesTotal: 10,
          trialRidesUsed: 10,
          isTrialActive: false,
          subscription: {
            status: 'active',
            planId: targetOrder.planId,
            planName: targetOrder.planName,
            startsAt: now.toISOString(),
            expiresAt: newExpiry.toISOString(),
          },
          filterRules: {
            minFare: 50,
            maxPickupDistanceKm: 2.5,
            minFarePerKm: 12,
            platforms: { rapido: true, uber: true, porter: true, ola: true },
            passengers: true,
            parcels: true,
            autoAccept: true,
            voiceAlert: true,
          },
          status: 'active',
          totalRidesAccepted: 0,
          createdAt: now.toISOString(),
          lastActiveAt: now.toISOString(),
        };
        drivers.unshift(driver);
      } else {
        let baseDate = now;
        if (driver.subscription && driver.subscription.expiresAt) {
          const existingExp = new Date(driver.subscription.expiresAt);
          if (existingExp > now) {
            baseDate = existingExp;
          }
        }
        const newExpiry = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000);
        driver.subscription = {
          status: 'active',
          planId: targetOrder.planId,
          planName: targetOrder.planName,
          startsAt: now.toISOString(),
          expiresAt: newExpiry.toISOString(),
        };
        driver.status = 'active';
      }

      targetDriver = { ...driver };
      return drivers;
    }, []);

    return NextResponse.json({
      success: true,
      message: `Order approved! Driver ${cleanPhone} activated for ${days} days.`,
      order: targetOrder,
      driver: targetDriver,
    });
  } catch (err) {
    console.error('Error approving order:', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
