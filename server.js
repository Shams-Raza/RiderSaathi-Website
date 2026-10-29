// RiderSaathi Production Next.js Server (Compatible with Render, Cloud & Local)
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const dev = process.env.NODE_ENV === 'development';
const port = parseInt(process.env.PORT || '3000', 10);
const hostname = '0.0.0.0';

// If .next build directory is missing in production, build automatically
if (!dev && !fs.existsSync(path.join(__dirname, '.next'))) {
  console.log('[Render Server] .next build directory missing. Building Next.js project now...');
  try {
    execSync('npx next build', { stdio: 'inherit', env: process.env });
  } catch (buildErr) {
    console.error('[Render Server] Build error:', buildErr);
    process.exit(1);
  }
}

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error handling request:', req.url, err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  }).listen(port, hostname, (err) => {
    if (err) throw err;
    console.log(`[RiderSaathi Next.js Server] Ready on http://${hostname}:${port}`);
  });
}).catch((err) => {
  console.error('[RiderSaathi Next.js Server] Startup error:', err);
  process.exit(1);
});
