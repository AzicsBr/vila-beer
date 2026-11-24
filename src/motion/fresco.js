// Etiqueta "Fresh!" que segue o ponteiro sobre as fotos do dia, os cards do cardápio e as polaroids
// (e sobre qualquer elemento marcado com data-fresco no HTML). O texto do selo está em src/sections/fresco.html.
// Com o ponteiro parado, o scroll (e a fila do cardápio, que anda com ele) muda o que está embaixo:
// por isso o alvo é conferido a cada quadro pelo ponto do ponteiro, não só no pointermove.
export function fresco() {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const selo = document.querySelector('.fresco');
  if (!selo) return;
  document.querySelectorAll('.hora__fotos img, .prato, .polaroid').forEach((el) => el.setAttribute('data-fresco', ''));

  let x = -1;
  let y = -1;
  let dentro = false;
  let pedido = 0;
  let ate = 0; // o scroll suave e o scrub seguem andando um pouco depois do último evento

  const confere = (agora) => {
    pedido = 0;
    const alvo = dentro && document.elementFromPoint(x, y);
    selo.classList.toggle('ativo', Boolean(alvo?.closest?.('[data-fresco]')));
    if (agora < ate) pedido = requestAnimationFrame(confere);
  };
  const agenda = () => { if (!pedido) pedido = requestAnimationFrame(confere); };
  const acompanha = () => { ate = performance.now() + 900; agenda(); };

  addEventListener('pointermove', (e) => {
    x = e.clientX;
    y = e.clientY;
    dentro = true;
    selo.style.left = `${x}px`;
    selo.style.top = `${y}px`;
    agenda();
  }, { passive: true });
  addEventListener('scroll', acompanha, { passive: true });
  addEventListener('wheel', acompanha, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => { dentro = false; agenda(); });
  addEventListener('blur', () => { dentro = false; agenda(); });
}
