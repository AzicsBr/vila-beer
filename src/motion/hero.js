// Hero: entrada em camadas depois da abertura e parallax dos recortes na rolagem.
// Cada peça tem uma linha nas tabelas abaixo (seletor, de onde vem, quando entra). Peça que não existe no HTML é
// pulada: tirar um recorte do hero é só apagar o <img>; um recorte novo ganha uma linha aqui e uma regra de posição
// em hero.css.
import { gsap } from 'gsap';

// [seletor, de onde a peça vem, quando começa (s)]
const ENTRADA = [
  ['.hero__palavra span', { yPercent: 60, autoAlpha: 0, rotation: 8, duration: 1, stagger: 0.07 }, 0],
  ['.hero__barca', { y: '-70vh', scale: 0.7, rotation: -40, autoAlpha: 0, duration: 1.3, ease: 'back.out(1.4)' }, 0.2],
  ['.hero__bolacha', { x: '30vw', rotation: 120, duration: 1.2 }, 0.45],
  ['.hero__bolacha2', { x: '-30vw', rotation: -120, duration: 1.2 }, 0.5],
  ['.hero__etiqueta', { scale: 0, rotation: -30, duration: 0.7, ease: 'back.out(2.5)' }, 0.9],
  ['.selo', { scale: 0, duration: 0.7, ease: 'back.out(2.5)' }, 1],
  [['.hero__frase', '.hero__pedido'], { y: 30, autoAlpha: 0, duration: 0.8, stagger: 0.1 }, 1],
];

// [seletor, onde a peça termina quando o hero sai da tela]: cada recorte numa velocidade e num giro
const PARALLAX = [
  ['.hero__palavra', { yPercent: 18 }],
  ['.hero__barca', { y: '16vh', rotation: 6 }],
  ['.hero__bolacha', { y: '-22vh', rotation: 30 }],
  ['.hero__bolacha2', { y: '18vh', rotation: -24 }],
  ['.hero__etiqueta', { y: '-8vh', rotation: -12 }],
];

const existe = (alvo) => gsap.utils.toArray(alvo).length > 0;

export function heroEntrada() {
  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
  ENTRADA.forEach(([alvo, de, quando]) => { if (existe(alvo)) tl.from(alvo, de, quando); });
  return tl;
}

export function heroScroll() {
  const st = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true };
  PARALLAX.forEach(([alvo, ate]) => { if (existe(alvo)) gsap.to(alvo, { ...ate, ease: 'none', scrollTrigger: st }); });
}

// Os recortes com data-arrasta (as duas bolachas de chopp) dá para pegar e arrastar pela hero (só com mouse).
// O deslocamento fica na propriedade CSS translate, que o arraste reescreve a cada movimento, e o crescer (1,04 com o
// mouse em cima, 1,08 segurando) vai pela escala do GSAP: o GSAP guarda no transform dele o espelho e a escala que o
// CSS deu ao recorte e zera as propriedades scale e rotate do CSS, então escala em CSS não pegaria. O centro do
// recorte não sai da hero. Ele não muda de camada: passa por trás do que já estava na frente dele
// (etiqueta, selo, textos). Ao soltar, segue com a velocidade do arraste e freia até parar.
export function heroArrasta() {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const hero = document.querySelector('.hero');
  if (!hero) return;
  hero.classList.add('pode-arrastar');

  hero.querySelectorAll('[data-arrasta]').forEach((el) => {
    const pos = { x: 0, y: 0 };
    const aplica = () => { el.style.translate = `${pos.x}px ${pos.y}px`; };
    let base; // a escala de repouso (com o espelho), lida na primeira vez que o mouse chega
    let segurando = false;
    const cresce = (f, duracao = 0.25) => {
      base ??= { x: gsap.getProperty(el, 'scaleX'), y: gsap.getProperty(el, 'scaleY') };
      gsap.to(el, { scaleX: base.x * f, scaleY: base.y * f, duration: duracao, ease: 'power3.out', overwrite: 'auto' });
    };
    el.addEventListener('pointerenter', () => { if (!segurando) cresce(1.04); });
    el.addEventListener('pointerleave', () => { if (!segurando) cresce(1); });

    el.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      gsap.killTweensOf(pos);
      el.setPointerCapture(e.pointerId);
      el.classList.add('arrastando');
      segurando = true;
      cresce(1.08);
      const x0 = e.clientX - pos.x;
      const y0 = e.clientY - pos.y;
      const area = hero.getBoundingClientRect();
      const caixa = el.getBoundingClientRect();
      const cx = caixa.left + caixa.width / 2 - pos.x;
      const cy = caixa.top + caixa.height / 2 - pos.y;
      const limX = gsap.utils.clamp(area.left - cx + 20, area.right - cx - 20);
      const limY = gsap.utils.clamp(area.top - cy + 20, area.bottom - cy - 20);

      // últimas posições do ponteiro, para medir a velocidade na hora de soltar
      let rastro = [{ x: e.clientX, y: e.clientY, t: e.timeStamp }];
      const move = (ev) => {
        pos.x = limX(ev.clientX - x0);
        pos.y = limY(ev.clientY - y0);
        aplica();
        rastro.push({ x: ev.clientX, y: ev.clientY, t: ev.timeStamp });
        rastro = rastro.filter((r) => ev.timeStamp - r.t < 100);
      };
      const solta = (ev) => {
        el.classList.remove('arrastando');
        segurando = false;
        const caixa = el.getBoundingClientRect();
        const dentro = ev.clientX >= caixa.left && ev.clientX <= caixa.right && ev.clientY >= caixa.top && ev.clientY <= caixa.bottom;
        cresce(dentro ? 1.04 : 1);
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerup', solta);
        el.removeEventListener('pointercancel', solta);

        const a = rastro[0];
        const dt = Math.max(ev.timeStamp - a.t, 16) / 1000;
        const parado = ev.timeStamp - rastro[rastro.length - 1].t > 80;
        const vx = parado ? 0 : (ev.clientX - a.x) / dt;
        const vy = parado ? 0 : (ev.clientY - a.y) / dt;
        const v = Math.hypot(vx, vy);
        if (v < 60) return;
        // freio: a distância cresce com a velocidade; o power3.out desacelera até parar
        const tempo = gsap.utils.clamp(0.7, 1.4, v / 2000);
        gsap.to(pos, {
          x: limX(pos.x + vx * tempo * 0.45),
          y: limY(pos.y + vy * tempo * 0.45),
          duration: tempo,
          ease: 'power3.out',
          onUpdate: aplica,
        });
      };
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerup', solta);
      el.addEventListener('pointercancel', solta);
    });
  });
}
