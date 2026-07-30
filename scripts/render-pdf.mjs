import fs from "node:fs";
import path from "node:path";
import { createCanvas, Image } from "canvas";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

globalThis.Image = Image;

const input = process.argv[2];
const outDir = process.argv[3] ?? "tmp-pdf";

if (!input) {
  console.error("Usage: node scripts/render-pdf.mjs <input.pdf> [outDir]");
  process.exit(1);
}

const data = new Uint8Array(fs.readFileSync(input));
const doc = await pdfjsLib.getDocument({ data }).promise;

fs.mkdirSync(outDir, { recursive: true });
console.log("pages", doc.numPages);

for (let i = 1; i <= doc.numPages; i++) {
  const page = await doc.getPage(i);
  const viewport = page.getViewport({ scale: 2 });
  const canvas = createCanvas(viewport.width, viewport.height);
  const ctx = canvas.getContext("2d");

  await page.render({ canvasContext: ctx, viewport }).promise;

  const out = path.join(outDir, `page-${i}.png`);
  fs.writeFileSync(out, canvas.toBuffer("image/png"));
  console.log("wrote", out);
}
