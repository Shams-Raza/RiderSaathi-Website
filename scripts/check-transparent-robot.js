const sharp = require('sharp');
const path = require('path');

async function check() {
  const imgPath = path.join(process.cwd(), 'public', 'images', 'hero-robot-transparent.png');
  const img = sharp(imgPath);
  const meta = await img.metadata();
  console.log('Channels:', meta.channels, 'hasAlpha:', meta.hasAlpha);

  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const corners = [
    [0, 0],
    [info.width - 1, 0],
    [0, info.height - 1],
    [info.width - 1, info.height - 1],
    [Math.round(info.width / 2), Math.round(info.height / 2)]
  ];
  for (const [x, y] of corners) {
    const idx = (y * info.width + x) * info.channels;
    console.log(`Pixel (${x}, ${y}): R=${data[idx]} G=${data[idx+1]} B=${data[idx+2]} A=${data[idx+3]}`);
  }
}

check().catch(console.error);
