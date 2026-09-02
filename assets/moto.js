/* ============================================================
   LE COSTANTI DEL MOVIMENTO — porto di moto.ts sul web
   Se un movimento non sta in una di queste voci, non si fa.
   ============================================================ */

/* 1 · LA MOLLA DEL PATTO
   Il gesto che chiude un accordo. L'unico movimento a cui è
   concesso di superare il bersaglio, perché arriva sempre dopo
   una spinta: una mano, un clic, una firma.
   smorzamento 0,74 · risposta 0,36 s */
export const MOLLA_PATTO = { damping: 11, mass: 0.42, stiffness: 130 };

/* 2 · LA MOLLA DI RITORNO
   Quando qualcosa torna al suo posto senza che nessuno l'abbia
   lanciato. Non rimbalza mai. */
export const MOLLA_RITORNO = { damping: 200, mass: 0.6, stiffness: 120 };

/* 3 · LA CURVA DELLE COSE CHE ARRIVANO */
export const CURVA = 'cubic-bezier(.22,.9,.24,1)';

/* 4 · I TEMPI — tre durate, non una di più (30 fps) */
export const TEMPO = { tocco: 200, entrata: 600, scena: 1500 };

/* 5 · LO SFALSAMENTO — 3 fotogrammi */
export const SFALSA = 100;

/* 6 · LO SCARTO DELLE DUE METÀ — 6 = aperto, 0 = pagato */
export const APERTO = 6;

/* ------------------------------------------------------------
   Integratore a molla. Parte sempre dal valore che si vede
   adesso, non dal bersaglio: così un'animazione interrotta a
   metà non salta. Accetta la velocità in ingresso, per non
   lasciare una cucitura fra il dito e l'animazione.
   ------------------------------------------------------------ */
export function molla({ da, a, velocita = 0, config = MOLLA_PATTO, passo, fine }) {
  const { damping: c, mass: m, stiffness: k } = config;
  let x = da, v = velocita, ferma = false;
  let ultimo = performance.now();

  function giro(ora) {
    if (ferma) return;
    // passo fisso a 1/240 s: stabile anche se il frame salta
    let dt = Math.min((ora - ultimo) / 1000, 0.064);
    ultimo = ora;
    const h = 1 / 240;
    let resto = dt;
    while (resto > 0) {
      const d = Math.min(h, resto);
      const forza = -k * (x - a) - c * v;
      v += (forza / m) * d;
      x += v * d;
      resto -= d;
    }
    passo && passo(x, v);
    if (Math.abs(x - a) < 0.05 && Math.abs(v) < 0.05) {
      x = a; passo && passo(x, 0); ferma = true; fine && fine();
      return;
    }
    requestAnimationFrame(giro);
  }
  requestAnimationFrame(giro);
  return { arresta() { ferma = true; }, get valore() { return x; }, get velocita() { return v; } };
}

/* Proiezione della quiete: dove finirebbe da solo, alla velocità
   con cui l'hai lasciato. Serve a far sì che un lancio deciso
   arrivi, e uno svogliato no. */
export function proietta(velocita, decelerazione = 0.998) {
  return (velocita / 1000) * decelerazione / (1 - decelerazione);
}

/* Elastico ai bordi: più tiri oltre, meno ti segue. Un muro
   secco sembra rotto; una resistenza continua sembra un limite. */
export function elastico(oltre, misura, costante = 0.55) {
  return (oltre * misura * costante) / (misura + costante * Math.abs(oltre));
}

/* Entrate sfalsate: mai due cose sullo stesso fotogramma. */
export function entra(radice = document) {
  const cose = radice.querySelectorAll('.rise:not(.in)');
  cose.forEach((el, i) => setTimeout(() => el.classList.add('in'), i * SFALSA));
}

export function osserva(radice = document) {
  if (!('IntersectionObserver' in window)) return entra(radice);
  const io = new IntersectionObserver((voci) => {
    voci.filter(v => v.isIntersecting).forEach((v, i) => {
      setTimeout(() => v.target.classList.add('in'), i * SFALSA);
      io.unobserve(v.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: .1 });
  radice.querySelectorAll('.rise:not(.in)').forEach(el => io.observe(el));
}

/* ------------------------------------------------------------
   IL SEGNO — la moneta spezzata
   ------------------------------------------------------------ */
export const MONETA_SVG =
  '<svg viewBox="0 0 100 100" aria-hidden="true">' +
  '<path class="l" d="M48 7 A43 43 0 0 0 48 93 Z"/>' +
  '<path class="r" d="M52 7 A43 43 0 0 1 52 93 Z"/></svg>';

export function moneta(classe = '', larghezza = null) {
  const w = larghezza ? ` style="width:${larghezza}px"` : '';
  return `<span class="mon ${classe}"${w}>${MONETA_SVG}</span>`;
}

/* ------------------------------------------------------------
   IL GESTO — trascina per allineare, rilascia il pagamento
   Tracciamento 1:1 con l'offset della presa, resistenza ai
   bordi, proiezione della velocità, molla del patto in uscita.
   È interrompibile in ogni istante.
   ------------------------------------------------------------ */
export function gestoMoneta(presa, { corsa = 74, onCambio, onChiuso } = {}) {
  const sx = presa.querySelector('.l');
  const dx = presa.querySelector('.r');
  if (!sx || !dx) return { chiudi() {} };

  let scarto = APERTO;      // 6 = aperto, 0 = chiuso
  let anim = null, chiuso = false;
  let tenuta = false, presoY = 0, partenza = 0;
  const storia = [];

  function dipingi(s) {
    scarto = s;
    sx.style.transform = `translateY(${s}px)`;
    dx.style.transform = `translateY(${-s}px)`;
    const q = Math.max(0, Math.min(1, 1 - s / APERTO));
    presa.setAttribute('aria-valuenow', Math.round(q * 100));
    onCambio && onCambio(q, s);
  }
  dipingi(APERTO);

  function conferma(velocita = 0) {
    if (chiuso) return;
    chiuso = true;
    presa.classList.remove('tenuta');
    anim && anim.arresta();

    /* La decisione è presa nell'istante del gesto, non quando la molla si
       ferma: se il browser sospende i fotogrammi (scheda in secondo piano,
       movimento ridotto), il pagamento deve partire lo stesso. L'animazione
       racconta la cosa, non la decide. */
    onChiuso && onChiuso();

    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { dipingi(0); return; }
    anim = molla({ da: scarto, a: 0, velocita, config: MOLLA_PATTO, passo: dipingi });
    /* rete di sicurezza: se i fotogrammi non arrivano, si allinea comunque */
    setTimeout(() => { if (Math.abs(scarto) > 0.01) { anim && anim.arresta(); dipingi(0); } }, TEMPO.scena);
  }

  function rinuncia(velocita = 0) {
    anim && anim.arresta();
    anim = molla({ da: scarto, a: APERTO, velocita, config: MOLLA_RITORNO, passo: dipingi });
  }

  presa.addEventListener('pointerdown', (e) => {
    if (chiuso) return;
    try { presa.setPointerCapture(e.pointerId); } catch { /* si continua senza cattura */ }
    anim && anim.arresta();          // si afferra a volo: si riparte da dov'è
    tenuta = true;
    presa.classList.add('tenuta');
    presoY = e.clientY;
    partenza = scarto;
    storia.length = 0;
    storia.push({ y: e.clientY, t: performance.now() });
  });

  addEventListener('pointermove', (e) => {
    if (!tenuta || chiuso) return;
    e.preventDefault();
    storia.push({ y: e.clientY, t: performance.now() });
    if (storia.length > 6) storia.shift();

    // tirare in giù chiude: da 6 verso 0
    const spinta = (e.clientY - presoY) / corsa * APERTO;
    let s = partenza - spinta;
    if (s > APERTO) s = APERTO + elastico(s - APERTO, corsa) * .12;
    else if (s < 0) s = elastico(s, corsa) * .12;
    dipingi(s);
  });

  function lascia(e) {
    if (!tenuta || chiuso) return;
    tenuta = false;
    presa.classList.remove('tenuta');
    try { presa.releasePointerCapture?.(e.pointerId); } catch { /* già rilasciato */ }

    // velocità dello scarto (unità/s), dal recente, non dall'ultimo punto
    const a = storia[0], b = storia[storia.length - 1];
    const dt = Math.max(16, b.t - a.t);
    const vPx = (b.y - a.y) / dt * 1000;
    const vScarto = -(vPx / corsa) * APERTO;

    // dove finirebbe da solo
    const quiete = scarto + proietta(vScarto);
    if (quiete <= APERTO * 0.42) conferma(vScarto);
    else rinuncia(vScarto);
  }
  /* il rilascio si ascolta sulla finestra: se la cattura del pointer
     non riesce, o il dito esce dalla moneta, il gesto si chiude lo stesso */
  addEventListener('pointerup', lascia);
  addEventListener('pointercancel', lascia);

  // tastiera: stessa cosa, senza il dito
  presa.addEventListener('keydown', (e) => {
    if (chiuso) return;
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); conferma(); }
    if (e.key === 'ArrowDown') { e.preventDefault(); dipingi(Math.max(0, scarto - 1.5)); if (scarto <= 0) conferma(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); dipingi(Math.min(APERTO, scarto + 1.5)); }
  });

  return { chiudi: () => conferma(), get chiuso() { return chiuso; } };
}

/* ------------------------------------------------------------
   utilità di formato — italiano, sempre
   ------------------------------------------------------------ */
/* useGrouping: true — senza, ECMA-402 non separa i numeri a quattro cifre
   ("2180" invece di "2.180") e in un prodotto che maneggia soldi la cifra
   deve leggersi sempre allo stesso modo. */
const IT = { useGrouping: true };
export const eur = n => '€ ' + n.toLocaleString('it-IT', { ...IT, minimumFractionDigits: 0, maximumFractionDigits: 0 });
export const eur2 = n => '€ ' + n.toLocaleString('it-IT', { ...IT, minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const num = n => n.toLocaleString('it-IT', IT);
export const mille = n => n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace('.', ',') + 'k' : String(n);
