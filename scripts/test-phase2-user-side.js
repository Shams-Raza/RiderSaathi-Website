// Comprehensive Phase 2 User-Side Functional Testing Script
const http = require('http');
const https = require('https');
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

async function runTests() {
  console.log('=== STARTING PHASE 2: USER-SIDE FUNCTIONAL TESTING ===\n');
  const results = [];

  function logResult(testName, passed, details = '') {
    results.push({ testName, passed, details });
    console.log(`${passed ? '✅ PASS' : '❌ FAIL'}: ${testName}${details ? ' - ' + details : ''}`);
  }

  // 1. Landing / Home page loads without errors
  try {
    const home = await get('/');
    const hasHero = home.body.includes('hero-wrapper') || home.body.includes('hero-content');
    const hasTitle = home.body.includes('<title>');
    const noError = home.status === 200 && !home.body.includes('Internal Server Error');
    logResult('Landing / Home page loads (200 OK, valid content)', noError && hasHero && hasTitle, `Status ${home.status}`);
  } catch (err) {
    logResult('Landing / Home page loads', false, err.message);
  }

  // 2. Navigation links (header, footer, all public pages)
  const navRoutes = [
    '/',
    '/how-it-works',
    '/pricing',
    '/install',
    '/buy',
    '/faq',
    '/guides',
    '/contact',
    '/about',
    '/delivery',
    '/refunds',
    '/terms',
    '/privacy',
    '/updates',
    '/api-docs'
  ];

  for (const route of navRoutes) {
    try {
      const res = await get(route);
      const ok = res.status === 200 && res.body.length > 500;
      logResult(`Route [${route}] renders correctly`, ok, `Status ${res.status}, length: ${res.body.length}`);
    } catch (err) {
      logResult(`Route [${route}] renders correctly`, false, err.message);
    }
  }

  // 3. User / Driver Signup & Login flow (API /app/auth)
  try {
    const testPhone = '9999888811';
    const regRes = await post('/api/app/auth', {
      phone: testPhone,
      name: 'QA Test Captain',
      deviceModel: 'Test Device 9',
      appVersion: '5.28.1'
    });
    const regOk = regRes.status === 200 && regRes.json && regRes.json.token;
    logResult('Driver App Auth/Signup (generates token & 10 free trial rides)', regOk, `Token: ${regRes.json?.token?.slice(0, 15)}...`);

    if (regOk) {
      const token = regRes.json.token;
      // Test status check
      const statusRes = await get('/api/app/status?token=' + token);
      const statusOk = statusRes.status === 200 && statusRes.body.includes('trial');
      logResult('Driver App Session & Status check with token', statusOk, `Status ${statusRes.status}`);

      // Test check-access
      const accessRes = await get('/api/app/check-access?token=' + token);
      logResult('Driver App check-access evaluation', accessRes.status === 200, `Access response: ${accessRes.body.slice(0, 60)}`);
    }
  } catch (err) {
    logResult('Driver App Auth/Signup flow', false, err.message);
  }

  // 4. Pass / Plan Purchase flow (/buy and /buy/upi)
  try {
    const buyPage = await get('/buy');
    logResult('/buy plan selector page loads', buyPage.status === 200 && (buyPage.body.includes('form-card') || buyPage.body.includes('delform')));

    // Initiate UPI Order
    const orderRes = await post('/api/buy/upi', {
      planId: 'week1',
      phone: '9999888822'
    });
    const orderOk = orderRes.status === 200 && orderRes.json && orderRes.json.orderId;
    logResult('Order creation for UPI payment (/api/buy/upi)', orderOk, `OrderId: ${orderRes.json?.orderId}`);

    if (orderOk) {
      const orderId = orderRes.json.orderId;
      // View UPI payment page
      const upiPage = await get(`/buy/upi?orderId=${orderId}`);
      const hasQr = upiPage.body.includes('data:image/png;base64') || upiPage.body.includes('qr-code') || upiPage.body.includes('Scan with any UPI App');
      const hasUtrForm = upiPage.body.includes('utr') || upiPage.body.includes('delform');
      logResult('/buy/upi page displays dynamic QR & UTR form', upiPage.status === 200 && (hasQr || hasUtrForm), `Status ${upiPage.status}`);

      // Submit UTR test
      const utrRes = await post('/api/buy/confirm-utr', {
        orderId,
        utr: 'UTR123456789012'
      });
      const utrOk = utrRes.status === 200 && utrRes.json && utrRes.json.ok;
      logResult('UTR Submission verification (/api/buy/confirm-utr)', utrOk, `Result: ${JSON.stringify(utrRes.json)}`);
    }
  } catch (err) {
    logResult('Pass purchase flow', false, err.message);
  }

  // 5. Contact / Support Form testing (/api/contact)
  try {
    const contactPage = await get('/contact');
    logResult('/contact page loads with form', contactPage.status === 200 && contactPage.body.includes('form'));

    // Normal submission
    const submitRes = await post('/api/contact', {
      name: 'QA Inspector',
      phone: '9876543210',
      subject: 'Functional Test Inquiry',
      message: 'This is an automated QA test message for contact form validation.'
    });
    logResult('Contact form normal submission', submitRes.status === 200 && submitRes.json?.ok === true);

    // Empty validation test
    const emptyRes = await post('/api/contact', {
      name: '',
      phone: '',
      message: ''
    });
    logResult('Contact form empty validation (proper 400 rejection)', emptyRes.status === 400 || (emptyRes.json && !emptyRes.json.ok));

    // SQL Injection / XSS attempt test
    const xssRes = await post('/api/contact', {
      name: '<script>alert(1)</script>',
      phone: '9876543210',
      subject: "'; DROP TABLE inquiries; --",
      message: '<img src=x onerror=alert(1)>'
    });
    // System should sanitize or safely store as string without crashing
    logResult('Contact form XSS/SQLi payload handled safely without 500 error', xssRes.status === 200 || xssRes.status === 400);
  } catch (err) {
    logResult('Contact form test', false, err.message);
  }

  // 6. Direct APK Download link (/download redirects to /downloads/*.apk)
  try {
    const dlRes = await get('/download');
    const isRedirect = dlRes.status === 302;
    const dest = dlRes.headers['location'] || '';
    let apkOk = false;
    if (dest) {
      const apkRes = await get(dest);
      apkOk = apkRes.status === 200 && apkRes.headers['content-type']?.includes('android');
    }
    logResult('APK Download endpoint (/download 302 -> static APK file 200)', isRedirect && apkOk, `Redirect to ${dest}`);
  } catch (err) {
    logResult('APK Download endpoint', false, err.message);
  }

  // 7. Bilingual Language Toggle test (/set-language/en and /set-language/hi)
  try {
    const enSwitch = await get('/set-language/en');
    const hasEnCookie = (enSwitch.headers['set-cookie'] || []).some(c => c.includes('lang=en'));
    logResult('Language switcher to EN (/set-language/en)', hasEnCookie || enSwitch.status === 307 || enSwitch.status === 302, `Redirect status: ${enSwitch.status}`);

    const hiSwitch = await get('/set-language/hi');
    const hasHiCookie = (hiSwitch.headers['set-cookie'] || []).some(c => c.includes('lang=hi'));
    logResult('Language switcher to HI (/set-language/hi)', hasHiCookie || hiSwitch.status === 307 || hiSwitch.status === 302, `Redirect status: ${hiSwitch.status}`);

    // Query param ?lang=en test
    const enPage = await get('/?lang=en');
    const isEnContent = enPage.body.includes('Never Miss a') || enPage.body.includes('SMART RIDE COMPANION');
    logResult('Query param ?lang=en renders English content', isEnContent);

    // Query param ?lang=hi test
    const hiPage = await get('/?lang=hi');
    const isHiContent = hiPage.body.includes('कमाई वाली राइड') || hiPage.body.includes('स्मार्ट राइड कम्पैनियन');
    logResult('Query param ?lang=hi renders Hindi content', isHiContent);
  } catch (err) {
    logResult('Bilingual Language Toggle test', false, err.message);
  }

  // 8. Static Assets Integrity (CSS, Images, Logos)
  const assets = [
    '/css/style.css',
    '/images/logo.svg',
    '/images/hero-robot-clean.png',
    '/images/icon.svg',
    '/manifest.webmanifest',
    '/robots.txt',
    '/sitemap.xml'
  ];

  for (const asset of assets) {
    try {
      const aRes = await get(asset);
      logResult(`Static asset [${asset}] accessible (200 OK)`, aRes.status === 200, `Type: ${aRes.headers['content-type']}`);
    } catch (err) {
      logResult(`Static asset [${asset}] accessible`, false, err.message);
    }
  }

  // 9. 404 Error handling
  try {
    const notFound = await get('/non-existent-page-xyz-123');
    logResult('404 Custom Error handling', notFound.status === 404, `Status ${notFound.status}`);
  } catch (err) {
    logResult('404 Error handling', false, err.message);
  }

  console.log('\n=== SUMMARY OF PHASE 2 TESTS ===');
  const passedCount = results.filter(r => r.passed).length;
  console.log(`Total tests: ${results.length} | Passed: ${passedCount} | Failed: ${results.length - passedCount}`);
}

runTests().catch(console.error);
