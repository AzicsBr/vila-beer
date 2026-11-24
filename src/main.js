// Ordem de inicialização. O CSS não entra por aqui: ele vem por <link> no index.html (src/styles/site.css), senão no
// dev do Vite a página aparece crua por um instante a cada recarregamento.
//   1. monta as faixas e liga o arrastar e o selo "Fresh!"
//   2. espera as fontes das palavras gigantes e mede cada uma (data-fit: a fração da largura da tela)
//   3. cria as animações presas à rolagem (hero, dia, panorama, cardápio, mural, fecho)
//   4. roda a abertura com a rolagem parada, libera a rolagem e toca a entrada do hero
// ?pronto pula a abertura e a entrada (para conferir uma seção depressa).
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { smooth } from './motion/smooth.js';
import { fit } from './motion/fit.js';
import { faixas } from './motion/faixas.js';
import { loader } from './motion/loader.js';
import { heroEntrada, heroScroll, heroArrasta } from './motion/hero.js';
import { petalas } from './motion/petalas.js';
import { dia } from './motion/dia.js';
import { virada } from './motion/virada.js';
import { panorama } from './motion/panorama.js';
import { cardapio } from './motion/cardapio.js';
import { mural } from './motion/mural.js';
import { fecho } from './motion/fecho.js';
import { fresco } from './motion/fresco.js';

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

const html = document.documentElement;
html.dataset.vivo = ''; // o plano B do <head> (index.html) só age se este módulo não rodar
const reduzido = matchMedia('(prefers-reduced-motion: reduce)').matches;
// a abertura toca só na primeira visita da sessão (quem volta do WhatsApp ou recarrega não espera de novo)
let jaViu = false;
try { jaViu = sessionStorage.getItem('villa-abertura') === '1'; sessionStorage.setItem('villa-abertura', '1'); } catch {}
const semEntrada = reduzido || jaViu || new URLSearchParams(location.search).has('pronto');
// durante a abertura nada atrás dela recebe foco nem clique (teclado, Tab, leitor de tela)
const conteudo = [...document.querySelectorAll('body > header, body > main, body > footer')];
conteudo.forEach((el) => { el.inert = true; });
document.body.classList.add('carregando');

// as fontes que as palavras gigantes e o japonês usam, com o texto de cada uma (o navegador baixa só o que precisa)
const fonte = (el, peso) => `${peso ?? getComputedStyle(el).fontWeight} 100px ${getComputedStyle(el).fontFamily}`;
const fontes = Promise.all([
  ...[...document.querySelectorAll('[data-fit], [lang="ja"]')].map((el) => document.fonts.load(fonte(el), el.textContent.trim() || 'A')),
  document.fonts.load(fonte(document.body, 500)),
  document.fonts.load(fonte(document.body, 700)),
]).catch(() => {});
// os recortes do hero decodificados antes de a abertura sair
const imagens = [...document.querySelectorAll('.hero img')].map((img) => img.decode().catch(() => {}));
// rede lenta: a abertura não espera o logo para sempre
const pronto = Promise.race([Promise.all([fontes, ...imagens]), new Promise((r) => setTimeout(r, 6000))]);

const lenis = smooth();
lenis.stop();
faixas();
fresco();
heroArrasta();

await fontes;
document.querySelectorAll('[data-fit]').forEach((el) => fit(el, Number(el.dataset.fit) || 0.9));
// o pé do nome do hero (a etiqueta cola nele): 0,766 do corpo abaixo do topo da palavra, medido depois do data-fit
const palavra = document.querySelector('.hero__palavra');
const pe = () => palavra?.parentElement.style.setProperty('--pe-palavra', `${palavra.offsetTop + parseFloat(getComputedStyle(palavra).fontSize) * 0.766}px`);
pe();
addEventListener('resize', pe);

if (!reduzido) heroScroll();
dia(lenis);
virada(reduzido);
panorama();
cardapio();
mural();
if (!reduzido) fecho();

const entrada = semEntrada ? null : heroEntrada().pause();
await loader(pronto, semEntrada);
conteudo.forEach((el) => { el.inert = false; });
document.body.classList.remove('carregando');
window.scrollTo(0, 0);
lenis.start();
// as partículas só começam quando a abertura sai (antes, animavam escondidas e disputavam quadro com a caneca)
if (!reduzido) petalas();
entrada?.play();
ScrollTrigger.refresh();
requestAnimationFrame(() => requestAnimationFrame(() => html.classList.add('assentou')));

if (document.readyState !== 'complete') addEventListener('load', () => ScrollTrigger.refresh());

// link com âncora vindo de fora (ex.: …/#visitar): rola até ela depois que os pins foram medidos
const alvo = location.hash.length > 1 && document.querySelector(location.hash);
if (alvo) requestAnimationFrame(() => lenis.scrollTo(alvo, { immediate: true }));
