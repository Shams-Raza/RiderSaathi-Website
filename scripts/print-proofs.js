const http = require('http');

function get(urlPath, headers = {}) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${urlPath}`, { headers }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function printProofs() {
  console.log('=== PROOF 1: QR CODE IMG TAG ON /buy/upi ===');
  const upiHtml = await get('/buy/upi');
  const imgMatch = upiHtml.match(/<img[^>]+alt=["']UPI Payment QR Code["'][^>]*>/i);
  if (imgMatch) {
    const fullTag = imgMatch[0];
    const srcMatch = fullTag.match(/src=["']([^"']+)["']/i);
    const src = srcMatch ? srcMatch[1] : '';
    console.log('Tag Snippet:');
    console.log(fullTag.substring(0, 150) + '... (src starts with ' + src.substring(0, 30) + '...)');
    console.log('Source Type:', src.startsWith('data:image/png;base64,') ? '100% Offline Local Base64 PNG' : 'External');
    console.log('Total Tag Chars:', fullTag.length);
  }

  console.log('\n=== PROOF 2: OG:IMAGE & TWITTER:IMAGE ON HOMEPAGE ===');
  const homeHtml = await get('/');
  const homeOgImg = homeHtml.match(/<meta\s+property=["']og:image["'][^>]+>/i);
  const homeOgWidth = homeHtml.match(/<meta\s+property=["']og:image:width["'][^>]+>/i);
  const homeOgHeight = homeHtml.match(/<meta\s+property=["']og:image:height["'][^>]+>/i);
  const homeOgType = homeHtml.match(/<meta\s+property=["']og:image:type["'][^>]+>/i);
  const homeTwImg = homeHtml.match(/<meta\s+name=["']twitter:image["'][^>]+>/i);
  console.log(homeOgImg ? homeOgImg[0] : 'None');
  console.log(homeOgWidth ? homeOgWidth[0] : 'None');
  console.log(homeOgHeight ? homeOgHeight[0] : 'None');
  console.log(homeOgType ? homeOgType[0] : 'None');
  console.log(homeTwImg ? homeTwImg[0] : 'None');

  console.log('\n=== PROOF 2b: OG:IMAGE & TWITTER:IMAGE ON /pricing ===');
  const pricingHtml = await get('/pricing');
  const pricingOgImg = pricingHtml.match(/<meta\s+property=["']og:image["'][^>]+>/i);
  const pricingTwImg = pricingHtml.match(/<meta\s+name=["']twitter:image["'][^>]+>/i);
  console.log(pricingOgImg ? pricingOgImg[0] : 'None');
  console.log(pricingTwImg ? pricingTwImg[0] : 'None');

  console.log('\n=== PROOF 3: FULL RENDERED <TITLE> FOR /pricing ===');
  const pricingHiTitle = (await get('/pricing', { 'Cookie': 'lang=hi' })).match(/<title[^>]*>([^<]+)<\/title>/i);
  const pricingEnTitle = (await get('/pricing', { 'Cookie': 'lang=en' })).match(/<title[^>]*>([^<]+)<\/title>/i);
  console.log('Hindi Title:', pricingHiTitle ? pricingHiTitle[0] : 'None');
  console.log('English Title:', pricingEnTitle ? pricingEnTitle[0] : 'None');

  console.log('\n=== PROOF 4: OG:LOCALE & OG:LOCALE:ALTERNATE ON /pricing ===');
  const prHiHtml = await get('/pricing', { 'Cookie': 'lang=hi' });
  const ogLocaleHi = prHiHtml.match(/<meta\s+property=["']og:locale["'][^>]+>/i);
  const ogLocaleAltHi = prHiHtml.match(/<meta\s+property=["']og:locale:alternate["'][^>]+>/i);
  console.log('Default Hindi:', ogLocaleHi ? ogLocaleHi[0] : 'None');
  console.log('Alternate English:', ogLocaleAltHi ? ogLocaleAltHi[0] : 'None');

  console.log('\n=== PROOF 5: HREFLANG TAGS ON /pricing ===');
  const hreflangMatches = [];
  let m;
  const re = /<link\s+[^>]*rel=["']alternate["'][^>]*>/gi;
  while ((m = re.exec(prHiHtml)) !== null) {
    hreflangMatches.push(m[0]);
  }
  hreflangMatches.forEach(t => console.log(t));

  console.log('\n=== PROOF 6: DYNAMIC GUIDE /guides/ridersaathi-shuru-kaise-kare ===');
  const guideHtml = await get('/guides/ridersaathi-shuru-kaise-kare');
  const gTitle = guideHtml.match(/<title[^>]*>([^<]+)<\/title>/i);
  const gDesc = guideHtml.match(/<meta\s+name=["']description["'][^>]+>/i);
  console.log('Title:', gTitle ? gTitle[0] : 'None');
  console.log('Description Tag:', gDesc ? gDesc[0] : 'None');
  const gDescContent = gDesc ? gDesc[0].match(/content=["']([^"']+)["']/i)[1] : '';
  console.log('Exact Description Length:', gDescContent.length, 'characters');
}

printProofs().catch(console.error);
