// Lenis no relógio do GSAP: um laço só para o scroll suave e o ScrollTrigger.
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function smooth() {
  const lenis = new Lenis({ lerp: 0.1, smoothWheel: true, touchMultiplier: 1.3 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const alvo = document.querySelector(a.getAttribute('href'));
      if (!alvo) return;
      e.preventDefault();
      lenis.scrollTo(alvo, { duration: 1.4 });
    });
  });
  return lenis;
}
