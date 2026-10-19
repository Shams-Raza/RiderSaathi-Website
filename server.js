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

  const apkPath = path.join(__dirname, 'public', 'downloads', 'RiderSaathi-v5.28.1.apk');
  if (fs.existsSync(apkPath)) {
    res.download(apkPath, 'RiderSaathi.apk');
  } else {
    res.redirect('/install');
  }
});

// Buy a Plan
app.get('/buy', (req, res) => {
  const plans = readJSON(PLANS_FILE, []);
  res.render('buy', {
    title: `Buy a ${res.locals.settings.siteName} Plan`,
    description: `Buy a plan with your mobile number. Pay by UPI.`,
    plans,
    phone: req.query.phone || ''
  });
});

app.post('/buy', (req, res) => {
  const { phone, planId } = req.body;
  const plans = readJSON(PLANS_FILE, []);
  const selectedPlan = plans.find(p => p.id === planId) || plans[0];

  const orderId = 'ORD-' + Date.now().toString(36).toUpperCase();
  const order = {
    id: orderId,
    phone: phone ? phone.trim() : '',
    planId: selectedPlan.id,
    planName: selectedPlan.name,
    price: selectedPlan.price,
    durationText: selectedPlan.durationText,
    status: 'Pending Payment',
    upiRef: '',
    createdAt: new Date().toISOString()
  };

  const orders = readJSON(ORDERS_FILE, []);
  orders.unshift(order);
  writeJSON(ORDERS_FILE, orders);

  const stats = readJSON(STATS_FILE, {});
  stats.orders = (stats.orders || 0) + 1;
  writeJSON(STATS_FILE, stats);

  res.redirect(`/buy/upi?orderId=${orderId}`);
});

// UPI Payment Page
app.get('/buy/upi', (req, res) => {
  const { orderId } = req.query;
  const orders = readJSON(ORDERS_FILE, []);
  const order = orders.find(o => o.id === orderId);

  if (!order) {
    return res.redirect('/buy');
  }

  const plans = readJSON(PLANS_FILE, []);
  const plan = plans.find(p => p.id === order.planId) || { name: order.planName, price: order.price, durationText: order.durationText };

  res.render('buy-upi', {
    title: `Pay ₹${order.price} via UPI — ${res.locals.settings.siteName}`,
    order,
    plan
  });
});

// Confirm Payment
app.post('/buy/confirm', (req, res) => {
  const { orderId, upiRef } = req.body;
  const orders = readJSON(ORDERS_FILE, []);
  const order = orders.find(o => o.id === orderId);

  if (order) {
    order.upiRef = (upiRef || '').trim();
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

  res.render('admin', {
    settings,
    plans,
    faqs,
    guides,
    updates,
    inquiries,
    orders,
    stats
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
  if (!q || !a) return res.status(400).json({ success: false, message: 'Missing fields' });
  faqs.push({ id: Date.now(), q, a });
  writeJSON(FAQS_FILE, faqs);
  res.json({ success: true });
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
  console.log(`🔑 Default Admin Password:          admin123`);
  console.log(`===============================================`);
});
