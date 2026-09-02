/* ============================================================
   I SEGNI — icone e illustrazioni
   Regola unica: un segno deve dire la cosa senza che ci sia
   scritto sotto. Se serve l'etichetta per capirlo, è sbagliato.

   Geometria: riquadro 24, tratto 1.6, estremi tondi.
   I due colori restano quelli del marchio: ambra = creator,
   acquamarina = azienda.
   ============================================================ */

const I = (d, extra = '') =>
  `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"
     stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}${extra}</svg>`;

export const ICO = {
  /* vassoio con un punto: le cose che aspettano te */
  oggi: () => I(`<path d="M3 13h4l1.5 3h7L17 13h4"/>
                 <path d="M5.4 6.5 3 13v5a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-5l-2.4-6.5A1.5 1.5 0 0 0 17.2 5.5H6.8A1.5 1.5 0 0 0 5.4 6.5z"/>`),

  /* le due metà: è l'oggetto centrale del prodotto */
  collab: () => `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M11.2 3.2A8.8 8.8 0 0 0 11.2 20.8Z" fill="var(--cre)" transform="translate(0,1.1)"/>
      <path d="M12.8 3.2A8.8 8.8 0 0 1 12.8 20.8Z" fill="var(--bra-hi)" transform="translate(0,-1.1)"/>
    </svg>`,

  /* scheda con una persona: il media kit */
  mediakit: () => I(`<rect x="3" y="4" width="18" height="16" rx="2"/>
                     <circle cx="9" cy="10" r="2.1"/>
                     <path d="M5.6 16.6a3.6 3.6 0 0 1 6.8 0"/>
                     <path d="M15 9.5h3.5M15 13h3.5"/>`),

  /* colonne che crescono: lo storico */
  storico: () => I(`<path d="M3 20h18"/><rect x="5" y="12" width="3.4" height="5" rx="1"/>
                    <rect x="10.3" y="8" width="3.4" height="9" rx="1"/>
                    <rect x="15.6" y="4.5" width="3.4" height="12.5" rx="1"/>`),

  /* portafoglio con la fessura: i soldi che entrano ed escono */
  portafoglio: () => I(`<path d="M20 8V6.5A1.5 1.5 0 0 0 18.5 5H5.2A2.2 2.2 0 0 0 3 7.2v9.6A2.2 2.2 0 0 0 5.2 19h13.3A1.5 1.5 0 0 0 20 17.5V16"/>
                        <path d="M21 11.2h-4.2a1.4 1.4 0 0 0 0 2.8H21a.8.8 0 0 0 .8-.8v-1.2a.8.8 0 0 0-.8-.8z"/>`),

  /* lente su una persona: trovare un creator */
  trova: () => I(`<circle cx="10.5" cy="9" r="2.3"/>
                  <circle cx="10.5" cy="10.5" r="7"/>
                  <path d="M6.8 15.6a4.2 4.2 0 0 1 7.4 0"/>
                  <path d="M15.6 15.6 21 21"/>`),

  /* scontrino con la spunta: ogni ordine, con la sua regola */
  attribuzione: () => I(`<path d="M6 3h12v18l-2-1.4-2 1.4-2-1.4-2 1.4-2-1.4L6 21z"/>
                         <path d="M9.4 11.4 11 13l3.6-3.8"/>`),

  /* tenda del negozio: il negozio collegato */
  negozio: () => I(`<path d="M4 9.5V19a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9.5"/>
                    <path d="M3 9.5 4.8 5A1.5 1.5 0 0 1 6.2 4h11.6A1.5 1.5 0 0 1 19.2 5L21 9.5"/>
                    <path d="M3 9.5h18"/><path d="M9.5 20v-5.2h5V20"/>`),

  /* freccia che rientra: tornare indietro */
  indietro: () => I(`<path d="M15 5 8 12l7 7"/>`),

  /* spunta: fatto */
  fatto: () => I(`<path d="M4.5 12.5 9.5 17.5 19.5 7"/>`),

  /* lucchetto aperto sul deposito: i soldi fermi */
  custodia: () => I(`<rect x="4" y="10.5" width="16" height="10" rx="2"/>
                     <path d="M8 10.5V7.8a4 4 0 0 1 7.7-1.5"/>
                     <circle cx="12" cy="15.5" r="1.4"/>`),

  /* orologio: il fermo tecnico, l'attesa */
  attesa: () => I(`<circle cx="12" cy="12" r="8.4"/><path d="M12 7.4V12l3.2 2"/>`),

  /* cerchio con la barra: escluso, scartato */
  scartato: () => I(`<circle cx="12" cy="12" r="8.4"/><path d="M6.6 6.6 17.4 17.4"/>`),

  /* documento firmato */
  contratto: () => I(`<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/>
                      <path d="M9 15.6c1.6-2.6 2.6-.6 4 .6 1-2 2.2-2.6 2.2-2.6"/>`),

  /* aeroplano: consegnato */
  consegna: () => I(`<path d="M21 3 10.5 13.5"/><path d="M21 3 14.4 21l-3.9-7.5L3 9.6z"/>`),

  /* più: aggiungere */
  piu: () => I(`<path d="M12 5.5v13M5.5 12h13"/>`),

  /* freccia avanti */
  avanti: () => I(`<path d="M9 5l7 7-7 7"/>`),
  giu:     () => I(`<path d="M6 9.5l6 6 6-6"/>`),

  /* occhio: cosa vede chi apre */
  occhio: () => I(`<path d="M2.5 12S6 5.6 12 5.6 21.5 12 21.5 12 18 18.4 12 18.4 2.5 12 2.5 12z"/>
                   <circle cx="12" cy="12" r="2.8"/>`),

  /* banca: dove finiscono i soldi */
  banca: () => I(`<path d="M3.4 9.4 12 4.6l8.6 4.8"/><path d="M4.6 9.4v8.2M9.4 9.4v8.2M14.6 9.4v8.2M19.4 9.4v8.2"/>
                  <path d="M2.8 19.4h18.4"/>`),

  /* stella: il giudizio. Piena si legge, contornata no. */
  stella: (piena = true) =>
    `<svg class="ico" viewBox="0 0 24 24" fill="${piena ? 'currentColor' : 'none'}"
       stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true">
       <path d="M12 3.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z"/></svg>`,

  /* ingranaggio: impostazioni */
  impostazioni: () => I(`<circle cx="12" cy="12" r="3.2"/>
    <path d="M19.4 14.6a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5v.2a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3h.1a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8v.1a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/>`),

  /* macchina fotografica: cambia la foto */
  foto: () => I(`<path d="M3 8.4a2 2 0 0 1 2-2h1.8l1.2-2h8l1.2 2H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                 <circle cx="12" cy="12.6" r="3.4"/>`),

  /* matita: modifica */
  matita: () => I(`<path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17z"/><path d="M14.5 5.5l4 4"/>`),

  /* calendario: le scadenze */
  calendario: () => I(`<rect x="3.4" y="5.4" width="17.2" height="15.2" rx="2"/>
    <path d="M3.4 10.2h17.2M8.4 3.4v4M15.6 3.4v4"/>`),

  /* scatola: il prodotto */
  prodotto: () => I(`<path d="M20.6 8.2 12 4 3.4 8.2v7.6L12 20l8.6-4.2z"/>
                     <path d="M3.4 8.2 12 12.4l8.6-4.2M12 12.4V20"/>`),

  /* lucchetto chiuso: esclusiva */
  esclusiva: () => I(`<rect x="4.4" y="10.4" width="15.2" height="10" rx="2"/>
                      <path d="M8 10.4V7.8a4 4 0 0 1 8 0v2.6"/>`),

  /* due frecce opposte: proponiti */
  proponi: () => I(`<path d="M7 4.6v14M7 4.6 3.6 8M7 4.6 10.4 8"/>
                    <path d="M17 19.4v-14M17 19.4 13.6 16M17 19.4 20.4 16"/>`),

  /* scudo: la tutela, i termini */
  scudo: () => I(`<path d="M12 3.4 4.6 6.2v5.4c0 4.4 3 8.3 7.4 9.4 4.4-1.1 7.4-5 7.4-9.4V6.2z"/>
                  <path d="M9.4 12.2 11.4 14l3.4-3.6"/>`),

  /* collegamento */
  link: () => I(`<path d="M10.5 13.5a4 4 0 0 0 5.7 0l2.6-2.6a4 4 0 0 0-5.7-5.7l-1.5 1.5"/>
                 <path d="M13.5 10.5a4 4 0 0 0-5.7 0l-2.6 2.6a4 4 0 0 0 5.7 5.7l1.5-1.5"/>`)
};

/* ============================================================
   LE ILLUSTRAZIONI
   Nate dalle prove di generazione immagini e ridisegnate in
   vettoriale: pesano 2 kB invece di 850, restano nitide a ogni
   misura e possono muoversi. Formato a fascia 320x200.
   ============================================================ */

const COLONNE = `<g opacity=".55">${
  Array.from({ length: 9 }, (_, i) =>
    `<line x1="${16 + i * 36}" y1="0" x2="${16 + i * 36}" y2="200" stroke="#22272A" stroke-width="1"/>`
  ).join('')}</g>`;

const CORNICE = (dentro) =>
  `<svg class="illo" viewBox="0 0 320 200" role="img" aria-hidden="true">
     <rect width="320" height="200" fill="#0A0B0C"/>${COLONNE}${dentro}</svg>`;

/* Mezza moneta. 'sx' bombata a sinistra (bordo dritto a destra),
   'dx' bombata a destra. Lo scarto verticale è il patto aperto. */
const mezza = (lato, cx, cy, r, colore, scarto = 0) => lato === 'sx'
  ? `<path d="M${cx} ${cy - r} A${r} ${r} 0 0 0 ${cx} ${cy + r} Z" fill="${colore}" transform="translate(0 ${scarto})"/>`
  : `<path d="M${cx} ${cy - r} A${r} ${r} 0 0 1 ${cx} ${cy + r} Z" fill="${colore}" transform="translate(0 ${-scarto})"/>`;

/* Chi crea: testa, busto, braccio teso in avanti. */
const figura = (x, y, s, colore) => `
  <g transform="translate(${x} ${y}) scale(${s})" fill="${colore}">
    <circle cx="0" cy="-58" r="15"/>
    <rect x="-15" y="-40" width="30" height="74" rx="15"/>
    <rect x="12" y="-16" width="42" height="12" rx="6"/>
  </g>`;

/* Chi vende: tenda, due montanti, porta, basamento. */
const negozio = (x, y, s, colore) => `
  <g transform="translate(${x} ${y}) scale(${s})" fill="${colore}">
    <rect x="-44" y="-72" width="88" height="13" rx="4"/>
    <rect x="-36" y="-88" width="72" height="12" rx="4"/>
    <rect x="-44" y="-55" width="11" height="76" rx="4"/>
    <rect x="33" y="-55" width="11" height="76" rx="4"/>
    <rect x="-48" y="21" width="96" height="11" rx="4"/>
    <rect x="-17" y="-28" width="34" height="45" rx="4"/>
  </g>`;

export const ILLO = {
  /* Il creator tiene la sua metà. L'altra è lì, ma ancora staccata. */
  creator: () => CORNICE(`
    ${figura(96, 136, 1, 'var(--cre)')}
    ${mezza('sx', 196, 100, 33, 'var(--cre)', 5)}
    ${mezza('dx', 200, 100, 33, 'var(--bra)', 5)}`),

  /* L'azienda custodisce la sua. Stessa scena, dall'altra parte. */
  azienda: () => CORNICE(`
    ${negozio(206, 148, 1, 'var(--bra)')}
    ${mezza('dx', 128, 104, 31, 'var(--bra)', 5)}
    ${mezza('sx', 124, 104, 31, 'var(--cre)', 5)}`),

  /* Quando combacia: un cerchio intero, e i due ai lati. */
  accordo: () => CORNICE(`
    ${figura(44, 150, .58, 'var(--cre)')}
    ${negozio(276, 152, .58, 'var(--bra)')}
    ${mezza('sx', 158, 100, 46, 'var(--cre)')}
    ${mezza('dx', 162, 100, 46, 'var(--bra)')}`),

  /* Ancora niente: la moneta spenta. */
  vuoto: () => CORNICE(`
    ${mezza('sx', 158, 100, 40, '#23282A', 6)}
    ${mezza('dx', 162, 100, 40, '#23282A', 6)}`)
};
