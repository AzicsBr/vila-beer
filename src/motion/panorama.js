// Panorama do salão: a foto 3:1 corre da direita para a esquerda enquanto a seção fica presa.
import { gsap } from 'gsap';

export function panorama() {
  const secao = document.querySelector('.panorama');
  if (!secao) return;
  const trilho = secao.querySelector('.panorama__trilho');
  const distancia = () => Math.max(0, trilho.offsetWidth - window.innerWidth);

  const anda = gsap.to(trilho, {
    x: () => -distancia(),
    ease: 'none',
    scrollTrigger: {
      trigger: secao,
      start: 'top top',
      end: () => `+=${distancia()}`,
      pin: secao.querySelector('.panorama__palco'),
      scrub: 0.4,
      invalidateOnRefresh: true,
    },
  });

  secao.querySelectorAll('.panorama__nota').forEach((nota) => {
    gsap.from(nota, {
      scale: 0,
      rotation: -20,
      ease: 'back.out(2.2)',
      duration: 0.6,
      scrollTrigger: { trigger: nota, containerAnimation: anda, start: 'left 85%', toggleActions: 'play none none reverse' },
    });
  });

  gsap.from(secao.querySelectorAll('.panorama__kata, .panorama__titulo h2, .panorama__legenda'), {
    y: 60,
    autoAlpha: 0,
    duration: 0.9,
    stagger: 0.1,
    ease: 'power3.out',
    scrollTrigger: { trigger: secao, start: 'top 40%', toggleActions: 'play none none reverse' },
  });
}
