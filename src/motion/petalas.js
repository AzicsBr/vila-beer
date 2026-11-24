// Pétalas caindo no hero, em três camadas de canvas (src/sections/hero.html): atrás do nome (a cor do hero um pouco
// mais escura, quase sombra), entre o nome e a barca (--cor-quente) e na frente da comida (--cor-papel, maiores e mais
// rápidas). O texto e os botões ficam sempre por cima. Cada pétala gira e "vira" (escala no eixo Y pelo cosseno),
// mostrando o verso num tom mais escuro. As cores saem dos tokens: trocar a paleta troca as pétalas.
// data-forma no .hero escolhe o desenho: petala (cerejeira, o padrão), folha (manjericão, chá) ou confete.
// Sem pétalas: apague os três <canvas class="petalas"> do hero.
import { cor, rgb, mistura } from './cores.js';

const PRETO = [0, 0, 0];
const CAMADAS = {
  fundo: { qtd: 18, tam: [9, 15], vel: [26, 42], cor: () => mistura(cor('hero'), PRETO, 0.15), verso: () => mistura(cor('hero'), PRETO, 0.24) },
  meio: { qtd: 11, tam: [12, 19], vel: [38, 58], cor: () => cor('quente'), verso: () => mistura(cor('quente'), PRETO, 0.08) },
  frente: { qtd: 7, tam: [16, 26], vel: [60, 90], cor: () => cor('papel'), verso: () => mistura(cor('papel'), cor('quente'), 0.3) },
};

// desenhos num quadrado de -1 a 1
const FORMAS = {
  petala: 'M0 1C-.95 .45-.85-.7-.28-.98L0-.72L.28-.98C.85-.7.95.45 0 1Z', // com o entalhe na ponta
  folha: 'M0 1C-.75 .55-.8-.45 0-1C.8-.45.75 .55 0 1Z',
  confete: 'M-.9-.5H.9V.5H-.9Z',
};
const sorteia = ([a, b]) => a + Math.random() * (b - a);

function camada(canvas, base, mobile, forma) {
  const cfg = { ...base, cor: rgb(base.cor()), verso: rgb(base.verso()) };
  const ctx = canvas.getContext('2d');
  const qtd = Math.round(cfg.qtd * (mobile ? 0.55 : 1));
  let w = 0;
  let h = 0;

  const nova = (p = {}, topo = false) =>
    Object.assign(p, {
      x: Math.random() * w * 1.1 - w * 0.1,
      y: topo ? -30 - Math.random() * h * 0.3 : Math.random() * h,
      s: sorteia(cfg.tam) * (mobile ? 0.85 : 1),
      vy: sorteia(cfg.vel),
      vento: sorteia([14, 34]), // deriva para a direita, como na queda em diagonal
      balanco: sorteia([18, 42]),
      freq: sorteia([0.5, 1.1]),
      fase: Math.random() * Math.PI * 2,
      ang: Math.random() * Math.PI * 2,
      giro: sorteia([-1.4, 1.4]),
      vira: Math.random() * Math.PI * 2,
      viraVel: sorteia([1.2, 2.6]),
    });

  const mede = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  mede();
  const lista = Array.from({ length: qtd }, () => nova());

  return {
    mede,
    passo(dt, t) {
      ctx.clearRect(0, 0, w, h);
      for (const p of lista) {
        p.y += p.vy * dt;
        p.x += p.vento * dt;
        p.ang += p.giro * dt;
        p.vira += p.viraVel * dt;
        if (p.y > h + 30 || p.x > w + 40) nova(p, true);
        const x = p.x + Math.sin(t * p.freq + p.fase) * p.balanco;
        const c = Math.cos(p.vira);
        ctx.save();
        ctx.translate(x, p.y);
        ctx.rotate(p.ang);
        ctx.scale(p.s, p.s * Math.max(Math.abs(c), 0.12));
        ctx.fillStyle = c >= 0 ? cfg.cor : cfg.verso;
        ctx.fill(forma);
        ctx.restore();
      }
    },
  };
}

export function petalas() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  const mobile = matchMedia('(max-width: 760px)').matches;
  const canvases = [...hero.querySelectorAll('.petalas')];
  if (!canvases.length) return;
  const forma = new Path2D(FORMAS[hero.dataset.forma] ?? FORMAS.petala);
  const camadas = canvases.map((c) => camada(c, CAMADAS[c.dataset.camada] ?? CAMADAS.meio, mobile, forma));

  let visivel = true;
  let ultimo = performance.now();
  let pedido = 0;
  const quadro = (agora) => {
    const dt = Math.min((agora - ultimo) / 1000, 0.05);
    ultimo = agora;
    camadas.forEach((c) => c.passo(dt, agora / 1000));
    pedido = visivel ? requestAnimationFrame(quadro) : 0;
  };

  new IntersectionObserver(([e]) => {
    visivel = e.isIntersecting;
    if (visivel && !pedido) {
      ultimo = performance.now();
      pedido = requestAnimationFrame(quadro);
    }
  }).observe(hero);

  let espera;
  addEventListener('resize', () => {
    clearTimeout(espera);
    espera = setTimeout(() => camadas.forEach((c) => c.mede()), 150);
  });
}
