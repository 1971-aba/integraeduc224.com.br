import fs from "node:fs";
import zlib from "node:zlib";
import { createCanvas } from "canvas";

const input = process.argv[2];
const outDir = process.argv[3] ?? "tmp-pdf";

if (!input) {
  console.error("Usage: node scripts/extract-pdf-images.mjs <input.pdf> [outDir]");
  process.exit(1);
}

const raw = fs.readFileSync(input).toString("latin1");
fs.mkdirSync(outDir, { recursive: true });

const imagePattern =
  /(\d+) 0 obj[\s\S]*?\/Subtype \/Image[\s\S]*?\/Width (\d+)[\s\S]*?\/Height (\d+)[\s\S]*?\/ColorSpace \/(\w+)[\s\S]*?stream\r?\n([\s\S]*?)endstream/g;

let match;
let index = 0;

while ((match = imagePattern.exec(raw)) !== null) {
  index += 1;
  const [, objId, width, height, colorSpace, stream] = match;

  let decoded;
  try {
    decoded = zlib.inflateSync(Buffer.from(stream, "latin1"));
  } catch {
    decoded = Buffer.from(stream, "latin1");
  }

  const channels = colorSpace === "DeviceRGB" ? 3 : colorSpace === "DeviceGray" ? 1 : 4;
  const expected = Number(width) * Number(height) * channels;

  console.log(
    `obj ${objId}: ${width}x${height} ${colorSpace}, stream=${decoded.length}, expected=${expected}`,
  );

  if (decoded.length === expected) {
    const canvas = createCanvas(Number(width), Number(height));
    const ctx = canvas.getContext("2d");
    const imageData = ctx.createImageData(Number(width), Number(height));

    for (let i = 0, p = 0; i < decoded.length; i += channels) {
      imageData.data[p++] = decoded[i];
      imageData.data[p++] = channels > 1 ? decoded[i + 1] : decoded[i];
      imageData.data[p++] = channels > 2 ? decoded[i + 2] : decoded[i];
      imageData.data[p++] = 255;
    }

    ctx.putImageData(imageData, 0, 0);
    const out = `${outDir}/extracted-${index}-obj${objId}.png`;
    fs.writeFileSync(out, canvas.toBuffer("image/png"));
    console.log("wrote", out);
  }
}
