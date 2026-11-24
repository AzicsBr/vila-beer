// O dia no Shari: seção presa; a cada hora o fundo troca de cor, o número sobe e as fotos giram e desfocam.
// Descendo, a rolagem anda uma hora por gesto (roda ou trackpad) e a inércia que sobra do mesmo gesto é ignorada;
// subindo, é livre, para ninguém ficar preso na volta ao topo; no toque, a seção encaixa na hora mais próxima.
// Funciona com qualquer número de horas (src/sections/dia.html). O fundo e o texto de cada hora vêm de data-cor e
// data-texto, e a cor do número gigante de data-num e data-num-sombra, pelo nome do papel em tokens.css ou uma cor; as pílulas são feitas aqui, uma por hora, com o texto do
// número da hora (ou de data-rotulo, se a hora tiver).
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cor, rgb, brilho } from './cores.js';

export function dia(lenis) {
  const secao = document.querySelector('.dia');
  if (!secao) return;
  const horas = [...secao.querySelectorAll('.hora')];
  const n = horas.length;
  if (!n) return;
  // o número gigante de cada hora: data-num (a cor) e data-num-sombra (a sombra dura), pelo nome do papel ou uma cor
  const papel = (v) => (/^[a-z]+$/i.test(v) && !CSS.supports('color', v) ? `var(--cor-${v})` : v);
  horas.forEach((h) => {
    if (h.dataset.num) h.style.setProperty('--n', papel(h.dataset.num));
    if (h.dataset.numSombra) h.style.setProperty('--s', papel(h.dataset.numSombra));
  });
  const fundo = horas.map((h) => cor(h.dataset.cor || 'fria'));
  const texto = horas.map((h) => cor(h.dataset.texto || 'papel'));
  const pilulas = secao.querySelector('.dia__horas');
  const botoes = horas.map((h) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = h.dataset.rotulo || h.querySelector('.hora__num')?.textContent.trim() || '';
    pilulas?.append(b);
    return b;
  });

  const partes = (h) => ({
    num: h.querySelector('.hora__num'),
    txt: h.querySelectorAll('.hora__titulo, .hora__texto'),
    fotos: h.querySelectorAll('.hora__fotos img'),
  });

  horas.slice(1).forEach((h) => gsap.set(h, { autoAlpha: 0 }));
  gsap.set(secao, { '--bg': rgb(fundo[0]), '--t': rgb(texto[0]) });

  const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } });
  for (let i = 1; i < n; i++) {
    const de = partes(horas[i - 1]);
    const para = partes(horas[i]);
    const t = i - 1 + 0.35;
    tl.to(secao, { '--bg': rgb(fundo[i]), '--t': rgb(texto[i]), duration: 0.5 }, t)
      .to(de.num, { yPercent: -50, autoAlpha: 0, duration: 0.35 }, t)
      .to(de.txt, { y: -30, autoAlpha: 0, duration: 0.3, stagger: 0.04 }, t)
      .to(de.fotos, { y: '-30vh', rotation: (k) => (k ? 22 : -22), filter: 'blur(10px)', autoAlpha: 0, duration: 0.45, stagger: 0.05 }, t)
      .set(horas[i - 1], { autoAlpha: 0 }, t + 0.5)
      .set(horas[i], { autoAlpha: 1 }, t + 0.1)
      .from(para.num, { yPercent: 50, autoAlpha: 0, duration: 0.4 }, t + 0.15)
      .from(para.txt, { y: 30, autoAlpha: 0, duration: 0.35, stagger: 0.05 }, t + 0.2)
      .from(para.fotos, { y: '40vh', rotation: (k) => (k ? -25 : 25), filter: 'blur(10px)', autoAlpha: 0, duration: 0.5, stagger: 0.06 }, t + 0.15);
  }
  tl.to({}, { duration: 0.35 });

  // momento da linha do tempo em que cada hora está parada e inteira (a transição dela já terminou)
  const total = tl.duration();
  const paradas = horas.map((_, i) => (i === 0 ? 0 : i === n - 1 ? 1 : (i + 0.2) / total));
  const toque = matchMedia('(pointer: coarse)').matches;

  // nas horas de fundo escuro (23h), o botão nori da nav ganha borda creme para não sumir no fundo
  const nav = document.querySelector('.nav') ?? document.createElement('i');
  const escura = fundo.map((c) => brilho(c) < 40);
  let atual = 0;
  const marca = (i) => {
    atual = i;
    botoes.forEach((b, k) => { b.classList.toggle('ativo', k === i); b.toggleAttribute('aria-current', k === i); });
  };
  let sobNav = false; // a seção está atrás da nav (do topo da seção até o pé dela passar a nav)
  const navEscura = () => nav.classList.toggle('nav--escuro', sobNav && escura[atual]);
  marca(0);

  const st = ScrollTrigger.create({
    trigger: secao,
    start: 'top top',
    end: () => `+=${(n - 1) * window.innerHeight}`,
    pin: secao.querySelector('.dia__palco'),
    scrub: 0.6,
    animation: tl,
    onUpdate: (s) => { marca(Math.min(n - 1, Math.floor(s.progress * (n - 1) + 0.15))); navEscura(); },
    snap: toque ? { snapTo: paradas, duration: { min: 0.3, max: 0.8 }, delay: 0.05, ease: 'power2.inOut' } : false,
  });

  ScrollTrigger.create({
    trigger: secao,
    start: 'top top+=40',
    end: 'bottom top+=40',
    onToggle: (s) => { sobNav = s.isActive; navEscura(); },
  });

  // posição de scroll em que cada hora está inteira na tela
  const parada = (i) => st.start + (st.end - st.start) * paradas[i];

  // trava por tempo (o onComplete do Lenis nem sempre dispara quando o pin reajusta a página)
  let livreEm = 0;
  let gestoUsado = false; // o gesto atual já moveu uma hora: o resto dele (inércia) não conta
  const vaiPara = (i, duracao = 0.9) => {
    livreEm = performance.now() + duracao * 1000;
    gestoUsado = true;
    lenis.scrollTo(parada(i), {
      duration: duracao,
      easing: (x) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2),
      force: true,
    });
  };

  let ultimoEvento = 0;
  let ultimoDelta = 0;
  lenis.options.virtualScroll = ({ deltaY, event }) => {
    if (event.type.startsWith('touch') || !deltaY || event.ctrlKey) return true;
    // devolver false só tira o evento do Lenis; o preventDefault segura a rolagem nativa
    const segura = () => { if (event.cancelable) event.preventDefault(); return false; };
    const agora = performance.now();
    const d = Math.abs(deltaY);
    // gesto novo: pausa depois do último evento ou um empurrão bem maior que a inércia que vinha caindo
    const novo = agora - ultimoEvento > 250 || d > ultimoDelta * 1.6 + 4;
    ultimoEvento = agora;
    ultimoDelta = d;

    // subindo, a rolagem é livre: quem volta para o topo não pode ficar preso hora a hora
    if (deltaY < 0) return true;
    if (novo) gestoUsado = false;
    if (agora < livreEm || gestoUsado) return segura();

    const y = lenis.targetScroll;
    const ini = parada(0);
    const fim = parada(n - 1);
    if (y >= fim - 1) return true; // da 23h para baixo, segue a página
    // chegando de cima: para na primeira hora, sem atravessar a seção no embalo
    if (y < ini - 1) {
      if (y + deltaY > ini) { vaiPara(0, 0.6); return segura(); }
      return true;
    }
    // próxima hora à frente (depois de subir livre, a posição pode estar entre duas horas)
    const prox = paradas.findIndex((_, i) => parada(i) > y + 8);
    if (prox < 0) return true; // entre a última hora e o fim do pin: segue a página (sem isso, parada(-1) mandava ao topo)
    vaiPara(prox);
    return segura();
  };

  botoes.forEach((b, i) => b.addEventListener('click', () => vaiPara(i, 1.2)));
}
