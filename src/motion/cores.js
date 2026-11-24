// Cores lidas dos tokens (src/styles/tokens.css), para o JS seguir a paleta sem repetir nenhum valor.
// cor('fria') ou cor('--cor-fria') ou cor('#1e3a8a') → [r, g, b]; rgb([r, g, b]) → 'rgb(r, g, b)'.

let sonda;
export function cor(valor) {
  if (!sonda) {
    sonda = document.createElement('i');
    sonda.hidden = true;
    document.body.append(sonda);
  }
  const v = valor.trim();
  sonda.style.color = '';
  if (/^--/.test(v)) sonda.style.color = `var(${v})`;
  else if (/^[a-z]+$/i.test(v) && !CSS.supports('color', v)) sonda.style.color = `var(--cor-${v})`;
  else sonda.style.color = v;
  return getComputedStyle(sonda).color.match(/[\d.]+/g).slice(0, 3).map(Number);
}

export const rgb = ([r, g, b]) => `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;

/** mistura a com b (0 = só a, 1 = só b) */
export const mistura = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);

/** brilho percebido, de 0 a 255 */
export const brilho = ([r, g, b]) => 0.299 * r + 0.587 * g + 0.114 * b;
