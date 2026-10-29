const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'http://localhost:3000';

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

async function runDeepAudit() {
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

  console.log(`Auditing ${routes.length} routes...`);

  const results = [];
  const titleMap = new Map();
  const descMap = new Map();

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
    const ogImageWidth = extractTag(html, /<meta\s+property=["']og:image:width["']\s+content=["']([^"']+)["']/i);
    const ogImageHeight = extractTag(html, /<meta\s+property=["']og:image:height["']\s+content=["']([^"']+)["']/i);
    const ogUrl = extractTag(html, /<meta\s+property=["']og:url["']\s+content=["']([^"']+)["']/i);
    const ogType = extractTag(html, /<meta\s+property=["']og:type["']\s+content=["']([^"']+)["']/i);
    const ogLocale = extractTag(html, /<meta\s+property=["']og:locale["']\s+content=["']([^"']+)["']/i);
    const ogLocaleAlt = extractTag(html, /<meta\s+property=["']og:locale:alternate["']\s+content=["']([^"']+)["']/i);

    const twCard = extractTag(html, /<meta\s+name=["']twitter:card["']\s+content=["']([^"']+)["']/i);
    const twTitle = extractTag(html, /<meta\s+name=["']twitter:title["']\s+content=["']([^"']+)["']/i);
    const twImage = extractTag(html, /<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i);

    const htmlLang = extractTag(html, /<html[^>]*\s+lang=["']([^"']+)["']/i);

    // Hreflang alternates
    const hreflangs = [];
    const altRegex = /<link\s+[^>]*rel=["']alternate["'][^>]*>/gi;
    let altMatch;
    while ((altMatch = altRegex.exec(html)) !== null) {
      const tagStr = altMatch[0];
      const langMatch = tagStr.match(/hrefLang=["']([^"']+)["']/i);
      const hrefMatch = tagStr.match(/href=["']([^"']+)["']/i);
      if (langMatch && hrefMatch) {
        hreflangs.push({ lang: langMatch[1], href: hrefMatch[1] });
      }
    }

    const h1s = extractAll(html, /<h1[^>]*>([\s\S]*?)<\/h1>/gi).map(s => s.replace(/<[^>]+>/g, '').trim());
    const h2s = extractAll(html, /<h2[^>]*>([\s\S]*?)<\/h2>/gi).map(s => s.replace(/<[^>]+>/g, '').trim());
    const h3s = extractAll(html, /<h3[^>]*>([\s\S]*?)<\/h3>/gi).map(s => s.replace(/<[^>]+>/g, '').trim());

    // JSON-LD
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

    // Images
    const imgMatches = html.match(/<img[^>]+>/gi) || [];
    const missingAlt = [];
    const externalImages = [];
    for (const img of imgMatches) {
      const alt = img.match(/alt=["']([^"']*)["']/i);
      const srcMatch = img.match(/src=["']([^"']+)["']/i);
      const src = srcMatch ? srcMatch[1] : '';
      if (!alt || !alt[1].trim()) {
        missingAlt.push(src || 'unknown');
      }
      if (src.includes('qrserver') || src.includes('chart.googleapis') || src.startsWith('http://') || (src.startsWith('https://') && !src.includes('localhost'))) {
        externalImages.push(src);
      }
    }

    // Duplicates check
    if (title) {
      if (!titleMap.has(title)) titleMap.set(title, []);
      titleMap.get(title).push(r);
    }
    if (desc) {
      if (!descMap.has(desc)) descMap.set(desc, []);
      descMap.get(desc).push(r);
    }

    const issues = [];
    if (!title) issues.push('Missing <title>');
    if (title && title.includes('— RiderSaathi — RiderSaathi')) issues.push('Double brand suffix');
    if (!desc) issues.push('Missing meta description');
    if (desc && (desc.length < 130 || desc.length > 175)) issues.push(`Desc length is ${desc.length}`);
    if (!canonical) issues.push('Missing canonical');
    if (h1s.length !== 1) issues.push(`H1 count is ${h1s.length}`);
    if (missingAlt.length > 0) issues.push(`Images missing alt: ${missingAlt.length}`);
    if (externalImages.length > 0) issues.push(`External images found: ${externalImages.join(', ')}`);
    if (!ogTitle || !ogDesc || !ogImage) issues.push('Incomplete OpenGraph');
    if (ogImage && !ogImage.endsWith('.png')) issues.push(`OG image is not PNG: ${ogImage}`);
    if (!twCard || !twTitle || !twImage) issues.push('Incomplete Twitter card');
    if (twImage && !twImage.endsWith('.png')) issues.push(`Twitter image is not PNG: ${twImage}`);

    results.push({
      route: r,
      title,
      desc,
      descLength: desc ? desc.length : 0,
      canonical,
      og: { ogTitle, ogDesc, ogImage, ogImageWidth, ogImageHeight, ogUrl, ogType, ogLocale, ogLocaleAlt },
      tw: { twCard, twTitle, twImage },
      htmlLang,
      hreflangs,
      h1Count: h1s.length,
      h1: h1s[0] || 'NONE',
      h2Count: h2s.length,
      h3Count: h3s.length,
      schemaTypes: schemaTypes.join(', ') || 'None',
      imgCount: imgMatches.length,
      missingAltCount: missingAlt.length,
      externalImages,
      issues,
      status: issues.length === 0 ? 'PASS' : 'WARN'
    });
  }

  // Specific tests for User Verification
  // 1. Buy UPI QR Code img tag extraction
  const buyUpiRes = await fetchPage('/buy/upi');
  const buyUpiImgTag = (buyUpiRes.html.match(/<img[^>]+alt=["']UPI Payment QR Code["'][^>]*>/i) || [])[0] || 
                       (buyUpiRes.html.match(/<img[^>]+>/i) || [])[0];
  const buyUpiSrcType = buyUpiImgTag && buyUpiImgTag.includes('data:image/png;base64') ? 'Base64 Local PNG Data URL' : 'Other';

  // 2. Bilingual test on /pricing
  const pricingHi = await fetchPage('/pricing', 'lang=hi');
  const pricingEn = await fetchPage('/pricing', 'lang=en');

  const pricingHiHead = pricingHi.html.substring(pricingHi.html.indexOf('<head>'), pricingHi.html.indexOf('</head>') + 7);
  const pricingEnHead = pricingEn.html.substring(pricingEn.html.indexOf('<head>'), pricingEn.html.indexOf('</head>') + 7);

  const pricingHiTitle = extractTag(pricingHi.html, /<title[^>]*>([^<]+)<\/title>/i);
  const pricingEnTitle = extractTag(pricingEn.html, /<title[^>]*>([^<]+)<\/title>/i);
  const pricingHiDesc = extractTag(pricingHi.html, /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
  const pricingEnDesc = extractTag(pricingEn.html, /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);

  const pricingHiOgLocale = extractTag(pricingHi.html, /<meta\s+property=["']og:locale["']\s+content=["']([^"']+)["']/i);
  const pricingHiOgLocaleAlt = extractTag(pricingHi.html, /<meta\s+property=["']og:locale:alternate["']\s+content=["']([^"']+)["']/i);
  const pricingEnOgLocale = extractTag(pricingEn.html, /<meta\s+property=["']og:locale["']\s+content=["']([^"']+)["']/i);
  const pricingEnOgLocaleAlt = extractTag(pricingEn.html, /<meta\s+property=["']og:locale:alternate["']\s+content=["']([^"']+)["']/i);

  const pricingHiHreflangs = [];
  let m;
  const re = /<link\s+[^>]*rel=["']alternate["'][^>]*>/gi;
  while ((m = re.exec(pricingHi.html)) !== null) {
    pricingHiHreflangs.push(m[0]);
  }

  // 3. Dynamic route sample (/guides/[slug])
  const sampleSlug = guides[0].slug;
  const sampleGuide = await fetchPage(`/guides/${sampleSlug}`);
  const sampleGuideTitle = extractTag(sampleGuide.html, /<title[^>]*>([^<]+)<\/title>/i);
  const sampleGuideDesc = extractTag(sampleGuide.html, /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
  const sampleGuideCanonical = extractTag(sampleGuide.html, /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);

  // 4. Duplicate checks
  const duplicateTitles = [];
  for (const [t, paths] of titleMap.entries()) {
    if (paths.length > 1) duplicateTitles.push({ title: t, paths });
  }

  const duplicateDescs = [];
  for (const [d, paths] of descMap.entries()) {
    if (paths.length > 1) duplicateDescs.push({ desc: d, paths });
  }

  const output = {
    totalRoutes: routes.length,
    passedCount: results.filter(r => r.issues.length === 0).length,
    routes: results,
    qrVerification: {
      route: '/buy/upi',
      imgTagSnippet: buyUpiImgTag ? buyUpiImgTag.substring(0, 140) + '... (len: ' + buyUpiImgTag.length + ')' : 'None',
      srcType: buyUpiSrcType,
      isExternal: buyUpiImgTag ? (buyUpiImgTag.includes('qrserver') || buyUpiImgTag.includes('chart.googleapis')) : false,
    },
    bilingualPricingTest: {
      hi: {
        title: pricingHiTitle,
        desc: pricingHiDesc,
        descLen: pricingHiDesc ? pricingHiDesc.length : 0,
        ogLocale: pricingHiOgLocale,
        ogLocaleAlt: pricingHiOgLocaleAlt,
        hreflangTags: pricingHiHreflangs
      },
      en: {
        title: pricingEnTitle,
        desc: pricingEnDesc,
        descLen: pricingEnDesc ? pricingEnDesc.length : 0,
        ogLocale: pricingEnOgLocale,
        ogLocaleAlt: pricingEnOgLocaleAlt,
      }
    },
    sampleDynamicGuide: {
      slug: sampleSlug,
      title: sampleGuideTitle,
      desc: sampleGuideDesc,
      descLen: sampleGuideDesc ? sampleGuideDesc.length : 0,
      canonical: sampleGuideCanonical,
    },
    duplicateTitles,
    duplicateDescs,
  };

  fs.writeFileSync(path.join(__dirname, 'deep-seo-audit-results.json'), JSON.stringify(output, null, 2), 'utf8');
  console.log(`Deep audit finished: ${output.passedCount}/${output.totalRoutes} routes 100% PASS.`);
  console.log(`QR Source: ${output.qrVerification.srcType}, IsExternal: ${output.qrVerification.isExternal}`);
  console.log(`Duplicate titles: ${duplicateTitles.length}, Duplicate descs: ${duplicateDescs.length}`);
}

runDeepAudit().catch(console.error);
