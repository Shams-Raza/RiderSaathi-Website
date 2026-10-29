const http = require('http');

http.get('http://localhost:3000', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('HTTP Status:', res.statusCode);
    
    // Check Brand Logo
    const hasLogo = data.includes('/images/logo.png');
    console.log('Brand Logo (/images/logo.png):', hasLogo ? 'PASS' : 'FAIL');
    
    // Check Hero Badge
    const hasHeroBadge = data.includes('hero-smart-badge');
    console.log('Hero Smart Badge:', hasHeroBadge ? 'PASS' : 'FAIL');
    
    // Check 3D Robot
    const hasRobot = data.includes('/images/hero-robot-clean.png');
    console.log('3D Robot Graphic (/images/hero-robot-clean.png):', hasRobot ? 'PASS' : 'FAIL');
    
    // Check Floating Cards
    const hasCard1 = data.includes('card-top-right');
    const hasCard2 = data.includes('card-mid-right');
    const hasCard3 = data.includes('card-bottom-left');
    console.log('Floating Glassmorphism Cards (3):', (hasCard1 && hasCard2 && hasCard3) ? 'PASS' : 'FAIL');
    
    // Check Feature Strip
    const hasFeatureStrip = data.includes('feature-strip');
    console.log('Feature Strip (3 columns):', hasFeatureStrip ? 'PASS' : 'FAIL');
    
    // Check 3 Modern Feature Cards
    const hasSaasFeatures = data.includes('saas-features-grid');
    console.log('3 Modern Feature Cards:', hasSaasFeatures ? 'PASS' : 'FAIL');
    
    // Check Built for Drivers Section
    const hasBuiltDrivers = data.includes('built-drivers-section');
    const hasDriverImg = data.includes('happy-driver.jpg');
    console.log('Built for Drivers Section + Photo:', (hasBuiltDrivers && hasDriverImg) ? 'PASS' : 'FAIL');
  });
}).on('error', err => {
  console.error('Error connecting to localhost:3000:', err.message);
});
