// Virada 2027: quando a seção entra, o título sobe, o ingresso cai girando com mola e a barra das reservas enche
// contando até o número do HTML (data-ate). Enquanto a seção está atrás da nav, o botão escuro da nav ganha borda
// creme (o fundo daqui é escuro).
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function virada(reduzido = false) {
  const secao = document.querySelector('.virada');
  if (!secao) return;

  const nav = document.querySelector('.nav');
  ScrollTrigger.create({
    trigger: secao,
    start: 'top top+=40',
    end: 'bottom top+=40',
    onToggle: (s) => nav?.classList.toggle('nav--virada', s.isActive),
  });

  if (reduzido) return;
  const conta = secao.querySelector('.ingresso__conta');
  const ate = Number(conta?.dataset.ate) || 0;
  const n = { v: 0 };

  gsap.timeline({ scrollTrigger: { trigger: secao, start: 'top 65%', once: true } })
    .from('.virada__data', { scale: 0, rotation: -30, duration: 0.6, ease: 'back.out(2.5)' })
    .from(['.virada__palavra', '.virada__ano'], { yPercent: 60, autoAlpha: 0, duration: 0.8, stagger: 0.12, ease: 'power4.out' }, 0.1)
    .from('.virada__texto > *', { y: 30, autoAlpha: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out' }, 0.4)
    .from('.ingresso', { y: -120, rotation: -18, autoAlpha: 0, duration: 1, ease: 'back.out(1.6)' }, 0.5)
    .from('.ingresso__barra i', { scaleX: 0, duration: 1.4, ease: 'power2.out' }, 1.1)
    .fromTo(n, { v: 0 }, { v: ate, duration: 1.4, ease: 'power2.out', onUpdate: () => { if (conta) conta.textContent = Math.round(n.v); } }, 1.1);
}
