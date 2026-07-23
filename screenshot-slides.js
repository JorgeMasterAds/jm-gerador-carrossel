/**
 * screenshot-slides.js — Pipeline JM Ads
 *
 * Renderiza todos os .html em tmp/ para .png (1080x1080 @ 2x).
 * O ÚLTIMO slide (slide07) é convertido também em .mp4 de 5 segundos
 * via ffmpeg — usado para tracking de tráfego (quem chegou no final).
 *
 * Uso:
 *   node screenshot-slides.js --dir tmp/xpost
 *   node screenshot-slides.js --dir tmp/cyber --no-video   (desativa vídeo)
 */

import { config } from 'dotenv';
import { URL } from 'url';
config({ path: new URL('.env', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1') });
import puppeteer from 'puppeteer-core';
import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';
import { checkLicense } from './lib/check-license.js';

checkLicense();

const __dirname  = path.dirname(fileURLToPath(import.meta.url));
const args       = process.argv.slice(2);
const dirFlag    = args.indexOf('--dir');
const subDir     = dirFlag !== -1 ? args[dirFlag + 1] : null;
const noVideo    = args.includes('--no-video');
const tmpDir     = subDir
  ? path.isAbsolute(subDir) ? subDir : path.join(__dirname, subDir)
  : path.join(__dirname, 'tmp');

if (!fs.existsSync(tmpDir)) {
  console.error('❌ Pasta tmp/ não encontrada. Rode gerar-htmls.js primeiro.');
  process.exit(1);
}

const htmlFiles = fs.readdirSync(tmpDir)
  .filter(f => f.endsWith('.html'))
  .sort();

if (htmlFiles.length === 0) {
  console.log('⚠️  Nenhum .html em tmp/. Rode gerar-htmls.js primeiro.');
  process.exit(0);
}

// Limpa PNGs antigos para não acumular slides de versões anteriores
const oldPngs = fs.readdirSync(tmpDir).filter(f => f.endsWith('.png'));
for (const p of oldPngs) fs.unlinkSync(path.join(tmpDir, p));
if (oldPngs.length) console.log(`🗑  ${oldPngs.length} PNG(s) antigo(s) removido(s)`);

console.log(`\n📸 Renderizando ${htmlFiles.length} slide(s)...\n`);

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH,
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security', '--allow-file-access-from-files', '--disable-spell-checking', '--disable-features=SpellcheckService'],
});

const page = await browser.newPage();
await page.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 2 });

// Identifica o ÚLTIMO slide de cada card (maior número por código)
// Ex: jm-c01_xpost_slide10.html é o último de jm-c01_xpost
const lastByCard = {};
for (const f of htmlFiles) {
  const m = f.match(/^(.+)_slide(\d+)\.html$/i);
  if (!m) continue;
  const cardKey = m[1]; // ex: jm-c01_xpost
  const num = parseInt(m[2], 10);
  if (!lastByCard[cardKey] || num > lastByCard[cardKey].num) {
    lastByCard[cardKey] = { num, file: f };
  }
}
const finalSlideFiles = new Set(Object.values(lastByCard).map(v => v.file));

const finalSlides = [];
let ok = 0;

for (const f of htmlFiles) {
  const htmlPath = path.join(tmpDir, f);
  const pngPath  = path.join(tmpDir, f.replace('.html', '.png'));

  const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/');
  await page.goto(fileUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await new Promise(r => setTimeout(r, 1500));

  await page.screenshot({ path: pngPath, type: 'png' });
  fs.unlinkSync(htmlPath);

  console.log(`  ✓ ${f.replace('.html', '.png')}`);
  ok++;

  if (finalSlideFiles.has(f)) {
    finalSlides.push(pngPath);
  }
}

await browser.close();
console.log(`\n✅ ${ok} PNG(s) gerado(s)`);

// ── Conversão de último slide em vídeo (5s) ──────────────────────────────────
if (!noVideo && finalSlides.length > 0) {
  console.log(`\n🎬 Gerando ${finalSlides.length} vídeo(s) de 5s do slide final...\n`);
  let videoOk = 0;
  for (const pngPath of finalSlides) {
    const mp4Path = pngPath.replace(/\.png$/i, '.mp4');
    const result = spawnSync('ffmpeg', [
      '-y',
      '-loop', '1',
      '-i', pngPath,
      '-c:v', 'libx264',
      '-t', '5',
      '-pix_fmt', 'yuv420p',
      '-vf', 'scale=1080:1350:flags=lanczos',
      '-r', '30',
      '-preset', 'medium',
      '-crf', '18',
      mp4Path,
    ], { stdio: ['ignore', 'ignore', 'pipe'] });

    if (result.status === 0) {
      console.log(`  ✓ ${path.basename(mp4Path)}`);
      videoOk++;
    } else {
      console.error(`  ✗ ${path.basename(mp4Path)} — ffmpeg falhou`);
      if (result.stderr) console.error(result.stderr.toString().split('\n').slice(-5).join('\n'));
    }
  }
  console.log(`\n✅ ${videoOk} MP4(s) gerado(s) em ${path.relative(__dirname, tmpDir)}/\n`);
} else if (noVideo) {
  console.log(`\n⏭️  Conversão em vídeo desativada (--no-video)\n`);
}
