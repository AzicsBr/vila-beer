// Fecho: a comanda sai da impressora, o combinado entra girando e o nome sobe do rodapé.
import { gsap } from 'gsap';

export function fecho() {
  if (!document.querySelector('.fecho')) return;
  const st = { trigger: '.fecho', start: 'top 85%', end: 'top 15%', scrub: 0.6 };
  gsap.fromTo('.comanda__papel', { clipPath: 'inset(0 0 100% 0)', yPercent: -25 }, { clipPath: 'inset(0 0 0% 0)', yPercent: 0, ease: 'none', scrollTrigger: st });
  gsap.from('.fecho__combinado', { x: '-20vw', rotation: -30, ease: 'none', scrollTrigger: st });
  // o nome do rodapé fica no pé da página: o gatilho é o fim do fecho, que sempre chega ao pé da tela (medido pelo
  // próprio nome, baixo e já deslocado, ele nunca terminava de subir e ficava cortado)
  if (document.querySelector('.fecho__palavra')) gsap.from('.fecho__palavra', { y: 40, ease: 'none', scrollTrigger: { trigger: '.fecho', start: 'bottom 130%', end: 'bottom bottom', scrub: 0.4 } });
}
