// Cardápio: seção presa, os cards atravessam na frente de "SUSHI" e balançam um pouco no caminho.
import { gsap } from 'gsap';

export function cardapio(lenis) {
  const secao = document.querySelector('.cardapio');
  if (!secao) return;
  const fila = secao.querySelector('.cardapio__fila');
  const pratos = fila.querySelectorAll('.prato');
  const celular = () => window.innerWidth < 760;
  const margem = () => (celular() ? 20 : window.innerWidth * 0.06);
  // no celular o primeiro card já entra inteiro; no desktop a fila chega pela direita
  const inicio = () => (celular() ? margem() : window.innerWidth * 0.7);
  const fim = () => window.innerWidth - fila.offsetWidth - margem();

  const tl = gsap.timeline({
    scrollTrigger: {
      id: 'cardapio',
      trigger: secao,
      start: 'top top',
      end: () => `+=${inicio() - fim()}`,
      pin: secao.querySelector('.cardapio__palco'),
      scrub: 0.5,
      invalidateOnRefresh: true,
    },
  });
  tl.fromTo(fila, { x: inicio }, { x: fim, ease: 'none', duration: 1 }, 0)
    .fromTo(pratos, { rotation: (i) => (i % 2 ? 10 : -10) }, { rotation: (i) => (i % 2 ? -4 : 4), ease: 'sine.inOut', duration: 1 }, 0)
    .fromTo('.cardapio__palavra', { scale: 0.92 }, { scale: 1.04, ease: 'none', duration: 1 }, 0);

  if (matchMedia('(pointer: coarse)').matches) arrastaDeLado(secao, fila, pratos, tl.scrollTrigger, lenis);
}

// No toque, o gesto para o lado vira rolagem dentro da seção presa (a fila anda 1:1 com a rolagem): o card
// acompanha o dedo e, ao soltar, encaixa no card seguinte ou no anterior, conforme o lado do gesto.
// O gesto vertical continua sendo a rolagem normal da página.
function arrastaDeLado(secao, fila, pratos, st, lenis) {
  const palco = secao.querySelector('.cardapio__palco');
  let x0 = 0, y0 = 0, s0 = 0, lado = null, ultimoX = 0;
  const passo = () => (pratos.length > 1 ? pratos[1].offsetLeft - pratos[0].offsetLeft : 1);
  const limita = (y) => Math.min(st.end, Math.max(st.start, y));

  palco.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    x0 = ultimoX = t.clientX; y0 = t.clientY; s0 = window.scrollY; lado = null;
  }, { passive: true });

  palco.addEventListener('touchmove', (e) => {
    const t = e.touches[0];
    const dx = t.clientX - x0, dy = t.clientY - y0;
    if (lado === null && Math.hypot(dx, dy) > 8) lado = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
    // só dentro da seção presa: fora dela o gesto de lado não faz nada
    if (lado !== 'x' || window.scrollY < st.start - 2 || window.scrollY > st.end + 2) return;
    e.preventDefault();
    ultimoX = t.clientX;
    window.scrollTo(0, limita(s0 - dx));
  }, { passive: false });

  palco.addEventListener('touchend', () => {
    if (lado !== 'x') return;
    const dx = ultimoX - x0;
    const atual = (window.scrollY - st.start) / passo();
    let i = Math.round(atual);
    if (dx < -40) i = Math.ceil(atual - 0.05);
    else if (dx > 40) i = Math.floor(atual + 0.05);
    const alvo = limita(st.start + i * passo());
    if (lenis) lenis.scrollTo(alvo, { duration: 0.45, force: true });
    else window.scrollTo({ top: alvo, behavior: 'smooth' });
    lado = null;
  });
}
