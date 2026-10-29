const http = require('http');

function fetchRaw(url) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const options = {
      hostname: parsed.hostname,
      port: parsed.port || 80,
      path: parsed.pathname + parsed.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      }
    };
    http.get(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body
        });
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('====================================================');
  console.log('CHECK 1 — CANONICAL & OG:URL FOR LANG VARIANTS');
  console.log('====================================================\n');

  const check1Urls = [
    'http://localhost:3000/pricing?lang=en',
    'http://localhost:3000/pricing?lang=hi',
    'http://localhost:3000/pricing'
  ];

  for (const u of check1Urls) {
    const res = await fetchRaw(u);
    const canonicalMatch = res.body.match(/<link[^>]*rel=["']canonical["'][^>]*>/i);
    const ogUrlMatch = res.body.match(/<meta[^>]*property=["']og:url["'][^>]*>/i);
    console.log(`URL: ${u}`);
    console.log(`  Canonical Tag: ${canonicalMatch ? canonicalMatch[0] : 'NOT FOUND'}`);
    console.log(`  og:url Tag:    ${ogUrlMatch ? ogUrlMatch[0] : 'NOT FOUND'}`);
    console.log('');
  }

  console.log('====================================================');
  console.log('CHECK 2 — SITEMAP XML ROOT & NAMESPACES');
  console.log('====================================================\n');

  const sitemapRes = await fetchRaw('http://localhost:3000/sitemap.xml');
  const lines = sitemapRes.body.split('\n');
  console.log(`Status Code: ${sitemapRes.statusCode}`);
  console.log('First 6 lines of /sitemap.xml:');
  for (let i = 0; i < Math.min(6, lines.length); i++) {
    console.log(`Line ${i + 1}: ${lines[i]}`);
  }
  const hasXhtmlNamespace = sitemapRes.body.includes('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
  console.log(`\nHas xmlns:xhtml="http://www.w3.org/1999/xhtml": ${hasXhtmlNamespace ? 'YES' : 'NO'}\n`);

  console.log('====================================================');
  console.log('CHECK 3 — MIDDLEWARE EDGE CASES');
  console.log('====================================================\n');

  const edgeCases = [
    { label: '/pricing?lang=EN (uppercase)', path: '/pricing?lang=EN' },
    { label: '/pricing?lang=xx (invalid)', path: '/pricing?lang=xx' },
    { label: '/pricing?lang= (empty)', path: '/pricing?lang=' },
    { label: '/pricing?lang=en&lang=hi (duplicate)', path: '/pricing?lang=en&lang=hi' }
  ];

  console.log('| Test Case | Status Code | <html lang> | Title Rendered | Fallback to Default (hi) |');
  console.log('|---|---|---|---|---|');

  for (const ec of edgeCases) {
    const res = await fetchRaw(`http://localhost:3000${ec.path}`);
    const htmlLangMatch = res.body.match(/<html[^>]*lang=["']([^"']+)["']/i);
    const titleMatch = res.body.match(/<title>([^<]*)<\/title>/i);
    const lang = htmlLangMatch ? htmlLangMatch[1] : 'NONE';
    const title = titleMatch ? titleMatch[1].replace(/&amp;/g, '&') : 'NONE';
    const fallsBack = lang === 'hi' ? 'YES' : 'NO';
    console.log(`| \`${ec.label}\` | \`${res.statusCode}\` | \`${lang}\` | ${title} | **${fallsBack}** |`);
  }
  console.log('');
}

run().catch(console.error);
