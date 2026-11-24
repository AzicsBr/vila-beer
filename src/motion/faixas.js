// Faixas que correm (letreiro em CSS, animação `corre` em faixas.css): os itens ficam no HTML, uma vez só
// (src/sections/faixas.html e avisos.html). Aqui o grupo é repetido quatro vezes, para a animação emendar em -50%,
// e a faixa de volta (data-volta) recebe os itens da faixa anterior na ordem inversa. As cópias ficam fora do leitor
// de tela.
function repete(trilho, itens, oculta = false) {
  trilho.replaceChildren();
  for (let i = 0; i < 4; i++) {
    itens.forEach((item) => {
      const copia = item.cloneNode(true);
      if (i > 0 || oculta) copia.setAttribute('aria-hidden', 'true');
      trilho.append(copia);
    });
  }
}

export function faixas() {
  let anterior = [];
  document.querySelectorAll('.faixa__trilho').forEach((trilho) => {
    if (trilho.hasAttribute('data-volta')) {
      repete(trilho, [...anterior].reverse(), true);
      return;
    }
    const itens = [...trilho.querySelectorAll(':scope > .faixa__item')];
    if (!itens.length) return;
    repete(trilho, itens);
    anterior = itens;
  });
}
