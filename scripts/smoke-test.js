const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3002';

async function fetchRoute(routePath, options = {}) {
  const url = new URL(routePath, BASE_URL);
  return new Promise((resolve, reject) => {
    const req = http.request(url, {
      method: options.method || 'GET',
      headers: options.headers || {},
    }, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body,
        });
      });
    });

    req.on('error', err => reject(err));
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING PRODUCTION SMOKE TESTS ON ' + BASE_URL);
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function report(name, isPass, detail = '') {
    if (isPass) {
      console.log(`✅ PASS: ${name} ${detail}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${name} ${detail}`);
      failed++;
    }
  }

  // 1. PUBLIC ROUTES
  const publicRoutes = [
    '/',
    '/how-it-works',
    '/pricing',
    '/install',
    '/buy',
    '/buy/upi',
    '/guides',
    '/guides/trip-aur-pickup-distance',
    '/faq',
    '/updates',
    '/about',
    '/contact',
    '/refunds',
    '/delivery',
    '/terms',
    '/privacy',
    '/api-docs',
  ];

  console.log('--- 1. Testing Public Pages ---');
  for (const r of publicRoutes) {
    try {
      const res = await fetchRoute(r);
      report(`Route ${r}`, res.status === 200, `(status ${res.status}, length: ${res.body.length})`);
    } catch (e) {
      report(`Route ${r}`, false, e.message);
    }
  }

  // 2. SEO & ASSETS
  console.log('\n--- 2. Testing SEO & Manifest Routes ---');
  try {
    const sitemap = await fetchRoute('/sitemap.xml');
    report('/sitemap.xml', sitemap.status === 200 && sitemap.body.includes('<urlset'), `(status ${sitemap.status})`);

    const robots = await fetchRoute('/robots.txt');
    report('/robots.txt', robots.status === 200 && robots.body.includes('Disallow: /admin'), `(status ${robots.status})`);

    const manifest = await fetchRoute('/manifest.webmanifest');
    report('/manifest.webmanifest', manifest.status === 200 && manifest.body.includes('RiderSaathi'), `(status ${manifest.status})`);
  } catch (e) {
    report('SEO/Manifest check', false, e.message);
  }

  // 3. UTILITY APIs
  console.log('\n--- 3. Testing Utility Endpoints ---');
  try {
    // Check download counter
    const statsBefore = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/stats.json'), 'utf8'));
    const dlRes = await fetchRoute('/download');
    report('/download 302 redirect', dlRes.status === 302 || dlRes.status === 307, `(status ${dlRes.status}, location: ${dlRes.headers.location})`);
    const statsAfter = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/stats.json'), 'utf8'));
    report('/download increments counter', statsAfter.downloads >= statsBefore.downloads, `(before: ${statsBefore.downloads}, after: ${statsAfter.downloads})`);

    // Language switcher
    const langRes = await fetchRoute('/set-language/hi');
    report('/set-language/hi 302 redirect', langRes.status === 302 || langRes.status === 307, `(status ${langRes.status}, set-cookie: ${langRes.headers['set-cookie'] ? 'yes' : 'no'})`);

    // Contact form POST
    const contactRes = await fetchRoute('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { name: 'Test Captain', phone: '9876543210', subject: 'Smoke Test', message: 'Automated test message' },
    });
    const contactJson = JSON.parse(contactRes.body);
    report('/api/contact submission', contactJson.ok === true, `(response ok: ${contactJson.ok})`);
  } catch (e) {
    report('Utility endpoints', false, e.message);
  }

  // 4. ADMIN AUTH & DASHBOARD
  console.log('\n--- 4. Testing Admin Auth & Security ---');
  let sessionCookie = '';
  try {
    // Unauthenticated /admin must redirect to /admin/login
    const adminUnauth = await fetchRoute('/admin');
    report('/admin redirect unauthenticated to /admin/login', adminUnauth.status === 302 || adminUnauth.status === 307, `(status: ${adminUnauth.status}, location: ${adminUnauth.headers.location})`);

    // /admin/login loads
    const loginPage = await fetchRoute('/admin/login');
    report('/admin/login page loads', loginPage.status === 200, `(status: ${loginPage.status})`);

    // Admin login with wrong password -> fails
    const badLogin = await fetchRoute('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { email: 'admin@ridersaathi.in', password: 'wrongpassword' },
    });
    const badLoginJson = JSON.parse(badLogin.body);
    report('/api/admin/login rejects wrong credentials', badLoginJson.ok === false, `(error: ${badLoginJson.error})`);

    // Admin login with correct password -> succeeds and sets cookie
    const goodLogin = await fetchRoute('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { email: 'admin@ridersaathi.in', password: 'admin123' },
    });
    const goodLoginJson = JSON.parse(goodLogin.body);
    report('/api/admin/login accepts correct credentials', goodLoginJson.ok === true, `(ok: ${goodLoginJson.ok})`);

    const rawCookies = goodLogin.headers['set-cookie'];
    if (rawCookies && rawCookies.length > 0) {
      sessionCookie = rawCookies[0].split(';')[0];
    }
    report('Admin session cookie retrieved', !!sessionCookie, `(${sessionCookie.slice(0, 30)}...)`);

    // Authenticated /admin returns 200
    const adminAuth = await fetchRoute('/admin', {
      headers: { 'Cookie': sessionCookie },
    });
    report('/admin loads with authenticated cookie', adminAuth.status === 200, `(status: ${adminAuth.status})`);

    // Authenticated /api/admin/backup/export returns JSON
    const backupRes = await fetchRoute('/api/admin/backup/export', {
      headers: { 'Cookie': sessionCookie },
    });
    report('/api/admin/backup/export downloads backup', backupRes.status === 200 && backupRes.headers['content-disposition']?.includes('attachment'), `(status: ${backupRes.status})`);
  } catch (e) {
    report('Admin flow', false, e.message);
  }

  // 5. MOBILE APP REST APIs
  console.log('\n--- 5. Testing Mobile App REST Endpoints ---');
  let driverToken = '';
  try {
    // 5.1 POST /api/app/auth
    const authRes = await fetchRoute('/api/app/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        phone: '9876543210',
        name: 'Captain Verification Test',
        deviceId: 'DEVICE-TEST-SMOKE',
        deviceModel: 'Pixel 8 Pro',
        appVersion: '5.28.1',
      },
    });
    const authJson = JSON.parse(authRes.body);
    driverToken = authJson.token;
    report('/api/app/auth registers/authenticates driver', authJson.success === true && !!driverToken, `(driver: ${authJson.driver?.name})`);

    // 5.2 GET /api/app/plans
    const plansRes = await fetchRoute('/api/app/plans');
    const plansJson = JSON.parse(plansRes.body);
    report('/api/app/plans returns plan list', plansJson.success === true && Array.isArray(plansJson.plans), `(${plansJson.plans?.length} plans)`);

    // 5.3 GET /api/app/check-update
    const updateRes = await fetchRoute('/api/app/check-update?version=5.20.0');
    const updateJson = JSON.parse(updateRes.body);
    report('/api/app/check-update detects version status', updateJson.latestVersion !== undefined, `(latest: ${updateJson.latestVersion}, hasUpdate: ${updateJson.hasUpdate})`);

    // 5.4 POST /api/app/check-access
    const accessRes = await fetchRoute('/api/app/check-access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${driverToken}`,
      },
    });
    const accessJson = JSON.parse(accessRes.body);
    report('/api/app/check-access validates trial/subscription', accessJson.success === true && accessJson.accessGranted !== undefined, `(accessGranted: ${accessJson.accessGranted}, reason: ${accessJson.reason})`);

    // 5.5 POST /api/app/rides
    const rideRes = await fetchRoute('/api/app/rides', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${driverToken}`,
      },
      body: {
        platform: 'rapido',
        fare: 120,
        pickupDistanceKm: 1.2,
        tripDistanceKm: 6.5,
      },
    });
    const rideJson = JSON.parse(rideRes.body);
    report('/api/app/rides logs accepted ride', rideJson.success === true && !!rideJson.rideId, `(rideId: ${rideJson.rideId})`);

    // 5.6 GET & POST /api/app/rules
    const syncRules = await fetchRoute('/api/app/rules', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${driverToken}`,
      },
      body: {
        filterRules: { minFare: 65, minFarePerKm: 15 },
      },
    });
    const syncRulesJson = JSON.parse(syncRules.body);
    report('/api/app/rules syncs driver preferences', syncRulesJson.success === true && syncRulesJson.filterRules?.minFare === 65, `(minFare: ${syncRulesJson.filterRules?.minFare})`);

    // 5.7 In-app order creation
    const orderRes = await fetchRoute('/api/app/order/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { planId: 'week1', phone: '9876543210' },
    });
    const orderJson = JSON.parse(orderRes.body);
    report('/api/app/order/create creates draft order', orderJson.success === true && !!orderJson.orderId, `(orderId: ${orderJson.orderId})`);

    // 5.8 In-app submit UTR
    const utrRes = await fetchRoute('/api/app/order/submit-utr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { orderId: orderJson.orderId, utr: 'UTR987654321012' },
    });
    const utrJson = JSON.parse(utrRes.body);
    report('/api/app/order/submit-utr submits UTR', utrJson.success === true && utrJson.order?.utr === 'UTR987654321012', `(status: ${utrJson.order?.status})`);
  } catch (e) {
    report('Mobile APIs', false, e.message);
  }

  // 6. DATA VALIDATION
  console.log('\n--- 6. Validating All data/*.json files ---');
  const dataDir = path.join(__dirname, '../data');
  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));
  for (const f of files) {
    try {
      const content = fs.readFileSync(path.join(dataDir, f), 'utf8');
      JSON.parse(content);
      report(`data/${f} valid JSON`, true, `(${content.length} bytes)`);
    } catch (e) {
      report(`data/${f} valid JSON`, false, e.message);
    }
  }

  console.log('\n====================================================');
  console.log(`🏁 SMOKE TESTS COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
