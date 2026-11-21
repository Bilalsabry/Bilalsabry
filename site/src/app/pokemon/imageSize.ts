// Reads width/height from an image header (JPEG, PNG, WebP) at build time, so
// the page can size every photo with plain percentages. No dependencies.
import fs from "node:fs";

export function imageSize(file: string): [number, number] | null {
  let b: Buffer;
  try {
    b = fs.readFileSync(file);
  } catch {
    return null;
  }
  // PNG: IHDR width/height at bytes 16..23
  if (b.length > 24 && b[0] === 0x89 && b.toString("ascii", 1, 4) === "PNG") {
    return [b.readUInt32BE(16), b.readUInt32BE(20)];
  }
  // WebP: RIFF....WEBP then VP8X / VP8 / VP8L
  if (b.length > 30 && b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP") {
    const kind = b.toString("ascii", 12, 16);
    if (kind === "VP8X") return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)];
    if (kind === "VP8 ") return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
    if (kind === "VP8L") {
      const n = b.readUInt32LE(21);
      return [1 + (n & 0x3fff), 1 + ((n >> 14) & 0x3fff)];
    }
    return null;
  }
  // JPEG: walk the segments to the first start-of-frame marker
  if (b.length > 4 && b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i + 9 < b.length) {
      if (b[i] !== 0xff) {
        i++;
        continue;
      }
      const m = b[i + 1];
      if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) {
        return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)];
      }
      if (m === 0xd8 || m === 0x01 || (m >= 0xd0 && m <= 0xd7)) {
        i += 2;
        continue;
      }
      i += 2 + b.readUInt16BE(i + 2);
    }
  }
  return null;
}
