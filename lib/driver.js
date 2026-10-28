const { readJSON } = require('./data');

// Helper to evaluate driver access
function evaluateDriverAccess(driver) {
  if (!driver) {
    return { accessGranted: false, reason: 'driver_not_found', message: 'Driver account not found' };
  }
  if (driver.status === 'banned') {
    return { accessGranted: false, reason: 'driver_banned', message: 'Account is suspended. Please contact support.' };
  }

  const now = new Date();
  
  // 1. Check active paid subscription
  if (driver.subscription && driver.subscription.expiresAt) {
    const exp = new Date(driver.subscription.expiresAt);
    if (exp > now) {
      const msLeft = exp.getTime() - now.getTime();
      const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
      return {
        accessGranted: true,
        reason: 'active_subscription',
        message: `Subscription active (${daysLeft} days remaining)`,
        subscription: {
          isActive: true,
          status: 'active',
          planName: driver.subscription.planName || 'Paid Plan',
          expiresAt: driver.subscription.expiresAt,
          daysLeft
        },
        trial: {
          total: driver.trialRidesTotal || 10,
          used: driver.trialRidesUsed || 0,
          remaining: Math.max(0, (driver.trialRidesTotal || 10) - (driver.trialRidesUsed || 0))
        }
      };
    } else {
      driver.subscription.status = 'expired';
    }
  }

  // 2. Check free trial rides
  const total = driver.trialRidesTotal || 10;
  const used = driver.trialRidesUsed || 0;
  const remaining = Math.max(0, total - used);

  if (remaining > 0 && driver.isTrialActive !== false) {
    return {
      accessGranted: true,
      reason: 'trial_active',
      message: `Free trial active: ${remaining} rides remaining`,
      subscription: {
        isActive: false,
        status: 'trial',
        planName: null,
        expiresAt: null,
        daysLeft: 0
      },
      trial: {
        total,
        used,
        remaining
      }
    };
  }

  // 3. Neither active subscription nor trial rides
  return {
    accessGranted: false,
    reason: driver.subscription && driver.subscription.expiresAt ? 'subscription_expired' : 'trial_exhausted',
    message: 'Free trial rides completed. Please recharge a plan to continue.',
    subscription: {
      isActive: false,
      status: 'expired',
      planName: (driver.subscription && driver.subscription.planName) || null,
      expiresAt: (driver.subscription && driver.subscription.expiresAt) || null,
      daysLeft: 0
    },
    trial: {
      total,
      used,
      remaining: 0
    }
  };
}

// Extract driver from standard Web Request (Next.js Request)
function getDriverFromNextRequest(req, body = {}, drivers = []) {
  const headers = req.headers;
  const searchParams = req.nextUrl ? req.nextUrl.searchParams : new URL(req.url, 'http://localhost').searchParams;

  let token = null;
  const authHeader = headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (headers.get('x-driver-token')) {
    token = headers.get('x-driver-token');
  } else if (body && body.token) {
    token = body.token;
  } else if (searchParams.get('token')) {
    token = searchParams.get('token');
  }

  const phone = (body && body.phone) || searchParams.get('phone') || headers.get('x-driver-phone');
  const deviceId = (body && body.deviceId) || searchParams.get('deviceId') || headers.get('x-device-id');

  if (token) {
    const d = drivers.find(drv => drv.authToken === token);
    if (d) return { driver: d, drivers };
  }
  if (phone) {
    const cleanPhone = String(phone).replace(/\D/g, '').slice(-10);
    const d = drivers.find(drv => drv.phone && drv.phone.replace(/\D/g, '').slice(-10) === cleanPhone);
    if (d) return { driver: d, drivers };
  }
  if (deviceId) {
    const d = drivers.find(drv => drv.deviceId === deviceId);
    if (d) return { driver: d, drivers };
  }
  return { driver: null, drivers };
}

// Deep merge helper
function deepMerge(target, source) {
  if (!source || typeof source !== 'object' || Array.isArray(source)) return source !== undefined ? source : target;
  const output = { ...(target || {}) };
  for (const key of Object.keys(source)) {
    if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      output[key] = deepMerge(target ? target[key] : {}, source[key]);
    } else if (source[key] !== undefined) {
      output[key] = source[key];
    }
  }
  return output;
}

module.exports = {
  evaluateDriverAccess,
  getDriverFromNextRequest,
  deepMerge
};
