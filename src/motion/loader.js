// Abertura: o desenho se monta em passos com legenda e a tela sobe com a onda (src/sections/loader.html).
// Cada parte do desenho tem data-passo (a ordem) e data-jeito, o jeito de entrar:
//   sobe    cresce de baixo, com mola          (o arroz)
//   estala  nasce do centro, com mola           (o wasabi)
//   cai     cai de cima girando e quica         (o salmão)
//   desce   se estende de cima para baixo       (a faixa de nori)
// A legenda troca para o <span> de mesmo número dentro de .loader__passo. O desenho termina balançando.
// A abertura dura o que os passos pedem, e no mínimo o tempo de as fontes e os recortes do hero ficarem prontos.
import { gsap } from 'gsap';

const JEITOS = {
  sobe: { de: { autoAlpha: 0, y: 30, scale: 0.6, transformOrigin: '50% 100%' }, para: { y: 0, scale: 1, ease: 'back.out(2)' }, dur: 0.55 },
  estala: { de: { autoAlpha: 0, scale: 0, transformOrigin: '50% 50%' }, para: { scale: 1, ease: 'back.out(2)' }, dur: 0.4 },
  cai: { de: { autoAlpha: 0, y: -90, rotation: -14, transformOrigin: '50% 50%' }, para: { y: 0, rotation: 0, ease: 'bounce.out' }, dur: 0.6 },
  desce: { de: { autoAlpha: 0, scaleY: 0, transformOrigin: '50% 0%' }, para: { scaleY: 1, ease: 'power3.out' }, dur: 0.4 },
};
const INTERVALO = 0.15; // respiro entre um passo e o seguinte

export function loader(pronto, reduzido) {
  const el = document.querySelector('.loader');
  if (!el) return pronto;
  const legenda = el.querySelector('.loader__passo');
  const textos = legenda ? [...legenda.querySelectorAll('span')].map((s) => s.textContent) : [];
  const troca = (i) => () => { if (legenda && textos[i] != null) legenda.textContent = textos[i]; };
  troca(0)();

  if (reduzido) {
    gsap.set(el.querySelectorAll('[data-passo]'), { autoAlpha: 1 });
    return pronto.then(() => gsap.to(el, { autoAlpha: 0, duration: 0.3, onComplete: () => el.remove() }));
  }

  const partes = [...el.querySelectorAll('[data-passo]')].sort((a, b) => a.dataset.passo - b.dataset.passo);
  const desenho = el.querySelector('.loader__box > svg, .loader__box > img');
  gsap.set(partes, { autoAlpha: 0 });

  const monta = gsap.timeline();
  const sombra = el.querySelector('[data-sombra]');
  if (sombra) monta.fromTo(sombra, { scaleX: 0.3, transformOrigin: '50% 50%' }, { scaleX: 1, duration: 0.5, ease: 'back.out(2)' }, 0);

  let t = 0;
  partes.forEach((parte, i) => {
    const j = JEITOS[parte.dataset.jeito] ?? JEITOS.estala;
    monta.call(troca(i), null, Math.max(0, t - 0.05))
      .fromTo(parte, j.de, { autoAlpha: 1, ...j.para, duration: j.dur }, t);
    t += j.dur + INTERVALO;
  });
  if (desenho) monta.to(desenho, { rotation: 6, duration: 0.15, yoyo: true, repeat: 3, ease: 'sine.inOut' }, t - INTERVALO);

  const minimo = new Promise((r) => monta.eventCallback('onComplete', r));
  return Promise.all([pronto, minimo]).then(
    () =>
      new Promise((r) => {
        gsap.timeline({ onComplete: () => { el.remove(); } })
          .to(el.querySelector('.loader__box'), { y: -60, autoAlpha: 0, duration: 0.45, ease: 'power2.in' })
          .to(el, { yPercent: -125, duration: 1.05, ease: 'power3.inOut' }, 0.25)
          .call(r, null, 0.85);
      }),
  );
}
