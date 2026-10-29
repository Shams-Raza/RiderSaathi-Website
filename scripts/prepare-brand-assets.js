const sharp = require('sharp');
const path = require('path');

const inputPath = 'C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\cdac98d1-d207-4fe8-875a-c6d4e9cfccf8\\.user_uploaded\\media_1793197721884.jpg';
const outputDir = path.join(process.cwd(), 'public', 'images');

async function processImage() {
  const metadata = await sharp(inputPath).metadata();
  const width = metadata.width;
  const height = metadata.height;

  // 1. Robot Hero Character: from top 30 to y 720, centered horizontally
  await sharp(inputPath)
    .extract({
      left: Math.round(width * 0.05),
      top: Math.round(height * 0.05),
      width: Math.round(width * 0.90),
      height: Math.round(height * 0.68)
    })
    .png({ quality: 95 })
    .toFile(path.join(outputDir, 'hero-robot.png'));
  console.log('Saved hero-robot.png');

  // 2. Clean brand logo with the pill badge
  await sharp(inputPath)
    .extract({
      left: Math.round(width * 0.04),
      top: Math.round(height * 0.66),
      width: Math.round(width * 0.92),
      height: Math.round(height * 0.28)
    })
    .png()
    .toFile(path.join(outputDir, 'brand-logo-with-pill.png'));
  console.log('Saved brand-logo-with-pill.png');
}

processImage().catch(console.error);
