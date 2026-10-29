const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function createOgImage() {
  const width = 1200;
  const height = 630;

  // Create an SVG banner at 1200x630
  const svgBanner = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0f172a" />
        <stop offset="40%" stop-color="#1e293b" />
        <stop offset="100%" stop-color="#1e3a8a" />
      </linearGradient>
      <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#3b82f6" />
        <stop offset="100%" stop-color="#60a5fa" />
      </linearGradient>
      <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.4" />
      </filter>
    </defs>

    <!-- Background -->
    <rect width="${width}" height="${height}" fill="url(#bg)" />

    <!-- Subtle Grid Accent Lines -->
    <g stroke="rgba(255,255,255,0.04)" stroke-width="1">
      <line x1="0" y1="126" x2="1200" y2="126" />
      <line x1="0" y1="252" x2="1200" y2="252" />
      <line x1="0" y1="378" x2="1200" y2="378" />
      <line x1="0" y1="504" x2="1200" y2="504" />
      <line x1="240" y1="0" x2="240" y2="630" />
      <line x1="480" y1="0" x2="480" y2="630" />
      <line x1="720" y1="0" x2="720" y2="630" />
      <line x1="960" y1="0" x2="960" y2="630" />
    </g>

    <!-- Glowing Accent Circles -->
    <circle cx="1050" cy="150" r="280" fill="#2563eb" opacity="0.18" filter="blur(60px)" />
    <circle cx="150" cy="520" r="240" fill="#3b82f6" opacity="0.12" filter="blur(50px)" />

    <!-- Container Card -->
    <g transform="translate(100, 75)">
      <!-- Brand Logo Badge -->
      <g filter="url(#shadow)">
        <rect x="0" y="0" width="88" height="88" rx="22" fill="#2563eb" />
        <!-- Lightning bolt path from icon.svg scaled -->
        <path d="M49.5 9.17 L22 47.67 h20.17 l-5.5 31.16 27.5 -38.5 h-20.17 z" fill="#ffffff" />
      </g>

      <!-- Site Brand Name & Pill -->
      <text x="110" y="58" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="44" font-weight="800" fill="#ffffff" letter-spacing="-1">RiderSaathi</text>
      
      <rect x="360" y="24" width="180" height="38" rx="19" fill="rgba(34, 197, 94, 0.2)" stroke="rgba(34, 197, 94, 0.5)" stroke-width="1.5" />
      <text x="382" y="49" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="700" fill="#4ade80">10 RIDES FREE</text>

      <!-- Headline -->
      <text x="0" y="180" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="56" font-weight="800" fill="#ffffff" letter-spacing="-1.2">
        Smart Ride Filter Assistant
      </text>

      <!-- Subheadline -->
      <text x="0" y="245" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="500" fill="#cbd5e1">
        For Rapido, Uber &amp; Porter Captains
      </text>

      <text x="0" y="295" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="400" fill="#94a3b8">
        Set custom rules: trip distance, pickup limit, fare filter &amp; auto-accept in 0.5s
      </text>

      <!-- Feature Badges Row -->
      <g transform="translate(0, 360)">
        <!-- Badge 1 -->
        <rect x="0" y="0" width="260" height="56" rx="14" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" stroke-width="1" />
        <text x="24" y="35" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="600" fill="#f8fafc">⚡ 0.5s Fast Auto-Accept</text>

        <!-- Badge 2 -->
        <rect x="280" y="0" width="260" height="56" rx="14" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" stroke-width="1" />
        <text x="304" y="35" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="600" fill="#f8fafc">📍 Distance &amp; Area Filter</text>

        <!-- Badge 3 -->
        <rect x="560" y="0" width="260" height="56" rx="14" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" stroke-width="1" />
        <text x="584" y="35" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="600" fill="#f8fafc">🔒 100% On-Device Safety</text>
      </g>

      <!-- Footer URL -->
      <text x="0" y="475" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="700" fill="#60a5fa">
        ridersaathi.com
      </text>
    </g>
  </svg>
  `;

  const outputPath = path.join(__dirname, '../public/images/og-default.png');
  await sharp(Buffer.from(svgBanner))
    .png({ quality: 95, compressionLevel: 8 })
    .toFile(outputPath);

  const stats = fs.statSync(outputPath);
  console.log(`Generated OG Image at ${outputPath}: ${width}x${height}, ${(stats.size / 1024).toFixed(1)} KB`);
}

createOgImage().catch(console.error);
