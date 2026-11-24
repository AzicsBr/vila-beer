// Mural do balcão: as polaroids caem espalhadas e, com mouse, dá para arrastar e trazer para a frente.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function mural() {
  const campo = document.querySelector('.mural__campo');
  if (!campo) return;
  const fotos = [...campo.querySelectorAll('.polaroid')];

  // As fotos são lazy: carrega e decodifica antes de a queda começar, senão o card cai vazio
  // e a foto aparece no meio da animação (o "pisca"). Começa a carregar uma tela e meia antes do mural.
  const imgs = fotos.map((f) => f.querySelector('img'));
  let carregando;
  const carrega = () =>
    (carregando ??= Promise.race([
      Promise.all(imgs.map((img) => { img.loading = 'eager'; return img.decode().catch(() => {}); })),
      new Promise((r) => setTimeout(r, 1500)), // rede lenta: não segura o mural para sempre
    ]));

  gsap.set(fotos, { autoAlpha: 0 });
  const queda = gsap.timeline({ paused: true }).fromTo(
    fotos,
    { y: -160, rotation: () => gsap.utils.random(-30, 30), autoAlpha: 0 },
    { y: 0, rotation: (i, el) => parseFloat(getComputedStyle(el).getPropertyValue('--r')) || 0, autoAlpha: 1, duration: 0.9, stagger: 0.09, ease: 'back.out(1.3)', force3D: true },
  );

  ScrollTrigger.create({ trigger: campo, start: 'top bottom+=150%', once: true, onEnter: carrega });
  ScrollTrigger.create({
    trigger: campo,
    start: 'top 75%',
    once: true,
    onEnter: () => carrega().then(() => queda.play()),
  });

  if (!matchMedia('(pointer: fine)').matches) return;
  campo.classList.add('pode-arrastar');
  let topo = 10;

  fotos.forEach((foto) => {
    foto.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      foto.setPointerCapture(e.pointerId);
      foto.classList.add('arrastando');
      foto.style.zIndex = ++topo;
      const x0 = e.clientX - gsap.getProperty(foto, 'x');
      const y0 = e.clientY - gsap.getProperty(foto, 'y');
      gsap.to(foto, { scale: 1.06, rotation: 0, duration: 0.25 });

      const move = (ev) => gsap.set(foto, { x: ev.clientX - x0, y: ev.clientY - y0 });
      const solta = () => {
        foto.classList.remove('arrastando');
        foto.removeEventListener('pointermove', move);
        gsap.to(foto, { scale: 1, rotation: gsap.utils.random(-8, 8), duration: 0.5, ease: 'back.out(2)' });
      };
      foto.addEventListener('pointermove', move);
      foto.addEventListener('pointerup', solta, { once: true });
      foto.addEventListener('pointercancel', solta, { once: true });
    });
  });
}
