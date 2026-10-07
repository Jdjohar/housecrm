const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createPNG(width, height) {
  const bytesPerPixel = 4; // RGBA
  const rowSize = width * bytesPerPixel;
  const rawData = Buffer.alloc((rowSize + 1) * height);

  const rBg1 = 15, gBg1 = 23, bBg1 = 42; // #0f172a
  const rBg2 = 30, gBg2 = 58, bBg2 = 138; // #1e3a8a
  const rGold = 245, gGold = 158, bGold = 11; // #f59e0b
  const rWhite = 255, gWhite = 255, bWhite = 255;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (rowSize + 1);
    rawData[rowOffset] = 0; // Filter type 0 (None)

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * bytesPerPixel;
      const t = (x + y) / (width + height);
      let r = Math.round(rBg1 * (1 - t) + rBg2 * t);
      let g = Math.round(gBg1 * (1 - t) + gBg2 * t);
      let b = Math.round(bBg1 * (1 - t) + bBg2 * t);
      let a = 255;

      // Draw stylized "H&H" in center
      const nx = (x - width / 2) / (width * 0.42);
      const ny = (y - height / 2) / (height * 0.42);

      let isLetter = false;

      // Left H: vertical bars at [-0.85, -0.65] and [-0.45, -0.25], horizontal crossbar at ny [-0.15, 0.15]
      if (nx >= -0.85 && nx <= -0.25 && ny >= -0.65 && ny <= 0.65) {
        if (nx <= -0.65 || nx >= -0.45 || (ny >= -0.15 && ny <= 0.15)) {
          isLetter = true;
        }
      }

      // Center Ampersand (&)
      if (nx >= -0.20 && nx <= 0.20 && ny >= -0.55 && ny <= 0.55) {
        const dTop = Math.hypot(nx, ny + 0.25);
        const dBot = Math.hypot(nx, ny - 0.20);
        if ((dTop >= 0.10 && dTop <= 0.20) || (dBot >= 0.14 && dBot <= 0.25)) {
          isLetter = true;
        }
        if (nx >= -0.08 && nx <= 0.18 && ny >= -0.15 && ny <= 0.55 && Math.abs(nx - ny * 0.5) < 0.08) {
          isLetter = true;
        }
      }

      // Right H: vertical bars at [0.25, 0.45] and [0.65, 0.85], horizontal crossbar at ny [-0.15, 0.15]
      if (nx >= 0.25 && nx <= 0.85 && ny >= -0.65 && ny <= 0.65) {
        if (nx <= 0.45 || nx >= 0.65 || (ny >= -0.15 && ny <= 0.15)) {
          isLetter = true;
        }
      }

      if (isLetter) {
        r = rGold;
        g = gGold;
        b = bGold;
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);

  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // bit depth 8
  ihdr.writeUInt8(6, 9); // color type 6 (RGBA)
  ihdr.writeUInt8(0, 10); // compression
  ihdr.writeUInt8(0, 11); // filter
  ihdr.writeUInt8(0, 12); // interlace

  const ihdrChunk = createChunk('IHDR', ihdr);
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(len + 12);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);

  const crc = calculateCRC(chunk.subarray(4, len + 8));
  chunk.writeUInt32BE(crc, len + 8);
  return chunk;
}

function calculateCRC(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (-(crc & 1) & 0xedb88320);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

const iconsDir = path.join(process.cwd(), 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

fs.writeFileSync(path.join(iconsDir, 'icon-192x192.png'), createPNG(192, 192));
fs.writeFileSync(path.join(iconsDir, 'icon-512x512.png'), createPNG(512, 512));
fs.writeFileSync(path.join(iconsDir, 'maskable-icon-512x512.png'), createPNG(512, 512));
fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.png'), createPNG(180, 180));
fs.writeFileSync(path.join(iconsDir, 'favicon-32x32.png'), createPNG(32, 32));

console.log('PWA app icons generated successfully in public/icons!');
