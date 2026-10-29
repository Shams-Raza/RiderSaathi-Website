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

async function runAudit() {
  const routes = [
    '/',
    '/how-it-works',
    '/pricing',
    '/install',
    '/buy',
    '/buy/upi',
    '/guides',
    '/guides/ridersaathi-shuru-kaise-kare',
    '/guides/booking-type-parcel-sawari',
    '/guides/trip-aur-pickup-distance',
    '/guides/auto-accept-sound-alerts',
    '/guides/battery-optimization-settings',
    '/guides/fare-calculation-tricks',
    '/guides/play-protect-warning-solution',
    '/guides/subscription-recharge-guide',
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

  const results = [];
  const allTitles = new Map();
  const allDescs = new Map();

  console.log(`Starting SEO extraction on ${routes.length} pages...\n`);

  for (const r of routes) {
    try {
      const res = await fetchPage(r);
      const html = res.html;

      // 1. Title
      const title = extractTag(html, /<title[^>]*>([^<]+)<\/title>/i);

      // 2. Meta description
      const desc = extractTag(html, /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i) ||
                   extractTag(html, /<meta\s+content=["']([^"']+)["']\s+name=["']description["']/i);

      // 3. Canonical
      const canonical = extractTag(html, /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i) ||
                        extractTag(html, /<link\s+href=["']([^"']+)["']\s+rel=["']canonical["']/i);

      // 4. OpenGraph
      const ogTitle = extractTag(html, /<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);
      const ogDesc = extractTag(html, /<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i);
      const ogImage = extractTag(html, /<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
      const ogUrl = extractTag(html, /<meta\s+property=["']og:url["']\s+content=["']([^"']+)["']/i);
      const ogType = extractTag(html, /<meta\s+property=["']og:type["']\s+content=["']([^"']+)["']/i);

      // 5. Twitter Card
      const twCard = extractTag(html, /<meta\s+name=["']twitter:card["']\s+content=["']([^"']+)["']/i);
      const twTitle = extractTag(html, /<meta\s+name=["']twitter:title["']\s+content=["']([^"']+)["']/i);
      const twImage = extractTag(html, /<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i);

      // 6. html lang
      const htmlLang = extractTag(html, /<html\s+[^>]*lang=["']([^"']+)["']/i);

      // 7. Headings
      const h1Matches = extractAll(html, /<h1[^>]*>([\s\S]*?)<\/h1>/gi).map(s => s.replace(/<[^>]+>/g, '').trim());
      const h2Matches = extractAll(html, /<h2[^>]*>([\s\S]*?)<\/h2>/gi);
      const h3Matches = extractAll(html, /<h3[^>]*>([\s\S]*?)<\/h3>/gi);

      // 8. JSON-LD
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
        } catch (e) {
          schemaTypes.push('INVALID_JSON');
        }
      }

      // 9. Images alt text
      const imgTags = html.match(/<img[^>]+>/gi) || [];
      const imagesWithoutAlt = [];
      for (const img of imgTags) {
        const hasAlt = /alt=["'][^"']*["']/i.test(img);
        const altEmpty = /alt=["']\s*["']/i.test(img);
        const srcMatch = img.match(/src=["']([^"']+)["']/i);
        const src = srcMatch ? srcMatch[1] : 'unknown';
        if (!hasAlt || altEmpty) {
          imagesWithoutAlt.push(src);
        }
      }

      // Track duplicates
      if (title) {
        const list = allTitles.get(title) || [];
        list.push(r);
        allTitles.set(title, list);
      }
      if (desc) {
        const list = allDescs.get(desc) || [];
        list.push(r);
        allDescs.set(desc, list);
      }

      results.push({
        route: r,
        status: res.statusCode,
        title,
        desc,
        descLength: desc ? desc.length : 0,
        canonical,
        og: { ogTitle, ogDesc, ogImage, ogUrl, ogType },
        tw: { twCard, twTitle, twImage },
        htmlLang,
        h1Count: h1Matches.length,
        h1s: h1Matches,
        h2Count: h2Matches.length,
        h3Count: h3Matches.length,
        schemaTypes,
        imagesCount: imgTags.length,
        imagesWithoutAlt,
      });
    } catch (e) {
      results.push({
        route: r,
        error: e.message,
      });
    }
  }

  // Save full JSON audit output
  fs.writeFileSync(path.join(__dirname, 'seo-audit-results.json'), JSON.stringify(results, null, 2), 'utf8');

  // Check Sitemap
  const sitemapRes = await fetchPage('/sitemap.xml');
  const sitemapRoutes = extractAll(sitemapRes.html, /<loc>([^<]+)<\/loc>/gi);
  const sitemapLastmods = extractAll(sitemapRes.html, /<lastmod>([^<]+)<\/lastmod>/gi);

  // Check Robots
  const robotsRes = await fetchPage('/robots.txt');

  // Check Bilingual Title / Description changes
  const homeHi = await fetchPage('/', 'lang=hi');
  const homeEn = await fetchPage('/', 'lang=en');

  const titleHi = extractTag(homeHi.html, /<title[^>]*>([^<]+)<\/title>/i);
  const titleEn = extractTag(homeEn.html, /<title[^>]*>([^<]+)<\/title>/i);
  const descHi = extractTag(homeHi.html, /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
  const descEn = extractTag(homeEn.html, /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
  const hreflangs = extractAll(homeHi.html, /<link\s+rel=["']alternate["'][^>]+hreflang=["']([^"']+)["'][^>]*>/gi);

  const auditSummary = {
    results,
    sitemap: {
      status: sitemapRes.statusCode,
      totalUrls: sitemapRoutes.length,
      urls: sitemapRoutes,
      hasLastmod: sitemapLastmods.length === sitemapRoutes.length,
      lastmodsCount: sitemapLastmods.length,
    },
    robots: {
      status: robotsRes.statusCode,
      body: robotsRes.html,
    },
    bilingual: {
      titleHi,
      titleEn,
      descHi,
      descEn,
      hreflangs,
    },
    duplicates: {
      titles: Array.from(allTitles.entries()).filter(([k, v]) => v.length > 1),
      descs: Array.from(allDescs.entries()).filter(([k, v]) => v.length > 1),
    }
  };

  fs.writeFileSync(path.join(__dirname, 'seo-audit-summary.json'), JSON.stringify(auditSummary, null, 2), 'utf8');
  console.log('Audit completed and written to scripts/seo-audit-summary.json');
}

runAudit().catch(console.error);
