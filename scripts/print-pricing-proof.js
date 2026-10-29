const http = require('http');

function fetchRaw(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(body));
    }).on('error', reject);
  });
}

async function verifyPricing() {
  const targets = [
    { name: '/pricing?lang=en', url: 'http://localhost:3000/pricing?lang=en' },
    { name: '/pricing?lang=hi', url: 'http://localhost:3000/pricing?lang=hi' },
    { name: '/pricing (no param)', url: 'http://localhost:3000/pricing' },
  ];

  for (const t of targets) {
    const html = await fetchRaw(t.url);
    const lang = (html.match(/<html[^>]*lang=["']([^"']+)["']/i) || [])[1];
    const title = (html.match(/<title>([^<]*)<\/title>/i) || [])[1];
    const ogLocale = (html.match(/<meta[^>]*property=["']og:locale["'][^>]*content=["']([^"']+)["']/i) || [])[1];
    const h1 = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1]?.replace(/<[^>]+>/g, '').trim();
    const sub = (html.match(/<p[^>]*class=["']?[^>]*>\s*([A-Za-z0-9\u0900-\u097F\s—•\-]+?)\s*<\/p>/i) || [])[1]?.trim() || '';

    // Check hreflang links
    const linkRegex = /<link[^>]*rel=["']alternate["'][^>]*>/gi;
    const links = html.match(linkRegex) || [];

    console.log(`=== ${t.name} ===`);
    console.log(`  <html lang>: "${lang}"`);
    console.log(`  <title>: "${title}"`);
    console.log(`  og:locale: "${ogLocale}"`);
    console.log(`  <h1>: "${h1}"`);
    console.log(`  Alternate links count: ${links.length}`);
    links.forEach(l => console.log(`    ${l}`));
    console.log('');
  }
}

verifyPricing().catch(console.error);
