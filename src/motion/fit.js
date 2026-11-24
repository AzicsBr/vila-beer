// Palavra que ocupa uma fração exata da largura da tela, em vw (não precisa recalcular no resize).
export function fit(el, fracao) {
  const largura = el.style.width;
  el.style.width = 'max-content';
  el.style.fontSize = '100px';
  const w = el.getBoundingClientRect().width;
  el.style.width = largura;
  el.style.fontSize = `calc(${fracao * 100}vw / ${w / 100})`;
}
