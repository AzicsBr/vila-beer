// Relógio controlado para gravar quadro a quadro (injetado pelo gravador antes de qualquer script, em todos os frames).
// O tempo da página só anda quando o gravador chama window.__passo(ms): performance.now, Date.now, setTimeout,
// setInterval e requestAnimationFrame passam a seguir esse relógio, e as animações e transições CSS ficam pausadas
// e posicionadas nele. Assim cada quadro é fotografado pronto, sem engasgo, no tempo exato.
(() => {
  if (window.__relogio) return;
  const realSetTimeout = window.setTimeout.bind(window);
  const epoca = Date.now();
  let virt = 0;
  let seq = 1;
  const timers = new Map(); // id -> {quando, fn, args, intervalo}
  let rafs = new Map();

  performance.now = () => virt;
  Date.now = () => epoca + virt;
  window.setTimeout = (fn, ms = 0, ...args) => { const id = seq++; timers.set(id, { quando: virt + Math.max(0, +ms || 0), fn, args, intervalo: null }); return id; };
  window.setInterval = (fn, ms = 0, ...args) => { const id = seq++; const i = Math.max(1, +ms || 0); timers.set(id, { quando: virt + i, fn, args, intervalo: i }); return id; };
  window.clearTimeout = window.clearInterval = (id) => { timers.delete(id); };
  window.requestAnimationFrame = (fn) => { const id = seq++; rafs.set(id, fn); return id; };
  window.cancelAnimationFrame = (id) => { rafs.delete(id); };

  const nascimento = new WeakMap();
  function sincronizaAnimacoes() {
    if (!document.getAnimations) return;
    for (const a of document.getAnimations()) {
      if (!nascimento.has(a)) { nascimento.set(a, virt - (a.currentTime || 0)); }
      try { a.pause(); a.currentTime = virt - nascimento.get(a); } catch {}
    }
  }

  function disparaVencidos() {
    let disparou = false;
    const vencidos = [...timers.entries()].filter(([, t]) => t.quando <= virt).sort((a, b) => a[1].quando - b[1].quando);
    for (const [id, t] of vencidos) {
      if (!timers.has(id)) continue;
      if (t.intervalo) t.quando += t.intervalo; else timers.delete(id);
      disparou = true;
      try { typeof t.fn === 'function' ? t.fn(...t.args) : eval(t.fn); } catch (e) { console.error(e); }
    }
    return disparou;
  }

  const respira = () => new Promise((r) => realSetTimeout(r, 0));

  window.__relogio = true;
  window.__passo = async (ms) => {
    virt += ms;
    // timers vencidos, deixando as promessas que eles soltam assentarem (podem marcar novos timers já vencidos)
    for (let k = 0; k < 12; k++) { disparaVencidos(); await respira(); if (![...timers.values()].some((t) => t.quando <= virt)) break; }
    const lote = rafs; rafs = new Map();
    for (const fn of lote.values()) { try { fn(virt); } catch (e) { console.error(e); } }
    await respira();
    sincronizaAnimacoes();
  };
  window.__sincroniza = sincronizaAnimacoes;
})();
