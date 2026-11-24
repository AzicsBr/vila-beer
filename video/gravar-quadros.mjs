// Grava o palco quadro a quadro com o relógio controlado (video/relogio.js): sem engasgos e no tempo exato.
// Precisa do servidor de desenvolvimento rodando (npm run dev, porta 5193) e, numa pasta à parte,
// npm install -E playwright-core@1.65.0 (usa o Edge instalado, sem baixar navegador).
// Uso: node gravar-quadros.mjs <pasta-de-saida> [fps]
// Depois: ffmpeg -framerate 30 -i <saida>/q%05d.jpg -i narracao.mp3 ... (ver video/saida/roteiro-elevenlabs.md)
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const saida = process.argv[2];
const fps = Number(process.argv[3] || 30);
const passo = 1000 / fps;
mkdirSync(saida, { recursive: true });
const relogio = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'relogio.js'), 'utf8');

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const context = await browser.newContext({ viewport: { width: 540, height: 960 }, deviceScaleFactor: 2 });
await context.addInitScript(relogio);
const page = await context.newPage();
page.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('404')) console.log('console:', m.text()); });
await page.goto('http://localhost:5193/video/palco.html');
await page.waitForFunction(() => window.__pronto === true);
const cdp = await context.newCDPSession(page);

// dá alguns passos para assentar a primeira pintura e começa a visita
for (let i = 0; i < 3; i++) await page.evaluate((ms) => window.__passo(ms), passo);
await page.evaluate(() => { window.__comeca(); });

let n = 0;
for (;;) {
  const fim = await page.evaluate(async (ms) => {
    const w = document.getElementById('site')?.contentWindow;
    try { if (w && w.__passo) await w.__passo(ms); } catch {}
    await window.__passo(ms);
    return window.__fim === true;
  }, passo);
  const { data } = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 92, clip: { x: 0, y: 0, width: 540, height: 960, scale: 2 } });
  writeFileSync(join(saida, `q${String(n++).padStart(5, '0')}.jpg`), Buffer.from(data, 'base64'));
  if (n % 150 === 0) console.log(`${(n / fps).toFixed(1)} s`);
  if (fim || n > fps * 120) break;
}
const marcas = await page.evaluate(() => window.__marcas);
await browser.close();
writeFileSync(join(saida, 'marcas.json'), JSON.stringify(marcas, null, 2));
console.log(`quadros: ${n} (${(n / fps).toFixed(2)} s)`);
console.log(JSON.stringify(marcas));
