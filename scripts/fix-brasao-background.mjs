/**
 * Converte fundo preto do brasão para branco.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const inputPath = path.resolve(__dirname, "../public/brasao-jardim-mulato.png");
const outputPath = path.resolve(__dirname, "../public/brasao-jardim-mulato-white.png");

const DARK_SUM = 120;

async function main() {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;

  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    if (r + g + b <= DARK_SUM) {
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      data[i + 3] = 255;
    }
  }

  await sharp(data, { raw: { width, height, channels } })
    .png()
    .toFile(outputPath);

  console.log("Brasão atualizado:", outputPath);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
