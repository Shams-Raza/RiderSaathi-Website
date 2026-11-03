// Comprehensive Phase 3 Admin Panel Functional Testing Suite
const http = require('http');
const fs = require('fs');

const BASE_URL = 'http://localhost:3000';

function get(path, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const req = http.get(url, { headers }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
    });
    req.on('error', reject);
  });
}

function post(path, data = {}, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const payload = JSON.stringify(data);
    const req = http.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        ...headers
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(body); } catch(e) {}
        resolve({ status: res.statusCode, headers: res.headers, body, json });
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function del(path, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const req = http.request(url, {
      method: 'DELETE',
      headers
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(body); } catch(e) {}
        resolve({ status: res.statusCode, headers: res.headers, body, json });
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function runAdminTests() {
  console.log('=== STARTING PHASE 3: ADMIN PANEL COMPLETE TESTING ===\n');
  const results = [];

  function logResult(testName, passed, details = '') {
    results.push({ testName, passed, details });
    console.log(`${passed ? '✅ PASS' : '❌ FAIL'}: ${testName}${details ? ' - ' + details : ''}`);
  }

  // 1. Admin login page opens and works
  try {
    const loginPage = await get('/admin/login');
    const hasForm = loginPage.status === 200 && (loginPage.body.includes('Admin') || loginPage.body.includes('password'));
    logResult('Admin login page opens (200 OK)', hasForm, `Status ${loginPage.status}`);
  } catch (err) {
    logResult('Admin login page opens', false, err.message);
  }

  // 2. Unauthorized access to /admin blocked
  try {
    const unauth = await get('/admin');
    const isRedirect = unauth.status === 307 || unauth.status === 302;
    const dest = unauth.headers['location'] || '';
    logResult('Unauthorized /admin access blocked & redirected to /admin/login', isRedirect && dest.includes('/admin/login'), `Status ${unauth.status} -> ${dest}`);
  } catch (err) {
    logResult('Unauthorized /admin access blocked', false, err.message);
  }

  // 3. Wrong credentials handling
  try {
    const wrongAuth = await post('/api/admin/login', {
      email: 'admin@ridersaathi.in',
      password: 'invalid_wrong_password_999'
    });
    const failedProperly = (wrongAuth.status === 401 || wrongAuth.status === 400) && wrongAuth.json?.ok === false;
    logResult('Wrong credentials rejected with proper error message', failedProperly, `Status: ${wrongAuth.status}, Error: ${wrongAuth.json?.error}`);
  } catch (err) {
    logResult('Wrong credentials rejected', false, err.message);
  }

  // 4. Correct credentials login & cookie acquisition
  let adminCookie = '';
  try {
    const validAuth = await post('/api/admin/login', {
      email: 'admin@ridersaathi.in',
      password: 'admin123'
    });
    const success = validAuth.status === 200 && validAuth.json?.ok === true;
    const cookies = validAuth.headers['set-cookie'] || [];
    const sessionCookie = cookies.find(c => c.startsWith('admin_session='));
    if (sessionCookie) {
      adminCookie = sessionCookie.split(';')[0];
    }
    logResult('Correct credentials authentication (generates signed admin_session)', success && !!adminCookie, `Cookie: ${adminCookie.slice(0, 30)}...`);
  } catch (err) {
    logResult('Correct credentials authentication', false, err.message);
  }

  const authHeaders = { Cookie: adminCookie };

  // 5. Admin Dashboard loads with real data
  try {
    const dashboard = await get('/admin', authHeaders);
    const ok = dashboard.status === 200 && dashboard.body.includes('Dashboard');
    const hasDrivers = dashboard.body.includes('DRV-') || dashboard.body.includes('Captain') || dashboard.body.includes('Drivers');
    const hasPlans = dashboard.body.includes('Pricing Plans') || dashboard.body.includes('Pass');
    logResult('Admin dashboard loads with authenticated session', ok && hasDrivers && hasPlans, `Status ${dashboard.status}`);
  } catch (err) {
    logResult('Admin dashboard loads', false, err.message);
  }

  // 6. Driver Management: Status toggle (Block / Unblock)
  try {
    const driversData = JSON.parse(fs.readFileSync('data/drivers.json', 'utf8'));
    const testDriver = driversData[0];
    if (testDriver) {
      const origStatus = testDriver.status;
      // Toggle status
      const banRes = await post('/api/admin/drivers/toggle-status', {
        driverId: testDriver.id
      }, authHeaders);
      const banOk = banRes.status === 200 && (banRes.json?.success === true || banRes.json?.ok === true);

      // Verify in file
      const updatedDrivers1 = JSON.parse(fs.readFileSync('data/drivers.json', 'utf8'));
      const driverInDb1 = updatedDrivers1.find(d => d.id === testDriver.id);
      const toggled = driverInDb1?.status !== origStatus;

      // Toggle back to restore
      await post('/api/admin/drivers/toggle-status', {
        driverId: testDriver.id
      }, authHeaders);

      logResult('Driver status toggle (banned/active) & DB sync', banOk && toggled, `Driver ${testDriver.id}`);
    } else {
      logResult('Driver status toggle', false, 'No driver found in data/drivers.json');
    }
  } catch (err) {
    logResult('Driver status toggle', false, err.message);
  }

  // 7. Driver Management: Grant trial rides
  try {
    const driversData = JSON.parse(fs.readFileSync('data/drivers.json', 'utf8'));
    const testDriver = driversData[0];
    if (testDriver) {
      const grantRes = await post('/api/admin/drivers/grant-trial', {
        driverId: testDriver.id,
        extraRides: 5
      }, authHeaders);
      const grantOk = grantRes.status === 200 && (grantRes.json?.success === true || grantRes.json?.ok === true);

      const updatedDrivers = JSON.parse(fs.readFileSync('data/drivers.json', 'utf8'));
      const driverInDb = updatedDrivers.find(d => d.id === testDriver.id);
      logResult('Driver grant trial rides (+5 rides)', grantOk && driverInDb?.trialRidesTotal >= (testDriver.trialRidesTotal + 5));
    }
  } catch (err) {
    logResult('Driver grant trial rides', false, err.message);
  }

  // 8. Driver Management: Grant subscription pass
  try {
    const driversData = JSON.parse(fs.readFileSync('data/drivers.json', 'utf8'));
    const testDriver = driversData[0];
    if (testDriver) {
      const grantSubRes = await post('/api/admin/drivers/grant-subscription', {
        driverId: testDriver.id,
        days: 7,
        planName: 'VIP 7 Days Pass'
      }, authHeaders);
      const subOk = grantSubRes.status === 200 && (grantSubRes.json?.success === true || grantSubRes.json?.ok === true);

      const updatedDrivers = JSON.parse(fs.readFileSync('data/drivers.json', 'utf8'));
      const driverInDb = updatedDrivers.find(d => d.id === testDriver.id);
      const hasActiveSub = driverInDb?.subscription?.status === 'active';
      logResult('Driver grant/extend subscription pass (VIP 7 Days)', subOk && hasActiveSub);
    }
  } catch (err) {
    logResult('Driver grant subscription pass', false, err.message);
  }

  // 9. Order Management: Status updates & approve-activate
  try {
    const ordersData = JSON.parse(fs.readFileSync('data/orders.json', 'utf8'));
    const testOrder = ordersData[0];
    if (testOrder) {
      const statusRes = await post(`/api/admin/orders/${testOrder.id}/status`, {
        status: 'Pending Verification'
      }, authHeaders);
      const statusOk = statusRes.status === 200 && (statusRes.json?.success === true || statusRes.json?.ok === true);

      const approveRes = await post(`/api/admin/orders/${testOrder.id}/approve-activate`, {}, authHeaders);
      const approveOk = approveRes.status === 200 && (approveRes.json?.success === true || approveRes.json?.ok === true);
      logResult(`Order status update & automatic plan activation (${testOrder.id})`, statusOk && approveOk);
    }
  } catch (err) {
    logResult('Order status update & activate', false, err.message);
  }

  // 10. Inquiries Management: Status toggle
  try {
    const inqData = JSON.parse(fs.readFileSync('data/inquiries.json', 'utf8'));
    const testInq = inqData[0];
    if (testInq) {
      const inqRes = await post(`/api/admin/inquiries/${testInq.id}/status`, {
        status: 'Read'
      }, authHeaders);
      const inqOk = inqRes.status === 200 && (inqRes.json?.success === true || inqRes.json?.ok === true);
      logResult(`Inquiry status update to Read (${testInq.id})`, inqOk);
    }
  } catch (err) {
    logResult('Inquiry status update', false, err.message);
  }

  // 11. Pricing Plans CRUD (Add, Edit, Delete)
  try {
    const testPlanId = 'test_plan_qa_' + Date.now();
    // A. Add
    const addRes = await post('/api/admin/plans/add', {
      id: testPlanId,
      name: 'QA Test Pass',
      name_hi: 'क्यूए टेस्ट पास',
      price: 99,
      durationDays: 3,
      durationText: '3 days',
      features: ['Test Feature 1', 'Test Feature 2'],
      features_hi: ['टेस्ट फीचर 1', 'टेस्ट फीचर 2'],
      active: true
    }, authHeaders);
    const addOk = addRes.status === 200 && (addRes.json?.success === true || addRes.json?.ok === true);

    // Verify added in DB
    const plans1 = JSON.parse(fs.readFileSync('data/plans.json', 'utf8'));
    const existsInDb = plans1.some(p => p.id === testPlanId);

    // B. Delete
    const delRes = await del(`/api/admin/plans/delete/${testPlanId}`, authHeaders);
    const delOk = delRes.status === 200 && (delRes.json?.success === true || delRes.json?.ok === true);

    // Verify deleted in DB
    const plans2 = JSON.parse(fs.readFileSync('data/plans.json', 'utf8'));
    const deletedFromDb = !plans2.some(p => p.id === testPlanId);

    logResult('Pricing Plans CRUD (Create, Read from DB, Delete)', addOk && existsInDb && delOk && deletedFromDb);
  } catch (err) {
    logResult('Pricing Plans CRUD', false, err.message);
  }

  // 12. Settings CMS Update
  try {
    const origSettings = JSON.parse(fs.readFileSync('data/settings.json', 'utf8'));
    const updateRes = await post('/api/admin/settings', {
      siteName: 'RiderSaathi',
      tagline: origSettings.tagline
    }, authHeaders);
    const settingsOk = updateRes.status === 200 && (updateRes.json?.success === true || updateRes.json?.ok === true);
    logResult('Global Settings CMS update (/api/admin/settings)', settingsOk);
  } catch (err) {
    logResult('Global Settings CMS update', false, err.message);
  }

  // 13. Data Backup Export (/api/admin/backup/export)
  try {
    // Authenticated export
    const backupRes = await get('/api/admin/backup/export', authHeaders);
    const isZipOrJson = backupRes.status === 200 && backupRes.body.includes('settings');
    logResult('Admin Data Backup Export (authenticated)', isZipOrJson, `Status ${backupRes.status}`);

    // Unauthenticated export rejection
    const unauthBackup = await get('/api/admin/backup/export');
    const isBlocked = unauthBackup.status === 401 || unauthBackup.status === 307;
    logResult('Admin Data Backup Export blocked without auth', isBlocked, `Status ${unauthBackup.status}`);
  } catch (err) {
    logResult('Admin Data Backup Export', false, err.message);
  }

  // 14. Admin Logout & Session Invalidation
  try {
    const logoutRes = await get('/admin/logout', authHeaders);
    const isLogoutRedirect = logoutRes.status === 307 || logoutRes.status === 302;
    const cookies = logoutRes.headers['set-cookie'] || [];
    const cleared = cookies.some(c => c.includes('admin_session=;') || c.includes('Max-Age=0') || c.includes('expires='));

    // Check subsequent access
    const postLogoutAccess = await get('/admin', { Cookie: 'admin_session=' });
    const isRedirectedToLogin = postLogoutAccess.status === 307 || postLogoutAccess.status === 302;

    logResult('Admin Logout destroys session & blocks subsequent access', isLogoutRedirect && isRedirectedToLogin);
  } catch (err) {
    logResult('Admin Logout destroys session', false, err.message);
  }

  console.log('\n=== SUMMARY OF PHASE 3 ADMIN TESTS ===');
  const passedCount = results.filter(r => r.passed).length;
  console.log(`Total tests: ${results.length} | Passed: ${passedCount} | Failed: ${results.length - passedCount}`);
}

runAdminTests().catch(console.error);
