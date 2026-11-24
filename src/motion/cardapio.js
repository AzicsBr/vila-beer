// Cardápio: seção presa, os cards atravessam na frente de "SUSHI" e balançam um pouco no caminho.
import { gsap } from 'gsap';

export function cardapio() {
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
}
