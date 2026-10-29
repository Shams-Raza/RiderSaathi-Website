const sharp = require('sharp');
const path = require('path');

const inputPath = 'C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\cdac98d1-d207-4fe8-875a-c6d4e9cfccf8\\.user_uploaded\\media_1793197721884.jpg';

async function makePerfectLogo() {
  const metadata = await sharp(inputPath).metadata();
  const width = metadata.width;
  const height = metadata.height;

  // Extract region containing "Rider Sathi RIDE AUTO ACCEPT BOT"
  const cropLeft = Math.round(width * 0.04);
  const cropTop = Math.round(height * 0.665);
  const cropWidth = Math.round(width * 0.92);
  const cropHeight = Math.round(height * 0.275);

  const croppedBuffer = await sharp(inputPath)
    .extract({ left: cropLeft, top: cropTop, width: cropWidth, height: cropHeight })
    .toBuffer();

  const { data, info } = await sharp(croppedBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = info.width;
  const h = info.height;
  const visited = new Uint8Array(w * h);
  const queue = [];

  function isBackground(x, y) {
    const idx = (y * w + x) * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    // Background is white or black squircle border
    if (r > 240 && g > 240 && b > 240) return true;
    if (r < 40 && g < 40 && b < 40) return true;
    // Wipe wheel top area
    if (y < 70 && (x < 215 || x > 275)) return true;
    if (y < 20) return true;
    // Wipe corner arcs
    if (y > 140 && (x < 150 || x > 720)) return true;
    return false;
  }

  // Push all border pixels to queue
  for (let x = 0; x < w; x++) {
    queue.push(x, 0);
    queue.push(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    queue.push(0, y);
    queue.push(w - 1, y);
  }

  // BFS Flood-fill
  let head = 0;
  while (head < queue.length) {
    const x = queue[head++];
    const y = queue[head++];
    const pos = y * w + x;
    if (visited[pos]) continue;
    visited[pos] = 1;

    if (isBackground(x, y)) {
      const idx = pos * 4;
      data[idx + 3] = 0; // Make transparent

      // Check 4 neighbors
      if (x > 0 && !visited[pos - 1]) queue.push(x - 1, y);
      if (x < w - 1 && !visited[pos + 1]) queue.push(x + 1, y);
      if (y > 0 && !visited[pos - w]) queue.push(x, y - 1);
      if (y < h - 1 && !visited[pos + w]) queue.push(x, y + 1);
    }
  }

  await sharp(data, {
    raw: {
      width: w,
      height: h,
      channels: 4,
    }
  })
    .trim()
    .png({ quality: 100 })
    .toFile(path.join(process.cwd(), 'public', 'images', 'logo.png'));

  console.log('Flood-filled and pristine public/images/logo.png created!');
}

makePerfectLogo().catch(console.error);
