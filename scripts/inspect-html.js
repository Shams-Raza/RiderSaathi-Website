const http = require('http');

http.get('http://localhost:3000/?lang=en', r => {
  let b = '';
  r.on('data', c => b += c);
  r.on('end', () => {
    const matches = b.match(/<link[^>]*rel=["']alternate["'][^>]*>/gi);
    console.log('Homepage alternates:', matches);
  });
});
