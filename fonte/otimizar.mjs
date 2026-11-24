// Gera as imagens do site a partir dos originais de fonte/ (JPG), nos tamanhos em que aparecem de verdade:
//   <hh>h-<nome>  → public/img/dia/<hh>h-<nome>.webp      720 × 900  (no celular aparece com até ~315 px)
//   prato-<nome>  → public/img/cardapio/prato-<nome>.webp  600 × 600 + public/img/mini/<nome>.webp 160 × 160
//   mural-<nome>  → public/img/mural/mural-<nome>.webp     600 × 600
// e regrava o logo (public/img/logo.webp) mais leve, mantendo o fundo transparente.
// Uso (na raiz do projeto): node fonte/otimizar.mjs
import sharp from 'sharp';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const fonte = 'fonte';
const saida = 'public/img';
const q = { quality: 72, effort: 6 };
let total = 0;
const grava = async (img, destino) => {
  const info = await img.webp(q).toFile(join(saida, destino));
  total += info.size;
  console.log(destino.padEnd(34), `${(info.size / 1024).toFixed(0)} KB`);
};

for (const f of readdirSync(fonte).filter((f) => f.endsWith('.jpg'))) {
  const nome = f.replace(/\.jpg$/, '');
  const src = join(fonte, f);
  if (/^\d{2}h-/.test(nome)) await grava(sharp(src).resize(720, 900, { fit: 'cover' }), `dia/${nome}.webp`);
  else if (nome.startsWith('prato-')) {
    await grava(sharp(src).resize(600, 600, { fit: 'cover' }), `cardapio/${nome}.webp`);
    await grava(sharp(src).resize(160, 160, { fit: 'cover' }), `mini/${nome.slice(6)}.webp`);
  } else if (nome.startsWith('mural-')) await grava(sharp(src).resize(600, 600, { fit: 'cover' }), `mural/${nome}.webp`);
}

const logo = readFileSync(join(saida, 'logo.webp'));
const leve = await sharp(logo).webp({ quality: 78, alphaQuality: 90, effort: 6 }).toBuffer();
if (leve.length < logo.length) writeFileSync(join(saida, 'logo.webp'), leve);
console.log('logo.webp'.padEnd(34), `${(Math.min(leve.length, logo.length) / 1024).toFixed(0)} KB`);
console.log('total das fotos', `${(total / 1024).toFixed(0)} KB`);
