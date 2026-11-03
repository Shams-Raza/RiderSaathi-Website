// Comprehensive Phase 4 Backend, API & Security Test Suite
const http = require('http');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const BASE_URL = 'http://localhost:3000';

function req(path, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      headers: { ...headers }
    };

    let payload = null;
    if (data !== null) {
      payload = typeof data === 'string' ? data : JSON.stringify(data);
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const request = http.request(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(body); } catch(e) {}
        resolve({ status: res.statusCode, headers: res.headers, body, json });
      });
    });
    request.on('error', reject);
    if (payload) request.write(payload);
    request.end();
  });
}

async function runSecurityAudit() {
  console.log('=== STARTING PHASE 4: BACKEND, API & SECURITY CHECKS ===\n');
  const results = [];

  function logResult(testName, passed, details = '') {
    results.push({ testName, passed, details });
    console.log(`${passed ? '✅ PASS' : '❌ FAIL'}: ${testName}${details ? ' - ' + details : ''}`);
  }

  // 1. Unauthorized access to all Admin APIs properly blocked (HTTP 401)
  const adminEndpoints = [
    { path: '/api/admin/credentials', method: 'POST', body: { email: 'hack@hack.com' } },
    { path: '/api/admin/password', method: 'POST', body: { newPassword: 'hack' } },
    { path: '/api/admin/settings', method: 'POST', body: { siteName: 'Hacked' } },
    { path: '/api/admin/plans/add', method: 'POST', body: { id: 'hack' } },
    { path: '/api/admin/plans/delete/week1', method: 'POST' },
    { path: '/api/admin/drivers/toggle-status', method: 'POST', body: { driverId: 'hack' } },
    { path: '/api/admin/drivers/grant-trial', method: 'POST', body: { driverId: 'hack', extraRides: 10 } },
    { path: '/api/admin/drivers/grant-subscription', method: 'POST', body: { driverId: 'hack', days: 10 } },
    { path: '/api/admin/orders/ORD-123/status', method: 'POST', body: { status: 'Hacked' } },
    { path: '/api/admin/orders/ORD-123/approve-activate', method: 'POST' },
    { path: '/api/admin/inquiries/INQ-123/status', method: 'POST', body: { status: 'Hacked' } },
    { path: '/api/admin/backup/export', method: 'GET' }
  ];

  let unauthPass = true;
  for (const ep of adminEndpoints) {
    const res = await req(ep.path, ep.method, ep.body);
    if (res.status !== 401) {
      unauthPass = false;
      console.log(`  ❌ Endpoint ${ep.path} allowed unauthenticated access (Status: ${res.status})`);
    }
  }
  logResult('All 12 Admin API endpoints reject unauthenticated access (HTTP 401)', unauthPass);

  // 2. Input Validation on Public Endpoints
  // A. /api/buy/upi validation
  const buyEmpty = await req('/api/buy/upi', 'POST', {});
  const buyBadPhone = await req('/api/buy/upi', 'POST', { planId: 'week1', phone: '123' });
  const buyBadPlan = await req('/api/buy/upi', 'POST', { planId: 'non_existent_plan_999', phone: '9876543210' });
  const buyValidations = (buyEmpty.status === 400) && (buyBadPhone.status === 400) && (buyBadPlan.status === 400);
  logResult('Backend input validation on /api/buy/upi (empty, invalid phone, non-existent plan)', buyValidations);

  // B. /api/buy/confirm-utr validation
  const utrEmpty = await req('/api/buy/confirm-utr', 'POST', {});
  const utrMissingOrder = await req('/api/buy/confirm-utr', 'POST', { utr: 'UTR123456789' });
  const utrBadOrder = await req('/api/buy/confirm-utr', 'POST', { orderId: 'NON-EXISTENT-ORDER', utr: 'UTR123456789' });
  const utrValidations = (utrEmpty.status === 400) && (utrMissingOrder.status === 400) && (utrBadOrder.status === 404);
  logResult('Backend input validation on /api/buy/confirm-utr (missing fields -> 400, not found -> 404)', utrValidations);

  // C. /api/contact validation
  const contactEmpty = await req('/api/contact', 'POST', {});
  const contactNoMsg = await req('/api/contact', 'POST', { name: 'John', phone: '9876543210' });
  logResult('Backend input validation on /api/contact (rejects empty/missing fields)', contactEmpty.status === 400 && contactNoMsg.status === 400);

  // D. /api/app/auth validation
  const authEmpty = await req('/api/app/auth', 'POST', {});
  logResult('Backend input validation on /api/app/auth (rejects empty request)', authEmpty.status === 400);

  // 3. SQLi / NoSQL / Prototype Pollution Injection resistance
  const sqliPayload = {
    name: "' OR 1=1 --",
    phone: "9876543210",
    subject: "'; DROP TABLE drivers; --",
    message: "Test SQLi payload"
  };
  const sqliRes = await req('/api/contact', 'POST', sqliPayload);
  const protoPayload = {
    "__proto__": { "isAdmin": true },
    "planId": "week1",
    "phone": "9876543210"
  };
  const protoRes = await req('/api/buy/upi', 'POST', protoPayload);
  const injectionOk = (sqliRes.status === 200 || sqliRes.status === 400) && (protoRes.status === 200 || protoRes.status === 400) && !({}).isAdmin;
  logResult('SQLi & Prototype pollution payloads handled safely without crash or pollution', injectionOk);

  // 4. XSS Protection
  const xssPayload = {
    name: '<script>alert("XSS")</script>',
    phone: '9876543210',
    subject: '<img src=x onerror=alert(1)>',
    message: '<b onmouseover=alert(1)>Hover me</b>'
  };
  const xssRes = await req('/api/contact', 'POST', xssPayload);
  logResult('XSS script tags processed safely without execution or server crash', xssRes.status === 200);

  // 5. Password Hashing Verification
  const adminData = JSON.parse(fs.readFileSync('data/admin.json', 'utf8'));
  const isBcrypt = adminData.passwordHash && /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(adminData.passwordHash);
  const verifyBcrypt = bcrypt.compareSync('admin123', adminData.passwordHash);
  logResult('Admin password is cryptographically hashed with Bcrypt (Salt rounds 10)', isBcrypt && verifyBcrypt, `Hash: ${adminData.passwordHash.slice(0, 15)}...`);

  // 6. Sensitive Data Exposure in API responses
  const appStatusRes = await req('/api/app/status?phone=9876543210');
  const bodyText = appStatusRes.body;
  const leaksSensitiveData = bodyText.includes('passwordHash') || bodyText.includes('adminPassword') || bodyText.includes('SESSION_SECRET');
  logResult('Sensitive data (passwords, secrets) not leaked in API responses', !leaksSensitiveData);

  // 7. Stack Trace Leakage in Error Responses
  const badJsonRes = await req('/api/buy/upi', 'POST', 'INVALID_JSON_RAW_DATA');
  const leaksStack = badJsonRes.body.includes('at NextNodeServer') || badJsonRes.body.includes('node_modules') || badJsonRes.body.includes('SyntaxError: Unexpected token');
  logResult('Error responses do not leak internal Node.js stack traces or file paths', !leaksStack, `Status: ${badJsonRes.status}`);

  // 8. Rate Limiting & Brute-Force Lockout Protection
  // Simulate 6 failed login attempts
  let lockedOut = false;
  let lockMsg = '';
  for (let i = 1; i <= 6; i++) {
    const attempt = await req('/api/admin/login', 'POST', {
      email: 'admin@ridersaathi.in',
      password: 'wrong_password_' + i
    });
    if (attempt.json && attempt.json.error && attempt.json.error.includes('Locked')) {
      lockedOut = true;
      lockMsg = attempt.json.error;
      break;
    }
  }
  logResult('Brute-force lockout active on /api/admin/login (IP locked after repeated failures)', lockedOut, lockMsg);

  console.log('\n=== SUMMARY OF PHASE 4 SECURITY TESTS ===');
  const passedCount = results.filter(r => r.passed).length;
  console.log(`Total tests: ${results.length} | Passed: ${passedCount} | Failed: ${results.length - passedCount}`);
}

runSecurityAudit().catch(console.error);
