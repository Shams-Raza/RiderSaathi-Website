const express = require('express');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Data file paths
const DATA_DIR = path.join(__dirname, 'data');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const PLANS_FILE = path.join(DATA_DIR, 'plans.json');
const FAQS_FILE = path.join(DATA_DIR, 'faqs.json');
const GUIDES_FILE = path.join(DATA_DIR, 'guides.json');
const UPDATES_FILE = path.join(DATA_DIR, 'updates.json');
const INQUIRIES_FILE = path.join(DATA_DIR, 'inquiries.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const STATS_FILE = path.join(DATA_DIR, 'stats.json');
const DRIVERS_FILE = path.join(DATA_DIR, 'drivers.json');
const RIDES_FILE = path.join(DATA_DIR, 'rides.json');

// Helper to read and write JSON safely
function readJSON(file, fallback = {}) {
  try {
    if (!fs.existsSync(file)) return fallback;
    const content = fs.readFileSync(file, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error(`Error reading ${file}:`, err);
    return fallback;
  }
}

function writeJSON(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`Error writing ${file}:`, err);
    return false;
  }
}

// Helper to authenticate driver from request
function getDriverFromRequest(req) {
  const drivers = readJSON(DRIVERS_FILE, []);
  let token = null;
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (req.headers['x-driver-token']) {
    token = req.headers['x-driver-token'];
  } else if (req.body && req.body.token) {
    token = req.body.token;
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  const phone = (req.body && req.body.phone) || (req.query && req.query.phone) || (req.headers['x-driver-phone']);
  const deviceId = (req.body && req.body.deviceId) || (req.query && req.query.deviceId) || (req.headers['x-device-id']);

  if (token) {
    const d = drivers.find(drv => drv.authToken === token);
    if (d) return { driver: d, drivers };
  }
  if (phone) {
    const cleanPhone = String(phone).replace(/\D/g, '').slice(-10);
    const d = drivers.find(drv => drv.phone.replace(/\D/g, '').slice(-10) === cleanPhone);
    if (d) return { driver: d, drivers };
  }
  if (deviceId) {
    const d = drivers.find(drv => drv.deviceId === deviceId);
    if (d) return { driver: d, drivers };
  }
  return { driver: null, drivers };
}

// Evaluate driver subscription & trial access
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

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Visitor Analytics Middleware
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/admin') && !req.path.startsWith('/api') && !req.path.includes('.')) {
    try {
      const stats = readJSON(STATS_FILE, { visitors: 0, downloads: 0, orders: 0, inquiries: 0 });
      stats.visitors = (stats.visitors || 0) + 1;
      writeJSON(STATS_FILE, stats);
    } catch (e) {}
  }
  next();
});

// Pass common variables to templates
app.use((req, res, next) => {
  res.locals.settings = readJSON(SETTINGS_FILE);
  res.locals.currentPath = req.path;
  next();
});

// ----------------- Public Routes ----------------- //

// Home Page
app.get('/', (req, res) => {
  const plans = readJSON(PLANS_FILE, []);
  const guides = readJSON(GUIDES_FILE, []);
  res.render('index', { plans, guides });
});

// Pricing Page
app.get('/pricing', (req, res) => {
  const plans = readJSON(PLANS_FILE, []);
  res.render('pricing', {
    title: `Plans & Pricing — ${res.locals.settings.siteName}`,
    description: `${res.locals.settings.siteName} plans and prices. 1 day, 1 week, 1 month. Free trial first, no auto-renewal.`,
    plans
  });
});

// Install & Download Page
app.get('/install', (req, res) => {
  res.render('install', {
    title: `How to install ${res.locals.settings.siteName} on Android`,
    description: `Step by step install guide for ${res.locals.settings.siteName} ride filter assistant.`
  });
});

// Direct APK Download Tracker
app.get('/download', (req, res) => {
  const stats = readJSON(STATS_FILE, { visitors: 0, downloads: 0, orders: 0, inquiries: 0 });
  stats.downloads = (stats.downloads || 0) + 1;
  writeJSON(STATS_FILE, stats);

  const settings = readJSON(SETTINGS_FILE);
  const downloadUrl = settings.apkDownloadUrl || '/downloads/RiderSaathi-v5.28.1.apk';
  res.redirect(downloadUrl);
});

// Buy Plan Page
app.get('/buy', (req, res) => {
  const planId = req.query.plan || 'week1';
  const plans = readJSON(PLANS_FILE, []);
  const selectedPlan = plans.find(p => p.id === planId) || plans[0];

  res.render('buy', {
    title: `Buy ${selectedPlan ? selectedPlan.name : 'Plan'} — ${res.locals.settings.siteName}`,
    description: `Activate your ${res.locals.settings.siteName} subscription via UPI.`,
    plans,
    selectedPlan
  });
});

// Buy via UPI Process
app.post('/buy/upi', (req, res) => {
  const { planId, phone } = req.body;
  const plans = readJSON(PLANS_FILE, []);
  const plan = plans.find(p => p.id === planId);
  const settings = readJSON(SETTINGS_FILE);

  if (!plan) {
    return res.redirect('/pricing');
  }

  const cleanPhone = String(phone || '').replace(/\D/g, '').slice(-10);
  const orders = readJSON(ORDERS_FILE, []);
  const orderId = 'ORD-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(100 + Math.random() * 900);

  const newOrder = {
    id: orderId,
    planId: plan.id,
    planName: plan.name,
    amount: plan.price,
    durationDays: plan.durationDays,
    phone: cleanPhone || 'Not provided',
    utr: '',
    status: 'Pending Payment',
    createdAt: new Date().toISOString(),
    source: 'web'
  };

  orders.unshift(newOrder);
  writeJSON(ORDERS_FILE, orders);

  const stats = readJSON(STATS_FILE, {});
  stats.orders = (stats.orders || 0) + 1;
  writeJSON(STATS_FILE, stats);

  const upiId = settings.upiId || 'ridersaathi@upi';
  const upiPayee = settings.upiPayeeName || 'RiderSaathi';
  const note = `${settings.siteName}_${plan.id}_${cleanPhone || 'driver'}`;
  const upiString = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(upiPayee)}&am=${plan.price}&cu=INR&tn=${encodeURIComponent(note)}`;

  res.render('buy-upi', {
    title: `Complete UPI Payment — ${res.locals.settings.siteName}`,
    description: `Pay ₹${plan.price} for ${plan.name} via UPI.`,
    plan,
    phone: cleanPhone,
    orderId,
    upiString,
    upiId,
    upiPayee
  });
});

// UTR / Transaction Submission
app.post('/buy/confirm-utr', (req, res) => {
  const { orderId, utr } = req.body;
  const orders = readJSON(ORDERS_FILE, []);
  const order = orders.find(o => o.id === orderId);

  if (order) {
    order.utr = (utr || '').trim();
    order.status = 'Pending Verification';
    order.updatedAt = new Date().toISOString();
    writeJSON(ORDERS_FILE, orders);
  }

  res.redirect(`/buy/upi?orderId=${orderId}&confirmed=1`);
});

// Guides
app.get('/guides', (req, res) => {
  const guides = readJSON(GUIDES_FILE, []);
  res.render('guides', {
    title: `Guides for Drivers — ${res.locals.settings.siteName}`,
    description: `Rules and settings guide for ${res.locals.settings.siteName} ride filter assistant.`,
    guides
  });
});

app.get('/guides/:slug', (req, res) => {
  const guides = readJSON(GUIDES_FILE, []);
  const guide = guides.find(g => g.slug === req.params.slug);
  if (!guide) {
    return res.redirect('/guides');
  }
  res.render('guide-detail', {
    title: `${guide.title} — ${res.locals.settings.siteName} Guides`,
    description: guide.summary,
    guide
  });
});

// FAQ Page
app.get('/faq', (req, res) => {
  const faqs = readJSON(FAQS_FILE, []);
  res.render('faq', {
    title: `${res.locals.settings.siteName} FAQ — Rules, settings aur aam sawal`,
    description: `Driver questions and answers for ${res.locals.settings.siteName}.`,
    faqs
  });
});

// Updates / What's New
app.get('/updates', (req, res) => {
  const updates = readJSON(UPDATES_FILE, []);
  res.render('updates', {
    title: `What's New in ${res.locals.settings.siteName} — Version Changelog`,
    description: `${res.locals.settings.siteName} version history and updates.`,
    updates
  });
});

// About Page
app.get('/about', (req, res) => {
  res.render('about', {
    title: `About ${res.locals.settings.siteName} — Kaun banata hai aur kyun`,
    description: `${res.locals.settings.siteName} is built for bike-taxi, auto, cab and parcel drivers.`
  });
});

// Contact Page
app.get('/contact', (req, res) => {
  res.render('contact', {
    title: `Contact — ${res.locals.settings.siteName}`,
    description: `How to reach ${res.locals.settings.siteName} support for help, payments or refunds.`
  });
});

// Contact API
app.post('/api/contact', (req, res) => {
  const { name, phone, subject, message } = req.body;
  if (!name || !phone || !message) {
    return res.status(400).json({ success: false, message: 'Please fill in all required fields.' });
  }

  const inquiries = readJSON(INQUIRIES_FILE, []);
  const newInquiry = {
    id: 'INQ-' + Date.now().toString(36).toUpperCase(),
    name: name.trim(),
    phone: phone.trim(),
    subject: subject || 'General',
    message: message.trim(),
    status: 'New',
    createdAt: new Date().toISOString()
  };
  inquiries.unshift(newInquiry);
  writeJSON(INQUIRIES_FILE, inquiries);

  const stats = readJSON(STATS_FILE, {});
  stats.inquiries = (stats.inquiries || 0) + 1;
  writeJSON(STATS_FILE, stats);

  res.json({ success: true, message: 'Message received successfully!' });
});

// Policy Pages
app.get('/refunds', (req, res) => {
  res.render('refunds', {
    title: `Refund & Cancellation Policy — ${res.locals.settings.siteName}`,
    description: `When a ${res.locals.settings.siteName} plan can be refunded, how cancellation works, and how to reach us.`
  });
});

app.get('/delivery', (req, res) => {
  res.render('delivery', {
    title: `Delivery & Activation — ${res.locals.settings.siteName}`,
    description: `How your ${res.locals.settings.siteName} digital license is activated after payment.`
  });
});

app.get('/terms', (req, res) => {
  res.render('terms', {
    title: `Terms of Use — ${res.locals.settings.siteName}`,
    description: `Terms and conditions for using ${res.locals.settings.siteName}.`
  });
});

app.get('/privacy', (req, res) => {
  res.render('privacy', {
    title: `Privacy Notice — ${res.locals.settings.siteName}`,
    description: `What ${res.locals.settings.siteName} reads and what it never reads.`
  });
});

// Developer API Documentation Page
app.get('/api/docs', (req, res) => {
  res.render('api-docs', {
    title: `Mobile App API Documentation — ${res.locals.settings.siteName}`,
    description: `API specifications for ${res.locals.settings.siteName} Android & Flutter app integration.`
  });
});

// =========================================================================
// 🚀 MOBILE APP REST APIS (/api/app/*)
// =========================================================================

// 1. Driver Auth (Login / Register)
app.post('/api/app/auth', (req, res) => {
  const { phone, name, deviceId, deviceModel, appVersion } = req.body;
  if (!phone) {
    return res.status(400).json({ success: false, message: 'Phone number is required' });
  }

  const cleanPhone = String(phone).replace(/\D/g, '').slice(-10);
  if (cleanPhone.length !== 10) {
    return res.status(400).json({ success: false, message: 'Valid 10-digit mobile number is required' });
  }

  const drivers = readJSON(DRIVERS_FILE, []);
  let driver = drivers.find(d => d.phone.replace(/\D/g, '').slice(-10) === cleanPhone);

  const settings = readJSON(SETTINGS_FILE, {});
  const initialTrialRides = parseInt(settings.freeRidesTrial) || 10;

  if (!driver) {
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
        expiresAt: null
      },
      filterRules: {
        minFare: 50,
        maxPickupDistanceKm: 2.5,
        minFarePerKm: 12,
        platforms: {
          rapido: true,
          uber: true,
          porter: true,
          ola: true
        },
        passengers: true,
        parcels: true,
        autoAccept: true,
        voiceAlert: true
      },
      status: 'active',
      totalRidesAccepted: 0,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString()
    };
    drivers.unshift(driver);

    const stats = readJSON(STATS_FILE, {});
    stats.totalDrivers = (stats.totalDrivers || 0) + 1;
    writeJSON(STATS_FILE, stats);
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

  writeJSON(DRIVERS_FILE, drivers);

  const access = evaluateDriverAccess(driver);

  res.json({
    success: true,
    message: 'Driver authenticated successfully',
    token: driver.authToken,
    driver: {
      id: driver.id,
      phone: driver.phone,
      name: driver.name,
      status: driver.status
    },
    access,
    filterRules: driver.filterRules,
    appConfig: {
      latestVersion: settings.appVersion,
      supportWhatsApp: settings.whatsappNumber,
      upiId: settings.upiId,
      upiPayeeName: settings.upiPayeeName
    }
  });
});

// 2. Driver Status & Subscription Check
function handleDriverStatus(req, res) {
  const { driver } = getDriverFromRequest(req);
  if (!driver) {
    return res.status(404).json({
      success: false,
      accessGranted: false,
      reason: 'driver_not_found',
      message: 'Driver not found. Please authenticate via /api/app/auth first.'
    });
  }
  const access = evaluateDriverAccess(driver);
  const settings = readJSON(SETTINGS_FILE, {});

  res.json({
    success: true,
    driver: {
      id: driver.id,
      phone: driver.phone,
      name: driver.name,
      status: driver.status
    },
    ...access,
    serverTime: new Date().toISOString(),
    appConfig: {
      latestVersion: settings.appVersion,
      supportWhatsApp: settings.whatsappNumber
    }
  });
}
app.get('/api/app/status', handleDriverStatus);
app.post('/api/app/status', handleDriverStatus);

// 3. Record Used / Accepted Ride
function handleRecordRide(req, res) {
  const { driver, drivers } = getDriverFromRequest(req);
  if (!driver) {
    return res.status(404).json({ success: false, message: 'Driver not found' });
  }

  const access = evaluateDriverAccess(driver);
  if (!access.accessGranted) {
    return res.status(403).json({
      success: false,
      accessGranted: false,
      reason: access.reason,
      message: access.message
    });
  }

  const { platform, fare, pickupDistanceKm, tripDistanceKm } = req.body;

  // If currently using trial rides, increment used count
  if (access.reason === 'trial_active') {
    driver.trialRidesUsed = (driver.trialRidesUsed || 0) + 1;
    if (driver.trialRidesUsed >= (driver.trialRidesTotal || 10)) {
      driver.isTrialActive = false;
    }
  }

  driver.totalRidesAccepted = (driver.totalRidesAccepted || 0) + 1;
  driver.lastActiveAt = new Date().toISOString();
  writeJSON(DRIVERS_FILE, drivers);

  // Log ride history
  const rides = readJSON(RIDES_FILE, []);
  const rideRecord = {
    id: 'RIDE-' + Date.now().toString(36).toUpperCase(),
    driverId: driver.id,
    driverPhone: driver.phone,
    platform: platform || 'general',
    fare: Number(fare) || 0,
    pickupDistanceKm: Number(pickupDistanceKm) || 0,
    tripDistanceKm: Number(tripDistanceKm) || 0,
    acceptedAt: new Date().toISOString()
  };
  rides.unshift(rideRecord);
  if (rides.length > 500) rides.length = 500;
  writeJSON(RIDES_FILE, rides);

  const stats = readJSON(STATS_FILE, {});
  stats.totalRidesFiltered = (stats.totalRidesFiltered || 0) + 1;
  writeJSON(STATS_FILE, stats);

  const updatedAccess = evaluateDriverAccess(driver);
  res.json({
    success: true,
    message: 'Ride accepted & recorded successfully',
    rideId: rideRecord.id,
    access: updatedAccess
  });
}
app.post('/api/app/ride/record', handleRecordRide);
app.post('/api/app/record-ride', handleRecordRide);
app.post('/api/app/use-ride', handleRecordRide);

// 4. Get & Sync Filter Rules
function handleGetRules(req, res) {
  const { driver } = getDriverFromRequest(req);
  if (!driver) {
    return res.status(404).json({ success: false, message: 'Driver not found' });
  }
  const rules = driver.filterRules || {};
  res.json({ success: true, filterRules: rules, rules });
}
app.get('/api/app/rules', handleGetRules);
app.get('/api/app/rules/get', handleGetRules);

function handleSyncRules(req, res) {
  const { driver, drivers } = getDriverFromRequest(req);
  if (!driver) {
    return res.status(404).json({ success: false, message: 'Driver not found' });
  }
  const incoming = req.body.filterRules || req.body.rules || (typeof req.body === 'object' && req.body.minFare ? req.body : null);
  if (incoming && typeof incoming === 'object') {
    driver.filterRules = { ...driver.filterRules, ...incoming };
    driver.lastActiveAt = new Date().toISOString();
    writeJSON(DRIVERS_FILE, drivers);
    return res.json({
      success: true,
      message: 'Filter rules synchronized',
      filterRules: driver.filterRules,
      rules: driver.filterRules
    });
  }
  res.status(400).json({ success: false, message: 'Invalid filterRules payload' });
}
app.post('/api/app/rules', handleSyncRules);
app.post('/api/app/rules/sync', handleSyncRules);

// 5. Version Update Check
app.get('/api/app/check-update', (req, res) => {
  const settings = readJSON(SETTINGS_FILE, {});
  const currentVersion = req.query.version || '0.0.0';
  const latestVersion = settings.appVersion || '5.28.1';
  const hasUpdate = currentVersion !== latestVersion;

  const rawUrl = settings.apkDownloadUrl || '/downloads/RiderSaathi-v5.28.1.apk';
  const apkUrl = rawUrl.startsWith('http') ? rawUrl : `${req.protocol}://${req.get('host')}${rawUrl}`;

  res.json({
    hasUpdate,
    currentVersion,
    latestVersion,
    apkUrl,
    apkFileSize: settings.apkFileSize || '11.1 MB',
    sha256File: settings.sha256File || '',
    releaseNotes: 'RiderSaathi update with improved speed, lower battery consumption, and latest Rapido/Uber/Porter support.',
    isForceUpdate: false
  });
});

// 6. Plans for Mobile App
app.get('/api/app/plans', (req, res) => {
  const plans = readJSON(PLANS_FILE, []);
  const settings = readJSON(SETTINGS_FILE, {});
  res.json({
    success: true,
    plans,
    payment: {
      upiId: settings.upiId,
      upiPayeeName: settings.upiPayeeName
    }
  });
});

// 7. In-App Order Creation
app.post('/api/app/order/create', (req, res) => {
  const { planId, phone } = req.body;
  const cleanPhone = String(phone || '').replace(/\D/g, '').slice(-10);
  if (!cleanPhone || cleanPhone.length !== 10) {
    return res.status(400).json({ success: false, message: 'Valid 10-digit mobile number required' });
  }
  const plans = readJSON(PLANS_FILE, []);
  const plan = plans.find(p => p.id === planId);
  if (!plan) {
    return res.status(404).json({ success: false, message: 'Selected plan not found' });
  }
  const settings = readJSON(SETTINGS_FILE, {});
  const orders = readJSON(ORDERS_FILE, []);
  const orderId = 'ORD-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(100 + Math.random() * 900);
  
  const upiString = `upi://pay?pa=${encodeURIComponent(settings.upiId)}&pn=${encodeURIComponent(settings.upiPayeeName)}&am=${plan.price}&cu=INR&tn=${encodeURIComponent(`${settings.siteName}_${plan.id}_${cleanPhone}`)}`;

  const order = {
    id: orderId,
    planId: plan.id,
    planName: plan.name,
    amount: plan.price,
    durationDays: plan.durationDays,
    phone: cleanPhone,
    utr: '',
    status: 'Pending Payment',
    createdAt: new Date().toISOString(),
    source: 'mobile_app'
  };

  orders.unshift(order);
  writeJSON(ORDERS_FILE, orders);

  const stats = readJSON(STATS_FILE, {});
  stats.orders = (stats.orders || 0) + 1;
  writeJSON(STATS_FILE, stats);

  res.json({
    success: true,
    orderId,
    planName: plan.name,
    amount: plan.price,
    durationDays: plan.durationDays,
    upiString,
    upiId: settings.upiId,
    upiPayeeName: settings.upiPayeeName
  });
});

// 8. In-App Submit UTR
app.post('/api/app/order/submit-utr', (req, res) => {
  const { orderId, utr } = req.body;
  if (!orderId || !utr) {
    return res.status(400).json({ success: false, message: 'Order ID and UTR/Transaction ID are required' });
  }
  const orders = readJSON(ORDERS_FILE, []);
  const order = orders.find(o => o.id === orderId);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }
  order.utr = utr.trim();
  order.status = 'Pending Verification';
  order.updatedAt = new Date().toISOString();
  writeJSON(ORDERS_FILE, orders);

  res.json({
    success: true,
    message: 'Payment UTR submitted! Admin will verify and activate your plan shortly.',
    order
  });
});

// ----------------- Admin Auth & Dashboard ----------------- //

function requireAdmin(req, res, next) {
  if (req.cookies && req.cookies.adminAuth === 'authenticated') {
    return next();
  }
  res.redirect('/admin/login');
}

app.get('/admin/login', (req, res) => {
  if (req.cookies && req.cookies.adminAuth === 'authenticated') {
    return res.redirect('/admin');
  }
  res.render('admin-login', { error: null });
});

app.post('/admin/login', (req, res) => {
  const { password } = req.body;
  const settings = readJSON(SETTINGS_FILE);
  const correctPassword = settings.adminPassword || 'admin123';

  if (password === correctPassword) {
    res.cookie('adminAuth', 'authenticated', { maxAge: 86400000, httpOnly: true });
    return res.redirect('/admin');
  }
  res.render('admin-login', { error: 'Incorrect password. (Default is admin123)' });
});

app.get('/admin/logout', (req, res) => {
  res.clearCookie('adminAuth');
  res.redirect('/admin/login');
});

// Admin Dashboard
app.get('/admin', requireAdmin, (req, res) => {
  const settings = readJSON(SETTINGS_FILE);
  const plans = readJSON(PLANS_FILE, []);
  const faqs = readJSON(FAQS_FILE, []);
  const guides = readJSON(GUIDES_FILE, []);
  const updates = readJSON(UPDATES_FILE, []);
  const inquiries = readJSON(INQUIRIES_FILE, []);
  const orders = readJSON(ORDERS_FILE, []);
  const stats = readJSON(STATS_FILE, { visitors: 0, downloads: 0 });
  const drivers = readJSON(DRIVERS_FILE, []);
  const rides = readJSON(RIDES_FILE, []);

  res.render('admin', {
    settings,
    plans,
    faqs,
    guides,
    updates,
    inquiries,
    orders,
    stats,
    drivers,
    rides
  });
});

// ----------------- Admin API Endpoints ----------------- //

// Update General Settings
app.post('/api/admin/settings', requireAdmin, (req, res) => {
  const current = readJSON(SETTINGS_FILE);
  const updated = { ...current, ...req.body };
  writeJSON(SETTINGS_FILE, updated);
  res.json({ success: true });
});

// Add Plan
app.post('/api/admin/plans/add', requireAdmin, (req, res) => {
  const plans = readJSON(PLANS_FILE, []);
  const newPlan = req.body;
  if (!newPlan.id || !newPlan.name || !newPlan.price) {
    return res.status(400).json({ success: false, message: 'Invalid plan details' });
  }
  plans.push(newPlan);
  writeJSON(PLANS_FILE, plans);
  res.json({ success: true });
});

// Delete Plan
app.post('/api/admin/plans/delete/:id', requireAdmin, (req, res) => {
  let plans = readJSON(PLANS_FILE, []);
  plans = plans.filter(p => p.id !== req.params.id);
  writeJSON(PLANS_FILE, plans);
  res.json({ success: true });
});

// Update Order Status
app.post('/api/admin/orders/:id/status', requireAdmin, (req, res) => {
  const orders = readJSON(ORDERS_FILE, []);
  const order = orders.find(o => o.id === req.params.id);
  if (order) {
    order.status = req.body.status || 'Activated';
    order.updatedAt = new Date().toISOString();
    writeJSON(ORDERS_FILE, orders);
    return res.json({ success: true });
  }
  res.status(404).json({ success: false, message: 'Order not found' });
});

// Order Approve & Instant Driver Subscription Activation
app.post('/api/admin/orders/:id/approve-activate', requireAdmin, (req, res) => {
  const orders = readJSON(ORDERS_FILE, []);
  const order = orders.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }
  order.status = 'Activated';
  order.updatedAt = new Date().toISOString();
  writeJSON(ORDERS_FILE, orders);

  const drivers = readJSON(DRIVERS_FILE, []);
  const cleanPhone = String(order.phone).replace(/\D/g, '').slice(-10);
  let driver = drivers.find(d => d.phone.replace(/\D/g, '').slice(-10) === cleanPhone);

  const days = parseInt(order.durationDays) || 7;
  const now = new Date();

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
        planId: order.planId,
        planName: order.planName,
        startsAt: now.toISOString(),
        expiresAt: newExpiry.toISOString()
      },
      filterRules: {
        minFare: 50,
        maxPickupDistanceKm: 2.5,
        minFarePerKm: 12,
        platforms: { rapido: true, uber: true, porter: true, ola: true },
        passengers: true,
        parcels: true,
        autoAccept: true,
        voiceAlert: true
      },
      status: 'active',
      totalRidesAccepted: 0,
      createdAt: now.toISOString(),
      lastActiveAt: now.toISOString()
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
      planId: order.planId,
      planName: order.planName,
      startsAt: now.toISOString(),
      expiresAt: newExpiry.toISOString()
    };
    driver.status = 'active';
  }

  writeJSON(DRIVERS_FILE, drivers);

  res.json({
    success: true,
    message: `Order approved! Driver ${cleanPhone} activated for ${days} days.`,
    order,
    driver
  });
});

// Driver Management: Grant Subscription Days
app.post('/api/admin/drivers/grant-subscription', requireAdmin, (req, res) => {
  const { driverId, days, planName } = req.body;
  const drivers = readJSON(DRIVERS_FILE, []);
  const driver = drivers.find(d => d.id === driverId || d.phone === driverId);
  if (!driver) {
    return res.status(404).json({ success: false, message: 'Driver not found' });
  }

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
    expiresAt: newExpiry.toISOString()
  };
  driver.status = 'active';
  writeJSON(DRIVERS_FILE, drivers);

  res.json({ success: true, message: `Granted ${durationDays} days to driver ${driver.phone}`, driver });
});

// Driver Management: Grant Extra Free Trial Rides
app.post('/api/admin/drivers/grant-trial', requireAdmin, (req, res) => {
  const { driverId, extraRides } = req.body;
  const drivers = readJSON(DRIVERS_FILE, []);
  const driver = drivers.find(d => d.id === driverId || d.phone === driverId);
  if (!driver) {
    return res.status(404).json({ success: false, message: 'Driver not found' });
  }
  const ridesToAdd = parseInt(extraRides) || 10;
  driver.trialRidesTotal = (driver.trialRidesTotal || 10) + ridesToAdd;
  driver.isTrialActive = true;
  writeJSON(DRIVERS_FILE, drivers);

  res.json({ success: true, message: `Added ${ridesToAdd} free rides to ${driver.phone}`, driver });
});

// Driver Management: Toggle Ban / Active Status
app.post('/api/admin/drivers/toggle-status', requireAdmin, (req, res) => {
  const { driverId } = req.body;
  const drivers = readJSON(DRIVERS_FILE, []);
  const driver = drivers.find(d => d.id === driverId || d.phone === driverId);
  if (!driver) {
    return res.status(404).json({ success: false, message: 'Driver not found' });
  }
  driver.status = driver.status === 'banned' ? 'active' : 'banned';
  writeJSON(DRIVERS_FILE, drivers);

  res.json({ success: true, message: `Driver status changed to ${driver.status}`, driver });
});

// Update Inquiry Status
app.post('/api/admin/inquiries/:id/status', requireAdmin, (req, res) => {
  const inquiries = readJSON(INQUIRIES_FILE, []);
  const inquiry = inquiries.find(i => i.id === req.params.id);
  if (inquiry) {
    inquiry.status = req.body.status || 'Resolved';
    writeJSON(INQUIRIES_FILE, inquiries);
    return res.json({ success: true });
  }
  res.status(404).json({ success: false, message: 'Inquiry not found' });
});

// Add FAQ
app.post('/api/admin/faq/add', requireAdmin, (req, res) => {
  const faqs = readJSON(FAQS_FILE, []);
  const { q, a } = req.body;
  if (!q || !a) return res.status(400).json({ success: false, message: 'Missing question or answer' });
  const newFaq = { id: Date.now(), q: String(q).trim(), a: String(a).trim() };
  faqs.push(newFaq);
  writeJSON(FAQS_FILE, faqs);
  res.json({ success: true, faq: newFaq });
});

// Delete FAQ
app.post('/api/admin/faq/delete/:id', requireAdmin, (req, res) => {
  let faqs = readJSON(FAQS_FILE, []);
  faqs = faqs.filter(f => String(f.id) !== String(req.params.id));
  writeJSON(FAQS_FILE, faqs);
  res.json({ success: true });
});

// Change Password
app.post('/api/admin/password', requireAdmin, (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
  }
  const settings = readJSON(SETTINGS_FILE);
  settings.adminPassword = newPassword;
  writeJSON(SETTINGS_FILE, settings);
  res.json({ success: true });
});

// Export Complete Data Backup
app.get('/api/admin/backup/export', requireAdmin, (req, res) => {
  const backup = {
    exportedAt: new Date().toISOString(),
    settings: readJSON(SETTINGS_FILE),
    plans: readJSON(PLANS_FILE),
    faqs: readJSON(FAQS_FILE),
    guides: readJSON(GUIDES_FILE),
    updates: readJSON(UPDATES_FILE),
    orders: readJSON(ORDERS_FILE),
    inquiries: readJSON(INQUIRIES_FILE),
    drivers: readJSON(DRIVERS_FILE),
    rides: readJSON(RIDES_FILE),
    stats: readJSON(STATS_FILE)
  };
  res.setHeader('Content-Disposition', 'attachment; filename=ridersaathi-backup.json');
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(backup, null, 2));
});

// Start Server
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 RiderSaathi Website running at: http://localhost:${PORT}`);
  console.log(`🔐 Admin Panel available at:        http://localhost:${PORT}/admin`);
  console.log(`⚡ Mobile App APIs available at:    http://localhost:${PORT}/api/app`);
  console.log(`📚 API Docs available at:           http://localhost:${PORT}/api/docs`);
  console.log(`🔑 Default Admin Password:          admin123`);
  console.log(`===============================================`);
});
