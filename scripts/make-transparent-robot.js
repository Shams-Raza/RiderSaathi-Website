const sharp = require('sharp');
const path = require('path');

const inputPath = 'C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\cdac98d1-d207-4fe8-875a-c6d4e9cfccf8\\.user_uploaded\\media_1793197721884.jpg';

async function makeTransparentRobot() {
  const metadata = await sharp(inputPath).metadata();
  
  // Crop the robot area (top 68% of image)
  const cropLeft = Math.round(metadata.width * 0.05);
  const cropTop = Math.round(metadata.height * 0.05);
  const cropWidth = Math.round(metadata.width * 0.90);
  const cropHeight = Math.round(metadata.height * 0.62);

  const cropped = await sharp(inputPath)
    .extract({ left: cropLeft, top: cropTop, width: cropWidth, height: cropHeight })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = cropped;
  const w = info.width;
  const h = info.height;

  // Let's create an alpha mask:
  // Any black pixel from the squircle border: R < 40 && G < 40 && B < 40 -> alpha = 0
  // Any background near white: R > 245 && G > 245 && B > 245
  // Let's do a BFS flood-fill starting from all 4 borders
  const visited = new Uint8Array(w * h);
  const queue = [];

  function isOuterBg(x, y) {
    const idx = (y * w + x) * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];

    // Black outer border
    if (r < 45 && g < 45 && b < 45) return true;
    // White/very light background outside the robot
    if (r > 235 && g > 235 && b > 235) return true;
    // Very pale mint tint background (R: 215-245, G: 240-255, B: 220-250)
    if (r > 200 && g > 230 && b > 210 && Math.abs(r - b) < 25) return true;
    return false;
  }

  // Seed borders
  for (let x = 0; x < w; x++) {
    queue.push(x, 0);
    queue.push(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    queue.push(0, y);
    queue.push(w - 1, y);
  }

  let head = 0;
  while (head < queue.length) {
    const x = queue[head++];
    const y = queue[head++];
    const pos = y * w + x;
    if (visited[pos]) continue;
    visited[pos] = 1;

    if (isOuterBg(x, y)) {
      const idx = pos * 4;
      data[idx + 3] = 0; // Transparent!

      if (x > 0 && !visited[pos - 1]) queue.push(x - 1, y);
      if (x < w - 1 && !visited[pos + 1]) queue.push(x + 1, y);
      if (y > 0 && !visited[pos - w]) queue.push(x, y - 1);
      if (y < h - 1 && !visited[pos + w]) queue.push(x, y + 1);
    }
  }

  // Also soften edges: for pixels near transparent, smooth alpha
  await sharp(data, {
    raw: { width: w, height: h, channels: 4 }
  })
    .png({ quality: 100 })
    .toFile(path.join(process.cwd(), 'public', 'images', 'hero-robot-transparent.png'));

  console.log('Created hero-robot-transparent.png successfully!');
}

makeTransparentRobot().catch(console.error);
