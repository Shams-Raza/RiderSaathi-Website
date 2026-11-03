// Crawl all internal links and images across all pages to check for 404s
const http = require('http');

const BASE_URL = 'http://localhost:3000';

function get(path) {
  return new Promise((resolve) => {
    try {
      const url = new URL(path, BASE_URL);
      http.get(url, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
      }).on('error', (err) => resolve({ status: 500, error: err.message }));
    } catch(e) {
      resolve({ status: 500, error: e.message });
    }
  });
}

async function verifyAllAssetsAndLinks() {
  console.log('=== CHECKING ALL INTERNAL LINKS & IMAGES FOR 404s ===\n');

  const pages = [
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

  const foundImages = new Set();
  const foundLinks = new Set();

  for (const page of pages) {
    const res = await get(page);
    if (res.status !== 200) {
      console.log(`❌ Page ${page} failed with status ${res.status}`);
      continue;
    }

    // Extract images
    const imgMatches = res.body.matchAll(/<img[^>]+src=["']([^"']+)["']/g);
    for (const match of imgMatches) {
      const src = match[1];
      if (src.startsWith('/') && !src.startsWith('//')) {
        foundImages.add(src);
      }
    }

    // Extract links
    const linkMatches = res.body.matchAll(/<a[^>]+href=["']([^"']+)["']/g);
    for (const match of linkMatches) {
      const href = match[1];
      if (href.startsWith('/') && !href.startsWith('//') && !href.startsWith('/#')) {
        foundLinks.add(href.split('#')[0]);
      }
    }
  }

  console.log(`Found ${foundImages.size} unique internal images to verify:`);
  let imgFailures = 0;
  for (const src of foundImages) {
    const res = await get(src);
    const ok = res.status === 200 || res.status === 304;
    console.log(`  ${ok ? '✅' : '❌'} [${res.status}] ${src}`);
    if (!ok) imgFailures++;
  }

  console.log(`\nFound ${foundLinks.size} unique internal links to verify:`);
  let linkFailures = 0;
  for (const href of foundLinks) {
    const res = await get(href);
    const ok = res.status === 200 || res.status === 302 || res.status === 307;
    console.log(`  ${ok ? '✅' : '❌'} [${res.status}] ${href}`);
    if (!ok) linkFailures++;
  }

  console.log(`\nAsset Check Result: ${imgFailures === 0 ? 'ALL IMAGES VALID ✅' : imgFailures + ' IMAGES BROKEN ❌'}`);
  console.log(`Link Check Result: ${linkFailures === 0 ? 'ALL LINKS VALID ✅' : linkFailures + ' LINKS BROKEN ❌'}`);
}

verifyAllAssetsAndLinks().catch(console.error);
