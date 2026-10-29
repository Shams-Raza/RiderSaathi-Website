const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';

function fetchPage(routePath, cookie = '') {
  return new Promise((resolve, reject) => {
    const url = new URL(routePath, BASE_URL);
    const headers = {};
    if (cookie) headers['Cookie'] = cookie;

    http.get(url, { headers }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          html: data,
        });
      });
    }).on('error', reject);
  });
}

function extractTag(html, regex) {
  const match = html.match(regex);
  return match ? match[1].trim() : null;
}

function extractAll(html, regex) {
  const matches = [];
  let m;
  while ((m = regex.exec(html)) !== null) {
    matches.push(m[1].trim());
  }
  return matches;
}

async function auditActualRoutes() {
  const guides = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/guides.json'), 'utf8'));
  const guideSlugs = guides.map(g => `/guides/${g.slug}`);

  const routes = [
    '/',
    '/how-it-works',
    '/pricing',
    '/install',
    '/buy',
    '/buy/upi',
    '/guides',
    ...guideSlugs,
    '/faq',
    '/updates',
    '/about',
    '/contact',
    '/refunds',
    '/delivery',
    '/terms',
    '/privacy',
    '/api-docs'
  ];

  const pageReports = [];

  for (const r of routes) {
    const res = await fetchPage(r);
    const html = res.html;

    const title = extractTag(html, /<title[^>]*>([^<]+)<\/title>/i);
    const desc = extractTag(html, /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i) ||
                 extractTag(html, /<meta\s+content=["']([^"']+)["']\s+name=["']description["']/i);
    const canonical = extractTag(html, /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i) ||
                      extractTag(html, /<link\s+href=["']([^"']+)["']\s+rel=["']canonical["']/i);

    const ogTitle = extractTag(html, /<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);
    const ogDesc = extractTag(html, /<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i);
    const ogImage = extractTag(html, /<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
    const ogUrl = extractTag(html, /<meta\s+property=["']og:url["']\s+content=["']([^"']+)["']/i);
    const ogType = extractTag(html, /<meta\s+property=["']og:type["']\s+content=["']([^"']+)["']/i);

    const twCard = extractTag(html, /<meta\s+name=["']twitter:card["']\s+content=["']([^"']+)["']/i);
    const twTitle = extractTag(html, /<meta\s+name=["']twitter:title["']\s+content=["']([^"']+)["']/i);
    const twImage = extractTag(html, /<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i);

    const h1s = extractAll(html, /<h1[^>]*>([\s\S]*?)<\/h1>/gi).map(s => s.replace(/<[^>]+>/g, '').trim());
    const h2s = extractAll(html, /<h2[^>]*>([\s\S]*?)<\/h2>/gi).map(s => s.replace(/<[^>]+>/g, '').trim());

    const jsonLdBlocks = extractAll(html, /<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
    const schemaTypes = [];
    for (const block of jsonLdBlocks) {
      try {
        const parsed = JSON.parse(block);
        if (Array.isArray(parsed)) {
          parsed.forEach(p => schemaTypes.push(p['@type']));
        } else if (parsed['@graph'] && Array.isArray(parsed['@graph'])) {
          parsed['@graph'].forEach(p => schemaTypes.push(p['@type']));
        } else if (parsed['@type']) {
          schemaTypes.push(parsed['@type']);
        }
      } catch (e) {}
    }

    const imgTags = html.match(/<img[^>]+>/gi) || [];
    const missingAlt = [];
    for (const img of imgTags) {
      const altMatch = img.match(/alt=["']([^"']*)["']/i);
      if (!altMatch || !altMatch[1].trim()) {
        const srcMatch = img.match(/src=["']([^"']+)["']/i);
        missingAlt.push(srcMatch ? srcMatch[1] : 'unknown');
      }
    }

    const issues = [];
    if (!title) issues.push('Missing <title>');
    if (title && title.includes('— RiderSaathi — RiderSaathi')) issues.push('Double brand suffix in title');
    if (!desc) issues.push('Missing meta description');
    if (desc && (desc.length < 50 || desc.length > 250)) issues.push(`Description length (${desc.length})`);
    if (!canonical) issues.push('Missing canonical link');
    if (h1s.length !== 1) issues.push(`H1 count is ${h1s.length} (expected 1)`);
    if (missingAlt.length > 0) issues.push(`Images missing alt: ${missingAlt.length}`);

    pageReports.push({
      route: r,
      title,
      desc,
      descLength: desc ? desc.length : 0,
      canonical,
      og: { ogTitle, ogDesc, ogImage, ogUrl, ogType },
      tw: { twCard, twTitle, twImage },
      h1Count: h1s.length,
      h1: h1s[0] || 'NONE',
      h2Count: h2s.length,
      schemaTypes: schemaTypes.join(', ') || 'None',
      issues,
    });
  }

  fs.writeFileSync(path.join(__dirname, 'actual-seo-report.json'), JSON.stringify(pageReports, null, 2), 'utf8');
  console.log(`Generated report for ${pageReports.length} actual routes.`);
}

auditActualRoutes().catch(console.error);
