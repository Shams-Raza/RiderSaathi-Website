/**
 * RiderSaathi Complete Broken-Link & Dev-URL Auditor
 * Crawls local production server, checks internal/external/asset/anchor links,
 * and scans the codebase for hardcoded localhost/dev URLs.
 */

const http = require('http');
const https = require('https');
const path = require('path');
const fs = require('fs');
const next = require('next');

const PORT = 3010;
const BASE_URL = `http://127.0.0.1:${PORT}`;

// Helper: HTTP request with timeout and redirect handling
function requestUrl(targetUrl, options = {}) {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(targetUrl);
      const isHttps = parsed.protocol === 'https:';
      const client = isHttps ? https : http;
      const method = options.method || 'GET';
      const timeout = options.timeout || 10000;
      const maxRedirects = options.maxRedirects !== undefined ? options.maxRedirects : 3;

      const startTime = Date.now();
      const req = client.request(
        parsed,
        {
          method,
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Accept: '*/*',
            ...(options.headers || {}),
          },
          timeout,
        },
        (res) => {
          const duration = Date.now() - startTime;
          const status = res.statusCode;

          // Follow redirect if 3xx
          if ([301, 302, 303, 307, 308].includes(status) && res.headers.location && maxRedirects > 0) {
            res.resume(); // discard body
            let redirectUrl = res.headers.location;
            if (redirectUrl.startsWith('/')) {
              redirectUrl = `${parsed.protocol}//${parsed.host}${redirectUrl}`;
            }
            return resolve(
              requestUrl(redirectUrl, {
                ...options,
                maxRedirects: maxRedirects - 1,
              })
            );
          }

          let body = '';
          if (options.readBody) {
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
              body += chunk;
            });
            res.on('end', () => {
              resolve({ ok: status >= 200 && status < 400, status, headers: res.headers, body, duration });
            });
          } else {
            res.resume();
            resolve({ ok: status >= 200 && status < 400, status, headers: res.headers, duration });
          }
        }
      );

      req.on('timeout', () => {
        req.destroy();
        resolve({ ok: false, status: 0, error: 'TIMEOUT', duration: Date.now() - startTime });
      });

      req.on('error', (err) => {
        resolve({ ok: false, status: 0, error: err.code || err.message, duration: Date.now() - startTime });
      });

      req.end();
    } catch (e) {
      resolve({ ok: false, status: 0, error: e.message, duration: 0 });
    }
  });
}

// Check external URL: HEAD first, fallback to GET if HEAD rejected
async function checkExternalUrl(url) {
  let res = await requestUrl(url, { method: 'HEAD', timeout: 10000 });
  // Some servers (e.g. WhatsApp, Facebook, LinkedIn, Cloudflare) reject HEAD with 400, 403, 405
  if (!res.ok && [400, 403, 405, 501].includes(res.status)) {
    res = await requestUrl(url, { method: 'GET', timeout: 10000, readBody: false });
  }
  return res;
}

// Extract HTML elements
function parseHtml(html) {
  const ids = new Set();
  const idRegex = /\bid=["']([^"']+)["']/gi;
  let m;
  while ((m = idRegex.exec(html)) !== null) {
    ids.add(m[1]);
  }

  const links = [];
  const linkRegex = /<a\b([^>]*)>(.*?)<\/a>/gis;
  while ((m = linkRegex.exec(html)) !== null) {
    const attrs = m[1];
    const text = m[2].replace(/<[^>]*>/g, '').trim().replace(/\s+/g, ' ');
    const hrefMatch = attrs.match(/\bhref=["']([^"']*)["']/i);
    const href = hrefMatch ? hrefMatch[1].trim() : '';
    links.push({ href, text });
  }

  const images = [];
  const imgRegex = /<img\b([^>]*)>/gis;
  while ((m = imgRegex.exec(html)) !== null) {
    const attrs = m[1];
    const srcMatch = attrs.match(/\bsrc=["']([^"']*)["']/i);
    if (srcMatch && srcMatch[1]) {
      images.push(srcMatch[1].trim());
    }
    const srcsetMatch = attrs.match(/\bsrcset=["']([^"']*)["']/i);
    if (srcsetMatch && srcsetMatch[1]) {
      const candidates = srcsetMatch[1].split(',');
      for (const cand of candidates) {
        const u = cand.trim().split(/\s+/)[0];
        if (u) images.push(u);
      }
    }
  }

  const stylesheets = [];
  const linkTagRegex = /<link\b([^>]*)>/gis;
  while ((m = linkTagRegex.exec(html)) !== null) {
    const attrs = m[1];
    const hrefMatch = attrs.match(/\bhref=["']([^"']*)["']/i);
    const relMatch = attrs.match(/\brel=["']([^"']*)["']/i);
    const rel = relMatch ? relMatch[1].toLowerCase() : '';
    if (hrefMatch && hrefMatch[1] && (rel.includes('stylesheet') || rel.includes('icon') || rel.includes('manifest'))) {
      stylesheets.push(hrefMatch[1].trim());
    }
  }

  const scripts = [];
  const scriptRegex = /<script\b([^>]*)>/gis;
  while ((m = scriptRegex.exec(html)) !== null) {
    const attrs = m[1];
    const srcMatch = attrs.match(/\bsrc=["']([^"']*)["']/i);
    if (srcMatch && srcMatch[1]) {
      scripts.push(srcMatch[1].trim());
    }
  }

  const forms = [];
  const formRegex = /<form\b([^>]*)>/gis;
  while ((m = formRegex.exec(html)) !== null) {
    const attrs = m[1];
    const actionMatch = attrs.match(/\baction=["']([^"']*)["']/i);
    if (actionMatch && actionMatch[1]) {
      forms.push(actionMatch[1].trim());
    }
  }

  return { ids, links, images, stylesheets, scripts, forms };
}

// Codebase text scanner for hardcoded localhost / 127.0.0.1 / http:
function scanCodebaseForDevUrls() {
  const findings = [];
  const rootDir = path.join(__dirname, '..');
  const targetDirs = ['app', 'components', 'data', 'lib', 'public'];

  function scanDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const ent of entries) {
      const fullPath = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        if (!['node_modules', '.next', '.git'].includes(ent.name)) {
          scanDir(fullPath);
        }
      } else if (ent.isFile()) {
        const ext = path.extname(ent.name);
        if (['.js', '.jsx', '.json', '.css', '.html'].includes(ext)) {
          const content = fs.readFileSync(fullPath, 'utf8');
          const lines = content.split('\n');
          lines.forEach((line, idx) => {
            const relPath = path.relative(rootDir, fullPath).replace(/\\/g, '/');
            // Ignore XML namespaces & schema contexts that require standard namespace strings
            if (line.includes('www.w3.org')) return;
            if (line.includes('schemas.xmlsoap.org')) return;

            // 1. localhost
            if (line.includes('localhost:3000') || (line.includes('localhost') && !line.includes('new URL(req.url, \'http://localhost\')'))) {
              findings.push({
                type: 'LOCALHOST_REF',
                file: relPath,
                line: idx + 1,
                content: line.trim(),
                severity: 'CRITICAL',
                suggestedFix: 'Replace hardcoded localhost URL with production URL (https://ridersaathi.in) or relative path',
              });
            }

            // 2. 127.0.0.1
            if (line.includes('127.0.0.1') && !relPath.startsWith('scripts/')) {
              // If not fallback clientIp in api routes
              if (!line.includes('x-forwarded-for') && !line.includes('clientIp')) {
                findings.push({
                  type: 'IP_REF',
                  file: relPath,
                  line: idx + 1,
                  content: line.trim(),
                  severity: 'CRITICAL',
                  suggestedFix: 'Remove 127.0.0.1 dev IP reference',
                });
              }
            }

            // 3. Insecure http://
            if (line.includes('http://') && !line.includes('http://localhost') && !line.includes('schema.org')) {
              // If in .env or data or app
              if (!relPath.startsWith('scripts/')) {
                findings.push({
                  type: 'INSECURE_HTTP',
                  file: relPath,
                  line: idx + 1,
                  content: line.trim(),
                  severity: 'WARNING',
                  suggestedFix: 'Upgrade http:// to https://',
                });
              }
            }
          });
        }
      }
    }
  }

  for (const t of targetDirs) {
    const full = path.join(rootDir, t);
    if (fs.existsSync(full)) {
      scanDir(full);
    }
  }

  return findings;
}

async function runAudit() {
  console.log('========================================================================');
  console.log('🔍 RIDERSAATHI COMPLETE BROKEN-LINK & DEV-URL AUDIT');
  console.log('========================================================================\n');

  console.log('[1/4] Starting local Next.js production server on port ' + PORT + '...');
  const app = next({
    dev: false,
    hostname: '127.0.0.1',
    port: PORT,
    dir: path.join(__dirname, '..'),
  });
  const handle = app.getRequestHandler();
  await app.prepare();

  const server = http.createServer((req, res) => handle(req, res));
  await new Promise((resolve, reject) => {
    server.listen(PORT, '127.0.0.1', (err) => (err ? reject(err) : resolve()));
  });
  console.log(`[Next.js] Server ready on ${BASE_URL}\n`);

  const knownSeedRoutes = [
    '/',
    '/about',
    '/api-docs',
    '/buy',
    '/contact',
    '/delivery',
    '/faq',
    '/guides',
    '/how-it-works',
    '/install',
    '/pricing',
    '/privacy',
    '/refunds',
    '/terms',
    '/updates',
    '/admin/login',
  ];

  // BFS crawl queue
  const queue = knownSeedRoutes.map((r) => ({ route: r, depth: 0 }));
  const visitedRoutes = new Set();
  const pageParsedData = new Map(); // route -> { ids, links, images, stylesheets, scripts, forms }

  console.log('[2/4] Crawling routes (BFS, max depth 3)...');

  while (queue.length > 0) {
    const { route, depth } = queue.shift();
    if (visitedRoutes.has(route)) continue;
    visitedRoutes.add(route);

    process.stdout.write(`  Crawling ${route} (depth ${depth})... `);
    const pageRes = await requestUrl(`${BASE_URL}${route}`, { readBody: true });

    if (!pageRes.ok) {
      console.log(`❌ [HTTP ${pageRes.status}]`);
      pageParsedData.set(route, { status: pageRes.status, ok: false });
      continue;
    }

    console.log(`✅ [HTTP ${pageRes.status}]`);
    const parsed = parseHtml(pageRes.body);
    pageParsedData.set(route, { status: pageRes.status, ok: true, ...parsed });

    // Expand queue with new internal links if depth < 3
    if (depth < 3) {
      for (const item of parsed.links) {
        const href = item.href;
        if (
          href.startsWith('/') &&
          !href.startsWith('//') &&
          !href.startsWith('/api') &&
          !href.startsWith('/images') &&
          !href.startsWith('/css') &&
          !href.startsWith('/downloads')
        ) {
          const cleanRoute = href.split('#')[0].split('?')[0] || '/';
          if (!visitedRoutes.has(cleanRoute) && !queue.some((q) => q.route === cleanRoute)) {
            queue.push({ route: cleanRoute, depth: depth + 1 });
          }
        }
      }
    }
  }

  console.log(`\nVisited ${visitedRoutes.size} total routes successfully.\n`);

  console.log('[3/4] Classifying and checking all links, assets, and anchors...');

  const criticalIssues = [];
  const warningIssues = [];
  const infoIssues = [];

  // Track checked assets and external URLs to avoid duplicate network calls
  const checkedAssets = new Map();
  const checkedExternalUrls = new Map();

  for (const [route, data] of pageParsedData.entries()) {
    if (!data.ok) {
      criticalIssues.push({
        severity: 'CRITICAL',
        page: route,
        type: 'INTERNAL_PAGE_ERROR',
        linkText: 'Page Entry',
        href: route,
        statusCode: data.status,
        suggestedFix: `Route ${route} returned HTTP ${data.status}. Fix page component or routing.`,
      });
      continue;
    }

    // A. Check Links
    for (const item of data.links) {
      const { href, text } = item;

      // 1. Placeholder links
      if (href === '#' || href === '' || href.toLowerCase().startsWith('javascript:')) {
        infoIssues.push({
          severity: 'INFO',
          page: route,
          type: 'PLACEHOLDER_LINK',
          linkText: text || '[Empty Text]',
          href: href || '(empty)',
          statusCode: 'N/A',
          suggestedFix: 'Replace placeholder anchor with valid target route or button onClick handler.',
        });
        continue;
      }

      // 2. Hardcoded localhost/dev URLs in href
      if (href.includes('localhost') || href.includes('127.0.0.1')) {
        criticalIssues.push({
          severity: 'CRITICAL',
          page: route,
          type: 'HARDCODED_LOCALHOST',
          linkText: text || '[No Text]',
          href,
          statusCode: 'N/A',
          suggestedFix: 'Replace localhost URL with production domain or relative route.',
        });
        continue;
      }

      // 3. Anchor links on same page
      if (href.startsWith('#')) {
        const anchorId = href.slice(1);
        if (anchorId && !data.ids.has(anchorId)) {
          warningIssues.push({
            severity: 'WARNING',
            page: route,
            type: 'DEAD_ANCHOR',
            linkText: text || '[No Text]',
            href,
            statusCode: 'N/A',
            suggestedFix: `Target id="${anchorId}" does not exist on page ${route}.`,
          });
        }
        continue;
      }

      // 4. Internal relative links
      if (href.startsWith('/') && !href.startsWith('//')) {
        const [pathOnly, hash] = href.split('#');
        const cleanPath = pathOnly.split('?')[0] || '/';

        // Check internal route or file
        let internalStatus = checkedAssets.get(cleanPath);
        if (internalStatus === undefined) {
          const testRes = await requestUrl(`${BASE_URL}${cleanPath}`);
          internalStatus = testRes.status;
          checkedAssets.set(cleanPath, internalStatus);
        }

        if (internalStatus === 404 || internalStatus >= 500) {
          criticalIssues.push({
            severity: 'CRITICAL',
            page: route,
            type: 'INTERNAL_404',
            linkText: text || '[No Text]',
            href,
            statusCode: internalStatus,
            suggestedFix: `Internal link ${cleanPath} returns HTTP ${internalStatus}. Correct URL path or create missing route.`,
          });
        } else if (hash) {
          // Check anchor on target page
          const targetPage = pageParsedData.get(cleanPath);
          if (targetPage && targetPage.ok && !targetPage.ids.has(hash)) {
            warningIssues.push({
              severity: 'WARNING',
              page: route,
              type: 'DEAD_CROSS_PAGE_ANCHOR',
              linkText: text || '[No Text]',
              href,
              statusCode: internalStatus,
              suggestedFix: `Target route ${cleanPath} exists but lacks anchor id="${hash}".`,
            });
          }
        }
        continue;
      }

      // 5. External links
      if (href.startsWith('http://') || href.startsWith('https://')) {
        if (href.startsWith('http://')) {
          warningIssues.push({
            severity: 'WARNING',
            page: route,
            type: 'INSECURE_HTTP',
            linkText: text || '[No Text]',
            href,
            statusCode: 'N/A',
            suggestedFix: 'Upgrade external link from http:// to https://.',
          });
        }

        let extRes = checkedExternalUrls.get(href);
        if (!extRes) {
          extRes = await checkExternalUrl(href);
          checkedExternalUrls.set(href, extRes);
        }

        if (!extRes.ok && ![999, 401, 403].includes(extRes.status)) {
          // Note: Some platforms return 401/403/999 to automated crawlers (e.g. LinkedIn/Instagram)
          warningIssues.push({
            severity: 'WARNING',
            page: route,
            type: 'EXTERNAL_ERROR',
            linkText: text || '[No Text]',
            href,
            statusCode: extRes.status || extRes.error,
            suggestedFix: `External URL returned ${extRes.status || extRes.error}. Verify link validity.`,
          });
        } else if (extRes.duration > 5000) {
          infoIssues.push({
            severity: 'INFO',
            page: route,
            type: 'SLOW_EXTERNAL_LINK',
            linkText: text || '[No Text]',
            href,
            statusCode: extRes.status,
            suggestedFix: `External URL took ${extRes.duration}ms to respond.`,
          });
        }
      }
    }

    // B. Check Assets (images, stylesheets, scripts)
    const allAssets = [
      ...data.images.map((src) => ({ src, type: 'IMAGE' })),
      ...data.stylesheets.map((src) => ({ src, type: 'STYLESHEET' })),
      ...data.scripts.map((src) => ({ src, type: 'SCRIPT' })),
    ];

    for (const asset of allAssets) {
      const src = asset.src;
      if (src.startsWith('data:') || src.startsWith('blob:')) continue;

      if (src.startsWith('http://') || src.startsWith('https://')) {
        // External asset
        let extRes = checkedExternalUrls.get(src);
        if (!extRes) {
          extRes = await checkExternalUrl(src);
          checkedExternalUrls.set(src, extRes);
        }
        if (!extRes.ok) {
          warningIssues.push({
            severity: 'WARNING',
            page: route,
            type: `BROKEN_EXTERNAL_${asset.type}`,
            linkText: asset.type,
            href: src,
            statusCode: extRes.status || extRes.error,
            suggestedFix: `External ${asset.type.toLowerCase()} asset is failing to load.`,
          });
        }
      } else if (src.startsWith('/')) {
        // Internal asset
        let status = checkedAssets.get(src);
        if (status === undefined) {
          const res = await requestUrl(`${BASE_URL}${src}`);
          status = res.status;
          checkedAssets.set(src, status);
        }

        if (status !== 200 && status !== 304) {
          criticalIssues.push({
            severity: 'CRITICAL',
            page: route,
            type: `MISSING_${asset.type}`,
            linkText: asset.type,
            href: src,
            statusCode: status,
            suggestedFix: `Missing local asset ${src} (HTTP ${status}). Ensure file exists in /public.`,
          });
        }
      }
    }
  }

  // Codebase scanner
  console.log('[4/4] Scanning codebase files for hardcoded localhost / dev URLs...');
  const codebaseFindings = scanCodebaseForDevUrls();
  for (const f of codebaseFindings) {
    if (f.severity === 'CRITICAL') {
      criticalIssues.push({
        severity: 'CRITICAL',
        page: `${f.file}:${f.line}`,
        type: f.type,
        linkText: f.content.slice(0, 60),
        href: f.content,
        statusCode: 'CODEBASE',
        suggestedFix: f.suggestedFix,
      });
    } else if (f.severity === 'WARNING') {
      warningIssues.push({
        severity: 'WARNING',
        page: `${f.file}:${f.line}`,
        type: f.type,
        linkText: f.content.slice(0, 60),
        href: f.content,
        statusCode: 'CODEBASE',
        suggestedFix: f.suggestedFix,
      });
    }
  }

  server.close();

  // Print Structured Report
  console.log('\n========================================================================');
  console.log('📊 AUDIT REPORT: SUMMARY OF ISSUES BY SEVERITY');
  console.log('========================================================================\n');

  console.log(`🔴 CRITICAL ISSUES (Must Fix: ${criticalIssues.length}):`);
  if (criticalIssues.length === 0) {
    console.log('   ✅ None found! All internal routes, assets, and URLs clean.\n');
  } else {
    criticalIssues.forEach((issue, idx) => {
      console.log(`   ${idx + 1}. [${issue.type}] on ${issue.page}`);
      console.log(`      Text/Snippet: "${issue.linkText}"`);
      console.log(`      Target/Href : ${issue.href}`);
      console.log(`      Status      : ${issue.statusCode}`);
      console.log(`      Suggested   : ${issue.suggestedFix}\n`);
    });
  }

  console.log(`🟡 WARNINGS (Should Fix: ${warningIssues.length}):`);
  if (warningIssues.length === 0) {
    console.log('   ✅ None found!\n');
  } else {
    warningIssues.forEach((issue, idx) => {
      console.log(`   ${idx + 1}. [${issue.type}] on ${issue.page}`);
      console.log(`      Text/Snippet: "${issue.linkText}"`);
      console.log(`      Target/Href : ${issue.href}`);
      console.log(`      Status      : ${issue.statusCode}`);
      console.log(`      Suggested   : ${issue.suggestedFix}\n`);
    });
  }

  console.log(`🟢 INFORMATIONAL (Nice to Fix: ${infoIssues.length}):`);
  if (infoIssues.length === 0) {
    console.log('   ✅ None found!\n');
  } else {
    infoIssues.forEach((issue, idx) => {
      console.log(`   ${idx + 1}. [${issue.type}] on ${issue.page}`);
      console.log(`      Text/Snippet: "${issue.linkText}"`);
      console.log(`      Target/Href : ${issue.href}`);
      console.log(`      Status      : ${issue.statusCode}`);
      console.log(`      Suggested   : ${issue.suggestedFix}\n`);
    });
  }

  console.log('========================================================================');
  console.log(`FINAL COUNTS: 🔴 ${criticalIssues.length} Critical | 🟡 ${warningIssues.length} Warnings | 🟢 ${infoIssues.length} Info`);
  console.log('========================================================================\n');

  return { criticalIssues, warningIssues, infoIssues };
}

runAudit()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Audit failed:', err);
    process.exit(1);
  });

