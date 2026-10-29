const http = require('http');

function fetchRaw(url, cookie = '') {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const options = {
      hostname: parsed.hostname,
      port: parsed.port || 80,
      path: parsed.pathname + parsed.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        ...(cookie ? { 'Cookie': cookie } : {})
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

function extractDetails(html) {
  const htmlLangMatch = html.match(/<html[^>]*lang=["']([^"']+)["']/i);
  const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
  const ogLocaleMatch = html.match(/<meta[^>]*property=["']og:locale["'][^>]*content=["']([^"']+)["']/i);
  const ogAltMatch = html.match(/<meta[^>]*property=["']og:locale:alternate["'][^>]*content=["']([^"']+)["']/i);
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  
  // hreflang alternate links
  const altLinks = [];
  const linkRegex = /<link[^>]*rel=["']alternate["'][^>]*>/gi;
  let m;
  while ((m = linkRegex.exec(html)) !== null) {
    const tag = m[0];
    const hreflang = (tag.match(/hrefLang=["']([^"']+)["']/i) || tag.match(/hreflang=["']([^"']+)["']/i))?.[1];
    const href = tag.match(/href=["']([^"']+)["']/i)?.[1];
    if (hreflang) {
      altLinks.push({ hreflang, href });
    }
  }

  return {
    htmlLang: htmlLangMatch ? htmlLangMatch[1] : 'NOT_FOUND',
    title: titleMatch ? titleMatch[1] : 'NOT_FOUND',
    ogLocale: ogLocaleMatch ? ogLocaleMatch[1] : 'NOT_FOUND',
    ogLocaleAlt: ogAltMatch ? ogAltMatch[1] : 'NOT_FOUND',
    h1: h1Match ? h1Match[1].replace(/<[^>]+>/g, '').trim() : 'NOT_FOUND',
    altLinks
  };
}

async function run() {
  console.log('=== VERIFYING HREFLANG FIX (NO COOKIE REQUESTS) ===\n');

  const urls = [
    'http://localhost:3000/pricing?lang=en',
    'http://localhost:3000/pricing?lang=hi',
    'http://localhost:3000/pricing',
    'http://localhost:3000/?lang=en',
    'http://localhost:3000/?lang=hi',
    'http://localhost:3000/',
    'http://localhost:3000/faq?lang=en',
    'http://localhost:3000/faq?lang=hi',
    'http://localhost:3000/faq',
    'http://localhost:3000/how-it-works?lang=en',
    'http://localhost:3000/how-it-works?lang=hi',
    'http://localhost:3000/how-it-works'
  ];

  const results = [];
  for (const u of urls) {
    const res = await fetchRaw(u);
    const parsed = extractDetails(res.body);
    results.push({ url: u, ...parsed });
  }

  console.log(JSON.stringify(results, null, 2));

  console.log('\n=== CHECKING SITEMAP.XML ===\n');
  const sitemapRes = await fetchRaw('http://localhost:3000/sitemap.xml');
  console.log('Sitemap status:', sitemapRes.statusCode);
  console.log('First 1500 chars of sitemap:');
  console.log(sitemapRes.body.slice(0, 1500));

  console.log('\n=== CHECKING /set-language/[lang] ROUTE ===\n');
  const setLangEn = await fetchRaw('http://localhost:3000/set-language/en');
  console.log('/set-language/en status:', setLangEn.statusCode);
  console.log('/set-language/en location:', setLangEn.headers.location);
  console.log('/set-language/en set-cookie:', setLangEn.headers['set-cookie']);

  const setLangHi = await fetchRaw('http://localhost:3000/set-language/hi');
  console.log('/set-language/hi status:', setLangHi.statusCode);
  console.log('/set-language/hi location:', setLangHi.headers.location);
  console.log('/set-language/hi set-cookie:', setLangHi.headers['set-cookie']);
}

run().catch(console.error);
