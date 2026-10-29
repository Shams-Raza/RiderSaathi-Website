const sharp = require('sharp');
const path = require('path');

const inputPath = 'C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\cdac98d1-d207-4fe8-875a-c6d4e9cfccf8\\.user_uploaded\\media_1793197721884.jpg';
const outputDir = path.join(process.cwd(), 'public', 'images');

async function cropClean() {
  const metadata = await sharp(inputPath).metadata();
  // Cut exactly above the logo (y = 0 to 650)
  await sharp(inputPath)
    .extract({
      left: Math.round(metadata.width * 0.04),
      top: Math.round(metadata.height * 0.04),
      width: Math.round(metadata.width * 0.92),
      height: Math.round(metadata.height * 0.62)
    })
    .png({ quality: 95 })
    .toFile(path.join(outputDir, 'hero-robot-clean.png'));
  console.log('Saved hero-robot-clean.png');
}

cropClean().catch(console.error);
